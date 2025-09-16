"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ButtonPrimary } from "@/components/ui/button-primary";

interface Step1ProfileProps {
  onNext: (data: { full_name: string; phone: string }) => void;
  onPrevious: () => void;
  initialData?: { full_name: string; phone: string };
}

export function Step1Profile({
  onNext,
  onPrevious,
  initialData,
}: Step1ProfileProps) {
  const [fullName, setFullName] = useState(initialData?.full_name || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [errors, setErrors] = useState<{ full_name?: string; phone?: string }>(
    {},
  );

  const validateForm = () => {
    const newErrors: { full_name?: string; phone?: string } = {};

    if (!fullName.trim()) {
      newErrors.full_name = "Full name is required";
    } else if (fullName.trim().length < 2) {
      newErrors.full_name = "Full name must be at least 2 characters";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(phone.trim())) {
      newErrors.phone = "Please enter a valid phone number";
    } else if (phone.replace(/\D/g, "").length < 10) {
      newErrors.phone = "Phone number must be at least 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext({
        full_name: fullName.trim(),
        phone: phone.trim(),
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Let's Get to Know You! 👤</h3>
        <p className="text-muted-foreground text-sm">
          We'll need some basic information to set up your profile
        </p>
      </div>

      <div className="space-y-4">
        {/* Full Name Input */}
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium">
            Full Name *
          </label>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onKeyPress={handleKeyPress}
            className={errors.full_name ? "border-red-500" : ""}
          />
          {errors.full_name && (
            <p className="text-red-500 text-xs">{errors.full_name}</p>
          )}
        </div>

        {/* Phone Input */}
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone Number *
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyPress={handleKeyPress}
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs">{errors.phone}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Include country code if outside Indonesia (e.g., +62 812 3456 7890)
          </p>
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

        <ButtonPrimary
          onClick={handleNext}
          disabled={!fullName.trim() || !phone.trim()}
        >
          Next
        </ButtonPrimary>
      </div>
    </div>
  );
}
