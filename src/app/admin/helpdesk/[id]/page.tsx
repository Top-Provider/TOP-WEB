"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminTicketDetail } from "@/components/helpdesk/admin-ticket-detail";

export default function AdminHelpdeskDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/helpdesk">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            กลับคิวงาน
          </Button>
        </Link>
      </div>
      <AdminTicketDetail ticketId={params.id} />
    </div>
  );
}
