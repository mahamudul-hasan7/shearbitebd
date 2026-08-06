"use client";

import { X } from "lucide-react";
import { useId, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";

export function Modal({
  triggerLabel,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  triggerLabel: string;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const sizes = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" };

  function close() {
    dialogRef.current?.close();
  }

  return (
    <>
      <Button variant="outline" onClick={() => dialogRef.current?.showModal()}>{triggerLabel}</Button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className={cn("m-auto w-[calc(100%-2rem)] rounded-panel border border-line bg-white p-0 shadow-dialog", sizes[size])}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line p-5 sm:p-6">
          <div>
            <h2 id={titleId} className="text-xl font-black text-ink-900">{title}</h2>
            {description && <p id={descriptionId} className="mt-1 text-sm leading-6 text-muted-600">{description}</p>}
          </div>
          <IconButton autoFocus label="Close dialog" onClick={close} className="shrink-0"><X className="size-5" /></IconButton>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-3 border-t border-line p-5 sm:p-6">{footer}</div>}
      </dialog>
    </>
  );
}
