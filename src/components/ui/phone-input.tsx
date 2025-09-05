import React from "react";
import { FieldError, UseFormRegister, Path } from "react-hook-form";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface PhoneInputProps<T extends Record<string, any>> {
  label: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  register: UseFormRegister<T>;
  name: Path<T>;
  error?: FieldError;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function PhoneInput<T extends Record<string, any>>({
  label,
  placeholder,
  required = false,
  hint,
  register,
  name,
  error,
  value,
  onChange,
  className,
  disabled = false,
}: PhoneInputProps<T>) {
  const {
    onChange: registerOnChange,
    onBlur: registerOnBlur,
    ...registerProps
  } = register(name);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Ensure +380 prefix is always present
    if (!newValue.startsWith("+380")) {
      newValue = "+380";
    }

    // Limit to 13 characters (+380XXXXXXXXX)
    if (newValue.length > 13) {
      newValue = newValue.slice(0, 13);
    }

    // Only allow digits after +380
    const digitsAfter380 = newValue.slice(4);
    if (digitsAfter380 && !/^\d*$/.test(digitsAfter380)) {
      return; // Don't update if non-digits are entered
    }

    registerOnChange(e);
    onChange?.(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const selectionStart = input.selectionStart || 0;

    // Prevent deletion of +380 prefix
    if ((e.key === "Backspace" || e.key === "Delete") && selectionStart <= 4) {
      e.preventDefault();
      // Move cursor to position after +380
      setTimeout(() => {
        input.setSelectionRange(4, 4);
      }, 0);
    }

    // Only allow digits after +380
    if (selectionStart >= 4) {
      const allowedKeys = [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "Tab",
        "Enter",
      ];
      if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-medium">
        {label} {required && "*"}
      </label>
      <Input
        id={name}
        type="tel"
        placeholder={placeholder}
        disabled={disabled}
        className={cn(error && "border-red-500", className)}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        maxLength={13}
        {...registerProps}
      />
      {error && <p className="text-sm text-red-500">{error.message}</p>}
      {!error && hint && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
