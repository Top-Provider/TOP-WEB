"use client";
import React, { useRef, useId } from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
interface ModalProps {
  isOpen: boolean; onClose: () => void; title: string; description?: string;
  children: React.ReactNode; maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";
  closeOnBackdropClick?: boolean; closeOnEsc?: boolean; footer?: React.ReactNode;
}
const widths = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl", "2xl": "max-w-2xl", "3xl": "max-w-3xl", "4xl": "max-w-4xl", "5xl": "max-w-5xl", "6xl": "max-w-6xl", "7xl": "max-w-7xl" };
export function Modal({ isOpen, onClose, title, description, children, maxWidth = "2xl", closeOnBackdropClick = false, closeOnEsc = true, footer }: ModalProps) {
  const opener = useRef<HTMLElement | null>(null);
  const descriptionId = useId();
  return (
    <Dialog.Root open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs" />
        <Dialog.Content
          aria-describedby={description ? descriptionId : undefined}
          onOpenAutoFocus={() => { opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; }}
          onCloseAutoFocus={event => { event.preventDefault(); if (opener.current?.isConnected) opener.current.focus(); }}
          onEscapeKeyDown={event => { if (!closeOnEsc) event.preventDefault(); }}
          onInteractOutside={event => { if (!closeOnBackdropClick) event.preventDefault(); }}
          className={`fixed left-1/2 top-1/2 z-50 flex max-h-[90dvh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl outline-none ${widths[maxWidth]}`}>
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
            <div className="min-w-0">
              <Dialog.Title className="text-base font-bold leading-snug text-slate-900 sm:text-lg">{title}</Dialog.Title>
              {description && <Dialog.Description id={descriptionId} className="mt-1 text-sm text-slate-500">{description}</Dialog.Description>}
            </div>
            <Dialog.Close asChild><button type="button" aria-label="ปิดหน้าต่าง" title={closeOnEsc ? "ปิด (Esc)" : "ปิด"} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"><X className="h-4 w-4" /></button></Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer && <div className="flex shrink-0 flex-wrap items-center justify-end gap-2.5 border-t border-slate-100 bg-white px-6 py-4">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
