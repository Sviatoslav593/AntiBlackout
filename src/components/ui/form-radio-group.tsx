import React from "react";
import { FieldError, UseFormRegister, Path } from "react-hook-form";
import { cn } from "@/lib/utils";

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface FormRadioGroupProps<T extends Record<string, any>> {
  label: string;
  required?: boolean;
  register: UseFormRegister<T>;
  name: Path<T>;
  error?: FieldError;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function FormRadioGroup<T extends Record<string, any>>({
  label,
  required = false,
  register,
  name,
  error,
  options,
  value,
  onChange,
  className,
  disabled = false,
}: FormRadioGroupProps<T>) {
  const { onChange: registerOnChange, ...registerProps } = register(name);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    registerOnChange(e);
    onChange?.(e.target.value);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-sm font-medium">
        {label} {required && "*"}
      </label>
      <div className="space-y-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors",
              value === option.value
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => {
              if (!disabled) {
                const syntheticEvent = {
                  target: { value: option.value },
                  currentTarget: { value: option.value },
                } as React.ChangeEvent<HTMLInputElement>;
                handleChange(syntheticEvent);
              }
            }}
          >
            <input
              type="radio"
              value={option.value}
              disabled={disabled}
              className="mt-1"
              {...registerProps}
              onChange={handleChange}
              checked={value === option.value}
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                {option.icon && (
                  <span className="text-primary">{option.icon}</span>
                )}
                <span className="font-medium">{option.label}</span>
              </div>
              {option.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {option.description}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
}
