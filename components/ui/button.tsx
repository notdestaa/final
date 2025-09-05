import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg bg-black text-white px-4 py-2 text-sm font-medium hover:bg-blue-600 transition",
        className
      )}
      {...props}
    />
  );
}
