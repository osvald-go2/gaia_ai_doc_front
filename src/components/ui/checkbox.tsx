"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox@1.1.4";
import { CheckIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer group relative size-[17px] shrink-0 rounded-[3px] border-2 shadow-sm outline-none transition-all duration-200",
        // Default/unchecked state
        "border-muted-foreground/30 bg-card hover:border-primary/60 hover:bg-primary/5",
        // Focus state
        "focus-visible:ring-[3px] focus-visible:ring-primary/20 focus-visible:border-primary",
        // Checked state
        "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:shadow-md",
        "[&[data-state=checked]]:shadow-primary/30",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-muted-foreground/30",
        // Error state
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-primary-foreground"
      >
        <CheckIcon 
          className="size-3" 
          strokeWidth={3}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
