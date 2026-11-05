"use client";

import type { HTMLAttributes, ReactNode } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "subtle" | "interactive";
}

export function GlassCard({
  children,
  className = "",
  variant = "default",
  ...props
}: GlassCardProps) {
  const variantClass = {
    default: "glass-panel",
    subtle: "glass-panel-subtle",
    interactive: "glass-panel-interactive cursor-pointer",
  }[variant];

  return (
    <div
      className={`pointer-events-auto rounded-xl p-4 shadow-2xl ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
