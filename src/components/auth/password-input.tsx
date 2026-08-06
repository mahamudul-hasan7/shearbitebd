"use client";

import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { Input, type InputProps } from "@/components/ui/input";

export interface PasswordInputProps extends Omit<InputProps, "type" | "leftIcon"> {
  label?: string;
}

export function PasswordInput({
  label = "Password",
  name = "password",
  placeholder = "Enter your password",
  autoComplete = "current-password",
  required = true,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        label={label}
        name={name}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={8}
        leftIcon={<LockKeyhole className="size-5" />}
        className="pr-12"
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        className="absolute right-2 top-8 grid size-8 place-items-center rounded-lg text-muted-600 transition hover:bg-brand-50 hover:text-brand-700"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
      </button>
    </div>
  );
}
