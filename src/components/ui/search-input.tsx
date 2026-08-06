import { Search } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/input";

export interface SearchInputProps extends Omit<InputProps, "type" | "leftIcon"> {
  label?: string;
}

export function SearchInput({ label = "Search", placeholder = "Search", ...props }: SearchInputProps) {
  return (
    <Input
      type="search"
      label={label}
      placeholder={placeholder}
      leftIcon={<Search className="size-5" aria-hidden="true" />}
      {...props}
    />
  );
}
