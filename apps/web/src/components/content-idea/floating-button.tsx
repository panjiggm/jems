"use client";

import { ButtonPrimary } from "../ui/button-primary";
import { PlusIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export function FloatingButton({ onClick, isOpen }: FloatingButtonProps) {
  return (
    <ButtonPrimary
      onClick={onClick}
      size="lg"
      className={cn(
        "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300",
        "hover:scale-110 hover:shadow-xl",
        isOpen && "rotate-45"
      )}
      aria-label={isOpen ? "Close content idea form" : "Add content idea"}
    >
      {isOpen ? (
        <XIcon className="h-6 w-6" />
      ) : (
        <PlusIcon className="h-6 w-6" />
      )}
    </ButtonPrimary>
  );
}

