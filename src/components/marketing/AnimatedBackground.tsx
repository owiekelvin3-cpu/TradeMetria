export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 bg-void" aria-hidden="true">
      <div className="absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(251,190,91,0.06),transparent_60%)]" />
    </div>
  );
}
