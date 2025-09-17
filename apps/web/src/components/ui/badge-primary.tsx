import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Supabase-like primary badge using the same palette as ButtonPrimary
// Light: bg #f7a641, text #4a2e1a
// Dark:  bg #4a2e1a, text #f8e9b0
const badgePrimary = cva(
  "inline-flex items-center justify-center gap-1 rounded-sm border font-semibold text-xs whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-[3px]",
  {
    variants: {
      tone: {
        solid:
          "bg-[#f7a641] text-[#4a2e1a] border-[#4a2e1a]/20 hover:bg-[#f7a641]/90 focus-visible:ring-[#4a2e1a]/25 " +
          "dark:bg-[#4a2e1a] dark:text-[#f8e9b0] dark:border-[#f8e9b0]/20 dark:hover:bg-[#4a2e1a]/90 dark:focus-visible:ring-[#f8e9b0]/25",
        outline:
          "bg-transparent text-[#4a2e1a] border-[#4a2e1a]/40 hover:bg-[#f7a641]/30 focus-visible:ring-[#4a2e1a]/20 " +
          "dark:text-[#f7a641] dark:border-[#f7a641]/40 dark:hover:bg-[#4a2e1a]/35 dark:focus-visible:ring-[#f7a641]/20",
        ghost:
          "bg-transparent text-[#4a2e1a] border-transparent hover:bg-[#f8e9b0]/40 focus-visible:ring-[#4a2e1a]/15 " +
          "dark:text-[#f8e9b0] dark:hover:bg-[#4a2e1a]/35 dark:focus-visible:ring-[#f8e9b0]/15",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        default: "px-2.5 py-1",
        lg: "px-3.5 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      tone: "solid",
      size: "default",
    },
  },
);

type BadgePrimaryProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgePrimary> & { asChild?: boolean };

function BadgePrimary({
  className,
  tone,
  size,
  asChild = false,
  ...props
}: BadgePrimaryProps) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgePrimary({ tone, size }), className)}
      {...props}
    />
  );
}

export { BadgePrimary, badgePrimary };
