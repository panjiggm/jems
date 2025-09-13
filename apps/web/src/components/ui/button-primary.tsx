import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Supabase-like primary button with custom palette
// Light: bg #f7a641, text #4a2e1a
// Dark:  bg #4a2e1a, text #f8e9b0
const buttonPrimary = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-xs font-bold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] active:translate-y-[0.5px]",
  {
    variants: {
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-sm gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-sm px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
      tone: {
        solid:
          // base + light mode tokens
          "bg-[#f7a641] text-[#4a2e1a] hover:bg-[#f7a641]/90 focus-visible:ring-[#4a2e1a]/30 border border-[#4a2e1a]/20 shadow-xs " +
          // dark mode tokens
          "dark:bg-[#4a2e1a] dark:text-[#f8e9b0] dark:hover:bg-[#4a2e1a]/90 dark:focus-visible:ring-[#f8e9b0]/30 dark:border-[#f8e9b0]/20",
        outline:
          // outline variant: transparent bg, colored border/text
          "bg-transparent text-[#4a2e1a] border border-[#4a2e1a]/50 hover:bg-[#f7a641]/40 focus-visible:ring-[#4a2e1a]/25 " +
          "dark:text-[#f7a641] dark:border-[#f7a641]/50 dark:hover:bg-[#4a2e1a]/40 dark:focus-visible:ring-[#f7a641]/25",
        ghost:
          // subtle background on hover only
          "bg-transparent text-[#4a2e1a] hover:bg-[#f8e9b0]/40 focus-visible:ring-[#4a2e1a]/20 " +
          "dark:text-[#f8e9b0] dark:hover:bg-[#4a2e1a]/40 dark:focus-visible:ring-[#f8e9b0]/20",
      },
    },
    defaultVariants: {
      size: "default",
      tone: "solid",
    },
  },
);

type ButtonPrimaryProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonPrimary> & {
    asChild?: boolean;
  };

function ButtonPrimary({
  className,
  size,
  tone,
  asChild = false,
  ...props
}: ButtonPrimaryProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonPrimary({ size, tone, className }))}
      {...props}
    />
  );
}

export { ButtonPrimary, buttonPrimary };
