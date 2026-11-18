"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToastContainer, toast } from "@/components/ui/toast";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Send,
} from "lucide-react";

const MAP_QUERY = encodeURIComponent(
  "Top provider systems group co.,ltd 129/18 Bang Yitho Thanyaburi Pathum Thani 12130"
);

export default function ContactPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const nextErrors: Record<string, string> = {};
    if (!firstName.trim()) nextErrors.firstName = "กรุณาระบุชื่อ";
    if (!email.trim()) {
      nextErrors.email = "กรุณาระบุอีเมล";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }
    if (!subject.trim()) nextErrors.subject = "กรุณาระบุหัวข้อที่ติดต่อ";
    if (!message.trim()) nextErrors.message = "กรุณาระบุข้อความ";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.warning("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          subject,
          message,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "ไม่สามารถส่งข้อความได้");
      }
      setSubmitted(true);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
      toast.success("ส่งข้อความติดต่อเรียบร้อยแล้ว ทีมงานจะติดต่อกลับโดยเร็ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_15%_10%,rgba(219,234,254,0.85),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(224,242,254,0.75),transparent_30%),#f7faff]">
      <Navbar />

      <main className="flex-1 pt-8 sm:pt-12 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Main 2-Column Map + Contact Form */}
          <div className="bg-white rounded-[28px] border border-blue-100/80 shadow-[0_20px_60px_rgba(30,64,175,0.08)] p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Left: Google Map */}
            <div className="flex flex-col gap-3">
              <div className="relative flex-1 min-h-[360px] lg:min-h-[480px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <iframe
                  title="แผนที่บริษัท ท็อป โปรไวเดอร์ ซิสเต็ม กรุ๊ป จำกัด"
                  src={`https://maps.google.com/maps?q=${MAP_QUERY}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full min-h-[360px] lg:min-h-[480px] border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs">
                <div className="text-slate-600">
                  <strong className="text-slate-900 block">
                    บริษัท ท็อป โปรไวเดอร์ ซิสเต็ม กรุ๊ป จำกัด
                  </strong>
                  129/18 ต.บึงยี่โถ อ.ธัญบุรี จ.ปทุมธานี 12130
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:underline shrink-0"
                >
                  เปิดใน Google Maps
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Right: Contact Form + Our Hours */}
            <div className="flex flex-col justify-between space-y-6">
              {submitted ? (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center space-y-3 my-auto">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">ได้รับข้อความของคุณเรียบร้อยแล้ว</h2>
                  <p className="text-sm text-slate-600">
                    ขอบคุณที่ติดต่อ TOP PROVIDER ทีมงานจะตรวจสอบและติดต่อกลับโดยเร็วที่สุดครับ
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSubmitted(false)}
                    className="mt-2 bg-white"
                  >
                    ส่งข้อความเพิ่มเติม
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        ชื่อ (First Name) <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          if (errors.firstName) setErrors((p) => ({ ...p, firstName: "" }));
                        }}
                        placeholder="ชื่อ"
                        className={`h-11 ${errors.firstName ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15" : ""}`}
                      />
                      {errors.firstName && <p className="mt-1 text-xs text-rose-600">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        นามสกุล (Last Name)
                      </label>
                      <Input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="นามสกุล"
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        อีเมล (Email Address) <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors((p) => ({ ...p, email: "" }));
                        }}
                        placeholder="name@hospital.go.th"
                        className={`h-11 ${errors.email ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15" : ""}`}
                      />
                      {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        เบอร์โทรศัพท์
                      </label>
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="08x-xxx-xxxx"
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      หัวข้อที่ติดต่อ (Subject) <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={subject}
                      onChange={(e) => {
                        setSubject(e.target.value);
                        if (errors.subject) setErrors((p) => ({ ...p, subject: "" }));
                      }}
                      placeholder="เช่น สอบถามใบเสนอราคา / นัด Demo ระบบ"
                      className={`h-11 ${errors.subject ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15" : ""}`}
                    />
                    {errors.subject && <p className="mt-1 text-xs text-rose-600">{errors.subject}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      ข้อความ (Your Message) <span className="text-rose-500">*</span>
                    </label>
                    <Textarea
                      rows={5}
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (errors.message) setErrors((p) => ({ ...p, message: "" }));
                      }}
                      placeholder="ระบุรายละเอียดที่ต้องการสอบถาม..."
                      className={`p-3.5 ${errors.message ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15" : ""}`}
                    />
                    {errors.message && <p className="mt-1 text-xs text-rose-600">{errors.message}</p>}
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-11 px-7 rounded-full bg-[#0874ff] hover:bg-blue-700 text-white font-bold gap-2 shadow-lg shadow-blue-200"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    ส่งข้อความติดต่อ
                  </Button>
                </form>
              )}

              {/* OUR HOURS */}
              <div className="pt-5 border-t border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0874ff]">
                  <Clock className="w-4 h-4" />
                  OUR HOURS · เวลาทำการ
                </div>
                <p className="text-sm text-slate-700 font-medium">
                  จันทร์ – ศุกร์ 08.30 น. – 18.00 น. · วันหยุดประจำสัปดาห์ วันเสาร์ – วันอาทิตย์
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <ToastContainer />
    </div>
  );
}
