"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { type VariantProps } from "class-variance-authority";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ButtonPrimary, buttonPrimary } from "./button-primary";
import { cn } from "@/lib/utils";

export interface ButtonGroupOption {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface ButtonGroupDropdownProps extends VariantProps<typeof buttonPrimary> {
  /** Label untuk button utama */
  label: string;
  /** Icon di sebelah kiri label (optional) */
  icon?: React.ReactNode;
  /** Fungsi yang dipanggil saat button utama diklik */
  onMainClick: () => void;
  /** Array options untuk dropdown menu */
  options: ButtonGroupOption[];
  /** Disabled state untuk button utama dan dropdown */
  disabled?: boolean;
  /** Custom className untuk wrapper */
  className?: string;
  /** Custom className untuk button utama */
  buttonClassName?: string;
}

function ButtonGroupDropdown({
  label,
  icon,
  onMainClick,
  options,
  disabled = false,
  className,
  buttonClassName,
  size,
  tone,
}: ButtonGroupDropdownProps) {
  return (
    <div
      className={cn(
        "divide-primary-foreground/30 inline-flex w-fit divide-x rounded-md shadow-xs",
        className,
      )}
    >
      <ButtonPrimary
        onClick={onMainClick}
        disabled={disabled}
        size={size}
        tone={tone}
        className={cn(
          "rounded-none rounded-l-md shadow-none focus-visible:z-10",
          buttonClassName,
        )}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {label}
      </ButtonPrimary>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ButtonPrimary
            size={size || "icon"}
            tone={tone}
            disabled={disabled}
            className="rounded-none rounded-r-md focus-visible:z-10 shadow-none"
          >
            <ChevronDownIcon />
            <span className="sr-only">Select option</span>
          </ButtonPrimary>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          sideOffset={4}
          align="end"
          className="max-w-64 md:max-w-xs!"
        >
          <DropdownMenuRadioGroup>
            {options.map((option, index) => (
              <DropdownMenuRadioItem
                key={`${option.label}-${index}`}
                value={String(index)}
                disabled={option.disabled}
                onClick={option.onClick}
                className={cn(
                  "items-start cursor-pointer",
                  option.description && "[&>span]:pt-1.5",
                )}
              >
                <div className="flex items-start gap-2 w-full">
                  {option.icon && (
                    <span className="shrink-0 mt-0.5 [&_svg]:size-4">
                      {option.icon}
                    </span>
                  )}
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-sm font-medium">{option.label}</span>
                    {option.description && (
                      <span className="text-muted-foreground text-xs">
                        {option.description}
                      </span>
                    )}
                  </div>
                </div>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export { ButtonGroupDropdown };
