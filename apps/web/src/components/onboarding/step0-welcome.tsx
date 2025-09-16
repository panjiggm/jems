"use client";

import { ButtonPrimary } from "@/components/ui/button-primary";
import Image from "next/image";

interface Step0WelcomeProps {
  onNext: () => void;
  onPrevious: () => void;
}

export function Step0Welcome({ onNext, onPrevious }: Step0WelcomeProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        {/* Welcome GIF */}
        <div className="flex justify-center">
          <div className="relative w-48 h-48 rounded-lg overflow-hidden">
            <Image
              src="/images/welcome.gif"
              alt="Welcome to Holobiont"
              fill
              className="object-cover"
              priority
              unoptimized // Allow GIF animation
            />
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-2xl font-bold text-primary">
          Welcome to Holobiont! 🎉
        </h2>

        <div className="text-base text-muted-foreground mt-4">
          This quick setup will help us understand your interests and
          preferences. It's only takes{" "}
          <strong className="text-stone-700">2-3 minutes</strong> ⏱️
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <ButtonPrimary
          tone="outline"
          onClick={onPrevious}
          className="invisible"
        >
          Previous
        </ButtonPrimary>

        <ButtonPrimary onClick={onNext} className="px-8">
          Let's Get Started!
        </ButtonPrimary>
      </div>
    </div>
  );
}
