"use client";

import { useUiText } from "@/lib/i18n/use-ui-text";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { Input, type InputProps } from "@/components/ui/input";

export type PasswordInputProps = Omit<
  InputProps,
  "type" | "leftIcon" | "rightElement"
>;

export function PasswordInput({
  label = "Password",
  name = "password",
  placeholder = "Enter your password",
  autoComplete = "current-password",
  required = true,
  ...props
}: PasswordInputProps) {
  const tx = useUiText();
  const [visible, setVisible] = useState(false);
  return (
    <Input
      label={label}
      name={name}
      type={visible ? "text" : "password"}
      placeholder={placeholder}
      autoComplete={autoComplete}
      required={required}
      minLength={8}
      leftIcon={<LockKeyhole className="size-5" />}
      rightElement={
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="grid size-11 place-items-center rounded-lg text-muted-600 transition hover:bg-brand-50 hover:text-brand-700"
          aria-label={visible ? tx("Hide password") : tx("Show password")}
          aria-pressed={visible}
          aria-controls={props.id ?? name}
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      }
      {...props}
    />
  );
}
