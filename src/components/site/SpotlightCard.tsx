import React, { useRef } from "react";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  glowColor?: string;
  borderColor?: string;
}

export function SpotlightCard({
  children,
  className = "",
  innerClassName = "",
  glowColor = "rgba(20, 184, 166, 0.08)",
  borderColor = "rgba(20, 184, 166, 0.22)",
  ...props
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    divRef.current.style.setProperty("--mouse-x", `${x}px`);
    divRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`group/card relative overflow-hidden rounded-[24px] border border-border bg-card p-px transition-all duration-500 hover:border-border/30 ${className}`}
      {...props}
    >
      {/* Background glow trail */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), ${glowColor}, transparent 80%)`,
        }}
      />
      {/* Border glow trail */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 border border-transparent [mask-image:linear-gradient(white,white)]"
        style={{
          background: `radial-gradient(250px circle at var(--mouse-x) var(--mouse-y), ${borderColor}, transparent 60%)`,
          zIndex: 1,
        }}
      />
      {/* Inner Content Wrapper */}
      <div className={`relative z-10 rounded-[inherit] bg-card h-full w-full ${innerClassName}`}>
        {children}
      </div>
    </div>
  );
}
