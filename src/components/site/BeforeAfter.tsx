import { useCallback, useRef, useState } from "react";

export function BeforeAfter({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
}: {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
}) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const move = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, next)));
  }, []);

  return (
    <div
      ref={ref}
      className="relative aspect-[16/10] w-full cursor-ew-resize overflow-hidden rounded-3xl border border-border shadow-soft select-none"
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && move(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
    >
      <img
        src={after}
        alt={afterLabel}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img
          src={before}
          alt={beforeLabel}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ width: ref.current?.clientWidth ?? "100%", maxWidth: "none" }}
        />
        <span className="absolute bottom-4 left-4 rounded-full bg-navy-gradient px-3 py-1 text-xs font-medium tracking-wide text-primary-foreground">
          {beforeLabel}
        </span>
      </div>
      <span className="absolute right-4 bottom-4 rounded-full bg-card px-3 py-1 text-xs font-medium tracking-wide text-foreground shadow-soft">
        {afterLabel}
      </span>
      <div
        className="pointer-events-none absolute inset-y-0 w-px bg-card"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-card text-foreground shadow-lift">
          <span className="text-xs tracking-widest">◀▶</span>
        </div>
      </div>
    </div>
  );
}
