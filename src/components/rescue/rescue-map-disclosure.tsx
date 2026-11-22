"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useUiText } from "@/lib/i18n/use-ui-text";
import styles from "./rescue-coordination.module.css";

export function RescueMapDisclosure({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const tx = useUiText();
  return (
    <details className={styles.disclosure} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>{tx("Map & saved handover locations")}<ChevronDown size={17} /></summary>
      {open && <div>{children}</div>}
    </details>
  );
}
