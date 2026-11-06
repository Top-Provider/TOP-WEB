"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Send,
  Loader2,
  SendHorizontal,
} from "lucide-react";

const formSchema = z.object({
  projectType: z.string().min(1, "Please select a project type"),
  fullName: z.string().min(2, "Full name is required"),
  company: z.string().min(2, "Company / organization is required"),
  email: z.string().email("Please enter a valid work email"),
  details: z.string().min(10, "Please provide at least a brief summary (10+ characters)"),
  agreement: z.boolean().refine((val) => val === true, {
    message: "You must accept the privacy policy to proceed",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const projectTypes = [
  "Web Platform",
  "Mobile App",
  "Enterprise Cloud",
  "System Architecture",
];

export function ContactSection() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedType, setSelectedType] = useState(projectTypes[0]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectType: projectTypes[0],
      fullName: "",
      company: "",
      email: "",
      details: "",
      agreement: true,
    },
  });

  const onSubmit = async (data: FormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    console.log("Inquiry submitted:", data);
    setIsSubmitted(true);
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setValue("projectType", type, { shouldValidate: true });
  };

  return (
    <section id="contact" className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
      <div className="w-[94%] max-w-[1680px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Heading and Promises */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-blue-50 text-blue-600 border border-blue-200/60 mb-4">
                <span>START A PROJECT</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Ready to<br />
                accelerate<br />
                <span className="text-blue-600">your digital systems?</span>
              </h2>
              <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
                Partner with our elite engineering team to architect, build, and deploy your next-generation platform.
              </p>
            </div>

            {/* Checkpoints */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Free 30-minute architectural consultation</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>NDA signed prior to project discovery</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Guaranteed response within 24 business hours</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitted(!isSubmitted)}
                className="text-[11px] font-semibold text-slate-400 hover:text-blue-600 transition-colors underline"
              >
                [Toggle view: {isSubmitted ? "Show Form Mode" : "Preview Submitted State"}]
              </button>
            </div>
          </div>

          {/* Right Column: Card matching user's image exactly */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-12 shadow-2xl shadow-slate-200/50 min-h-[420px] flex flex-col justify-center">
              {isSubmitted ? (
                /* The exact Transmission Received card from the user's second screenshot */
                <div className="py-8 text-center space-y-5 animate-in fade-in duration-500">
                  <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
                    <SendHorizontal className="w-8 h-8 -rotate-12 translate-x-0.5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      Transmission Received
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                      Thank you for reaching out to Top Provider System. A senior engineer will review your inquiry and follow up within 24 business hours.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Button
                      onClick={() => {
                        setIsSubmitted(false);
                        reset();
                      }}
                      variant="outline"
                      className="rounded-full text-xs font-semibold px-6 py-2 border-slate-200 hover:bg-slate-50 text-slate-700"
                    >
                      Submit another brief
                    </Button>
                  </div>
                </div>
              ) : (
                /* Interactive Form matching the user's first screenshot */
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Project Scope Pills */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Select Project Scope
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {projectTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleTypeSelect(type)}
                          className={`text-xs font-semibold py-2 px-3 rounded-xl border transition-all text-center truncate ${
                            selectedType === type
                              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                              : "bg-slate-50 text-slate-600 border-slate-200/80 hover:border-blue-300"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name and Company */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Your Full Name *
                      </label>
                      <Input
                        placeholder="John Doe"
                        {...register("fullName")}
                        className="bg-white border-slate-200 rounded-xl text-xs py-2"
                      />
                      {errors.fullName && (
                        <p className="text-[11px] text-rose-500 mt-1">
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Company / Organization *
                      </label>
                      <Input
                        placeholder="Acme Corp, Inc."
                        {...register("company")}
                        className="bg-white border-slate-200 rounded-xl text-xs py-2"
                      />
                      {errors.company && (
                        <p className="text-[11px] text-rose-500 mt-1">
                          {errors.company.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Work Email */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Work Email *
                    </label>
                    <Input
                      type="email"
                      placeholder="john@company.com"
                      {...register("email")}
                      className="bg-white border-slate-200 rounded-xl text-xs py-2"
                    />
                    {errors.email && (
                      <p className="text-[11px] text-rose-500 mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Details */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Project Goals & Requirements *
                    </label>
                    <Textarea
                      rows={3}
                      placeholder="Briefly describe your expected timeline, tech stack preferences, and goals..."
                      {...register("details")}
                      className="bg-white border-slate-200 rounded-xl resize-none text-xs"
                    />
                    {errors.details && (
                      <p className="text-[11px] text-rose-500 mt-1">
                        {errors.details.message}
                      </p>
                    )}
                  </div>

                  {/* Agreement */}
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="agreement"
                      {...register("agreement")}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5 cursor-pointer"
                    />
                    <label htmlFor="agreement" className="text-[11px] text-slate-500 cursor-pointer leading-tight">
                      I agree to allow Top Provider System to store my information for communication regarding this project under our Privacy Policy.
                    </label>
                  </div>
                  {errors.agreement && (
                    <p className="text-[11px] text-rose-500">
                      {errors.agreement.message}
                    </p>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transmitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Project Brief</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
