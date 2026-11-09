"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "ยืนยันการลบข้อมูล",
  description,
  itemName,
  confirmText = "ยืนยันการลบ",
  cancelText = "ยกเลิก",
  isLoading = false,
  variant = "danger",
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  return (
    <div
      onClick={() => {
        if (!isLoading) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200/90 animate-in fade-in zoom-in-95 duration-200 space-y-5"
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              variant === "danger"
                ? "bg-rose-50 text-rose-600 border border-rose-100"
                : "bg-amber-50 text-amber-600 border border-amber-100"
            }`}
          >
            {variant === "danger" ? (
              <Trash2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            {itemName && (
              <p className="text-sm font-semibold text-rose-600 mt-1 break-words">
                &ldquo;{itemName}&rdquo;
              </p>
            )}
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {description ||
                "การดำเนินการนี้ไม่สามารถย้อนกลับได้ ข้อมูลจะถูกลบออกจากฐานข้อมูลอย่างถาวร"}
            </p>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={onClose}
            className="rounded-xl px-4 text-xs font-semibold cursor-pointer"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isLoading}
            onClick={onConfirm}
            className={`rounded-xl px-4 text-xs font-semibold text-white cursor-pointer ${
              variant === "danger"
                ? "bg-rose-600 hover:bg-rose-700 shadow-sm shadow-rose-600/30"
                : "bg-amber-600 hover:bg-amber-700 shadow-sm shadow-amber-600/30"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                กำลังดำเนินการ...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

