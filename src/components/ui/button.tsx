import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "rounded-full bg-primary text-primary-foreground shadow-none hover:opacity-90",
        secondary:
          "rounded-full border border-border bg-secondary/60 text-foreground hover:bg-secondary",
        outline:
          "rounded-full border border-border bg-transparent text-foreground hover:bg-secondary/50",
        ghost:
          "rounded-xl text-muted hover:text-foreground hover:bg-secondary/60",
        destructive:
          "rounded-full border border-red-500/25 bg-red-500/10 text-red-500 hover:bg-red-500/15",
        link: "rounded-none text-emerald underline-offset-4 hover:underline",
        gold:
          "rounded-full bg-emerald text-void hover:bg-emerald-glow",
        pill:
          "rounded-full bg-primary text-primary-foreground shadow-none hover:opacity-90",
      },
      size: {
        default: "h-11 px-6 text-sm",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
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
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
