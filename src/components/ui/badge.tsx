import * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive";
}

export const Badge = ({ className, variant = "default", ...props }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold",
      variant === "default" && "bg-blue-100 text-blue-800 border-blue-200",
      variant === "secondary" && "bg-gray-100 text-gray-800 border-gray-200",
      variant === "destructive" && "bg-red-100 text-red-800 border-red-200",
      className
    )}
    {...props}
  />
);
