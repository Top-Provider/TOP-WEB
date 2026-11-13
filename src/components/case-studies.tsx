"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, CheckCircle2, Play, Pause, Package, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Project } from '../types';
import { ProjectModal } from './project-modal';
import { fetchPublicRecords } from '@/lib/crud';
import { MedicalCrossLoader } from './ui/medical-cross-loader';

interface StickyProjectSectionProps {
  onSelectProject?: (project: Project) => void;
  initialCategories?: { id?: number; category_id: string; name: string }[];
  initialSoftwareRecords?: Record<string, unknown>[];
  initialProducts?: Record<string, unknown>[];
  initialSolutionTopics?: Record<string, unknown>[];
}

export interface SolutionCardItem {
  id: string;
  tabCategory: 'printing' | 'hardware' | 'software' | 'network' | 'medical' | 'iot';
  counterText: string;
  urlPath: string;
  clientSubtitle: string;
  ctaText?: string;
  ctaLink?: string;
  isProductPhoto?: boolean;
  project: Project;
}

export const SOLUTION_TABS = [
  { id: 'printing', label: 'Printing & Supply Solution' },
  { id: 'hardware', label: 'Hardware Solution' },
  { id: 'software', label: 'Software Solution' },
  { id: 'network', label: 'Network Solution' },
] as const;

export type TabId = typeof SOLUTION_TABS[number]['id'];

const BASE_URL = '/';

// =========================================================================
// Overview โซลูชันหลักของแต่ละด้าน (Printing, Hardware, Network, Medical, IoT)
// =========================================================================
export const ALL_SOLUTION_CARDS: SolutionCardItem[] = [
  // =================== 1. PRINTING & SUPPLY SOLUTION (Overview) ===================
  {
    id: 'printing-printer',
    tabCategory: 'printing',
    counterText: '01 / 02',
    urlPath: 'Topprovider.co.th / Printer',
    clientSubtitle: 'Printing & Supply Solution',
    ctaText: 'ดูสินค้า Printer ทั้งหมด',
    ctaLink: '/solutions/printing?type=printer',
    isProductPhoto: true,
    project: {
      id: 'printing-printer',
      name: 'Printer',
      client: 'Printing & Supply Solution',
      year: '2026',
      category: 'Printing',
      subCategory: 'Printer Overview',
      shortDescription:
        'ศูนย์รวมเครื่องพิมพ์คุณภาพสูงครบวงจรสำหรับองค์กรและสถานพยาบาล รองรับตั้งแต่ Laser, Inkjet, Thermal, Wristband ไปจนถึง Dot Matrix',
      fullDescription:
        'ศูนย์รวมเครื่องพิมพ์คุณภาพสูงครบวงจรสำหรับองค์กรและสถานพยาบาล รองรับตั้งแต่ Laser, Inkjet, Thermal, Wristband ไปจนถึง Dot Matrix',
      challenge:
        'องค์กรและสถานพยาบาลต้องการเครื่องพิมพ์หลากหลายประเภท ทั้งงานพิมพ์เอกสารทั่วไป งานพิมพ์ฉลากยาความเร็วสูง และสายรัดข้อมือผู้ป่วยที่ต้องเชื่อมต่อกับระบบเครือข่ายโรงพยาบาลได้เสถียร',
      solution:
        'จัดหาโซลูชันเครื่องพิมพ์ครบทุกประเภท Laser, Inkjet, Thermal, Wristband, Dot Matrix พร้อมบริการติดตั้ง เชื่อมต่อกับระบบ HIS และดูแลแบบ Onsite ทั่วประเทศ',
      deliverables: [
        'Laser & Inkjet Printer',
        'Thermal & Wristband Printer',
        'Large Format & Dot Matrix',
      ],
      metrics: [],
      technologies: ['Laser Printing', 'Thermal Wristband', 'High-Speed Inkjet', 'Network Fleet'],
      coverImage: `${BASE_URL}images/printer-podium-showcase.png`,
      galleryImages: [`${BASE_URL}images/printer-podium-showcase.png`],
      testimonial: {
        quote:
          'เครื่องพิมพ์ของ Top Provider มีครบทุกประเภทที่โรงพยาบาลต้องการ ใช้งานทนทานและมีทีมช่างคอยดูแลรวดเร็วมาก',
        author: 'หัวหน้างานพัสดุและจัดซื้อ',
        role: 'โรงพยาบาลทั่วไป',
      },
      featured: true,
      accentColor: '#0066FF',
    },
  },
  {
    id: 'printing-supplies',
    tabCategory: 'printing',
    counterText: '02 / 02',
    urlPath: 'Topprovider.co.th / Printing & Supply Solution',
    clientSubtitle: '2026 • Printing & Supply Solution',
    ctaText: 'ดูสินค้า Supply ทั้งหมด',
    isProductPhoto: true,
    project: {
      id: 'printing-supplies',
      name: 'Supply',
      client: 'Printing & Supply Solution',
      year: '2026',
      category: 'Printing',
      subCategory: 'Supply Overview',
      shortDescription:
        'ศูนย์รวมวัสดุสิ้นเปลืองการพิมพ์ครบวงจร ทั้งตลับหมึกเลเซอร์ (Toner Cartridge), ผ้าหมึกพิมพ์ดอทเมทริกซ์ (Ribbon), หมึกอิงค์เจ็ท, ริบบอนบาร์โค้ด และสายรัดข้อมือผู้ป่วย (Wristband) คุณภาพสูง ได้มาตรฐาน ช่วยยืดอายุการใช้งานของเครื่องพิมพ์และให้งานพิมพ์คมชัดสม่ำเสมอ',
      fullDescription:
        'ศูนย์รวมวัสดุสิ้นเปลืองการพิมพ์ครบวงจร ทั้งตลับหมึกเลเซอร์ (Toner Cartridge), ผ้าหมึกพิมพ์ดอทเมทริกซ์ (Ribbon), หมึกอิงค์เจ็ท, ริบบอนบาร์โค้ด และสายรัดข้อมือผู้ป่วย (Wristband) คุณภาพสูง ได้มาตรฐาน ปลอดภัย มั่นใจได้ในความคมชัดและประสิทธิภาพสูงสุดในการทำงานร่วมกับเครื่องพิมพ์ทุกแบรนด์ชั้นนำ พร้อมบริการจัดส่งด่วนและการันตีคุณภาพทุกชิ้น',
      challenge:
        'การใช้วัสดุสิ้นเปลืองที่ไม่ได้มาตรฐานส่งผลให้เครื่องพิมพ์เสียหายง่าย และงานพิมพ์บาร์โค้ดเลือนราง สแกนติดยาก',
      solution:
        'จัดหาตลับหมึก ริบบอนบาร์โค้ด และวัสดุสิ้นเปลืองแท้และเกรดพรีเมียมที่ผ่านการทดสอบความเข้ากันได้ 100% พร้อมรับประกันเปลี่ยนคืนหากมีปัญหา',
      deliverables: [
        'Laser Toner Cartridge (ตลับหมึกเลเซอร์)',
        'Ribbon & Barcode Label (ผ้าหมึกและริบบอน)',
        'Medical Wristband (สายรัดข้อมือผู้ป่วย)',
      ],
      metrics: [],
      technologies: ['High-Yield Toner', 'Thermal Transfer Ribbon', 'Medical-Grade Wristbands'],
      coverImage: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1400&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80'],
      testimonial: {
        quote: 'หมึกและริบบอนคุณภาพดีมาก พิมพ์บาร์โค้ดออกมาคมชัด สแกนผ่านง่าย ไม่ติดขัด',
        author: 'ฝ่ายไอทีและสารสนเทศ',
        role: 'โรงพยาบาลทั่วไป',
      },
      featured: true,
      accentColor: '#0066FF',
    },
  },

  // =================== 2. HARDWARE SOLUTION (Overview) ===================
  {
    id: 'hardware-barcode-scanner',
    tabCategory: 'hardware',
    counterText: '01 / 03',
    urlPath: 'Topprovider.co.th / Hardware Solution / Barcode & Scanner',
    clientSubtitle: '2026 • Barcode & Scanner Solution',
    ctaText: 'ดูสินค้า Barcode & Scanner ทั้งหมด',
    isProductPhoto: true,
    project: {
      id: 'hardware-barcode-scanner',
      name: 'Barcode & Scanner',
      client: 'Clinical & Enterprise Barcode Solution',
      year: '2026',
      category: 'Hardware Solution',
      subCategory: 'Barcode & Scanner',
      shortDescription:
        'ศูนย์รวมเครื่องอ่านบาร์โค้ดมือถือ (Handheld Barcode Scanner), เครื่องสแกนบาร์โค้ด 2 มิติเกรดการแพทย์ และเครื่องสแกนเนอร์ความเร็วสูง รองรับการสแกนฉลากยา สายรัดข้อมือ และเอกสารเวชระเบียนได้อย่างรวดเร็ว แม่นยำ',
      fullDescription:
        'จัดจำหน่ายและติดตั้งเครื่องอ่านบาร์โค้ดคุณภาพสูง ทั้งแบบมีสาย ไร้สาย และมือถือพกพา (Handheld Barcode) ออกแบบสำหรับโรงพยาบาลและคลังเวชภัณฑ์ ทนต่อสารเคมีทำความสะอาด มีระบบเซนเซอร์ความไวสูง อ่านโค้ดยับหรือเปียกน้ำได้แม่นยำ พร้อมเครื่องสแกนเนอร์ความเร็วสูงสำหรับงานเอกสาร',
      challenge:
        'โรงพยาบาลและองค์กรต้องการความเร็วและความแม่นยำในการระบุตัวตนผู้ป่วย สแกนฉลากยา และแปลงเอกสารเวชระเบียนเป็นดิจิทัล',
      solution:
        'นำเสนอเครื่องสแกนบาร์โค้ด 1D/2D, Handheld Barcode Scanner (Casio, CipherLab) และ Document Scanner (Fujitsu, Canon) พร้อมรับประกันและบริการ Onsite ทั่วประเทศ',
      deliverables: [
        'Handheld Barcode Scanner (Casio, CipherLab)',
        '2D Medical Barcode Scanner (Honeywell, Opticon)',
        'High-Speed Document Scanner (Fujitsu, Canon)',
        'Healthcare Disinfectant-Ready Housing',
        'Long-Range Wireless Bluetooth & Drop Resistance',
      ],
      metrics: [
        { label: 'ความเร็วในการอ่านบาร์โค้ด', value: '< 0.1 วินาที' },
        { label: 'ความแม่นยำในการระบุข้อมูล', value: '100%' },
      ],
      technologies: ['2D Area Imager', 'Bluetooth LE', 'Antimicrobial Enclosure', 'High-Speed ADF Scanner'],
      coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1400&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80'],
      testimonial: {
        quote: 'เครื่องสแกนไวและทนทานมาก สแกนสายรัดข้อมือและฉลากยาได้ในเสี้ยววินาที ช่วยลดเวลาทำงานของพยาบาลได้อย่างชัดเจน',
        author: 'หัวหน้าพยาบาลแผนกผู้ป่วยนอก',
        role: 'โรงพยาบาลศูนย์',
      },
      featured: true,
      accentColor: '#0066FF',
    },
  },
  {
    id: 'hardware-computer-display',
    tabCategory: 'hardware',
    counterText: '02 / 03',
    urlPath: 'Topprovider.co.th / Hardware Solution / Computer & Display',
    clientSubtitle: '2026 • Computer & Display Workstations',
    ctaText: 'ดูสินค้า Computer & Display ทั้งหมด',
    isProductPhoto: true,
    project: {
      id: 'hardware-computer-display',
      name: 'Computer & Display',
      client: 'Hospital Computer & Display Infrastructure',
      year: '2026',
      category: 'Hardware Solution',
      subCategory: 'Computer & Display',
      shortDescription:
        'จัดจำหน่ายและติดตั้งเครื่องคอมพิวเตอร์ประสิทธิภาพสูง All-in-One PC สำหรับงานสำนักงานและเกรดการแพทย์ ตัวเครื่องป้องกันน้ำและฝุ่น ทนต่อน้ำยาฆ่าเชื้อ พร้อมจอแสดงภาพ Display ขนาด 19 - 21.5 นิ้ว มาตรฐานสากล',
      fullDescription:
        'คอมพิวเตอร์ All-in-One PC และจอภาพประสิทธิภาพสูงสำหรับเคาน์เตอร์พยาบาล ห้องตรวจ ห้องยา และสำนักงาน ออกแบบไร้พัดลม (Fanless) ลดการสะสมเชื้อโรค เคลือบสารต้านจุลชีพ และมีมาตรฐานกันน้ำ IP65 ที่แผงหน้าจอ รองรับการทำงานต่อเนื่อง 24 ชั่วโมง',
      challenge:
        'คอมพิวเตอร์สำนักงานทั่วไปเกิดปัญหาบ่อยเมื่อต้องเปิดทำงานตลอด 24 ชั่วโมง และพังง่ายเมื่อโดนน้ำยาฆ่าเชื้อเช็ดทำความสะอาดหน้าจอ',
      solution:
        'จัดหาเครื่องคอมพิวเตอร์ All-in-One PC เกรดการแพทย์และสำนักงานที่ทนทาน พร้อมจอแสดงภาพ Display ความคมชัดสูง รองรับการเชื่อมต่อกับระบบ HIS ได้อย่างสมบูรณ์แบบ',
      deliverables: [
        'Computer All-in-One สำหรับงานสำนักงานและโรงพยาบาล',
        'Display จอแสดงภาพขนาด 19 นิ้ว และ 21.5 นิ้ว',
        'Fanless Antimicrobial Medical PC Housing',
        'IP65 Waterproof Front Bezel ป้องกันน้ำและของเหลว',
        'Onsite Hardware Maintenance SLA ตลอดอายุสัญญา',
      ],
      metrics: [
        { label: 'รองรับการทำงานต่อเนื่องแบบ Non-stop', value: '24/7' },
        { label: 'มาตรฐานป้องกันน้ำและฝุ่นละออง', value: 'IP65' },
      ],
      technologies: ['Fanless Cooling', 'Antimicrobial Chassis', 'Medical Display', 'All-in-One Architecture'],
      coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'],
      testimonial: {
        quote: 'เครื่องคอมพิวเตอร์ All-in-One ทนทานและประหยัดพื้นที่มาก เช็ดทำความสะอาดได้ทั้งวัน เครื่องเงียบและเสถียรมาก',
        author: 'ผู้จัดการฝ่ายสารสนเทศและเทคโนโลยี',
        role: 'โรงพยาบาลทั่วไป',
      },
      featured: true,
      accentColor: '#0066FF',
    },
  },
  {
    id: 'hardware-equipment-power',
    tabCategory: 'hardware',
    counterText: '03 / 03',
    urlPath: 'Topprovider.co.th / Hardware Solution / Equipment & Power',
    clientSubtitle: '2026 • UPS, Projector & Enterprise Equipment',
    ctaText: 'ดูสินค้า Equipment & Power ทั้งหมด',
    isProductPhoto: true,
    project: {
      id: 'hardware-equipment-power',
      name: 'Equipment & Power',
      client: 'Enterprise Power & Multimedia Infrastructure',
      year: '2026',
      category: 'Hardware Solution',
      subCategory: 'Equipment & Power',
      shortDescription:
        'ศูนย์รวมเครื่องสำรองไฟฟ้า (UPS) ประสิทธิภาพสูงเพื่อความต่อเนื่องของระบบไอทีโรงพยาบาล เครื่องฉายโปรเจกเตอร์ (Projector) ห้องประชุม และอุปกรณ์แท็บเล็ต กล้องพกพาสำหรับองค์กร (Mobile & Camera)',
      fullDescription:
        'ระบบสำรองไฟฟ้าอัตโนมัติ (UPS) คุณภาพสูง ช่วยป้องกันไฟตก ไฟกระชาก และไฟฟ้าดับ เพื่อปกป้องเครื่องมือแพทย์และเซิร์ฟเวอร์ พร้อมโปรเจกเตอร์คุณภาพสูงสำหรับห้องประชุมและห้องเรียนรู้ และอุปกรณ์พกพาสำหรับตรวจการณ์',
      challenge:
        'ปัญหาไฟตกหรือไฟดับกะทันหันอาจสร้างความเสียหายร้ายแรงต่อระบบคอมพิวเตอร์และข้อมูลเวชระเบียนผู้ป่วย',
      solution:
        'ติดตั้งเครื่องสำรองไฟฟ้า Pure Sine Wave UPS ที่เชื่อถือได้ พร้อมโซลูชันอุปกรณ์แสดงภาพโปรเจกเตอร์ความสว่างสูงและอุปกรณ์พกพาครบวงจร',
      deliverables: [
        'เครื่องสำรองไฟฟ้าฉุกเฉิน (UPS) ประสิทธิภาพสูง',
        'เครื่องฉายภาพโปรเจกเตอร์ความสว่างสูงสำหรับห้องประชุม (Projector)',
        'อุปกรณ์แท็บเล็ตและกล้องสำหรับองค์กร (Mobile & Camera)',
        'Surge Protection ป้องกันไฟฟ้ากระชากและสัญญาณรบกวน',
        'บริการตรวจเช็กสภาพแบตเตอรี่และบำรุงรักษาเชิงป้องกัน',
      ],
      metrics: [
        { label: 'ความต่อเนื่องในการจ่ายกระแสไฟฟ้า', value: '100%' },
        { label: 'ระบบป้องกันไฟกระชากและสัญญาณรบกวน', value: 'True Online' },
      ],
      technologies: ['Pure Sine Wave UPS', 'High-Lumen 3LCD/DLP Projector', 'Surge Protection', 'Mobile Solutions'],
      coverImage: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=1400&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=1200&q=80'],
      testimonial: {
        quote: 'ระบบ UPS ของ Top Provider ช่วยป้องกันความเสียหายจากไฟตกในโรงพยาบาลได้อย่างดีเยี่ยม มั่นใจได้ในความปลอดภัยของข้อมูล',
        author: 'หัวหน้างานระบบไฟฟ้าและสื่อสาร',
        role: 'ศูนย์การแพทย์เฉพาะทาง',
      },
      featured: true,
      accentColor: '#0066FF',
    },
  },

  // =================== 3. NETWORK SOLUTION (Overview) ===================
  {
    id: 'network-datacenter',
    tabCategory: 'network',
    counterText: '01 / 02',
    urlPath: 'Topprovider.co.th / Network Solution / Server & Switch',
    clientSubtitle: '2026 • Server & Network Infrastructure',
    ctaText: 'ดูสินค้า Server ทั้งหมด',
    project: {
      id: 'network-datacenter',
      name: 'Server & Network Infrastructure',
      client: 'Hospital Core Server & Network Infrastructure',
      year: '2026',
      category: 'Network Solution',
      subCategory: 'Server & Network Infrastructure',
      shortDescription:
        'วางระบบโครงสร้างพื้นฐานแม่ข่ายคอมพิวเตอร์และเครือข่ายสำหรับโรงพยาบาล จัดจำหน่าย Server Load Balancer, L2 Switch 16/24 Ports, Link Load Balancer และ Wireless Access Point ความเร็วสูง',
      fullDescription:
        'การออกแบบและวางระบบโครงสร้างพื้นฐานเครือข่ายระดับ Mission-Critical สำหรับโรงพยาบาลและศูนย์ข้อมูล ด้วยระบบ Server Load Balancer กระจายภาระงาน, L2 Switch ประสิทธิภาพสูง และ Access Point ที่ครอบคลุมทุกจุดบริการ มั่นใจได้ในเสถียรภาพการทำงานตลอด 24 ชั่วโมง',
      challenge: 'ระบบเครือข่ายเดิมแบนด์วิดท์ไม่พอ และเครื่องแม่ข่ายทำงานหนักจนระบบค้างในชั่วโมงเร่งด่วน',
      solution: 'ติดตั้ง Server Load Balancer และ L2 Switch ความเร็วสูง พร้อมระบบกระจายสัญญาณ Wi-Fi ที่รองรับอุปกรณ์แพทย์นับหมื่นเครื่อง',
      deliverables: [
        'Server Load Balancer กระจายการทำงานเครื่องแม่ข่าย',
        'L2 Switch ขนาด 16 ช่อง และ 24 ช่อง',
        'Link Load Balancer & Wireless Access Point',
        '10Gbps High-Availability Architecture',
        '24/7 Network Operations Center (NOC)',
      ],
      metrics: [
        { label: 'Uptime เสถียรภาพเครือข่าย', value: '99.99%' },
        { label: 'ความเร็วเชื่อมต่อ Core Backbone', value: '10 Gbps' },
      ],
      technologies: ['Server Load Balancing', 'L2 Switch Architecture', 'Wireless Access Point', 'Link Redundancy'],
      coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80'],
      testimonial: {
        quote: 'ระบบเครือข่ายและสวิตช์ของ Top Provider เสถียรมาก เปิดใช้งานระบบพร้อมกันทั้งโรงพยาบาลได้ราบรื่นไม่มีสะดุด',
        author: 'ผู้อำนวยการฝ่ายสารสนเทศ',
        role: 'ศูนย์การแพทย์เฉพาะทาง',
      },
      featured: true,
      accentColor: '#0066FF',
    },
  },
  {
    id: 'network-firewall-wifi',
    tabCategory: 'network',
    counterText: '02 / 02',
    urlPath: 'Topprovider.co.th / Network Solution / SAN & NAS Storage',
    clientSubtitle: '2026 • Enterprise Storage & Backup',
    ctaText: 'ดูสินค้า Storage ทั้งหมด',
    project: {
      id: 'network-firewall-wifi',
      name: 'SAN & NAS Storage Solutions',
      client: 'Enterprise Storage & Data Protection',
      year: '2026',
      category: 'Network Solution',
      subCategory: 'SAN & NAS Storage',
      shortDescription:
        'ศูนย์รวมระบบจัดเก็บข้อมูล SAN Storage และ NAS Storage ประสิทธิภาพสูง รองรับการจัดเก็บภาพทางการแพทย์ (PACS) ฐานข้อมูลเวชระเบียน และระบบสำรองข้อมูลอัตโนมัติ',
      fullDescription:
        'โซลูชันระบบจัดเก็บข้อมูลระดับองค์กร (SAN All-Flash & NAS Storage) ออกแบบเพื่อความปลอดภัยสูงสุดของข้อมูลคนไข้ รองรับการอ่านและเขียนข้อมูลขนาดใหญ่ด้วยความเร็ว Sub-millisecond พร้อมระบบสำรองและกู้คืนข้อมูลกรณีเกิดภัยพิบัติ (Disaster Recovery)',
      challenge: 'พื้นที่จัดเก็บข้อมูลภาพเอกซเรย์ CT/MRI ไม่เพียงพอ และการค้นหาไฟล์ภาพคนไข้ย้อนหลังทำได้ช้ามาก',
      solution: 'ติดตั้ง SAN Storage ความเร็วสูงและ NAS Storage ความจุสูง พร้อมระบบคัดแยกและสำรองข้อมูลอัตโนมัติ',
      deliverables: [
        'อุปกรณ์สำหรับจัดเก็บข้อมูลแบบ SAN Storage',
        'อุปกรณ์สำหรับจัดเก็บข้อมูลแบบ NAS Storage',
        'Sub-millisecond PACS Storage Access',
        'Automated Disaster Recovery Replication',
        'PDPA & Healthcare Data Compliance',
      ],
      metrics: [
        { label: 'ความเร็วในการเข้าถึงข้อมูล PACS', value: '< 1 ms' },
        { label: 'ความปลอดภัยและสำรองข้อมูล', value: '100%' },
      ],
      technologies: ['SAN All-Flash Storage', 'NAS Data Protection', 'PACS Archiving', 'Automated Replication'],
      coverImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1400&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80'],
      testimonial: {
        quote: 'การเปิดดูภาพสแกน MRI และ CT ทำได้เร็วทันใจ แพทย์รังสีวินิจฉัยทำงานได้รวดเร็วและปลอดภัยขึ้นอย่างมาก',
        author: 'หัวหน้างานรังสีวิทยาและเวชสารสนเทศ',
        role: 'โรงพยาบาลศูนย์',
      },
      featured: true,
      accentColor: '#0066FF',
    },
  },

  // =================== 4. MEDICAL EQUIPMENT (Overview) ===================
  {
    id: 'medical-kiosk',
    tabCategory: 'medical',
    counterText: '01 / 02',
    urlPath: 'Topprovider.co.th / Smart Kiosk',
    clientSubtitle: '2026 • Patient Self-Service Systems',
    ctaText: 'ดูรายละเอียดโซลูชัน',
    project: {
      id: 'smart-kiosk',
      name: 'Smart Self-Registration & Payment Kiosk',
      client: 'Smart Hospital Kiosk',
      year: '2026',
      category: 'Medical Equipment',
      subCategory: 'Self-Service Kiosk',
      shortDescription:
        'นวัตกรรมตู้บริการตนเองอัจฉริยะ (Self-Service Kiosk) สำหรับลงทะเบียนผู้ป่วย ตรวจสอบสิทธิ ชำระเงินค่ารักษาพยาบาล ลดความแออัดและลดเวลารอคอยของผู้รับบริการ',
      fullDescription:
        'ตู้บริการอัตโนมัติอัจฉริยะที่ช่วยยกระดับประสบการณ์ผู้ป่วย ผู้รับบริการสามารถเสียบบัตรประชาชนเพื่อเช็คสิทธิการรักษา จองคิว หรือชำระเงินผ่าน QR Code และบัตรเครดิตได้ด้วยตนเอง มีเสียงและคำแนะนำภาษาไทยและภาษาอังกฤษ ใช้งานง่ายและสะดวกรวดเร็วใน 1 นาที',
      challenge: 'ผู้ป่วยต้องต่อแถวรอคิวยาวที่เคาน์เตอร์เวชระเบียนและห้องการเงิน ทำให้เกิดความแออัดบริเวณทางเข้าโรงพยาบาล',
      solution: 'ติดตั้งตู้ Smart Kiosk กระจายตามจุดสำคัญ เชื่อมต่อกับระบบ HIS ของโรงพยาบาลแบบ Real-time',
      deliverables: [
        'Thai National ID Smart Card Reader',
        'Automatic Health Rights & Eligibility Check',
        'Cashless QR Code & Credit Card Payment',
        'Thermal Queue & Navigation Ticket Printer',
        'Voice Guidance for Elderly & Disabled Access',
      ],
      metrics: [
        { label: 'ลดระยะเวลารอคอยของผู้ป่วย', value: '60%' },
        { label: 'ความพึงพอใจของผู้รับบริการ', value: '98.5%' },
      ],
      technologies: ['Smart Kiosk', 'Thai ID Reader', 'Payment Gateway', 'HIS Integration'],
      coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80'],
      testimonial: {
        quote: 'ตู้ Kiosk ช่วยลดความแออัดหน้าเคาน์เตอร์เวชระเบียนได้เกินครึ่ง คนไข้กดทำรายการเองได้สะดวกและรวดเร็วมาก',
        author: 'หัวหน้าแผนกบริการผู้ป่วยนอก',
        role: 'โรงพยาบาลศูนย์การแพทย์',
      },
      featured: true,
      accentColor: '#0066FF',
    },
  },
  {
    id: 'medical-vital-signs',
    tabCategory: 'medical',
    counterText: '02 / 02',
    urlPath: 'Topprovider.co.th / Vital Signs Station',
    clientSubtitle: '2026 • Automated Clinical Measurement',
    ctaText: 'ดูรายละเอียดโซลูชัน',
    project: {
      id: 'vital-signs-station',
      name: 'Direct HIS-Synced Vital Signs Station',
      client: 'Clinical Vitals Integration',
      year: '2026',
      category: 'Medical Equipment',
      subCategory: 'Vital Signs',
      shortDescription:
        'สถานีตรวจวัดสัญญาณชีพและเครื่องวัดความดันอัตโนมัติที่ซิงค์ข้อมูลผลตรวจ (ความดัน, ชีพจร, น้ำหนัก, ส่วนสูง, BMI) ตรงเข้าสู่ระบบ HIS ทันที พยาบาลไม่ต้องจดหรือคีย์ข้อมูลซ้ำ',
      fullDescription:
        'การผสานเครื่องวัดความดันโลหิต เครื่องวัดค่าออกซิเจนในเลือด และเครื่องชั่งน้ำหนัก-วัดส่วนสูงเข้ากับระบบ HIS โดยตรง เมื่อผู้ป่วยสแกนสายรัดข้อมือหรือบัตรประชาชน ข้อมูลสัญญาณชีพจะถูกบันทึกลงเวชระเบียนอิเล็กทรอนิกส์ของแพทย์ทันที ป้องกันความผิดพลาดจากการจดบันทึกด้วยมือ',
      challenge: 'พยาบาลจุดคัดกรองต้องจดค่าความดันและคีย์ลงคอมพิวเตอร์ทีละราย เสี่ยงต่อการพิมพ์ตัวเลขผิดพลาดและทำให้คิวยาว',
      solution: 'ติดตั้งสถานีวัดสัญญาณชีพอัตโนมัติที่เชื่อมต่อผ่านระบบบลูทูธและเครือข่าย ส่งผลตรวจเข้าหน้าจอแพทย์ทันทีที่วัดเสร็จ',
      deliverables: [
        'Automated Blood Pressure & Pulse Monitor',
        'Digital Height, Weight & BMI Calculation',
        'Direct Integration to Hospital HIS',
        'Thai/English Audio Guidance System',
        'Thermal Result Slip for Patient Reference',
      ],
      metrics: [
        { label: 'ความแม่นยำในการซิงค์ข้อมูลเข้า HIS', value: '100%' },
        { label: 'ลดเวลาการคีย์ข้อมูลของพยาบาล', value: '50%' },
      ],
      technologies: ['Medical Vital Sensor', 'Bluetooth/LAN Bridge', 'HIS HL7 API'],
      coverImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1400&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80'],
      testimonial: {
        quote: 'วัดเสร็จปุ๊บ ข้อมูลความดันและน้ำหนักเด้งเข้าหน้าจอหมอทันที พยาบาลไม่ต้องนั่งพิมพ์ตัวเลขซ้ำ ลดข้อผิดพลาดได้ 100%',
        author: 'พยาบาลหัวหน้าจุดคัดกรอง',
        role: 'โรงพยาบาลทั่วไป',
      },
      featured: true,
      accentColor: '#0066FF',
    },
  },

  // =================== 5. SMART SOLUTION (IoT) (Overview) ===================
  {
    id: 'iot-facial-security',
    tabCategory: 'iot',
    counterText: '01 / 02',
    urlPath: 'Topprovider.co.th / AI Facial Recognition',
    clientSubtitle: '2026 • AI Computer Vision Security',
    ctaText: 'ดูรายละเอียดโซลูชัน',
    project: {
      id: 'ai-facial-security',
      name: 'AI Facial Recognition & CCTV Surveillance',
      client: 'Smart Hospital IoT & AI',
      year: '2026',
      category: 'Smart Solution (IoT)',
      subCategory: 'AI Surveillance',
      shortDescription:
        'ระบบกล้องโทรทัศน์วงจรปิดอัจฉริยะวิเคราะห์ใบหน้า ตรวจจับบุคคลต้องสงสัย แจ้งเตือนเมื่อมีผู้ป่วยพลัดหลง และควบคุมการเข้าออกพื้นที่หวงห้ามได้อย่างแม่นยำ',
      fullDescription:
        'การยกระดับความปลอดภัยในโรงพยาบาลด้วยเทคโนโลยี AI คอมพิวเตอร์วิทัศน์ สามารถตรวจจับใบหน้าในระยะไกล ค้นหาเส้นทางการเคลื่อนที่ของผู้ป่วยกลุ่มเสี่ยงหรือเด็กแรกเกิด พร้อมระบบแจ้งเตือนแบบเรียลไทม์ไปยังห้องควบคุมความปลอดภัยเมื่อมีเหตุผิดปกติ',
      challenge: 'การดูแลความปลอดภัยในโรงพยาบาลขนาดใหญ่ที่มีคนเข้าออกหลักพันต่อวัน และการติดตามผู้ป่วยสมองเสื่อมที่อาจพลัดหลง',
      solution: 'ติดตั้งกล้อง AI CCTV พร้อมระบบประมวลผลใบหน้าอัจฉริยะ ค้นหาตำแหน่งบุคคลได้ใน 1 วินาทีจากภาพถ่าย',
      deliverables: [
        'Real-Time Face Match (<0.2s Response)',
        'Wandering Patient & Missing Person Search',
        'Cleanroom & Operating Theater Access Control',
        'Emergency Exit & Perimeter Breach Alarm',
        'Centralized Security Control Room Software',
      ],
      metrics: [
        { label: 'ความเร็วในการตรวจจับและระบุตัวตน', value: '0.2 วินาที' },
        { label: 'ความแม่นยำในการเปรียบเทียบใบหน้า', value: '99.7%' },
      ],
      technologies: ['AI Deep Learning', 'Facial Recognition', 'Edge Computing', 'IP CCTV'],
      coverImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1400&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80'],
      testimonial: {
        quote: 'ระบบกล้อง AI ช่วยให้เจ้าหน้าที่รักษาความปลอดภัยค้นหาคนไข้ที่พลัดหลงได้ทันทีในไม่กี่วินาที สร้างความอุ่นใจให้กับญาติผู้ป่วยมาก',
        author: 'ผู้จัดการฝ่ายรักษาความปลอดภัย',
        role: 'ศูนย์การแพทย์ชั้นนำ',
      },
      featured: true,
      accentColor: '#0066FF',
    },
  },
  {
    id: 'iot-rtls-tracking',
    tabCategory: 'iot',
    counterText: '02 / 02',
    urlPath: 'Topprovider.co.th / RTLS Asset Tracking',
    clientSubtitle: '2026 • Real-Time Location Systems',
    ctaText: 'ดูรายละเอียดโซลูชัน',
    project: {
      id: 'rtls-asset-tracking',
      name: 'Real-Time Asset & Patient Tracking (RTLS)',
      client: 'Healthcare IoT Logistics',
      year: '2026',
      category: 'Smart Solution (IoT)',
      subCategory: 'RTLS Tracking',
      shortDescription:
        'ระบบติดตามพิกัดตำแหน่งอุปกรณ์ทางการแพทย์ (เครื่องกระตุกหัวใจ, เครื่องช่วยหายใจ, รถเข็น) และผู้ป่วยกลุ่มเสี่ยงด้วยสัญญาณ BLE/RFID แสดงผลบนแผนผังดิจิทัลแบบเรียลไทม์',
      fullDescription:
        'โซลูชัน IoT แท็กอัจฉริยะติดเครื่องมือแพทย์ ช่วยให้แพทย์และพยาบาลสามารถค้นหาตำแหน่งเครื่องมือกู้ชีพที่ใกล้ที่สุดได้ทันทีในเวลาฉุกเฉิน พร้อมระบบแจ้งเตือนการบำรุงรักษาเครื่องมือตามรอบระยะเวลา และระบบเตือนเมื่ออุปกรณ์ถูกเคลื่อนย้ายออกนอกแผนก',
      challenge: 'ในเวลาฉุกเฉิน พยาบาลต้องเสียเวลาวิ่งตามหาเครื่องกระตุกหัวใจหรือเครื่องวัดสัญญาณชีพเคลื่อนที่ที่ถูกยืมไปแผนกอื่น',
      solution: 'ติดแท็ก BLE ขนาดจิ๋วบนอุปกรณ์การแพทย์ทุกชิ้น และแสดงผลพิกัดตำแหน่งบนแผนผังอาคารผ่านหน้าจอคอมพิวเตอร์และมือถือ',
      deliverables: [
        'Sub-Meter Indoor BLE Beacon Positioning',
        'Digital Floorplan Real-Time Asset Map',
        'Geofence Alarm When Device Leaves Ward',
        'Preventive Maintenance Usage Tracking',
        'High-Risk Patient Fall & Wandering Tag',
      ],
      metrics: [
        { label: 'ระยะเวลาค้นหาอุปกรณ์ในภาวะฉุกเฉิน', value: '< 10 วินาที' },
        { label: 'ลดการสูญหายของเครื่องมือแพทย์', value: '100%' },
      ],
      technologies: ['BLE 5.0 Beacon', 'Indoor Positioning', 'RFID', 'IoT Dashboard'],
      coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'],
      testimonial: {
        quote: 'เวลาคนไข้ฉุกเฉิน เปิดดูหน้าจอรู้ทันทีว่าเครื่องกระตุกหัวใจอยู่ห้องไหน ประหยัดเวลาชีวิตได้จริง มีประโยชน์มาก',
        author: 'พยาบาลวิชาชีพ แผนกอุบัติเหตุและฉุกเฉิน (ER)',
        role: 'โรงพยาบาลทั่วไป',
      },
      featured: true,
      accentColor: '#0066FF',
    },
  },
];

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

  const rawCover = r.cover_image_url || '';
  const coverImage = rawCover.startsWith('data:')
    ? `/api/software-image/${r.id}`
    : rawCover || (String(r.category_id).toLowerCase() === 'network' ? 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80' : '/images/vitanix-dashboard-hd.png');

  const rawCat = (r.category_id || '').toLowerCase();
  const tabCategory: SolutionCardItem['tabCategory'] =
    rawCat === 'network' ? 'network'
    : rawCat === 'printing' ? 'printing'
    : rawCat === 'hardware' ? 'hardware'
    : rawCat === 'medical' ? 'medical'
    : rawCat === 'iot' ? 'iot'
    : 'software';

  const cardId =
    tabCategory === 'network'
      ? (r.id === 15 || r.name.toLowerCase().includes('server') ? 'network-datacenter' : 'network-firewall-wifi')
      : `software-${r.id}`;

  const ctaText = tabCategory === 'network' ? 'ดูสินค้า Network ทั้งหมด' : 'ดูรายละเอียดระบบ';

  return {
    id: cardId,
    tabCategory,
    counterText,
    urlPath: `Topprovider.co.th / ${r.name}`,
    clientSubtitle: `2026 • ${subCategory}`,
    ctaText,
    project: {
      id: `vitanix-${r.id}`,
      name: r.name,
      client: subCategory,
      year: '2026',
      category: category,
      subCategory: subCategory,
      shortDescription: r.short_description || r.full_description || '',
      fullDescription: r.full_description || r.short_description || '',
      challenge: r.feature_1_desc || '',
      solution: r.feature_2_desc || '',
      deliverables,
      metrics,
      technologies: tabCategory === 'network' ? ['Cisco/Aruba', 'SAN All-Flash', 'Fiber Optic 10G', 'VMware HA'] : ['React', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'HL7/FHIR'],
      coverImage: coverImage,
      videoUrl: r.video_url || '',
      galleryImages: [coverImage],
      featured: true,
      accentColor: '#0066FF',
    },
  };
}

export interface ProductRecord {
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
  specifications?: { label?: string; value: string }[] | string;
  cover_image_url?: string;
  is_active?: boolean;
}

export function mapProductRecordToCardItem(
  p: ProductRecord,
  index: number,
  total: number
): SolutionCardItem {
  const counterText = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  const rawCat = (p.category_id || '').toLowerCase();
  const tabCategory: SolutionCardItem['tabCategory'] =
    rawCat.includes('network') ? 'network'
    : rawCat.includes('print') ? 'printing'
    : rawCat.includes('hard') ? 'hardware'
    : 'printing';

  let deliverables: string[] = [];
  if (Array.isArray(p.specifications)) {
    const specWithLines = p.specifications.find((s) => s.value && s.value.includes('\n'));
    if (specWithLines && specWithLines.value) {
      deliverables = specWithLines.value
        .split('\n')
        .map((l) => l.replace(/^-\s*/, '').trim())
        .filter(Boolean)
        .slice(0, 3);
    } else {
      deliverables = p.specifications
        .slice(0, 3)
        .map((s) => s.value || s.label || '')
        .filter(Boolean);
    }
  }

  const rawCover = p.cover_image_url || '';
  const fallbackImg =
    tabCategory === 'network'
      ? 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80'
      : tabCategory === 'hardware'
      ? 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1400&q=80'
      : '/images/printer-product.png';

  const coverImage = rawCover.startsWith('data:')
    ? `/api/product-image/${p.id}`
    : rawCover || fallbackImg;

  const subCategory = p.sub_category || p.brand || 'Product Item';
  const urlPath = `Topprovider.co.th / ${p.brand ? `${p.brand} ` : ''}${p.name}`;

  let ctaText = 'ดูรายละเอียดสินค้า';
  if (tabCategory === 'printing') {
    ctaText = p.product_type === 'supply' ? 'ดูสินค้า Supply ทั้งหมด' : 'ดูสินค้า Printer ทั้งหมด';
  } else if (tabCategory === 'network') {
    ctaText = 'ดูสินค้า Network ทั้งหมด';
  } else if (tabCategory === 'hardware') {
    ctaText = 'ดูสินค้า Hardware ทั้งหมด';
  }

  let shortDesc = p.short_description || p.full_description || '';
  if (!shortDesc && Array.isArray(p.specifications)) {
    const specWithVal = p.specifications.find(
      (s) => s.value && (s.label?.includes('คุณลักษณะ') || s.label?.includes('รายละเอียด') || s.value.length > 20)
    );
    if (specWithVal?.value) {
      shortDesc = specWithVal.value.split('\n')[0].replace(/^-\s*/, '').trim();
    }
  }
  if (!shortDesc) {
    shortDesc = `${p.name} - ระบบและอุปกรณ์มาตรฐานระดับองค์กรสำหรับโรงพยาบาลและหน่วยงานสาธารณสุข`;
  }

  return {
    id: `product-${p.id}`,
    tabCategory,
    counterText,
    urlPath,
    clientSubtitle: `2026 • ${subCategory}`,
    ctaText,
    isProductPhoto: true,
    project: {
      id: `prod-${p.id}`,
      name: p.name,
      client: subCategory,
      year: '2026',
      category: p.category_id || 'Product',
      subCategory: subCategory,
      shortDescription: shortDesc,
      fullDescription: p.full_description || shortDesc,
      challenge: '',
      solution: '',
      deliverables,
      metrics: [],
      technologies: [p.brand, p.sub_category].filter(Boolean) as string[],
      coverImage,
      galleryImages: [coverImage],
      featured: true,
      accentColor: '#0066FF',
    },
  };
}

function mapTopicRecordToCardItem(
  t: Record<string, unknown>,
  index: number,
  total: number
): SolutionCardItem {
  let deliverables: string[] = [];
  if (Array.isArray(t.key_features)) {
    deliverables = t.key_features.map(String).filter(Boolean);
  } else if (typeof t.key_features === 'string' && t.key_features.trim()) {
    try {
      const parsed = JSON.parse(t.key_features);
      if (Array.isArray(parsed)) {
        deliverables = parsed.map(String).filter(Boolean);
      } else {
        deliverables = t.key_features.split('\n').map((s) => s.trim()).filter(Boolean);
      }
    } catch {
      deliverables = t.key_features.split('\n').map((s) => s.trim()).filter(Boolean);
    }
  }

  const rawCat = String(t.tab_category || 'printing').toLowerCase();
  const tabCategory: SolutionCardItem['tabCategory'] =
    rawCat === 'network' ? 'network'
    : rawCat === 'hardware' ? 'hardware'
    : rawCat === 'software' ? 'software'
    : rawCat === 'medical' ? 'medical'
    : rawCat === 'iot' ? 'iot'
    : 'printing';

  const title = String(t.title || 'Solution');
  const isPrinter = title.toLowerCase() === 'printer' || String(t.id) === '1';
  const subtitle = String(t.subtitle || (isPrinter ? 'Printing & Supply Solution' : ''));
  const shortDesc = String(t.short_description || t.full_description || '');
  const fullDesc = String(t.full_description || shortDesc);
  const coverImage = String(t.cover_image_url || (isPrinter ? '/images/printer-podium-showcase.png' : '/images/printer-product.png'));
  const ctaText = String(t.cta_text || (isPrinter ? 'ดูสินค้า Printer ทั้งหมด' : 'ดูสินค้าทั้งหมด'));
  const ctaLink = String(t.cta_link || (isPrinter ? '/solutions/printing?type=printer' : `/solutions/${tabCategory}`));
  const counterText = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  return {
    id: `topic-${t.id || index}`,
    tabCategory,
    counterText,
    urlPath: `Topprovider.co.th / ${title}`,
    clientSubtitle: subtitle || (tabCategory === 'printing' ? 'Printing & Supply Solution' : `2026 • ${title}`),
    ctaText,
    ctaLink,
    isProductPhoto: true,
    project: {
      id: `topic-proj-${t.id || index}`,
      name: title,
      client: subtitle || title,
      year: '2026',
      category: tabCategory,
      subCategory: title,
      shortDescription: shortDesc,
      fullDescription: fullDesc,
      challenge: '',
      solution: '',
      deliverables: deliverables.length > 0 ? deliverables : [
        'Laser & Inkjet Printer',
        'Thermal & Wristband Printer',
        'Large Format & Dot Matrix',
      ],
      metrics: [],
      technologies: deliverables.slice(0, 4),
      coverImage,
      galleryImages: [coverImage],
      featured: true,
      accentColor: '#0066FF',
    },
  };
}

export const StickyProjectSection: React.FC<StickyProjectSectionProps> = ({
  onSelectProject,
  initialCategories,
  initialSoftwareRecords,
  initialProducts,
  initialSolutionTopics,
}) => {
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/solutions/printing?type=printer');
    router.prefetch('/solutions/printing?type=supply');
    router.prefetch('/solutions/hardware');
    router.prefetch('/solutions/software');
    router.prefetch('/solutions/network');
    router.prefetch('/products');
  }, [router]);

  // แท็บเริ่มต้น: Printing & Supply Solution ตามที่ผู้ใช้ต้องการ
  const [activeTab, setActiveTab] = useState<string>('printing');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Dynamic Solution Category Tabs from DB / props / fallback
  const [solutionTabs, setSolutionTabs] = useState<{ id: string; label: string }[]>(() => {
    if (initialCategories && initialCategories.length > 0) {
      return initialCategories.map((c) => ({
        id: (c.category_id || '').toLowerCase(),
        label: c.name || c.category_id,
      }));
    }
    return SOLUTION_TABS.map((t) => ({ id: t.id, label: t.label }));
  });

  const hasLoadedTabsRef = useRef(false);

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) return;
    if (hasLoadedTabsRef.current) return;
    hasLoadedTabsRef.current = true;
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
  }, [initialCategories]);

  // Cards from DB (Software)
  const initialCards = useMemo(() => {
    if (initialSoftwareRecords && initialSoftwareRecords.length > 0) {
      return initialSoftwareRecords.map((r, i) =>
        mapSoftwareRecordToCardItem(r as unknown as SoftwareRecord, i, initialSoftwareRecords.length)
      );
    }
    return [];
  }, [initialSoftwareRecords]);

  const [dynamicRecords, setDynamicRecords] = useState<SolutionCardItem[]>(initialCards);
  const [dbLoading, setDbLoading] = useState<boolean>(initialCards.length === 0);

  useEffect(() => {
    if (initialCards.length > 0) {
      setDynamicRecords(initialCards);
      setDbLoading(false);
    }
  }, [initialCards]);

  // Client-side fetch fallback from DB for Software
  useEffect(() => {
    if (dynamicRecords.length === 0) {
      setDbLoading(true);
      fetchPublicRecords<SoftwareRecord>({
        table: 'TB_PRODUCT_SOFTWARE',
        orderBy: 'id',
        orderDir: 'asc',
      })
        .then((records) => {
          if (records && records.length > 0) {
            setDynamicRecords(
              records.map((r, i) => mapSoftwareRecordToCardItem(r, i, records.length))
            );
          }
        })
        .catch((err) => console.error('Error loading software records from DB:', err))
        .finally(() => {
          setDbLoading(false);
        });
    }
  }, [dynamicRecords.length]);

  // Dynamic Solution Topics from TB_SOLUTION_TOPICS
  const initialTopics = useMemo(() => {
    if (initialSolutionTopics && initialSolutionTopics.length > 0) {
      return initialSolutionTopics.map((t, i) =>
        mapTopicRecordToCardItem(t, i, initialSolutionTopics.length)
      );
    }
    return [];
  }, [initialSolutionTopics]);

  const [dynamicTopics, setDynamicTopics] = useState<SolutionCardItem[]>(initialTopics);

  useEffect(() => {
    if (initialTopics.length > 0) {
      setDynamicTopics(initialTopics);
    }
  }, [initialTopics]);

  // Client-side fetch fallback for TB_SOLUTION_TOPICS
  useEffect(() => {
    if (dynamicTopics.length === 0) {
      fetchPublicRecords({
        table: 'TB_SOLUTION_TOPICS',
        orderBy: 'sort_order',
        orderDir: 'asc',
      })
        .then((records) => {
          if (records && records.length > 0) {
            const activeOnly = (records as Record<string, unknown>[]).filter(
              (r) => r.is_active !== false
            );
            if (activeOnly.length > 0) {
              setDynamicTopics(
                activeOnly.map((r, i) => mapTopicRecordToCardItem(r, i, activeOnly.length))
              );
            }
          }
        })
        .catch(() => {
          // Table doesn't exist yet, seamlessly falls back
        });
    }
  }, [dynamicTopics.length]);

  // Current cards:
  // - ถ้าเป็น Software: ดึงรายการระบบจากฐานข้อมูล TB_PRODUCT_SOFTWARE
  // - ถ้าเป็น หมวดอื่นๆ: ตรวจสอบ TB_SOLUTION_TOPICS ก่อน ถ้ามีให้ใช้จาก DB ถ้าไม่มีให้ใช้ ALL_SOLUTION_CARDS (Fallback)
  const currentCards = useMemo(() => {
    if (activeTab === 'software') {
      if (dbLoading) return [];
      const matched = dynamicRecords.filter((item) => item.tabCategory === 'software');
      return matched.map((item, idx) => ({
        ...item,
        counterText: `${String(idx + 1).padStart(2, '0')} / ${String(matched.length).padStart(2, '0')}`,
      }));
    }

    const matchedTopics = dynamicTopics.filter((item) => item.tabCategory === activeTab);
    if (matchedTopics.length > 0) {
      return matchedTopics.map((item, idx) => ({
        ...item,
        counterText: `${String(idx + 1).padStart(2, '0')} / ${String(matchedTopics.length).padStart(2, '0')}`,
      }));
    }

    const overviewCards = ALL_SOLUTION_CARDS.filter((item) => item.tabCategory === activeTab);
    return overviewCards.map((item, idx) => ({
      ...item,
      counterText: `${String(idx + 1).padStart(2, '0')} / ${String(overviewCards.length).padStart(2, '0')}`,
    }));
  }, [activeTab, dynamicRecords, dynamicTopics, dbLoading]);

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
    if (cardItem.ctaLink) {
      router.push(cardItem.ctaLink);
      return;
    }
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
    if (cardItem.tabCategory === 'hardware') {
      if (cardItem.id === 'hardware-barcode-scanner') {
        router.push('/solutions/hardware?sub=Handheld Barcode Scanner');
        return;
      }
      if (cardItem.id === 'hardware-computer-display') {
        router.push('/solutions/hardware?sub=Computer');
        return;
      }
      if (cardItem.id === 'hardware-equipment-power') {
        router.push('/solutions/hardware?sub=UPS');
        return;
      }
      router.push('/solutions/hardware');
      return;
    }
    if (cardItem.tabCategory === 'network') {
      if (cardItem.id === 'network-datacenter') {
        router.push('/solutions/network?type=server');
        return;
      }
      if (cardItem.id === 'network-firewall-wifi') {
        router.push('/solutions/network?type=firewall');
        return;
      }
      router.push('/solutions/network');
      return;
    }
    if (cardItem.tabCategory === 'software') {
      router.push('/solutions/software');
      return;
    }
    handleSelectProject(cardItem.project);
  };

  return (
    <section id="showcase" className="py-12 sm:py-16 lg:py-20 bg-[#F8FAFC] text-slate-900 relative z-20 border-b border-slate-200/80 select-none">
      <div id="case-studies" className="w-[94%] max-w-[2200px] mx-auto px-2 sm:px-4 lg:px-6">
        {/* Section Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0F172A] leading-[1.2]">
            IT Solution & Product
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 font-normal">
            เลือกดูภาพรวมโซลูชันและผลิตภัณฑ์ตามหมวดหมู่การใช้งานที่ครอบคลุมทุกระบบโรงพยาบาลและองค์กร
          </p>
        </div>

        {/* Sticky Tab List / Pill Navigation Bar */}
        <div className="sticky top-0 z-30 py-2.5 sm:py-3 bg-[#F8FAFC]/95 backdrop-blur-md mb-6 sm:mb-8 -mx-2 px-2 sm:-mx-4 sm:px-4 transition-all">
          <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto py-2 px-1.5 -mx-1.5 no-scrollbar">
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

        {/* Dynamic Cards Stage or Loading / Empty State */}
        {dbLoading ? (
          <div className="min-h-[500px] sm:min-h-[660px] md:min-h-[760px] rounded-[32px] sm:rounded-[36px] bg-white border border-slate-200/90 shadow-sm p-4 sm:p-8 flex flex-col items-center justify-center text-center my-6 overflow-hidden">
            <MedicalCrossLoader size="lg" />
          </div>
        ) : currentCards.length === 0 ? (
          <div className="rounded-3xl bg-white border border-slate-200/90 p-12 text-center my-8 shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 flex items-center justify-center text-[#0066FF]">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">ยังไม่มีข้อมูลในหมวดหมู่นี้</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              ขณะนี้ยังไม่มีข้อมูลโซลูชันในหมวดหมู่นี้ คุณสามารถเลือกดูหมวดหมู่อื่นๆ หรือติดต่อทีมงานเพื่อสอบถามรายละเอียด
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
                  suppressHydrationWarning
                  className="relative lg:sticky rounded-[24px] sm:rounded-[32px] lg:rounded-[36px] bg-[#FFFFFF] border border-blue-100/90 shadow-[0_20px_50px_rgba(0,102,255,0.06)] overflow-hidden transition-all duration-300"
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
                      <span className="text-[11px] font-mono lowercase text-slate-500 bg-slate-100/90 px-3 py-0.5 rounded-full border border-slate-200/60 shadow-xs">
                        {project.category.toLowerCase()}
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

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-line">
                          {project.shortDescription || project.fullDescription}
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

                        {/* CTA Button ลิงก์ตรงไปหน้า Product เสมอ */}
                        {cardItem.ctaLink ? (
                          <Link
                            href={cardItem.ctaLink}
                            prefetch={true}
                            className="w-full py-3.5 px-6 rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,102,255,0.3)] hover:shadow-[0_12px_28px_rgba(0,102,255,0.45)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
                          >
                            <span>{cardItem.ctaText || 'ดูสินค้าทั้งหมด'}</span>
                            <ArrowUpRight className="w-4 h-4 stroke-[2.5] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </Link>
                        ) : cardItem.tabCategory === 'printing' ? (
                          <Link
                            href={
                              cardItem.id === 'printing-printer'
                                ? '/solutions/printing?type=printer'
                                : '/solutions/printing?type=supply'
                            }
                            prefetch={true}
                            className="w-full py-3.5 px-6 rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,102,255,0.3)] hover:shadow-[0_12px_28px_rgba(0,102,255,0.45)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
                          >
                            <span>{cardItem.ctaText || 'ดูสินค้าทั้งหมด'}</span>
                            <ArrowUpRight className="w-4 h-4 stroke-[2.5] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </Link>
                        ) : cardItem.tabCategory === 'network' ? (
                          <Link
                            href={
                              cardItem.id === 'network-datacenter'
                                ? '/solutions/network?type=server'
                                : '/solutions/network?type=firewall'
                            }
                            prefetch={true}
                            className="w-full py-3.5 px-6 rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,102,255,0.3)] hover:shadow-[0_12px_28px_rgba(0,102,255,0.45)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
                          >
                            <span>{cardItem.ctaText || 'ดูสินค้า Network ทั้งหมด'}</span>
                            <ArrowUpRight className="w-4 h-4 stroke-[2.5] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </Link>
                        ) : cardItem.tabCategory === 'hardware' ? (
                          <Link
                            href={
                              cardItem.id === 'hardware-barcode-scanner'
                                ? '/solutions/hardware?sub=Handheld Barcode Scanner'
                                : cardItem.id === 'hardware-computer-display'
                                ? '/solutions/hardware?sub=Computer'
                                : cardItem.id === 'hardware-equipment-power'
                                ? '/solutions/hardware?sub=UPS'
                                : '/solutions/hardware'
                            }
                            prefetch={true}
                            className="w-full py-3.5 px-6 rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,102,255,0.3)] hover:shadow-[0_12px_28px_rgba(0,102,255,0.45)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
                          >
                            <span>{cardItem.ctaText || 'ดูสินค้าทั้งหมด'}</span>
                            <ArrowUpRight className="w-4 h-4 stroke-[2.5] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </Link>
                        ) : cardItem.tabCategory === 'software' ? (
                          <Link
                            href="/solutions/software"
                            prefetch={true}
                            className="w-full py-3.5 px-6 rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,102,255,0.3)] hover:shadow-[0_12px_28px_rgba(0,102,255,0.45)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
                          >
                            <span>{cardItem.ctaText || 'ดูรายละเอียดระบบ'}</span>
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
                    {(() => {
                      const isPrinterCard =
                        cardItem.id === 'printing-printer' ||
                        project.name.toLowerCase() === 'printer' ||
                        project.coverImage?.includes('printer-podium') ||
                        project.coverImage?.includes('printer-product');

                      return (
                        <div
                          onClick={() => handleSelectCard(cardItem)}
                          className={`w-full lg:w-[62%] relative overflow-hidden group cursor-pointer flex items-center justify-center min-h-[360px] sm:min-h-[420px] lg:min-h-full ${
                            isPrinterCard
                              ? 'p-0 bg-gradient-to-b from-[#F2F7FF] via-[#E8F2FD] to-white'
                              : cardItem.isProductPhoto
                              ? 'bg-white p-6 sm:p-8 lg:p-10'
                              : 'bg-gradient-to-br from-slate-50/80 to-blue-50/20 p-6 sm:p-8 lg:p-10'
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
                          ) : isPrinterCard ? (
                            <div className="relative w-full h-full min-h-[360px] sm:min-h-[420px] lg:min-h-[480px] flex items-center justify-center overflow-hidden">
                              <img
                                src={project.coverImage || '/images/printer-podium-showcase.png'}
                                alt="Printer Solution Showcase"
                                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                                loading="lazy"
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
                                  className="w-full h-full object-cover object-top"
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
                                    <span>เล่นวิดีโอ</span>
                                  </button>
                                )}
                              </div>

                              <div className="relative w-full h-3 sm:h-3.5 bg-gradient-to-b from-slate-200 to-slate-300 rounded-b-xl border-t border-slate-400/80 shadow-md flex justify-center items-start">
                                <div className="w-20 h-1.5 rounded-b-sm bg-slate-400" />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
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
