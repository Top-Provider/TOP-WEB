"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { SOCIAL_CHANNELS } from "@/lib/site-navigation";

const SOCIAL_ICONS: Record<(typeof SOCIAL_CHANNELS)[number]["id"], React.ReactNode> = {
  facebook: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  ),
  line: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5zm9.55 1.9a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4z" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.34 0 .66.06.96.16V9.02a6.33 6.33 0 0 0-.96-.08A6.34 6.34 0 0 0 3 15.28 6.34 6.34 0 0 0 9.34 21.6a6.34 6.34 0 0 0 6.34-6.34V8.78a8.18 8.18 0 0 0 4.76 1.52V6.85a4.84 4.84 0 0 1-.85-.16z" />
    </svg>
  ),
};

export function openContactSocialModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("top:open-contact-modal"));
  }
}

export function ContactSocialModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ช่องทางติดต่อออนไลน์"
      description="เลือกช่องทางโซเชียลมีเดียที่ต้องการเพื่อเปิดหน้าติดต่อได้ทันที"
      maxWidth="md"
      closeOnBackdropClick
    >
      <div className="space-y-3">
        {SOCIAL_CHANNELS.map((channel) => (
          <a
            key={channel.name}
            href={channel.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-sm ${channel.bgClass}`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-xs ${channel.iconBgClass}`}
              >
                {SOCIAL_ICONS[channel.id]}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold">{channel.name}</div>
                <div className="text-xs opacity-80 truncate">{channel.subtitle}</div>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 opacity-75" />
          </a>
        ))}
      </div>
    </Modal>
  );
}
