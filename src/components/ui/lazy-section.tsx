import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { SectionErrorBoundary } from "@/components/ui/section-error-boundary";

export function LazySection({
  children,
  fallback,
  minHeight = 280,
  rootMargin = "320px",
}: {
  children: ReactNode;
  fallback?: ReactNode;
  minHeight?: number;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, visible]);

  const placeholder = fallback ?? <div className="w-full animate-pulse rounded-2xl bg-secondary/30" style={{ minHeight }} />;

  return (
    <div ref={ref} style={!visible ? { minHeight } : undefined}>
      {visible ? (
        <SectionErrorBoundary fallback={placeholder}>
          <Suspense fallback={placeholder}>{children}</Suspense>
        </SectionErrorBoundary>
      ) : (
        placeholder
      )}
    </div>
  );
}
