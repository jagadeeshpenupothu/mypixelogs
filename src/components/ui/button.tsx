import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-200 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_8px_18px_rgba(37,99,235,0.18)] hover:-translate-y-0.5 hover:bg-primary/95 hover:shadow-[0_10px_22px_rgba(37,99,235,0.20)] active:bg-primary/90 dark:shadow-none dark:hover:bg-primary/90",
        secondary:
          "border border-border bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-muted active:bg-muted/80 dark:bg-[#111111] dark:hover:border-white/20 dark:hover:bg-[#171717]",
        outline:
          "border border-border bg-background/70 hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-muted hover:text-foreground active:bg-muted/80 dark:bg-[#0A0A0A] dark:hover:border-white/20 dark:hover:bg-[#171717]",
        ghost:
          "hover:bg-muted hover:text-foreground active:bg-muted/80 dark:hover:bg-white/[0.06]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
