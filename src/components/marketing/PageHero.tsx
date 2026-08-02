import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/motion/Motion";
import { Container } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Capital.com-style page header — regulatory line, large headline, white CTA. */
export function PageHero({
  badge,
  title,
  subtitle,
  children,
  align = "left",
  cta,
  image: _image,
}: {
  badge?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  align?: "left" | "center";
  cta?: { label: string; href: string };
  image?: string;
}) {
  void _image;
  return (
    <section className="border-b border-border bg-void pb-12 pt-10 md:pb-16 md:pt-14">
      <Container>
        <FadeIn
          className={cn(
            "max-w-3xl",
            align === "center" && "mx-auto text-center"
          )}
        >
          {badge && (
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-muted">
              {badge}
            </p>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="font-display text-4xl font-bold leading-[1.06] tracking-tight text-foreground sm:text-5xl md:text-[3.25rem]"
          >
            {title}
          </motion.h1>
          {subtitle && (
            <p className={cn("mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base", align === "center" && "mx-auto")}>
              {subtitle}
            </p>
          )}
          {cta && (
            <div className={cn("mt-8 flex flex-col gap-3 sm:flex-row", align === "center" && "justify-center")}>
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to={cta.href}>{cta.label}</Link>
              </Button>
            </div>
          )}
          {children && <div className="mt-8">{children}</div>}
        </FadeIn>
      </Container>
    </section>
  );
}
