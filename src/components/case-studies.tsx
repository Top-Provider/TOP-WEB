"use client";

import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2, Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Project } from '../types';
import { ProjectModal } from './project-modal';

interface StickyProjectSectionProps {
  onSelectProject?: (project: Project) => void;
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

const BASE_URL = '/';

// Comprehensive Solution Cards with Sticky Stacked Scroll Behavior
const ALL_SOLUTION_CARDS: SolutionCardItem[] = [
  // =================== 1. SOFTWARE SOLUTION (Default Active Tab) ===================
  {
    id: 'software-vitanix-claim',
    tabCategory: 'software',
    counterText: '01 / 12',
    urlPath: 'Topprovider.co.th / Vitanix Claim',
    clientSubtitle: '2026 • Healthcare Management',
    project: {
      id: 'vitanix-claim',
      name: 'Vitanix Claim',
      client: 'Healthcare Management',
      year: '2026',
      category: 'Hospital Claim',
      subCategory: 'Healthcare Solution',
      shortDescription: 'ระบบบริหารจัดการและเบิกจ่ายค่ารักษาพยาบาลอัตโนมัติ เชื่อมต่อข้อมูลสิทธิการรักษาและประกันภัยแบบครบวงจร ช่วยลดขั้นตอนการตรวจสอบเอกสารและเพิ่มความแม่นยำในการเคลม',
      fullDescription: 'Vitanix Claim ระบบบริหารจัดการและเบิกจ่ายค่ารักษาพยาบาลอัจฉริยะสำหรับโรงพยาบาลและสถานพยาบาลระดับองค์กร ช่วยให้การเคลมสิทธิการรักษาพยาบาล (e-Claim, ประกันสุขภาพ, สิทธิราชการ) เป็นไปอย่างถูกต้อง แม่นยำ และรวดเร็ว พร้อมระบบ Pre-audit ตรวจสอบความถูกต้องของเวชระเบียนและเอกสารก่อนส่งเคลม ลดอัตราการถูกปฏิเสธเคลมได้อย่างมีนัยสำคัญ',
      challenge: 'การเบิกจ่ายค่ารักษาพยาบาลมีความซับซ้อนในเรื่องสิทธิ เงื่อนไขกองทุน และรหัสโรค-หัตถการ ซึ่งหากส่งข้อมูลผิดพลาดจะทำให้การเบิกจ่ายล่าช้าหรือถูกตัดสิทธิ์',
      solution: 'พัฒนาระบบตรวจสอบความถูกต้องล่วงหน้า (Pre-audit), ติดตามสถานะเคลมแบบ Real-time, และเชื่อมต่อระบบ e-Claim กองทุนสุขภาพภาครัฐและเอกชนแบบครบวงจร',
      deliverables: [
        'Real-time Claim Tracking',
        'Pre-audit & Error Detection',
        'Automated e-Claim Processing',
        'Business Intelligence Dashboard',
        'Fund & Rule Validation Engine',
      ],
      metrics: [
        { label: 'ความแม่นยำในการส่งข้อมูลเคลม', value: '99.8%' },
        { label: 'เจ้าหน้าที่จัดการงานเคลมได้เร็วขึ้น', value: '2.4x' },
      ],
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'HL7/FHIR'],
      coverImage: `${BASE_URL}images/vitanix-claim.png`,
      videoUrl: 'https://www.youtube.com/embed/TNXBrlFZ5ps?autoplay=1&mute=1&playsinline=1&rel=0&start=1',
      galleryImages: [`${BASE_URL}images/vitanix-claim.png`],
      testimonial: {
        quote: 'ระบบ Vitanix Claim ช่วยให้งานเบิกจ่ายของโรงพยาบาลรวดเร็วขึ้นกว่าเดิมอย่างมาก ตรวจจับข้อผิดพลาดก่อนส่งเบิกได้แบบเรียลไทม์',
        author: 'โรงพยาบาลพันธมิตร',
        role: 'ผู้อำนวยการฝ่ายการเงินและบริหารเวชระเบียน',
      },
      featured: true,
      accentColor: '#0066FF',
    },
  },
  {
    id: 'software-panacea-his',
    tabCategory: 'software',
    counterText: '02 / 12',
    urlPath: 'Topprovider.co.th / Panacea Plus HIS',
    clientSubtitle: '2026 • Core Hospital HIS',
    project: {
      id: 'panacea-his',
      name: 'Panacea Plus Hospital Solution (HIS)',
      client: 'Top Provider HIS Suite',
      year: '2026',
      category: 'Hospital HIS',
      subCategory: 'Cloud Hospital SaaS',
      shortDescription: 'โปรแกรมบริหารจัดการโรงพยาบาลครบวงจร Standard Module 30 ระบบ และ Special Module 34 ระบบ ครอบคลุมงานเวชระเบียน, ตรวจสอบสิทธิ, OPD, IPD, ห้องยา, แล็บ, เอกซเรย์ และการเงิน',
      fullDescription: 'Panacea Plus Hospital Solution (PPHS) เป็นซอฟต์แวร์ระดับ Enterprise ออกแบบและพัฒนาในลักษณะ One System & Software as a Service (On Cloud) รองรับการเชื่อมต่อข้อมูลผู้ป่วย แผนกเวชระเบียน พยาธิวิทยา รังสีวิทยา และระบบบัญชีหลังบ้านอย่างสมบูรณ์แบบ',
      challenge: 'ระบบโรงพยาบาลเดิมแยกส่วนฐานข้อมูล ทำให้การส่งต่อข้อมูลคนไข้ระหว่างแผนกเกิดความล่าช้าและผิดพลาด',
      solution: 'รวมศูนย์ระบบทั้งหมดเป็น One System บนคลาวด์ พร้อมสถาปัตยกรรม High Availability และระบบความปลอดภัยระดับสากล',
      deliverables: [
        'Front & Back HIS Standard (30 Modules)',
        'Special Clinical Modules (34 Modules)',
        'Cloud-Native SaaS Infrastructure',
        'HL7/FHIR Interoperability Standard',
        'Integrated Lab & PACS Communication',
      ],
      metrics: [
        { label: 'โมดูลระบบมาตรฐานครบวงจร', value: '30+ ระบบ' },
        { label: 'เสถียรภาพระบบบนคลาวด์', value: '99.9%' },
      ],
      technologies: ['Cloud HIS', 'PostgreSQL', 'HL7/FHIR', 'Docker', 'Kubernetes'],
      coverImage: `${BASE_URL}images/pphs-banner.jpg`,
      galleryImages: [`${BASE_URL}images/pphs-banner.jpg`],
      testimonial: {
        quote: 'Panacea Plus ช่วยให้แพทย์และพยาบาลเข้าถึงประวัติคนไข้ได้ทันทีจากทุกแผนก ลดเวลาการทำงานและเพิ่มความปลอดภัยแก่ผู้ป่วย',
        author: 'ผู้อำนวยการโรงพยาบาล',
        role: 'ศูนย์การแพทย์เฉพาะทาง',
      },
      featured: true,
      accentColor: '#0066FF',
    },
  },
  {
    id: 'software-emr-tablet',
    tabCategory: 'software',
    counterText: '03 / 12',
    urlPath: 'Topprovider.co.th / Smart EMR & Mobile',
    clientSubtitle: '2026 • Mobile Clinical & PHR',
    project: {
      id: 'emr-tablet',
      name: 'Smart EMR Tablet & Mobile Patients (PHR/EHR)',
      client: 'Clinical Mobile Systems',
      year: '2026',
      category: 'EMR Tablet',
      subCategory: 'Mobile Health',
      shortDescription: 'ระบบเวชระเบียนอิเล็กทรอนิกส์สำหรับแพทย์และพยาบาลบนแท็บเล็ต (EMR Tablet) พร้อมแอปพลิเคชันสำหรับผู้ป่วย ตรวจสอบผลตรวจ จองคิวออนไลน์ และบันทึกประวัติสุขภาพตนเอง',
      fullDescription: 'โซลูชันเปลี่ยนผ่านโรงพยาบาลสู่ยุคไร้กระดาษ (Paperless Hospital) ด้วยระบบ EMR Tablet สำหรับการราวน์วอร์ดของแพทย์ (Doctor Inpatient Care, Nurse Note, Pre-admit) เชื่อมโยงกับแอปพลิเคชันมือถือสำหรับคนไข้ (PHR/EHR) ให้บริการจองคิวและแจ้งเตือนนัดหมายอัตโนมัติ',
      challenge: 'การบันทึกประวัติคนไข้บนกระดาษทำให้ค้นหาข้อมูลช้า และคนไข้ต้องรอคอยคิวนานโดยไม่ทราบเวลาตรวจที่แน่นอน',
      solution: 'นำระบบ EMR บนแท็บเล็ตมาใช้ในการตรวจรักษา พร้อมเปิดให้คนไข้ดูประวัติและรับการแจ้งเตือนคิวผ่าน Mobile App',
      deliverables: [
        'Doctor Inpatient Care & Round Ward UI',
        'Nurse Note & Real-time Vitals Charting',
        'Patient Mobile Application (PHR/EHR)',
        'Smart Queue & Appointment Online',
        'Digital Signature & Consent Forms',
      ],
      metrics: [
        { label: 'ลดการใช้กระดาษในหอผู้ป่วย', value: '100%' },
        { label: 'แพทย์บันทึกข้อมูลราวน์วอร์ดเร็วขึ้น', value: '70%' },
      ],
      technologies: ['React Native', 'TypeScript', 'Secure Biometrics', 'WebSockets'],
      coverImage: `${BASE_URL}images/showcase-laptop.png`,
      galleryImages: [`${BASE_URL}images/showcase-laptop.png`],
      testimonial: {
        quote: 'แพทย์ราวน์วอร์ดได้สะดวกรวดเร็วมากผ่านแท็บเล็ต ตรวจสอบผลแล็บและภาพเอกซเรย์ได้ทันทีข้างเตียงคนไข้',
        author: 'หัวหน้าฝ่ายการพยาบาล',
        role: 'โรงพยาบาลเอกชน',
      },
      featured: true,
      accentColor: '#0066FF',
    },
  },

  // =================== 2. PRINTING & SUPPLY SOLUTION (Matching Reference Image 2) ===================
  {
    id: 'printing-printer',
    tabCategory: 'printing',
    counterText: '01 / 02',
    urlPath: 'Topprovider.co.th / Printing & Supply Solution',
    clientSubtitle: '2026 • Printing & Supply Solution',
    ctaText: 'ดูสินค้าทั้งหมด',
    isProductPhoto: true,
    project: {
      id: 'printing-printer',
      name: 'Printer',
      client: 'Printing & Supply Solution',
      year: '2026',
      category: 'Printing',
      subCategory: '',
      shortDescription: 'ศูนย์รวมเครื่องพิมพ์คุณภาพสูงครบวงจรสำหรับองค์กรและสถานพยาบาล รองรับตั้งแต่การพิมพ์เอกสารสำนักงานความเร็วสูง ฉลากยา บาร์โค้ด ไปจนถึงสายรัดข้อมือผู้ป่วย (Wristband) ช่วยเพิ่มความแม่นยำในการระบุตัวตน ลดต้นทุนการพิมพ์ และรองรับการทำงานร่วมกับระบบสารสนเทศได้อย่างไร้รอยต่อ',
      fullDescription: 'ศูนย์รวมเครื่องพิมพ์คุณภาพสูงครบวงจรสำหรับองค์กรและสถานพยาบาล รองรับตั้งแต่การพิมพ์เอกสารสำนักงานความเร็วสูง ฉลากยา บาร์โค้ด ไปจนถึงสายรัดข้อมือผู้ป่วย (Wristband) ช่วยเพิ่มความแม่นยำในการระบุตัวตน ลดต้นทุนการพิมพ์ และรองรับการทำงานร่วมกับระบบสารสนเทศได้อย่างไร้รอยต่อ พร้อมบริการติดตั้ง ดูแลบำรุงรักษา และจัดจำหน่ายวัสดุสิ้นเปลืองครบวงจร',
      challenge: 'องค์กรและสถานพยาบาลต้องการเครื่องพิมพ์หลากหลายประเภท ทั้งงานพิมพ์เอกสารทั่วไป งานพิมพ์ฉลากยาความเร็วสูง และสายรัดข้อมือผู้ป่วยที่ต้องเชื่อมต่อกับระบบเครือข่ายโรงพยาบาลได้เสถียร',
      solution: 'จัดหาโซลูชันเครื่องพิมพ์ครบทุกประเภท Laser, Inkjet, Thermal, Wristband, Dot Matrix พร้อมบริการติดตั้ง เชื่อมต่อกับระบบ HIS และดูแลแบบ Onsite ทั่วประเทศ',
      deliverables: [
        'Laser & Inkjet Printer',
        'Thermal & Wristband Printer',
        'Large Format & Dot Matrix',
      ],
      metrics: [],
      technologies: ['Laser Printing', 'Thermal Wristband', 'High-Speed Inkjet', 'Network Fleet'],
      coverImage: `${BASE_URL}images/printer-product.png`,
      galleryImages: [`${BASE_URL}images/printer-product.png`],
      testimonial: {
        quote: 'เครื่องพิมพ์ของ Top Provider มีครบทุกประเภทที่โรงพยาบาลต้องการ ใช้งานทนทานและมีทีมช่างคอยดูแลรวดเร็วมาก',
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
    urlPath: 'Topprovider.co.th / Patient Wristbands & Barcode Supplies',
    clientSubtitle: '2026 • Patient Identification & Consumables',
    ctaText: 'ดูรายละเอียด',
    project: {
      id: 'medical-wristbands-supplies',
      name: 'Medical Wristbands & Supplies',
      client: 'Hospital Supply Management',
      year: '2026',
      category: 'Printing & Supply',
      subCategory: 'Medical Supplies',
      shortDescription: 'สายรัดข้อมือระบุตัวตนผู้ป่วยเกรดการแพทย์ ทนทานต่อน้ำ สบู่ และแอลกอฮอล์ฆ่าเชื้อ บาร์โค้ดไม่เลือนราง ปลอดภัยต่อผิวบอบบางและทารกแรกเกิด',
      fullDescription: 'สายรัดข้อมือผู้ป่วยมาตรฐานการแพทย์ระดับสากล ผ่านการทดสอบความทนทานต่อแอลกอฮอล์ 75% และสารทำความสะอาดในโรงพยาบาล หมึกพิมพ์คมชัดสูง อ่านค่าบาร์โค้ดได้ 100% แม้ผ่านการใช้งานหลายวัน ป้องกันข้อผิดพลาดในการให้ยาและการผ่าตัด',
      challenge: 'สายรัดข้อมือทั่วไปมักฉีกขาดหรือหมึกเลือนหายเมื่อโดนแอลกอฮอล์ ทำให้พยาบาลสแกนยืนยันตัวตนคนไข้ไม่ได้',
      solution: 'จัดหาสายรัดข้อมือวัสดุพิเศษเคลือบนาโน ทนทานต่อสารเคมีและแอลกอฮอล์ พร้อมขอบนุ่มอ่อนโยนต่อผิว',
      deliverables: [
        'Alcohol & Chemical Resistant Surface',
        'Hypoallergenic Material (Latex-free)',
        'High-Density 1D/2D Barcode Support',
      ],
      metrics: [
        { label: 'ความทนทานต่อแอลกอฮอล์และสารเคมี', value: '100%' },
        { label: 'ความแม่นยำในการอ่านบาร์โค้ด', value: '99.9%' },
      ],
      technologies: ['Nano-coated Thermal Film', 'Direct Thermal', '2D Datamatrix'],
      coverImage: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1400&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80'],
      testimonial: {
        quote: 'สายรัดข้อมือของ Top Provider ทนทานมาก โดนเจลแอลกอฮอล์วันละสิบรอบบาร์โค้ดยังคมชัด สแกนติดทันที',
        author: 'หัวหน้างานความปลอดภัยผู้ป่วย',
        role: 'โรงพยาบาลศูนย์',
      },
      featured: true,
      accentColor: '#0066FF',
    },
  },

  // =================== 3. HARDWARE SOLUTION ===================
  {
    id: 'hardware-aio-pc',
    tabCategory: 'hardware',
    counterText: '01 / 02',
    urlPath: 'Topprovider.co.th / Medical All-in-One PC',
    clientSubtitle: '2026 • Medical Grade Hardware',
    project: {
      id: 'medical-aio-pc',
      name: 'Medical-Grade All-in-One PC Workstations',
      client: 'Hospital Hardware Infrastructure',
      year: '2026',
      category: 'Hardware Solution',
      subCategory: 'Medical PC',
      shortDescription: 'จัดจำหน่ายและติดตั้งเครื่องคอมพิวเตอร์ประสิทธิภาพสูง All-in-One PC เกรดการแพทย์ ตัวเครื่องป้องกันน้ำและฝุ่น ทนทานต่อน้ำยาฆ่าเชื้อ รองรับการทำงานต่อเนื่อง 24 ชั่วโมง',
      fullDescription: 'คอมพิวเตอร์ระดับอุตสาหกรรมการแพทย์สำหรับเคาน์เตอร์พยาบาล ห้องตรวจ และห้องผ่าตัด ออกแบบไร้พัดลม (Fanless) ลดการสะสมของเชื้อโรค ตัวเครื่องเคลือบสารต้านจุลชีพและมีมาตรฐานกันน้ำ IP65 ที่แผงหน้าจอ ทนทานต่อการเช็ดทำความสะอาดตลอดเวลา',
      challenge: 'คอมพิวเตอร์สำนักงานทั่วไปมีช่องพัดลมดูดฝุ่นและเชื้อโรคเข้ามาสะสม และพังง่ายเมื่อโดนน้ำยาฆ่าเชื้อเช็ดหน้าจอ',
      solution: 'นำเข้าคอมพิวเตอร์เกรดการแพทย์แบบ Fanless หน้าจอป้องกันรอยขีดข่วนและของเหลว พร้อมการรับประกัน Onsite แบบเปลี่ยนเครื่องทันที',
      deliverables: [
        'Fanless Antimicrobial Medical PC',
        'IP65 Waterproof Front Bezel',
        'High-Brightness Anti-Glare Medical Display',
        'Hot-Swappable UPS Battery Backup',
        'Onsite Hardware Maintenance SLA',
      ],
      metrics: [
        { label: 'รองรับการทำงานต่อเนื่องแบบ Non-stop', value: '24/7' },
        { label: 'มาตรฐานป้องกันน้ำและฝุ่นละออง', value: 'IP65' },
      ],
      technologies: ['Fanless Cooling', 'Antimicrobial Chassis', 'Medical Touchscreen'],
      coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'],
      testimonial: {
        quote: 'เครื่องคอมพิวเตอร์ทนทานมาก เช็ดน้ำยาฆ่าเชื้อได้ทั้งวันไม่มีปัญหา และเครื่องเงียบสนิทเหมาะกับห้องผู้ป่วย',
        author: 'ผู้จัดการฝ่ายวิศวกรรมการแพทย์',
        role: 'โรงพยาบาลกรุงเทพและปริมณฑล',
      },
      featured: true,
      accentColor: '#0066FF',
    },
  },
  {
    id: 'hardware-scanners',
    tabCategory: 'hardware',
    counterText: '02 / 02',
    urlPath: 'Topprovider.co.th / 2D Medical Scanners',
    clientSubtitle: '2026 • High-Speed Barcode Readers',
    project: {
      id: 'medical-scanners',
      name: 'High-Speed 2D Medical Barcode Scanners',
      client: 'Clinical Devices',
      year: '2026',
      category: 'Hardware Solution',
      subCategory: 'Barcode Readers',
      shortDescription: 'เครื่องอ่านบาร์โค้ด 2 มิติเกรดการแพทย์ สแกนสายรัดข้อมือและฉลากยาได้ในเสี้ยววินาที รองรับการอ่านบาร์โค้ดที่ยับหรือเปียกน้ำ พร้อมระบบเสียงและแสงยืนยันการอ่านสำเร็จ',
      fullDescription: 'เครื่องอ่านบาร์โค้ดแบบไร้สายและมีสาย ออกแบบสำหรับโรงพยาบาลโดยเฉพาะ ตัวเครื่องทนต่อสารเคมีทำความสะอาด มีระบบเล็งและสแกนความเร็วสูง อ่านโค้ดบนพื้นผิวโค้งของขวดยาหรือสายรัดข้อมือได้อย่างแม่นยำในครั้งเดียว',
      challenge: 'พยาบาลเสียเวลาในการสแกนบาร์โค้ดบนสายรัดข้อมือที่ไม่ค่อยติด หรือบาร์โค้ดยับบนซองยา',
      solution: 'ใช้เซนเซอร์ออปติคอลความไวสูง จับภาพได้ 360 องศา อ่านโค้ดที่มีความเปรียบต่างต่ำหรือยับได้อย่างแม่นยำ',
      deliverables: [
        'Healthcare Disinfectant-Ready Housing',
        'Omnidirectional 1D/2D High-Speed Scanning',
        'Night-Mode Vibration & LED Feedback',
        'Long-Range Wireless Bluetooth Base',
        '1.8m Drop Resistance Rating',
      ],
      metrics: [
        { label: 'ความเร็วในการอ่านบาร์โค้ด', value: '< 0.1 วินาที' },
        { label: 'ความแม่นยำในการระบุตัวยา', value: '100%' },
      ],
      technologies: ['2D Area Imager', 'Bluetooth LE', 'Antimicrobial Enclosure'],
      coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1400&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80'],
      testimonial: {
        quote: 'เครื่องสแกนบาร์โค้ดอ่านเร็วมาก แม้สายรัดข้อมือจะโค้งหรือเปียกน้ำก็อ่านได้ในคลิกเดียว ช่วยลดเวลาทำงานได้เยอะ',
        author: 'พยาบาลวิชาชีพ แผนกผู้ป่วยใน',
        role: 'โรงพยาบาลทั่วไป',
      },
      featured: true,
      accentColor: '#0066FF',
    },
  },

  // =================== 4. NETWORK SOLUTION ===================
  {
    id: 'network-datacenter',
    tabCategory: 'network',
    counterText: '01 / 02',
    urlPath: 'Topprovider.co.th / Network & Server Infrastructure',
    clientSubtitle: '2026 • Core Hospital Infrastructure',
    project: {
      id: 'network-datacenter',
      name: 'Hospital Core Server & SAN Storage Cluster',
      client: 'Healthcare Infrastructure',
      year: '2026',
      category: 'Network Solution',
      subCategory: 'Core Server & Storage',
      shortDescription: 'วางระบบโครงสร้างพื้นฐานเครือข่ายและศูนย์ข้อมูลสำหรับโรงพยาบาล ออกแบบระบบ Server, Storage, Firewall ความปลอดภัยขั้นสูง เพื่อการส่งผ่านข้อมูลเวชระเบียนและภาพ PACS ไร้รอยต่อ',
      fullDescription: 'การออกแบบและวางระบบโครงสร้างพื้นฐานเครือข่ายระดับ Mission-Critical รองรับการส่งถ่ายข้อมูลภาพทางการแพทย์ (PACS) ขนาดใหญ่ และฐานข้อมูลคนไข้ที่เติบโตอย่างต่อเนื่อง มั่นใจได้ด้วยระบบ Server Cluster สำรองข้อมูลแบบ Real-time และโครงข่ายไฟเบอร์ 10Gbps ทั่วทั้งโรงพยาบาล',
      challenge: 'ระบบเครือข่ายเดิมแบนด์วิดท์ไม่พอ ทำให้การเปิดดูภาพเอกซเรย์ CT/MRI ช้า และมีความเสี่ยงต่อระบบล่ม',
      solution: 'อัปเกรดเป็น Core Fiber 10Gbps พร้อม SAN All-Flash Storage และระบบกระจายภาระงาน (Load Balancing)',
      deliverables: [
        'High-Availability Server & Storage Cluster',
        '10Gbps Core Fiber Optic Backbone',
        'Sub-millisecond PACS Storage Access',
        'Automated Disaster Recovery Replication',
        '24/7 Network Operations Center (NOC)',
      ],
      metrics: [
        { label: 'Uptime เสถียรภาพเครือข่าย', value: '99.99%' },
        { label: 'ความเร็วเชื่อมต่อ Core Backbone', value: '10 Gbps' },
      ],
      technologies: ['Cisco/Aruba', 'SAN All-Flash', 'Fiber Optic 10G', 'VMware HA'],
      coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80'],
      testimonial: {
        quote: 'การเปิดดูภาพสแกน MRI ทำได้เร็วขึ้นแบบทันทีทันใด แพทย์รังสีวินิจฉัยทำงานได้ราบรื่นมาก',
        author: 'ผู้อำนวยการฝ่ายสารสนเทศ',
        role: 'ศูนย์รังสีวิทยาและโรงพยาบาล',
      },
      featured: true,
      accentColor: '#0066FF',
    },
  },
  {
    id: 'network-firewall-wifi',
    tabCategory: 'network',
    counterText: '02 / 02',
    urlPath: 'Topprovider.co.th / Next-Gen Firewall & Wi-Fi 6',
    clientSubtitle: '2026 • Security & Wireless Connectivity',
    project: {
      id: 'network-firewall-wifi',
      name: 'Next-Gen Firewall & Healthcare Wi-Fi 6',
      client: 'Cyber Security & Network',
      year: '2026',
      category: 'Network Solution',
      subCategory: 'Firewall & Wi-Fi 6',
      shortDescription: 'ระบบไฟร์วอลล์ความปลอดภัยสูงป้องกัน Ransomware ตามมาตรฐาน PDPA พร้อมระบบ Wi-Fi 6 เกรดการแพทย์ รองรับอุปกรณ์แท็บเล็ตและเครื่องมือแพทย์นับหมื่นเครื่องพร้อมกัน',
      fullDescription: 'การสร้างเครือข่ายไร้สายความหนาแน่นสูง (High-Density Wi-Fi 6) ครอบคลุมทุกอาคารและห้องผ่าตัด สัญญาณเสถียรไม่มีจุดอับสัญญาณ รองรับการโรมมิ่งอย่างราบรื่นสำหรับรถเข็นพยาบาลและแท็บเล็ต พร้อมระบบไฟร์วอลล์ระดับ Enterprise คอยป้องกันภัยคุกคามทางไซเบอร์ตลอด 24 ชั่วโมง',
      challenge: 'สัญญาณ Wi-Fi หลุดบ่อยเมื่อเข็นรถยาข้ามตึก และมีความเสี่ยงถูกโจมตีทางไซเบอร์เพื่อเรียกค่าไถ่ข้อมูลคนไข้',
      solution: 'ติดตั้ง Healthcare Wi-Fi 6 พร้อม Fast Roaming และระบบ Next-Gen Firewall ที่ตรวจจับมัลแวร์แบบ Real-time',
      deliverables: [
        'Zero-Trust Next-Gen Firewall Security',
        'Hospital-Wide Seamless Wi-Fi 6 Roaming',
        'IoT & Medical Device Network Segmentation',
        'PDPA Compliance Data Protection Policy',
        'Real-Time Threat Detection & Automated Block',
      ],
      metrics: [
        { label: 'อัตราการตรวจจับภัยคุกคามไซเบอร์', value: '100%' },
        { label: 'ความครอบคลุมสัญญาณ Wi-Fi ทั่วอาคาร', value: '99.9%' },
      ],
      technologies: ['Wi-Fi 6', 'Next-Gen Firewall', 'Zero Trust', 'WPA3 Enterprise'],
      coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1400&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80'],
      testimonial: {
        quote: 'สัญญาณ Wi-Fi นิ่งและเร็วมาก เข็นรถพยาบาลข้ามตึกแท็บเล็ตไม่มีหลุด และมั่นใจในความปลอดภัยข้อมูลคนไข้',
        author: 'หัวหน้างานความมั่นคงปลอดภัยไซเบอร์',
        role: 'เครือโรงพยาบาลชั้นนำ',
      },
      featured: true,
      accentColor: '#0066FF',
    },
  },

  // =================== 5. MEDICAL EQUIPMENT ===================
  {
    id: 'medical-kiosk',
    tabCategory: 'medical',
    counterText: '01 / 02',
    urlPath: 'Topprovider.co.th / Smart Kiosk',
    clientSubtitle: '2026 • Patient Self-Service Systems',
    project: {
      id: 'smart-kiosk',
      name: 'Smart Self-Registration & Payment Kiosk',
      client: 'Smart Hospital Kiosk',
      year: '2026',
      category: 'Medical Equipment',
      subCategory: 'Self-Service Kiosk',
      shortDescription: 'นวัตกรรมตู้บริการตนเองอัจฉริยะ (Self-Service Kiosk) สำหรับลงทะเบียนผู้ป่วย ตรวจสอบสิทธิ ชำระเงินค่ารักษาพยาบาล ลดความแออัดและลดเวลารอคอยของผู้รับบริการ',
      fullDescription: 'ตู้บริการอัตโนมัติอัจฉริยะที่ช่วยยกระดับประสบการณ์ผู้ป่วย ผู้รับบริการสามารถเสียบบัตรประชาชนเพื่อเช็คสิทธิการรักษา จองคิว หรือชำระเงินผ่าน QR Code และบัตรเครดิตได้ด้วยตนเอง มีเสียงและคำแนะนำภาษาไทยและภาษาอังกฤษ ใช้งานง่ายและสะดวกรวดเร็วใน 1 นาที',
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
    project: {
      id: 'vital-signs-station',
      name: 'Direct HIS-Synced Vital Signs Station',
      client: 'Clinical Vitals Integration',
      year: '2026',
      category: 'Medical Equipment',
      subCategory: 'Vital Signs',
      shortDescription: 'สถานีตรวจวัดสัญญาณชีพและเครื่องวัดความดันอัตโนมัติที่ซิงค์ข้อมูลผลตรวจ (ความดัน, ชีพจร, น้ำหนัก, ส่วนสูง, BMI) ตรงเข้าสู่ระบบ HIS ทันที พยาบาลไม่ต้องจดหรือคีย์ข้อมูลซ้ำ',
      fullDescription: 'การผสานเครื่องวัดความดันโลหิต เครื่องวัดค่าออกซิเจนในเลือด และเครื่องชั่งน้ำหนัก-วัดส่วนสูงเข้ากับระบบ HIS โดยตรง เมื่อผู้ป่วยสแกนสายรัดข้อมือหรือบัตรประชาชน ข้อมูลสัญญาณชีพจะถูกบันทึกลงเวชระเบียนอิเล็กทรอนิกส์ของแพทย์ทันที ป้องกันความผิดพลาดจากการจดบันทึกด้วยมือ',
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

  // =================== 6. SMART SOLUTION (IoT) ===================
  {
    id: 'iot-facial-security',
    tabCategory: 'iot',
    counterText: '01 / 02',
    urlPath: 'Topprovider.co.th / AI Facial Recognition',
    clientSubtitle: '2026 • AI Computer Vision Security',
    project: {
      id: 'ai-facial-security',
      name: 'AI Facial Recognition & CCTV Surveillance',
      client: 'Smart Hospital IoT & AI',
      year: '2026',
      category: 'Smart Solution (IoT)',
      subCategory: 'AI Surveillance',
      shortDescription: 'ระบบกล้องโทรทัศน์วงจรปิดอัจฉริยะวิเคราะห์ใบหน้า ตรวจจับบุคคลต้องสงสัย แจ้งเตือนเมื่อมีผู้ป่วยพลัดหลง และควบคุมการเข้าออกพื้นที่หวงห้ามได้อย่างแม่นยำ',
      fullDescription: 'การยกระดับความปลอดภัยในโรงพยาบาลด้วยเทคโนโลยี AI คอมพิวเตอร์วิทัศน์ สามารถตรวจจับใบหน้าในระยะไกล ค้นหาเส้นทางการเคลื่อนที่ของผู้ป่วยกลุ่มเสี่ยงหรือเด็กแรกเกิด พร้อมระบบแจ้งเตือนแบบเรียลไทม์ไปยังห้องควบคุมความปลอดภัยเมื่อมีเหตุผิดปกติ',
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
    project: {
      id: 'rtls-asset-tracking',
      name: 'Real-Time Asset & Patient Tracking (RTLS)',
      client: 'Healthcare IoT Logistics',
      year: '2026',
      category: 'Smart Solution (IoT)',
      subCategory: 'RTLS Tracking',
      shortDescription: 'ระบบติดตามพิกัดตำแหน่งอุปกรณ์ทางการแพทย์ (เครื่องกระตุกหัวใจ, เครื่องช่วยหายใจ, รถเข็น) และผู้ป่วยกลุ่มเสี่ยงด้วยสัญญาณ BLE/RFID แสดงผลบนแผนผังดิจิทัลแบบเรียลไทม์',
      fullDescription: 'โซลูชัน IoT แท็กอัจฉริยะติดเครื่องมือแพทย์ ช่วยให้แพทย์และพยาบาลสามารถค้นหาตำแหน่งเครื่องมือกู้ชีพที่ใกล้ที่สุดได้ทันทีในเวลาฉุกเฉิน พร้อมระบบแจ้งเตือนการบำรุงรักษาเครื่องมือตามรอบระยะเวลา และระบบเตือนเมื่ออุปกรณ์ถูกเคลื่อนย้ายออกนอกแผนก',
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

export const StickyProjectSection: React.FC<StickyProjectSectionProps> = ({ onSelectProject }) => {
  // Default to 'software' tab (Software Solution) as shown in Reference Image 2
  const [activeTab, setActiveTab] = useState<TabId>('software');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Filter cards for active tab
  const currentCards = ALL_SOLUTION_CARDS.filter((item) => item.tabCategory === activeTab);

  const handleTabClick = (tabId: TabId) => {
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

  return (
    <section id="showcase" className="py-12 sm:py-16 lg:py-20 bg-[#F8FAFC] text-slate-900 relative z-20 border-b border-slate-200/80 select-none">
      <div id="case-studies" className="w-[92%] max-w-[1500px] mx-auto px-2 sm:px-4 lg:px-6">
        {/* Section Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0F172A] leading-[1.2]">
            IT Solution & Product
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 font-normal">
            เลือกดูโซลูชันและผลิตภัณฑ์ตามหมวดหมู่การใช้งานที่ครอบคลุมทุกระบบโรงพยาบาลและองค์กร
          </p>
        </div>

        {/* Sticky Tab List / Pill Navigation Bar - Locked at Top while Scrolling (matching Reference Image) */}
        <div className="sticky top-0 z-30 py-2.5 sm:py-3 bg-[#F8FAFC]/95 backdrop-blur-md mb-6 sm:mb-8 -mx-2 px-2 sm:-mx-4 sm:px-4 transition-all">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-2 px-1.5 -mx-1.5 no-scrollbar">
            {SOLUTION_TABS.map((tab) => {
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

        {/* Sticky Stacked Product Cards Stage - EXACTLY PRESERVING THE SCROLL STACKING EFFECT */}
        <div className="relative space-y-10 lg:space-y-14">
          {currentCards.map((cardItem, index) => {
            // Top offset positioned right below the locked tablist for sticky stacked deck effect
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
                    {/* 1. Top Browser Window Bar: Vertically Centered & Uniform Padding */}
                    <div className="px-6 sm:px-8 py-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-4">
                      {/* Left: Window Controls & URL Path */}
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

                      {/* Right: Category Badges */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-medium text-[#0066FF] bg-white px-3.5 py-1 rounded-full border border-blue-200/90 shadow-2xs">
                          {project.category}
                        </span>
                        {project.subCategory ? (
                          <span className="text-xs font-medium text-[#0066FF] bg-white px-3.5 py-1 rounded-full border border-blue-200/90 shadow-2xs">
                            {project.subCategory}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* 2. Card Body: 38% Information : 62% Laptop Mockup */}
                    <div className="flex flex-col lg:flex-row min-h-[480px] lg:min-h-[520px]">
                      {/* Left Column (38%): Product Information */}
                      <div className="w-full lg:w-[38%] p-6 sm:p-8 lg:p-8 xl:p-9 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100 bg-[#FFFFFF] shrink-0">
                        {/* Top Group: Counter, Title, Description & Features */}
                        <div className="space-y-4">
                          {/* Counter & Subtitle */}
                          <div className="flex items-center justify-between gap-4">
                            <span className="inline-flex items-center justify-center text-xs font-mono font-semibold text-[#0066FF] bg-blue-50/90 px-3 py-1 rounded-full border border-blue-100 leading-none">
                              {cardItem.counterText}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              {cardItem.clientSubtitle}
                            </span>
                          </div>

                          {/* Product Title */}
                          <h3 className="text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight text-[#0F172A] leading-tight">
                            {project.name}
                          </h3>

                          {/* Description */}
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                            {project.shortDescription}
                          </p>

                          {/* Key Features */}
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
                        </div>

                        {/* Bottom Group: Metrics & Action Button */}
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

                          {/* Primary CTA in Electric Blue */}
                          <button
                            onClick={() => handleSelectProject(project)}
                            className="w-full py-3.5 px-6 rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,102,255,0.3)] hover:shadow-[0_12px_28px_rgba(0,102,255,0.45)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
                          >
                            <span>{cardItem.ctaText || 'ดูรายละเอียด'}</span>
                            <ArrowUpRight className="w-4 h-4 stroke-[2.5] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </button>
                        </div>
                      </div>

                      {/* Right Column (62%): Centered Product Preview */}
                      <div
                        onClick={() => handleSelectProject(project)}
                        className={`w-full lg:w-[62%] relative overflow-hidden group cursor-pointer flex items-center justify-center p-6 sm:p-8 lg:p-10 min-h-[360px] sm:min-h-[420px] lg:min-h-full ${
                          cardItem.isProductPhoto
                            ? 'bg-white'
                            : 'bg-gradient-to-br from-slate-50/80 to-blue-50/20'
                        }`}
                      >
                        {cardItem.isProductPhoto ? (
                          <div className="relative w-full max-w-[740px] xl:max-w-[780px] my-auto flex items-center justify-center p-2 sm:p-4 lg:p-6">
                            <img
                              src={project.coverImage}
                              alt={project.name}
                              className="w-full max-w-[440px] sm:max-w-[560px] md:max-w-[640px] lg:max-w-[720px] max-h-[440px] sm:max-h-[480px] lg:max-h-[520px] h-auto object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03] drop-shadow-[0_18px_35px_rgba(0,0,0,0.12)]"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          /* Centered Laptop Mockup matching Reference Image 2 */
                          <div className="relative w-full max-w-[760px] my-auto transition-transform duration-500 ease-out group-hover:scale-[1.015] flex flex-col items-center justify-center">
                            {/* Laptop Screen Bezel */}
                            <div className="relative w-full rounded-t-xl bg-[#0F172A] border-[6px] sm:border-[8px] border-slate-900 shadow-[0_20px_50px_rgba(0,102,255,0.12)] overflow-hidden aspect-[16/10] flex items-center justify-center">
                              <img
                                src={project.coverImage}
                                alt={project.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />

                              {/* Video Popup Trigger Button if video is available */}
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

                            {/* Laptop Bottom Base */}
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
