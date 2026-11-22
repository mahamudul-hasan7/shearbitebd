import type { ReactNode } from "react";
import styles from "./collection-toolbar.module.css";
export function CollectionToolbar({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div role="search" aria-label={label} className={styles.toolbar}>
      {children}
    </div>
  );
}
