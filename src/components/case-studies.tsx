"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, CheckCircle2, Play, Pause, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Project } from '../types';
import { ProjectModal } from './project-modal';
import { fetchRecords } from '@/lib/crud';

interface StickyProjectSectionProps {
  onSelectProject?: (project: Project) => void;
  initialSoftwareRecords?: Record<string, unknown>[];
  initialProducts?: Record<string, unknown>[];
}

export interface SolutionCardItem {
  id: string;
  tabCategory: 'printing' | 'hardware' | 'software' | 'network' | 'medical' | 'iot';
  counterText: string;
  urlPath: string;
  clientSubtitle: string;
  ctaText?: string;
  isProductPhoto?: boolean;
  project: Project;
}

export const SOLUTION_TABS = [
  { id: 'printing', label: 'Printing & Supply Solution' },
  { id: 'hardware', label: 'Hardware Solution' },
  { id: 'software', label: 'Software Solution' },
  { id: 'network', label: 'Network Solution' },
  { id: 'medical', label: 'Medical Equipment' },
  { id: 'iot', label: 'Smart Solution (IoT)' },
] as const;

export type TabId = typeof SOLUTION_TABS[number]['id'];

// ค่าเริ่มต้นเป็น Array ว่าง ไม่ใช้ข้อมูล mock
export const ALL_SOLUTION_CARDS: SolutionCardItem[] = [];

export interface SoftwareRecord {
  id: number;
  name: string;
  category_id?: string;
  program_code?: string;
  client_subtitle?: string;
  short_description?: string;
  full_description?: string;
  video_url?: string;
  cover_image_url?: string;
  key_features?: string[] | string;
  metric_label?: string;
  metric_value?: string;
  is_active?: boolean;
  feature_1_badge?: string;
  feature_1_title?: string;
  feature_1_desc?: string;
  feature_1_bullets?: string[] | string;
  feature_1_image?: string;
  feature_2_badge?: string;
  feature_2_title?: string;
  feature_2_desc?: string;
  feature_2_highlights?: string[] | string;
  feature_2_tags?: string[] | string;
  feature_2_image?: string;
}

export interface DbProductRecord {
  id: number;
  name: string;
  sku?: string;
  slug?: string;
  category_id?: string;
  sub_category?: string;
  brand?: string;
  product_type?: string;
  short_description?: string;
  full_description?: string;
  specifications?: { label: string; value: string }[] | Record<string, unknown>[];
  bullet_points?: string[];
  cover_image_url?: string;
  gallery_images?: string[];
  compatible_products?: string[];
  datasheet_en_url?: string;
  tor_th_url?: string;
  is_active?: boolean;
}

export function mapSoftwareRecordToCardItem(
  r: SoftwareRecord,
  index: number,
  total: number
): SolutionCardItem {
  const counterText = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  const category =
    r.program_code && r.program_code !== 'Software'
      ? r.program_code
      : r.category_id && r.category_id !== 'Software'
      ? r.category_id
      : 'Hospital Software';
  const subCategory = r.client_subtitle || 'Healthcare Solution';

  let deliverables: string[] = [];
  if (Array.isArray(r.key_features) && r.key_features.length > 0) {
    deliverables = r.key_features;
  } else if (typeof r.key_features === 'string' && r.key_features.trim()) {
    deliverables = r.key_features.split('\n').map((s) => s.trim()).filter(Boolean);
  }

  const metrics: { label: string; value: string }[] = [];
  if (r.metric_value) {
    metrics.push({
      value: r.metric_value,
      label: r.metric_label || 'ประสิทธิภาพการทำงาน',
    });
  }

  const coverImage = r.cover_image_url || '/images/vitanix-dashboard-hd.png';

  return {
    id: `software-${r.id}`,
    tabCategory: 'software',
    counterText,
    urlPath: `Topprovider.co.th / ${r.name}`,
    clientSubtitle: `2026 • ${subCategory}`,
    project: {
      id: `vitanix-${r.id}`,
      name: r.name,
      client: subCategory,
      year: '2026',
      category: category,
      subCategory: subCategory,
      shortDescription: r.short_description || '',
      fullDescription: r.full_description || r.short_description || '',
      challenge: r.feature_1_desc || '',
      solution: r.feature_2_desc || '',
      deliverables,
      metrics,
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'HL7/FHIR'],
      coverImage: coverImage,
      videoUrl: r.video_url || '',
      galleryImages: [coverImage],
      featured: true,
      accentColor: '#0066FF',
    },
  };
}

export function mapProductRecordToCardItem(
  p: DbProductRecord,
  index: number,
  total: number
): SolutionCardItem {
  const counterText = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  const rawCat = (p.category_id || '').toLowerCase();

  let tabCategory: SolutionCardItem['tabCategory'] = 'printing';
  if (rawCat.includes('hardware')) tabCategory = 'hardware';
  else if (rawCat.includes('software')) tabCategory = 'software';
  else if (rawCat.includes('network')) tabCategory = 'network';
  else if (rawCat.includes('medical')) tabCategory = 'medical';
  else if (rawCat.includes('iot') || rawCat.includes('smart')) tabCategory = 'iot';
  else tabCategory = 'printing';

  const subCategory = p.sub_category || p.brand || 'Product Item';
  const coverImage = p.cover_image_url || '/images/printer-product.png';

  let deliverables: string[] = [];
  if (Array.isArray(p.bullet_points) && p.bullet_points.length > 0) {
    deliverables = p.bullet_points;
  } else if (Array.isArray(p.compatible_products) && p.compatible_products.length > 0) {
    deliverables = p.compatible_products;
  } else if (Array.isArray(p.specifications) && p.specifications.length > 0) {
    deliverables = (p.specifications as { label?: string; value?: string }[])
      .slice(0, 5)
      .map((s) => `${s.label || ''}: ${s.value || ''}`.trim())
      .filter(Boolean);
  }

  return {
    id: `product-${p.id}`,
    tabCategory,
    counterText,
    urlPath: `Topprovider.co.th / ${p.name}`,
    clientSubtitle: `2026 • ${subCategory}`,
    isProductPhoto: true,
    ctaText: 'ดูรายละเอียดสินค้า',
    project: {
      id: `prod-${p.id}`,
      name: p.name,
      client: subCategory,
      year: '2026',
      category: p.category_id || 'Printing',
      subCategory: subCategory,
      shortDescription: p.short_description || p.full_description || '',
      fullDescription: p.full_description || p.short_description || '',
      challenge: '',
      solution: '',
      deliverables,
      metrics: [],
      technologies: [p.brand || 'Enterprise Hardware'],
      coverImage: coverImage,
      galleryImages:
        Array.isArray(p.gallery_images) && p.gallery_images.length > 0
          ? p.gallery_images
          : [coverImage],
      featured: true,
      accentColor: '#0066FF',
    },
  };
}

export const StickyProjectSection: React.FC<StickyProjectSectionProps> = ({
  onSelectProject,
  initialSoftwareRecords,
  initialProducts,
}) => {
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/solutions/printing?type=printer');
    router.prefetch('/solutions/printing?type=supply');
    router.prefetch('/solutions/software');
    router.prefetch('/products');
  }, [router]);

  const [activeTab, setActiveTab] = useState<string>('software');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Dynamic Solution Category Tabs from /api/admin/categories
  const [solutionTabs, setSolutionTabs] = useState<{ id: string; label: string }[]>(
    SOLUTION_TABS.map((t) => ({ id: t.id, label: t.label }))
  );

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((json) => {
        if (json && json.success && Array.isArray(json.categories) && json.categories.length > 0) {
          const dynamicTabs = json.categories
            .filter((c: { is_active?: boolean }) => c.is_active !== false)
            .map((c: { category_id: string; name: string }) => ({
              id: (c.category_id || '').toLowerCase(),
              label: c.name || c.category_id,
            }));
          if (dynamicTabs.length > 0) setSolutionTabs(dynamicTabs);
        }
      })
      .catch((err) => console.log('Tabs API fallback:', err));
  }, []);

  // Cards from DB (Software)
  const initialSoftwareCards = useMemo(() => {
    if (initialSoftwareRecords && initialSoftwareRecords.length > 0) {
      return initialSoftwareRecords.map((r, i) =>
        mapSoftwareRecordToCardItem(r as unknown as SoftwareRecord, i, initialSoftwareRecords.length)
      );
    }
    return [];
  }, [initialSoftwareRecords]);

  // Cards from DB (Products)
  const initialProductCards = useMemo(() => {
    if (initialProducts && initialProducts.length > 0) {
      return initialProducts.map((p, i) =>
        mapProductRecordToCardItem(p as unknown as DbProductRecord, i, initialProducts.length)
      );
    }
    return [];
  }, [initialProducts]);

  const [dynamicSoftwareCards, setDynamicSoftwareCards] = useState<SolutionCardItem[]>(initialSoftwareCards);
  const [dynamicProductCards, setDynamicProductCards] = useState<SolutionCardItem[]>(initialProductCards);

  // Client-side fetch fallback if server didn't provide
  useEffect(() => {
    if (dynamicSoftwareCards.length === 0) {
      fetchRecords<SoftwareRecord>({
        table: 'TB_PRODUCT_SOFTWARE',
        orderBy: 'id',
        orderDir: 'asc',
      })
        .then((records) => {
          if (records && records.length > 0) {
            setDynamicSoftwareCards(
              records.map((r, i) => mapSoftwareRecordToCardItem(r, i, records.length))
            );
          }
        })
        .catch((err) => console.error('Error loading software from DB:', err));
    }

    if (dynamicProductCards.length === 0) {
      fetchRecords<DbProductRecord>({
        table: 'TB_PRODUCTS',
        orderBy: 'id',
        orderDir: 'asc',
      })
        .then((records) => {
          if (records && records.length > 0) {
            setDynamicProductCards(
              records.map((p, i) => mapProductRecordToCardItem(p, i, records.length))
            );
          }
        })
        .catch((err) => console.error('Error loading products from DB:', err));
    }
  }, [dynamicSoftwareCards.length, dynamicProductCards.length]);

  // Filter cards for active tab (DB ONLY)
  const currentCards = useMemo(() => {
    if (activeTab === 'software') {
      return dynamicSoftwareCards;
    }
    return dynamicProductCards.filter((item) => item.tabCategory === activeTab);
  }, [activeTab, dynamicSoftwareCards, dynamicProductCards]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setPlayingVideoId(null);
  };

  const toggleVideoPlayback = (e: React.MouseEvent, cardId: string) => {
    e.stopPropagation();
    setPlayingVideoId(playingVideoId === cardId ? null : cardId);
  };

  const handleSelectProject = (project: Project) => {
    if (onSelectProject) {
      onSelectProject(project);
    } else {
      setSelectedProject(project);
    }
  };

  const handleSelectCard = (cardItem: SolutionCardItem) => {
    if (cardItem.tabCategory === 'printing') {
      if (cardItem.id === 'printing-printer') {
        router.push('/solutions/printing?type=printer');
        return;
      }
      if (cardItem.id === 'printing-supplies') {
        router.push('/solutions/printing?type=supply');
        return;
      }
      router.push('/solutions/printing');
      return;
    }
    handleSelectProject(cardItem.project);
  };

  return (
    <section id="showcase" className="py-12 sm:py-16 lg:py-20 bg-[#F8FAFC] text-slate-900 relative z-20 border-b border-slate-200/80 select-none">
      <div id="case-studies" className="w-[94%] max-w-[1680px] mx-auto px-2 sm:px-4 lg:px-6">
        {/* Section Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0F172A] leading-[1.2]">
            IT Solution & Product
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 font-normal">
            เลือกดูโซลูชันและผลิตภัณฑ์ตามหมวดหมู่การใช้งานที่ครอบคลุมทุกระบบโรงพยาบาลและองค์กร
          </p>
        </div>

        {/* Sticky Tab List / Pill Navigation Bar */}
        <div className="sticky top-0 z-30 py-2.5 sm:py-3 bg-[#F8FAFC]/95 backdrop-blur-md mb-6 sm:mb-8 -mx-2 px-2 sm:-mx-4 sm:px-4 transition-all">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-2 px-1.5 -mx-1.5 no-scrollbar">
            {solutionTabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`shrink-0 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#0066FF] text-white border border-[#0066FF] shadow-sm shadow-blue-500/25 scale-[1.02]'
                      : 'bg-white text-slate-700 border border-slate-200/90 hover:border-blue-200 hover:text-[#0066FF] hover:bg-blue-50/40 shadow-2xs'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Cards Stage or Empty State */}
        {currentCards.length === 0 ? (
          <div className="rounded-3xl bg-white border border-slate-200/90 p-12 text-center my-8 shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 flex items-center justify-center text-[#0066FF]">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">ยังไม่มีข้อมูลในหมวดหมู่นี้</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              ขณะนี้ยังไม่มีข้อมูลโซลูชันหรือสินค้าในหมวดหมู่นี้ในระบบฐานข้อมูล คุณสามารถเลือกดูหมวดหมู่อื่นๆ หรือติดต่อทีมงานเพื่อสอบถามรายละเอียด
            </p>
          </div>
        ) : (
          <div className="relative space-y-10 lg:space-y-14">
            {currentCards.map((cardItem, index) => {
              const topOffset = 84 + index * 16;
              const project = cardItem.project;
              const isPlaying = playingVideoId === cardItem.id;

              return (
                <motion.div
                  key={cardItem.id}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  style={{ top: `${topOffset}px` }}
                  className="sticky rounded-[24px] sm:rounded-[32px] lg:rounded-[36px] bg-[#FFFFFF] border border-blue-100/90 shadow-[0_20px_50px_rgba(0,102,255,0.06)] overflow-hidden transition-all duration-300"
                >
                  {/* Top Browser Window Bar */}
                  <div className="px-6 sm:px-8 py-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] inline-block" />
                      </div>
                      <span className="text-xs font-medium text-slate-500 ml-2 truncate">
                        {cardItem.urlPath}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400 bg-white px-2.5 py-1 rounded-md border border-slate-200/80">
                        {project.category}
                      </span>
                      {project.videoUrl && (
                        <button
                          type="button"
                          onClick={(e) => toggleVideoPlayback(e, cardItem.id)}
                          className="px-3 py-1 rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white text-[11px] font-medium flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                        >
                          {isPlaying ? (
                            <>
                              <Pause className="w-3 h-3 fill-white" />
                              <span>หยุดวิดีโอ</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-white" />
                              <span>เล่นวิดีโอ</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Main Card Body */}
                  <div className="flex flex-col lg:flex-row min-h-[460px] sm:min-h-[500px]">
                    {/* Left Column: Product Information */}
                    <div className="w-full lg:w-[38%] p-6 sm:p-8 lg:p-8 xl:p-9 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100 bg-[#FFFFFF] shrink-0">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <span className="inline-flex items-center justify-center text-xs font-mono font-semibold text-[#0066FF] bg-blue-50/90 px-3 py-1 rounded-full border border-blue-100 leading-none">
                            {cardItem.counterText}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {cardItem.clientSubtitle}
                          </span>
                        </div>

                        <h3 className="text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight text-[#0F172A] leading-tight">
                          {project.name}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                          {project.shortDescription}
                        </p>

                        {project.deliverables && project.deliverables.length > 0 && (
                          <div className="space-y-2 pt-1">
                            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                              KEY FEATURES :
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {project.deliverables.slice(0, 3).map((item, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50/80 text-xs text-slate-700 border border-slate-200/80 font-medium"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0066FF] shrink-0" />
                                  <span>{item}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bottom Action Area */}
                      <div className="pt-6 sm:pt-8 mt-4 sm:mt-6 border-t border-slate-100/90">
                        {project.metrics && project.metrics.length > 0 && (
                          <div className="grid grid-cols-2 gap-4 mb-5 sm:mb-6">
                            <div>
                              <p className="text-2xl sm:text-3xl font-bold text-[#0066FF] tracking-tight">
                                {project.metrics[0].value}
                              </p>
                              <p className="text-xs text-slate-500 mt-1 font-normal leading-snug">
                                {project.metrics[0].label}
                              </p>
                            </div>
                            {project.metrics[1] && (
                              <div>
                                <p className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
                                  {project.metrics[1].value}
                                </p>
                                <p className="text-xs text-slate-500 mt-1 font-normal leading-snug">
                                  {project.metrics[1].label}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {cardItem.tabCategory === 'printing' ? (
                          <Link
                            href="/solutions/printing"
                            prefetch={true}
                            className="w-full py-3.5 px-6 rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,102,255,0.3)] hover:shadow-[0_12px_28px_rgba(0,102,255,0.45)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
                          >
                            <span>{cardItem.ctaText || 'ดูสินค้าทั้งหมด'}</span>
                            <ArrowUpRight className="w-4 h-4 stroke-[2.5] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleSelectCard(cardItem)}
                            className="w-full py-3.5 px-6 rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,102,255,0.3)] hover:shadow-[0_12px_28px_rgba(0,102,255,0.45)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
                          >
                            <span>{cardItem.ctaText || 'ดูรายละเอียด'}</span>
                            <ArrowUpRight className="w-4 h-4 stroke-[2.5] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Preview / Media */}
                    <div
                      onClick={() => handleSelectCard(cardItem)}
                      className={`w-full lg:w-[62%] relative overflow-hidden group cursor-pointer flex items-center justify-center p-6 sm:p-8 lg:p-10 min-h-[360px] sm:min-h-[420px] lg:min-h-full ${
                        cardItem.isProductPhoto
                          ? 'bg-white'
                          : 'bg-gradient-to-br from-slate-50/80 to-blue-50/20'
                      }`}
                    >
                      {isPlaying && project.videoUrl ? (
                        <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden shadow-2xl bg-black">
                          <iframe
                            src={project.videoUrl}
                            title={project.name}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : cardItem.isProductPhoto ? (
                        <div className="relative w-full max-w-[740px] xl:max-w-[780px] my-auto flex items-center justify-center p-2 sm:p-4 lg:p-6">
                          <img
                            src={project.coverImage}
                            alt={project.name}
                            className="w-full max-w-[440px] sm:max-w-[560px] md:max-w-[640px] lg:max-w-[720px] max-h-[440px] sm:max-h-[480px] lg:max-h-[520px] h-auto object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03] drop-shadow-[0_18px_35px_rgba(0,0,0,0.12)]"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="relative w-full max-w-[760px] my-auto transition-transform duration-500 ease-out group-hover:scale-[1.015] flex flex-col items-center justify-center">
                          <div className="relative w-full rounded-t-xl bg-[#0F172A] border-[6px] sm:border-[8px] border-slate-900 shadow-[0_20px_50px_rgba(0,102,255,0.12)] overflow-hidden aspect-[16/10] flex items-center justify-center">
                            <img
                              src={project.coverImage}
                              alt={project.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />

                            {project.videoUrl && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectProject(project);
                                }}
                                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 shadow-lg border border-white/20 cursor-pointer"
                              >
                                <Play className="w-3.5 h-3.5 fill-white" />
                                <span>ดูคลิปสาธิต</span>
                              </button>
                            )}
                          </div>

                          <div className="relative w-full h-3 sm:h-3.5 bg-gradient-to-b from-slate-200 to-slate-300 rounded-b-xl border-t border-slate-400/80 shadow-md flex justify-center items-start">
                            <div className="w-20 h-1.5 rounded-b-sm bg-slate-400" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
};

export const CaseStudies = StickyProjectSection;
