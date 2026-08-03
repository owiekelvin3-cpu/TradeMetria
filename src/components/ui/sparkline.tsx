import { cn } from "@/lib/utils";

export function Sparkline({
  values,
  up,
  wide = false,
  className,
}: {
  values: number[];
  up: boolean;
  wide?: boolean;
  className?: string;
}) {
  const width = wide ? 96 : 80;
  const height = 40;

  if (values.length < 2) {
    return <div className={cn(wide ? "h-9 w-full min-w-[88px] sm:h-10" : "h-9 w-[72px] sm:h-10 sm:w-20", className)} />;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const color = up ? "#22c55e" : "#f87171";
  const fillId = `spark-${values[0]}-${values.length}-${wide ? "w" : "n"}`;

  const coords = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 6) - 3;
    return { x, y };
  });

  const line = coords.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${coords.map((p) => `${p.x},${p.y}`).join(" ")} ${width},${height} 0,${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn(wide ? "h-9 w-full min-w-[88px] sm:h-10" : "h-9 w-[72px] sm:w-20", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${fillId})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
