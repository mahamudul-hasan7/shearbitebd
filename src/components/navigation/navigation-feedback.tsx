"use client";
import { useLinkStatus } from "next/link";
import styles from "./navigation-feedback.module.css";

export function NavigationFeedback() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden="true"
      className={styles.progress}
      data-navigation-pending={pending}
    />
  );
}
