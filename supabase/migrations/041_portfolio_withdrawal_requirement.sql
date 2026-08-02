-- Portfolio deposit requirement before withdrawals.
-- Only completed deposits count toward the requirement; trading profits do not.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS portfolio_requirement_override NUMERIC(18, 2),
  ADD COLUMN IF NOT EXISTS portfolio_requirement_waived BOOLEAN NOT NULL DEFAULT false;

INSERT INTO public.platform_settings (key, value)
VALUES (
  'withdrawal_portfolio_requirement',
  '{"enabled": false, "min_deposit_total": 0, "currency": "USD"}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.user_deposit_total(p_user_id UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(d.amount), 0)
  FROM public.deposits d
  WHERE d.user_id = p_user_id
    AND d.status IN ('completed', 'approved');
$$;

CREATE OR REPLACE FUNCTION public.get_portfolio_requirement_settings()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_raw JSONB;
  v_enabled BOOLEAN := false;
  v_min NUMERIC(18, 2) := 0;
  v_currency TEXT := 'USD';
BEGIN
  SELECT value INTO v_raw
  FROM public.platform_settings
  WHERE key = 'withdrawal_portfolio_requirement';

  IF v_raw IS NOT NULL THEN
    v_enabled := COALESCE((v_raw->>'enabled')::boolean, false);
    v_min := COALESCE((v_raw->>'min_deposit_total')::numeric, 0);
    v_currency := COALESCE(NULLIF(v_raw->>'currency', ''), 'USD');
  END IF;

  IF v_min < 0 THEN
    v_min := 0;
  END IF;

  RETURN jsonb_build_object(
    'enabled', v_enabled,
    'min_deposit_total', v_min,
    'currency', v_currency
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.effective_portfolio_requirement(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile public.profiles%ROWTYPE;
  v_settings JSONB;
  v_enabled BOOLEAN;
  v_global_min NUMERIC(18, 2);
  v_currency TEXT;
  v_requirement NUMERIC(18, 2) := 0;
  v_source TEXT := 'none';
  v_deposit_total NUMERIC(18, 2);
  v_remaining NUMERIC(18, 2);
  v_can_withdraw BOOLEAN := true;
BEGIN
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  v_settings := public.get_portfolio_requirement_settings();
  v_enabled := COALESCE((v_settings->>'enabled')::boolean, false);
  v_global_min := COALESCE((v_settings->>'min_deposit_total')::numeric, 0);
  v_currency := COALESCE(v_settings->>'currency', 'USD');
  v_deposit_total := public.user_deposit_total(p_user_id);

  IF v_profile.portfolio_requirement_waived THEN
    RETURN jsonb_build_object(
      'enabled', v_enabled,
      'waived', true,
      'source', 'waived',
      'requirement', 0,
      'deposit_total', v_deposit_total,
      'remaining', 0,
      'currency', v_currency,
      'can_withdraw', true
    );
  END IF;

  IF v_profile.portfolio_requirement_override IS NOT NULL THEN
    v_requirement := GREATEST(v_profile.portfolio_requirement_override, 0);
    v_source := 'override';
    v_enabled := true;
  ELSIF v_enabled THEN
    v_requirement := GREATEST(v_global_min, 0);
    v_source := 'global';
  ELSE
    RETURN jsonb_build_object(
      'enabled', false,
      'waived', false,
      'source', 'none',
      'requirement', 0,
      'deposit_total', v_deposit_total,
      'remaining', 0,
      'currency', v_currency,
      'can_withdraw', true
    );
  END IF;

  v_remaining := GREATEST(v_requirement - v_deposit_total, 0);
  v_can_withdraw := v_deposit_total >= v_requirement;

  RETURN jsonb_build_object(
    'enabled', true,
    'waived', false,
    'source', v_source,
    'requirement', v_requirement,
    'deposit_total', v_deposit_total,
    'remaining', v_remaining,
    'currency', v_currency,
    'can_withdraw', v_can_withdraw
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_withdrawal_eligibility()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_portfolio JSONB;
  v_pending_fees INT;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_portfolio := public.effective_portfolio_requirement(v_uid);

  SELECT COUNT(*)::int INTO v_pending_fees
  FROM public.user_fees
  WHERE user_id = v_uid AND status = 'pending';

  RETURN jsonb_build_object(
    'portfolio', v_portfolio,
    'pending_fees_count', v_pending_fees,
    'can_withdraw',
      COALESCE((v_portfolio->>'can_withdraw')::boolean, true)
      AND v_pending_fees = 0
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.block_withdrawal_if_portfolio_unmet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_portfolio JSONB;
BEGIN
  v_portfolio := public.effective_portfolio_requirement(NEW.user_id);

  IF COALESCE((v_portfolio->>'enabled')::boolean, false)
     AND NOT COALESCE((v_portfolio->>'can_withdraw')::boolean, false) THEN
    RAISE EXCEPTION 'Portfolio deposit requirement not met. Deposit % more before withdrawing.',
      COALESCE((v_portfolio->>'remaining')::numeric, 0);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_withdrawal_portfolio_gate ON public.withdrawals;
CREATE TRIGGER trg_withdrawal_portfolio_gate
  BEFORE INSERT ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION public.block_withdrawal_if_portfolio_unmet();

CREATE OR REPLACE FUNCTION public.admin_set_withdrawal_portfolio_requirement(
  p_enabled BOOLEAN,
  p_min_deposit_total NUMERIC,
  p_currency TEXT DEFAULT 'USD'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_min NUMERIC(18, 2);
  v_currency TEXT;
  v_value JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  v_min := GREATEST(COALESCE(p_min_deposit_total, 0), 0);
  v_currency := COALESCE(NULLIF(TRIM(p_currency), ''), 'USD');

  v_value := jsonb_build_object(
    'enabled', COALESCE(p_enabled, false),
    'min_deposit_total', v_min,
    'currency', v_currency
  );

  INSERT INTO public.platform_settings (key, value)
  VALUES ('withdrawal_portfolio_requirement', v_value)
  ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      updated_at = NOW();

  RETURN v_value;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_user_portfolio_requirement(
  p_user_id UUID,
  p_override NUMERIC DEFAULT NULL,
  p_waived BOOLEAN DEFAULT NULL,
  p_clear_override BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_override NUMERIC(18, 2);
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF p_clear_override THEN
    v_override := NULL;
  ELSIF p_override IS NOT NULL THEN
    v_override := GREATEST(p_override, 0);
  ELSE
    SELECT portfolio_requirement_override INTO v_override
    FROM public.profiles
    WHERE id = p_user_id;
  END IF;

  UPDATE public.profiles
  SET portfolio_requirement_override = v_override,
      portfolio_requirement_waived = COALESCE(p_waived, portfolio_requirement_waived),
      updated_at = NOW()
  WHERE id = p_user_id;

  RETURN public.effective_portfolio_requirement(p_user_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_user_details(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_portfolio JSONB;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  v_portfolio := public.effective_portfolio_requirement(p_user_id);

  SELECT jsonb_build_object(
    'profile', to_jsonb(p.*),
    'balance', COALESCE((SELECT b.amount FROM balances b WHERE b.user_id = p_user_id), 0),
    'outstanding_fees_total', COALESCE((
      SELECT SUM(f.amount) FROM user_fees f WHERE f.user_id = p_user_id AND f.status = 'pending'
    ), 0),
    'portfolio', v_portfolio,
    'auth', (
      SELECT jsonb_build_object(
        'created_at', u.created_at,
        'last_sign_in_at', u.last_sign_in_at,
        'email_confirmed_at', u.email_confirmed_at,
        'phone', u.phone,
        'has_password', (u.encrypted_password IS NOT NULL),
        'providers', COALESCE((
          SELECT jsonb_agg(DISTINCT i.provider)
          FROM auth.identities i
          WHERE i.user_id = u.id
        ), '[]'::jsonb)
      )
      FROM auth.users u
      WHERE u.id = p_user_id
    ),
    'stats', jsonb_build_object(
      'deposits_count', (SELECT COUNT(*)::int FROM deposits d WHERE d.user_id = p_user_id),
      'deposits_total', COALESCE((SELECT SUM(d.amount) FROM deposits d WHERE d.user_id = p_user_id AND d.status IN ('completed', 'approved')), 0),
      'withdrawals_count', (SELECT COUNT(*)::int FROM withdrawals w WHERE w.user_id = p_user_id),
      'withdrawals_total', COALESCE((SELECT SUM(w.amount) FROM withdrawals w WHERE w.user_id = p_user_id AND w.status = 'completed'), 0),
      'trades_count', (SELECT COUNT(*)::int FROM trades t WHERE t.user_id = p_user_id),
      'active_trades', (SELECT COUNT(*)::int FROM trades t WHERE t.user_id = p_user_id AND t.status = 'active'),
      'ai_bots_active', (SELECT COUNT(*)::int FROM ai_trading_subscriptions a WHERE a.user_id = p_user_id AND a.status = 'active')
    ),
    'fees', COALESCE((
      SELECT jsonb_agg(row_to_json(rf))
      FROM (
        SELECT id, fee_type, label, amount, currency, status, notes, assigned_by, paid_at, created_at, updated_at
        FROM user_fees
        WHERE user_id = p_user_id
        ORDER BY
          CASE status WHEN 'pending' THEN 0 ELSE 1 END,
          created_at DESC
        LIMIT 50
      ) rf
    ), '[]'::jsonb),
    'balance_adjustments', COALESCE((
      SELECT jsonb_agg(row_to_json(ba))
      FROM (
        SELECT a.id, a.direction, a.amount, a.balance_before, a.balance_after, a.reason, a.created_at, a.admin_id,
               ap.email AS admin_email, ap.full_name AS admin_name
        FROM admin_balance_adjustments a
        LEFT JOIN profiles ap ON ap.id = a.admin_id
        WHERE a.user_id = p_user_id
        ORDER BY a.created_at DESC
        LIMIT 20
      ) ba
    ), '[]'::jsonb),
    'recent_deposits', COALESCE((
      SELECT jsonb_agg(row_to_json(rd))
      FROM (
        SELECT id, amount, method, status, created_at
        FROM deposits
        WHERE user_id = p_user_id
        ORDER BY created_at DESC
        LIMIT 5
      ) rd
    ), '[]'::jsonb),
    'recent_withdrawals', COALESCE((
      SELECT jsonb_agg(row_to_json(rw))
      FROM (
        SELECT id, amount, method, status, wallet_address, created_at
        FROM withdrawals
        WHERE user_id = p_user_id
        ORDER BY created_at DESC
        LIMIT 5
      ) rw
    ), '[]'::jsonb),
    'kyc_submissions', COALESCE((
      SELECT jsonb_agg(row_to_json(rk))
      FROM (
        SELECT id, document_type, document_url, selfie_url, face_captured_at, status, notes, created_at
        FROM kyc_submissions
        WHERE user_id = p_user_id
        ORDER BY created_at DESC
        LIMIT 10
      ) rk
    ), '[]'::jsonb),
    'moderation_actions', COALESCE((
      SELECT jsonb_agg(row_to_json(ma))
      FROM (
        SELECT a.id, a.action_type, a.reason, a.created_at, a.admin_id,
               ap.email AS admin_email, ap.full_name AS admin_name
        FROM admin_user_actions a
        LEFT JOIN profiles ap ON ap.id = a.admin_id
        WHERE a.user_id = p_user_id
        ORDER BY a.created_at DESC
        LIMIT 20
      ) ma
    ), '[]'::jsonb)
  )
  INTO v_result
  FROM profiles p
  WHERE p.id = p_user_id;

  IF v_result IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.user_deposit_total(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.user_deposit_total(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.get_portfolio_requirement_settings() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_portfolio_requirement_settings() TO authenticated;

REVOKE ALL ON FUNCTION public.effective_portfolio_requirement(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.effective_portfolio_requirement(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.get_withdrawal_eligibility() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_withdrawal_eligibility() TO authenticated;

REVOKE ALL ON FUNCTION public.admin_set_withdrawal_portfolio_requirement(BOOLEAN, NUMERIC, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_withdrawal_portfolio_requirement(BOOLEAN, NUMERIC, TEXT) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_set_user_portfolio_requirement(UUID, NUMERIC, BOOLEAN, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_user_portfolio_requirement(UUID, NUMERIC, BOOLEAN, BOOLEAN) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_get_user_details(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_get_user_details(UUID) TO authenticated;
