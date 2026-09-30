import { Search } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SearchInputProps extends Omit<InputProps, "type" | "leftIcon"> {
  label?: string;
}

export function SearchInput({ label = "Search", placeholder = "Search", containerClassName, ...props }: SearchInputProps) {
  return (
    <Input
      type="search"
      label={label}
      placeholder={placeholder}
      enterKeyHint="search"
      containerClassName={cn("min-w-0", containerClassName)}
      leftIcon={<Search className="size-5" aria-hidden="true" />}
      {...props}
    />
  );
}
