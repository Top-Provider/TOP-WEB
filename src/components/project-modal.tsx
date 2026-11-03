"use client";

import React, { useEffect } from "react";
import {
  X,
  ArrowUpRight,
  User,
  Calendar,
  Tag,
  Layers,
  Sparkles,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Project } from "../types";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (project) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  const handleInquire = () => {
    onClose();
    const contactEl = document.getElementById("contact");
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#F8FAFC] rounded-[24px] sm:rounded-[32px] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-[0_25px_70px_rgba(15,23,42,0.25)] border border-slate-200/90"
          >
            {/* 1. Sticky Top Header */}
            <div className="px-5 sm:px-8 py-4 bg-white border-b border-slate-100 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900 shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate leading-tight">
                    {project.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">
                    {project.client} • {project.year}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={handleInquire}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-medium shadow-sm transition-all cursor-pointer"
                >
                  <span>Build similar project</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-5">
              {/* Hero Media Box (Video or Image) */}
              <div className="relative rounded-2xl bg-[#0B1120] overflow-hidden aspect-video shadow-md border border-slate-200/60">
                <span className="absolute top-3.5 left-3.5 z-10 px-3 py-1 rounded-full bg-[#0066FF] text-white text-[11px] font-medium shadow-sm pointer-events-none">
                  {project.category}
                </span>

                {project.videoUrl ? (
                  project.videoUrl.includes("youtube.com/embed") ? (
                    <iframe
                      src={project.videoUrl}
                      title={project.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <video
                      src={project.videoUrl}
                      poster={project.coverImage}
                      controls
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  )
                ) : (
                  <img
                    src={project.coverImage}
                    alt={project.name}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* 4-Column Client / Year / Discipline / Stack Strip */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mb-1">
                    <User className="w-3.5 h-3.5 text-[#0066FF]" />
                    <span>Client</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {project.client}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mb-1">
                    <Calendar className="w-3.5 h-3.5 text-[#0066FF]" />
                    <span>Year</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">
                    {project.year}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mb-1">
                    <Tag className="w-3.5 h-3.5 text-[#0066FF]" />
                    <span>Discipline</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {project.category}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mb-1">
                    <Layers className="w-3.5 h-3.5 text-[#0066FF]" />
                    <span>Stack</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {project.technologies.slice(0, 2).join(", ")}
                  </p>
                </div>
              </div>

              {/* Overview Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#0066FF] mb-3">
                  OVERVIEW
                </p>
                <h4 className="text-base sm:text-xl font-bold text-slate-900 leading-relaxed mb-3">
                  {project.shortDescription}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {project.fullDescription}
                </p>
              </div>

              {/* Business Impact Card */}
              {project.metrics && project.metrics.length > 0 && (
                <div className="rounded-2xl bg-gradient-to-r from-[#003B95] to-[#0052CC] text-white p-6 sm:p-7 shadow-md">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-blue-100 pb-3.5 mb-5 border-b border-white/15">
                    <Sparkles className="w-4 h-4" />
                    <span>BUSINESS IMPACT</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {project.metrics.map((metric, i) => (
                      <div key={i}>
                        <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                          {metric.value}
                        </p>
                        <p className="text-xs text-blue-100 mt-1.5">{metric.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* The Challenge & Our Solution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#0066FF] mb-2.5">
                    THE CHALLENGE
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {project.challenge}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#0066FF] mb-2.5">
                    OUR SOLUTION
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {project.solution}
                  </p>
                </div>
              </div>

              {/* Deliverables & Technologies */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 space-y-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#0066FF] mb-3.5">
                    DELIVERABLES
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.deliverables.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-[#0066FF] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {project.technologies && project.technologies.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                      TECHNOLOGIES
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, i) => (
                        <span
                          key={i}
                          className="px-3.5 py-1 rounded-full border border-blue-200/80 bg-blue-50/40 text-[#0066FF] text-xs font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Testimonial Card */}
              {project.testimonial && (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
                  <p className="text-xs sm:text-sm italic text-slate-700 leading-relaxed mb-2.5">
                    &ldquo;{project.testimonial.quote}&rdquo;
                  </p>
                  <p className="text-xs">
                    <span className="font-bold text-slate-900">{project.testimonial.author}</span>{" "}
                    <span className="text-slate-400">—</span>{" "}
                    <span className="text-[#0066FF] font-medium">{project.testimonial.role}</span>
                  </p>
                </div>
              )}
            </div>

            {/* 3. Sticky Bottom Footer */}
            <div className="px-5 sm:px-8 py-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <p className="text-xs text-slate-500">
                Want a tailored case study presentation for your team?
              </p>
              <button
                onClick={handleInquire}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <span>Inquire About Similar Scope</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

