import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { BRAND } from "@/constants/brand";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { LazyVideo } from "@/components/ui/lazy-video";

const PLATFORM_VIDEO_SRC = "/videos/platform.mp4";
const PLATFORM_VIDEO_POSTER = "/images/platform-video-nebula.png";

function PlatformHeroVideo() {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-charcoal">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-2.5 sm:px-5">
        <span className="text-xs font-medium text-muted">{t("hero.videoLabel", { brand: BRAND.shortName })}</span>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground">
          {t("common.live")}
        </span>
      </div>
      <LazyVideo
        className="aspect-[16/10] w-full object-cover object-top"
        src={PLATFORM_VIDEO_SRC}
        poster={PLATFORM_VIDEO_POSTER}
        autoPlay
        muted
        loop
        playsInline
        aria-label={t("hero.videoAlt")}
      />
    </div>
  );
}

export function Hero() {
  const { t } = useTranslation();

  const badges = [
    t("capital.heroBadgeGlobal"),
    t("capital.heroBadgeInstruments"),
    t("capital.heroBadgeDesk"),
  ];

  return (
    <section className="border-b border-border bg-void pb-12 pt-10 md:pb-16 md:pt-14">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_minmax(0,1.05fr)] lg:gap-14">
          <div className="max-w-xl">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="text-xs font-medium leading-relaxed text-muted sm:text-sm"
            >
              {t("capital.heroRegulatory", {
                entity: BRAND.legalEntity,
                id: BRAND.registrationNumber,
              })}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="mt-4 font-display text-4xl font-bold leading-[1.06] tracking-tight text-foreground sm:text-5xl md:text-[3.35rem]"
            >
              {t("capital.heroTitle")}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12 }}
              className="mt-5 flex flex-wrap gap-2"
            >
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-border bg-charcoal px-3 py-1 text-[11px] font-medium text-muted sm:text-xs"
                >
                  {badge}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.18 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link to="/auth?mode=register">{t("capital.openAccount")}</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                <Link to="/auth">{t("capital.logIn")}</Link>
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <PlatformHeroVideo />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
