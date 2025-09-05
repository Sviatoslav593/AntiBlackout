import React from "react";
import { FieldError, UseFormRegister, Path } from "react-hook-form";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface FormInputProps<T extends Record<string, any>> {
  label: string;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  required?: boolean;
  hint?: string;
  register: UseFormRegister<T>;
  name: Path<T>;
  error?: FieldError;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  className?: string;
  disabled?: boolean;
}

export function FormInput<T extends Record<string, any>>({
  label,
  placeholder,
  type = "text",
  maxLength,
  required = false,
  hint,
  register,
  name,
  error,
  value,
  onChange,
  onBlur,
  className,
  disabled = false,
}: FormInputProps<T>) {
  const {
    onChange: registerOnChange,
    onBlur: registerOnBlur,
    ...registerProps
  } = register(name);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    registerOnChange(e);
    onChange?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    registerOnBlur(e);
    onBlur?.();
  };

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-medium">
        {label} {required && "*"}
      </label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className={cn(error && "border-red-500", className)}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        {...registerProps}
      />
      {error && <p className="text-sm text-red-500">{error.message}</p>}
      {!error && hint && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
