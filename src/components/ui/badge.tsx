import * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold", 
        variant === "outline"
          ? "border border-slate-200 text-slate-700"
          : "bg-slate-900 text-white",
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = "Badge";
