"use client";

import React, { useState } from "react";
import { ZoomIn } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export interface TicketAttachmentItem {
  id: number | string;
  stage: string;
  file_name: string;
  data_url: string;
}

export function AttachmentGallery({
  attachments,
}: {
  attachments: TicketAttachmentItem[];
}) {
  const [selected, setSelected] = useState<TicketAttachmentItem | null>(null);

  if (!attachments || attachments.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {attachments.map((att) => (
          <button
            key={att.id}
            type="button"
            onClick={() => setSelected(att)}
            className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={att.data_url}
              alt={att.file_name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/25 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity w-9 h-9 rounded-full bg-white/90 text-slate-800 flex items-center justify-center shadow-md">
                <ZoomIn className="w-4 h-4" />
              </span>
            </div>
            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-slate-900/75 text-white text-[10px] font-semibold">
              {att.stage}
            </span>
          </button>
        ))}
      </div>

      <Modal
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.file_name || "รูปภาพประกอบ"}
        description={selected ? `ประเภท: ${selected.stage}` : undefined}
        maxWidth="4xl"
        closeOnBackdropClick
        footer={
          <Button
            type="button"
            variant="outline"
            onClick={() => setSelected(null)}
            className="rounded-xl px-6 h-10 text-sm font-medium cursor-pointer"
          >
            ปิดหน้าต่าง
          </Button>
        }
      >
        {selected && (
          <div className="flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-200/80 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selected.data_url}
              alt={selected.file_name}
              className="max-h-[70dvh] w-auto max-w-full rounded-xl object-contain"
            />
          </div>
        )}
      </Modal>
    </>
  );
}
