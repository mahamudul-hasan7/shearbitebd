import type { ReactNode } from "react";
import type { PortalRole } from "@/types/navigation";
import styles from "./portal-theme.module.css";
export function PortalTheme({
  role,
  children,
}: {
  role: PortalRole;
  children: ReactNode;
}) {
  return (
    <div className={styles.theme} data-portal-role={role}>
      {children}
    </div>
  );
}
