"use client";

import { X } from "lucide-react";
import { useId, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";

export function Drawer({
  triggerLabel,
  title,
  description,
  children,
}: {
  triggerLabel: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

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
        className="ml-auto mr-0 h-dvh max-h-none w-[min(92vw,28rem)] border-0 border-l border-line bg-white p-0 shadow-dialog"
      >
        <div className="flex min-h-full flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-line p-5">
            <div>
              <h2 id={titleId} className="text-xl font-black text-ink-900">{title}</h2>
              {description && <p id={descriptionId} className="mt-1 text-sm leading-6 text-muted-600">{description}</p>}
            </div>
            <IconButton autoFocus label="Close drawer" onClick={close}><X className="size-5" /></IconButton>
          </div>
          <div className="flex-1 overflow-y-auto p-5">{children}</div>
          <div className="border-t border-line p-5"><Button fullWidth onClick={close}>Done</Button></div>
        </div>
      </dialog>
    </>
  );
}
