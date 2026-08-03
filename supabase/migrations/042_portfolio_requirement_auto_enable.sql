-- Treat a positive min_deposit_total as an active global requirement (even if enabled flag is false).

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

  IF v_min > 0 THEN
    v_enabled := true;
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
      'enabled', v_enabled OR v_global_min > 0,
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
    v_enabled := v_requirement > 0;
  ELSIF v_global_min > 0 THEN
    v_requirement := v_global_min;
    v_source := 'global';
    v_enabled := true;
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
  v_enabled BOOLEAN;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  v_min := GREATEST(COALESCE(p_min_deposit_total, 0), 0);
  v_currency := COALESCE(NULLIF(TRIM(p_currency), ''), 'USD');
  v_enabled := v_min > 0 OR COALESCE(p_enabled, false);

  v_value := jsonb_build_object(
    'enabled', v_enabled,
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
