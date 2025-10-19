"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  parseDurationString,
  formatDurationString,
  type DurationUnit,
} from "@/lib/duration-utils";
import { cn } from "@/lib/utils";

export interface DurationInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
  helperText?: string;
}

export function DurationInput({
  value = "",
  onChange,
  placeholder = "",
  disabled = false,
  className,
  error = false,
  helperText,
}: DurationInputProps) {
  const [internalValue, setInternalValue] = React.useState("");
  const [internalUnit, setInternalUnit] = React.useState<DurationUnit>("d");
  const [isValid, setIsValid] = React.useState(true);
  const [isFocused, setIsFocused] = React.useState(false);

  // Parse initial value
  React.useEffect(() => {
    if (value) {
      const parsed = parseDurationString(value);
      if (parsed) {
        setInternalValue(parsed.value.toString());
        setInternalUnit(parsed.unit);
        setIsValid(true);
      }
    } else {
      setInternalValue("");
      setIsValid(true);
    }
  }, [value]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);

    // Validate on change
    if (newValue === "") {
      setIsValid(true);
      onChange?.("");
      return;
    }

    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && numValue >= 0) {
      const formatted = formatDurationString(numValue, internalUnit);
      setIsValid(true);
      onChange?.(formatted);
    } else {
      setIsValid(false);
    }
  };

  const handleUnitChange = (newUnit: DurationUnit) => {
    setInternalUnit(newUnit);

    if (internalValue && !isNaN(parseFloat(internalValue))) {
      const numValue = parseFloat(internalValue);
      const formatted = formatDurationString(numValue, newUnit);
      onChange?.(formatted);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);

    // Re-validate on blur
    if (internalValue) {
      const numValue = parseFloat(internalValue);
      if (!isNaN(numValue) && numValue >= 0) {
        // Clean up decimal places
        const formatted = formatDurationString(numValue, internalUnit);
        const parsed = parseDurationString(formatted);
        if (parsed) {
          setInternalValue(parsed.value.toString());
          setIsValid(true);
        }
      } else {
        setIsValid(false);
      }
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-1.5">
        <Input
          type="text"
          value={internalValue}
          onChange={handleValueChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "flex-1 h-7 text-xs placeholder:text-xs",
            (error || !isValid) && "border-red-500 focus-visible:ring-red-500",
          )}
        />
        <Select
          value={internalUnit}
          onValueChange={handleUnitChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-[70px] h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="d" className="text-xs">
              Days
            </SelectItem>
            <SelectItem value="h" className="text-xs">
              Hours
            </SelectItem>
            <SelectItem value="m" className="text-xs">
              Min
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {helperText && (
        <p
          className={cn(
            "text-xs",
            error || !isValid ? "text-red-500" : "text-muted-foreground",
          )}
        >
          {helperText}
        </p>
      )}

      {!isValid && !helperText && (
        <p className="text-xs text-red-500">
          Please enter a valid number (e.g., 1, 1.5, 2.3)
        </p>
      )}
    </div>
  );
}
