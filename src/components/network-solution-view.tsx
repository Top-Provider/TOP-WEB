"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  PhoneCall,
  FileText,
  X,
  ArrowRight,
  ExternalLink,
  Loader2,
  Server,
  Shield,
  Wifi,
  HardDrive,
  Cpu,
  Layers,
  CheckCircle2,
  Activity,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductItemResponse } from "@/app/api/products/route";

export const SOLUTION_CATEGORY_TABS = [
  { id: "printing", label: "Printing & Supply Solution", href: "/solutions/printing" },
  { id: "hardware", label: "Hardware Solution", href: "/#case-studies" },
  { id: "software", label: "Software Solution", href: "/solutions/software" },
  { id: "network", label: "Network Solution", href: "/solutions/network", active: true },
  { id: "medical", label: "Medical Equipment", href: "/#case-studies" },
  { id: "iot", label: "Smart Solution (IoT)", href: "/#case-studies" },
];

export interface ExtendedProductItem extends ProductItemResponse {
  is_new?: boolean;
  bullet_specs?: string[];
}

export const SIDEBAR_SERVER_CATEGORIES = [
  "Server",
  "Storage",
  "Core Server Cluster",
  "Backup & Disaster Recovery",
];

export const SIDEBAR_NETWORK_CATEGORIES = [
  "Next-Gen Firewall",
  "Core & Access Switch",
  "Enterprise Router",
  "Wireless & Wi-Fi 6",
];

export const SIDEBAR_LICENSE_CATEGORIES = [
  "License",
  "Software Install Client",
];

export const DEFAULT_NETWORK_PRODUCTS: ExtendedProductItem[] = [
  {
    id: 101,
    name: "HPE ProLiant DL380 Gen11 Rack Server",
    sku: "DL380-G11-ENT",
    slug: "hpe-proliant-dl380-gen11",
    category_id: "Network",
    sub_category: "Server",
    brand: "HPE",
    product_type: "printer", // generic type
    short_description: "เซิร์ฟเวอร์แบบ 2U 2-Sockets ขุมพลัง 4th/5th Gen Intel Xeon Scalable สำหรับระบบฐานข้อมูลเวชระเบียนและ PACS โรงพยาบาล",
    full_description: "HPE ProLiant DL380 Gen11 มอบความปลอดภัยระดับสูงสุดด้วย Silicon Root of Trust และประสิทธิภาพการประมวลผลขั้นสูง รองรับเวิร์กโหลดเวชระเบียนโรงพยาบาล (HIS), ระบบจัดเก็บและรับส่งภาพทางการแพทย์ (PACS) และ Cloud Virtualization แบบไม่มีสะดุดตลอด 24 ชั่วโมง",
    specifications: [
      { label: "Processor", value: "Dual Intel Xeon Silver 4410Y (12C/24T, 2.0GHz up to 3.9GHz)" },
      { label: "Memory (RAM)", value: "64GB (2x32GB) DDR5-4800 RDIMM (ขยายได้สูงสุด 8TB)" },
      { label: "Internal Storage", value: "8 SFF SAS/SATA/NVMe Hot Plug Drive Bays (พร้อม 2x 960GB SSD RI)" },
      { label: "Storage Controller", value: "HPE Smart Array MR408i-o Gen11 4GB Flash-Backed Write Cache" },
      { label: "Network Interface", value: "Broadcom BCM57416 10GBASE-T 2-port OCP3 + 4x 1GbE Base-T" },
      { label: "Power Supply", value: "Dual 800W Flex Slot Platinum Hot Plug Low Halogen Power Supply" },
      { label: "Management", value: "HPE iLO 6 Advanced with Intelligent Provisioning & Security" },
      { label: "Form Factor", value: "2U Rack Mount with Easy Install Rail Kit & Cable Management Arm" },
      { label: "Warranty", value: "3 Years 24x7 4-Hour Onsite Response" },
    ],
    cover_image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
    ],
    compatible_products: ["Dell EMC PowerVault ME5024 SAN Storage", "VMware vSphere Enterprise Plus License"],
    datasheet_en_url: "https://www.hpe.com",
    tor_th_url: "https://www.topprovider.co.th",
    is_active: true,
    is_new: true,
    bullet_specs: ["Dual Intel Xeon Scalable Gen4", "64GB DDR5 RDIMM (Max 8TB)"],
  },
  {
    id: 102,
    name: "Dell PowerEdge R760 Enterprise Server",
    sku: "PE-R760-2U",
    slug: "dell-poweredge-r760",
    category_id: "Network",
    sub_category: "Server",
    brand: "Dell Technologies",
    product_type: "printer",
    short_description: "เซิร์ฟเวอร์สมรรถนะสูงระดับ Mission-Critical รองรับ Virtualization, Data Analytics และ Hospital Core Cluster",
    full_description: "Dell PowerEdge R760 ขับเคลื่อนงานประมวลผลที่ซับซ้อนที่สุดขององค์กรและโรงพยาบาลขนาดใหญ่ รองรับ VMware HA Cluster, Large In-Memory Database และระบบ AI Image Analysis ได้อย่างมีเสถียรภาพสูงสุด พร้อมระบบบริหารจัดการระยะไกล iDRAC9 Enterprise",
    specifications: [
      { label: "Processor", value: "Dual Intel Xeon Gold 5418Y (24C/48T, 2.0GHz up to 3.8GHz)" },
      { label: "Memory (RAM)", value: "128GB (4x32GB) DDR5 4800MHz RDIMM ECC" },
      { label: "Storage Drive", value: "8x 2.4TB 10K RPM SAS 12Gbps 512e 2.5in Hot-plug Hard Drive" },
      { label: "RAID Controller", value: "PERC H755 SAS Front (RAID 0, 1, 5, 6, 10, 50, 60)" },
      { label: "Network Ports", value: "Dual Port 10GbE SFP+ / Base-T OCP 3.0 + Dual Port 1GbE" },
      { label: "Power Supply", value: "Dual, Hot-Plug, Redundant Power Supply (1+1), 1100W Titanium" },
      { label: "Server Management", value: "iDRAC9 Enterprise 16G with OpenManage Enterprise" },
      { label: "Warranty", value: "3 Years ProSupport Plus with 24x7 Mission Critical Onsite" },
    ],
    cover_image_url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
    ],
    compatible_products: ["Microsoft Windows Server 2025 Standard", "Cisco Catalyst 9300 48-Port PoE+ Switch"],
    datasheet_en_url: "https://www.dell.com",
    tor_th_url: "https://www.topprovider.co.th",
    is_active: true,
    is_new: true,
    bullet_specs: ["Dual Intel Xeon Gold 24-Core", "128GB DDR5 ECC RAM"],
  },
  {
    id: 103,
    name: "Dell EMC PowerVault ME5024 SAN Storage",
    sku: "ME5024-SAN",
    slug: "dell-emc-powervault-me5024",
    category_id: "Network",
    sub_category: "Storage",
    brand: "Dell Technologies",
    product_type: "printer",
    short_description: "ระบบจัดเก็บข้อมูล SAN All-Flash/Hybrid Storage ความเร็วสูงสำหรับระบบ PACS และฐานข้อมูลเวชระเบียนผู้ป่วย",
    full_description: "Dell PowerVault ME5024 สตอเรจ SAN ประสิทธิภาพสูงที่ออกแบบมาเพื่อรองรับงานโรงพยาบาลและศูนย์ข้อมูล ด้วยคอนโทรลเลอร์คู่แบบ Dual Active-Active มอบ IOPS สูงถึง 640,000 IOPS และแบนด์วิดท์ส่งผ่านข้อมูล 12GB/s ทำให้การเปิดดูภาพ CT, MRI และเวชระเบียนทำได้ทันที",
    specifications: [
      { label: "Controllers", value: "Dual Active-Active Controllers with Intel Xeon 8-Core Processors" },
      { label: "Drive Bays", value: "24x 2.5\" Drive Bays (SFF) รองรับ SAS SSD และ 10K/15K SAS HDD" },
      { label: "Raw Capacity", value: "รองรับการขยายสูงสุด 2.4PB ผ่าน Expansion Enclosure ME484/ME424" },
      { label: "Host Connectivity", value: "8x 16Gb/32Gb Fibre Channel (FC) หรือ 8x 10G/25G iSCSI SFP28 Ports" },
      { label: "Management Protocols", value: "PowerVault Manager HTML5 GUI, CLI, SMI-S, SNMP, REST API" },
      { label: "Data Protection", value: "ADAPT (Advanced Distributed Autonomic Protection), Snapshots, Replication" },
      { label: "Power Supply", value: "Redundant Hot-Swappable 580W Power Supplies" },
      { label: "Warranty", value: "3 Years ProSupport Plus 24x7 4-Hour Onsite" },
    ],
    cover_image_url: "https://images.unsplash.com/photo-1551808525-51a94da548ce?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1551808525-51a94da548ce?auto=format&fit=crop&w=800&q=80",
    ],
    compatible_products: ["HPE ProLiant DL380 Gen11 Rack Server", "VMware vSphere Enterprise Plus License"],
    datasheet_en_url: "https://www.dell.com",
    tor_th_url: "https://www.topprovider.co.th",
    is_active: true,
    is_new: true,
    bullet_specs: ["Dual Active-Active Controller", "16Gb FC / 10G iSCSI Ready"],
  },
  {
    id: 104,
    name: "Synology Enterprise FlashStation FS3410 NAS",
    sku: "FS3410-24BAY",
    slug: "synology-flashstation-fs3410",
    category_id: "Network",
    sub_category: "Storage",
    brand: "Synology",
    product_type: "printer",
    short_description: "สตอเรจ All-Flash NAS/SAN 24 ช่อง สำหรับสำรองข้อมูลเวชระเบียนและแชร์ไฟล์ความเร็วสูงระดับ sub-millisecond",
    full_description: "Synology FlashStation FS3410 คือเซิร์ฟเวอร์สตอเรจ All-Flash ขนาด 2U แบบ 24 ช่อง ที่ให้ประสิทธิภาพการอ่าน/เขียนแบบสุ่มระดับ 356,000/129,000 4K Random Write IOPS เหมาะอย่างยิ่งสำหรับระบบสำรองข้อมูลโรงพยาบาล, Virtual Machine Storage และ PACS Backup",
    specifications: [
      { label: "CPU", value: "Intel Xeon D-1541 8-Core 2.1 GHz (Turbo up to 2.7 GHz)" },
      { label: "Memory (RAM)", value: "16GB DDR4 ECC RDIMM (ขยายได้สูงสุด 128GB)" },
      { label: "Drive Bays", value: "24x 2.5\" SATA SSD Hot-swappable" },
      { label: "Network Ports", value: "2x 10GbE SFP+ Ports + 4x 1GbE RJ-45 Ports" },
      { label: "PCIe Expansion", value: "2x PCIe 3.0 x8 slots สำหรับเพิ่มการ์ด 25GbE/40GbE หรือ Fibre Channel" },
      { label: "Storage Protocol", value: "iSCSI, Fibre Channel (optional), NFS, SMB, AFP, FTP" },
      { label: "Power Supply", value: "Dual Redundant 500W Power Supply Units" },
      { label: "Warranty", value: "5 Years Synology Replacement Warranty" },
    ],
    cover_image_url: "https://images.unsplash.com/photo-1597852074816-d933c4d2b988?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1597852074816-d933c4d2b988?auto=format&fit=crop&w=800&q=80",
    ],
    compatible_products: ["Fortinet FortiGate 100F Next-Gen Firewall", "HPE ProLiant DL380 Gen11 Rack Server"],
    datasheet_en_url: "https://www.synology.com",
    tor_th_url: "https://www.topprovider.co.th",
    is_active: true,
    is_new: false,
    bullet_specs: ["24-Bay All-Flash NVMe/SSD", "Dual 10GbE SFP+ Built-in"],
  },
  {
    id: 105,
    name: "Fortinet FortiGate 100F Next-Gen Firewall",
    sku: "FG-100F-BDL-950-12",
    slug: "fortinet-fortigate-100f",
    category_id: "Network",
    sub_category: "Next-Gen Firewall",
    brand: "Fortinet",
    product_type: "printer",
    short_description: "ไฟร์วอลล์ความปลอดภัยสูงระดับ Enterprise สำหรับปกป้องเครือข่ายโรงพยาบาลจาก Ransomware และภัยไซเบอร์",
    full_description: "FortiGate 100F มอบโซลูชันระบบรักษาความปลอดภัยเครือข่ายระดับเน็กซ์เจน (NGFW) ที่ขับเคลื่อนด้วยชิปประมวลผลความปลอดภัยเฉพาะทาง SPU (Security Processing Unit) ช่วยตรวจจับและบล็อกภัยคุกคาม มัลแวร์เรียกค่าไถ่ และบุกรุกช่องโหว่ตามมาตรฐานความปลอดภัย PDPA และ สกมช.",
    specifications: [
      { label: "Firewall Throughput", value: "20 Gbps (1518 / 512 / 64 byte UDP packets)" },
      { label: "IPS Throughput", value: "2.6 Gbps Enterprise Protection" },
      { label: "NGFW Throughput", value: "1.6 Gbps Full Threat Inspection" },
      { label: "Threat Protection", value: "1.0 Gbps (Antivirus, IPS, Web Filtering, Application Control)" },
      { label: "Interfaces", value: "2x 10GE SFP+ slots, 4x 1GE SFP slots, 16x 1GE RJ45 ports (incl. 2x WAN, 1x DMZ)" },
      { label: "Concurrent Sessions", value: "1,500,000 TCP Concurrent Sessions" },
      { label: "VPN Support", value: "IPsec VPN Throughput 11.5 Gbps, SSL-VPN 1 Gbps" },
      { label: "Power Supply", value: "Dual Dual-AC Redundant Power Supplies built-in" },
      { label: "Bundle License", value: "1 Year FortiCare Premium and FortiGuard Enterprise Protection Bundle" },
    ],
    cover_image_url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
    ],
    compatible_products: ["Cisco Catalyst 9300 48-Port PoE+ Switch", "Aruba AP-535 Wi-Fi 6 Medical Grade Access Point"],
    datasheet_en_url: "https://www.fortinet.com",
    tor_th_url: "https://www.topprovider.co.th",
    is_active: true,
    is_new: true,
    bullet_specs: ["20 Gbps Firewall Throughput", "Dual Redundant AC Power"],
  },
  {
    id: 106,
    name: "Palo Alto PA-440 Next-Generation Firewall",
    sku: "PAN-PA-440",
    slug: "palo-alto-pa-440",
    category_id: "Network",
    sub_category: "Next-Gen Firewall",
    brand: "Palo Alto Networks",
    product_type: "printer",
    short_description: "เน็กซ์เจนไฟร์วอลล์ขับเคลื่อนด้วย Machine Learning ป้องกันภัยคุกคามแบบ Zero-Day และควบคุมการเข้าถึงแม่นยำ",
    full_description: "Palo Alto Networks PA-440 มอบความปลอดภัยระดับสูงสุดด้วย ML-Powered NGFW สำหรับสาขาและโรงพยาบาลขนาดกลาง วิเคราะห์ทราฟฟิกข้อมูลอย่างลึกซึ้งด้วยเทคโนโลยี App-ID, User-ID และ Device-ID เพื่อป้องกันการโจมตีจากภายนอกและหยุดยั้งมัลแวร์แบบเรียลไทม์",
    specifications: [
      { label: "Firewall Throughput", value: "3.0 Gbps (App-ID enabled)" },
      { label: "Threat Prevention", value: "1.0 Gbps (IPS, AV, Spyware inspection)" },
      { label: "IPsec VPN Throughput", value: "1.6 Gbps" },
      { label: "Max Concurrent Sessions", value: "200,000 Max Sessions (39,000 new sessions/sec)" },
      { label: "I/O Ports", value: "8x 10/100/1000 RJ-45 ports, 1x 10/100/1000 Out-of-Band Management" },
      { label: "Zero-Day Defense", value: "Inline Deep Learning Cloud-Delivered Security Services" },
      { label: "Cooling Design", value: "Fanless, silent operation with high reliability" },
      { label: "Warranty", value: "3 Years Platinum Support 24x7" },
    ],
    cover_image_url: "https://images.unsplash.com/photo-1544197150-199123fc2d9d?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1544197150-199123fc2d9d?auto=format&fit=crop&w=800&q=80",
    ],
    compatible_products: ["Aruba CX 6200F 24G Class 4 PoE 4SFP+ Switch", "Dell PowerEdge R760 Enterprise Server"],
    datasheet_en_url: "https://www.paloaltonetworks.com",
    tor_th_url: "https://www.topprovider.co.th",
    is_active: true,
    is_new: false,
    bullet_specs: ["ML-Powered Zero-Day Defense", "Fanless High-Availability Design"],
  },
  {
    id: 107,
    name: "Cisco Catalyst 9300 48-Port PoE+ Switch",
    sku: "C9300-48P-A",
    slug: "cisco-catalyst-9300-48p",
    category_id: "Network",
    sub_category: "Core & Access Switch",
    brand: "Cisco",
    product_type: "printer",
    short_description: "สวิตช์ระดับ Enterprise 48 พอร์ต Gigabit PoE+ พร้อม Modular Uplink สำหรับโครงข่ายอาคารโรงพยาบาล",
    full_description: "Cisco Catalyst 9300 Series คือแพลตฟอร์มสวิตชิ่งหลักชั้นนำที่ออกแบบมาเพื่อสถาปัตยกรรม Cisco Digital Network Architecture (Cisco DNA) รองรับการจ่ายไฟ PoE+ กำลังสูงถึง 740W สำหรับกล้องวงจรปิด AI, Access Point Wi-Fi 6 และโทรศัพท์ IP Phone พร้อมระบบ Stacking แบนด์วิดท์ 480 Gbps",
    specifications: [
      { label: "Downlink Ports", value: "48x 10/100/1000 Ethernet with Full PoE+ (802.3at)" },
      { label: "PoE Power Budget", value: "740W default (รองรับสูงสุด 1440W เมื่อใส่ Redundant PSU)" },
      { label: "Uplink Module", value: "Modular Uplink รองรับ 4x 1G/10G SFP+ หรือ 2x 25G/40G" },
      { label: "Stacking Bandwidth", value: "480 Gbps StackWise-480 Technology (รองรับซ้อนสวิตช์สูงสุด 8 ตัว)" },
      { label: "Switching Capacity", value: "256 Gbps (Forwarding Rate 190.4 Mpps)" },
      { label: "Operating System", value: "Cisco IOS-XE with Advanced Security & Encrypted Traffic Analytics" },
      { label: "Power Supply", value: "Dual Modular Redundant Power Supplies (1100W AC)" },
      { label: "Warranty", value: "Enhanced Limited Lifetime Warranty (E-LLW)" },
    ],
    cover_image_url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
    ],
    compatible_products: ["Cisco Catalyst 9120AX Series Wi-Fi 6 AP", "Fortinet FortiGate 100F Next-Gen Firewall"],
    datasheet_en_url: "https://www.cisco.com",
    tor_th_url: "https://www.topprovider.co.th",
    is_active: true,
    is_new: true,
    bullet_specs: ["48x Gigabit PoE+ (740W Budget)", "StackWise-480 Technology"],
  },
  {
    id: 108,
    name: "Aruba CX 6200F 24G Class 4 PoE 4SFP+ Switch",
    sku: "JL725A",
    slug: "aruba-cx-6200f-24g",
    category_id: "Network",
    sub_category: "Core & Access Switch",
    brand: "HPE Aruba Networking",
    product_type: "printer",
    short_description: "สวิตช์เลเยอร์ 3 ประสิทธิภาพสูง รองรับอุปกรณ์ IoT ทางการแพทย์และ Access Point ด้วย PoE+ จ่ายไฟเสถียร",
    full_description: "Aruba CX 6200F Series คือตระกูลสวิตช์ Layer 3 Access ยุคใหม่ที่ทำงานบนระบบปฏิบัติการ ArubaOS-CX ออกแบบมาสำหรับงาน Campus และ Healthcare Network พร้อมฟังก์ชันการตรวจสอบอัตโนมัติด้วย Aruba Network Analytics Engine (NAE) และรองรับการจัดการผ่าน Aruba Central Cloud",
    specifications: [
      { label: "Ports", value: "24x 10/100/1000BASE-T Class 4 PoE Ports (370W PoE budget)" },
      { label: "Uplink Interfaces", value: "4x 1/10G SFP+ Dedicated High-Speed Uplinks" },
      { label: "Throughput", value: "95.2 Mpps (Switching Capacity 128 Gbps)" },
      { label: "Stacking", value: "Virtual Switching Framework (VSF) Stacking สูงสุด 8 สวิตช์" },
      { label: "Features", value: "Advanced Layer 3 (OSPF, Static, RIP, Access Control Lists, QoS)" },
      { label: "Management", value: "Aruba Central, Aruba NetEdit, Web GUI, CLI, REST API" },
      { label: "Warranty", value: "Aruba Limited Lifetime Warranty with NBD Replacement" },
    ],
    cover_image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    ],
    compatible_products: ["Aruba AP-535 Wi-Fi 6 Medical Grade Access Point", "Palo Alto PA-440 Next-Generation Firewall"],
    datasheet_en_url: "https://www.arubanetworks.com",
    tor_th_url: "https://www.topprovider.co.th",
    is_active: true,
    is_new: false,
    bullet_specs: ["24-Port Class 4 PoE (370W)", "4x 10G SFP+ High-Speed Uplink"],
  },
  {
    id: 109,
    name: "Aruba AP-535 Wi-Fi 6 Medical Grade Access Point",
    sku: "AP-535-RW",
    slug: "aruba-ap-535-wifi-6",
    category_id: "Network",
    sub_category: "Wireless & Wi-Fi 6",
    brand: "HPE Aruba Networking",
    product_type: "printer",
    short_description: "แอคเซสพอยต์ Wi-Fi 6 ประสิทธิภาพสูงพิเศษ รองรับการโรมมิ่งของรถเข็นพยาบาลและอุปกรณ์การแพทย์ไม่หลุดการเชื่อมต่อ",
    full_description: "Aruba AP-535 ให้ประสิทธิภาพการเชื่อมต่อไร้สายความเร็วสูงระดับ Enterprise และเกรดการแพทย์ ด้วยเทคโนโลยี Wi-Fi 6 (802.11ax) 4x4 MU-MIMO รองรับความเร็วรวมสูงสุด 3.55 Gbps พร้อมระบบ AI ClientMatch ป้องกันสัญญาณสะดุดขณะเข็นอุปกรณ์ตรวจรักษาข้ามแผนก",
    specifications: [
      { label: "Wi-Fi Standard", value: "Wi-Fi 6 (802.11ax), 4x4 MU-MIMO, OFDMA with Target Wake Time" },
      { label: "Max Data Rate", value: "5GHz (2.4 Gbps) + 2.4GHz (1.15 Gbps) Combined Peak Rate 3.55 Gbps" },
      { label: "Ethernet Uplink", value: "2x HPE Smart Rate Multi-Gigabit Ports (100/1000/2500/5000 Base-T)" },
      { label: "IoT Integration", value: "Integrated Bluetooth 5 and Zigbee (802.15.4) for Patient Location & Asset Tracking" },
      { label: "Client Capacity", value: "รองรับผู้ใช้งานสูงสุด 1,024 Associated Client Devices per Radio" },
      { label: "Power Source", value: "PoE (802.3at Class 4 / 802.3bt Class 5) หรือ Direct 12V DC" },
      { label: "Security", value: "WPA3 Enterprise, Enhanced Open (OWE), TPM for secure credential storage" },
      { label: "Warranty", value: "Aruba Limited Lifetime Warranty" },
    ],
    cover_image_url: "https://images.unsplash.com/photo-1544197150-199123fc2d9d?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1544197150-199123fc2d9d?auto=format&fit=crop&w=800&q=80",
    ],
    compatible_products: ["Aruba CX 6200F 24G Class 4 PoE 4SFP+ Switch"],
    datasheet_en_url: "https://www.arubanetworks.com",
    tor_th_url: "https://www.topprovider.co.th",
    is_active: true,
    is_new: true,
    bullet_specs: ["Wi-Fi 6 4x4 MU-MIMO (3.55 Gbps)", "Integrated BLE & IoT Radio"],
  },
  {
    id: 110,
    name: "Cisco Catalyst 9120AX Series Wi-Fi 6 AP",
    sku: "C9120AXI-E",
    slug: "cisco-catalyst-9120ax",
    category_id: "Network",
    sub_category: "Wireless & Wi-Fi 6",
    brand: "Cisco",
    product_type: "printer",
    short_description: "อุปกรณ์กระจายสัญญาณ Wi-Fi 6 ระดับ Mission-Critical สัญญาณนิ่ง ครอบคลุมพื้นที่ความหนาแน่นสูง",
    full_description: "Cisco Catalyst 9120AX มอบประสบการณ์การเชื่อมต่อไร้สายที่ดีเยี่ยมสำหรับอาคารโรงพยาบาลและสถานศึกษา ด้วยเสาอากาศอัจฉริยะ Cisco CleanAir Technology ป้องกันคลื่นรบกวน พร้อมรองรับ Cisco DNA Center เพื่อตรวจสอบคุณภาพสัญญาณแบบ AI Analytics",
    specifications: [
      { label: "Radio Architecture", value: "Dual Radio 4x4:4 MU-MIMO Wi-Fi 6 (802.11ax)" },
      { label: "Uplink Port", value: "1x 100/1000/2500 Multi-Gigabit Ethernet (RJ-45)" },
      { label: "IoT Gateway", value: "Integrated Bluetooth Low Energy (BLE) 5.0" },
      { label: "RF Optimization", value: "Cisco CleanAir Spectrum Intelligence across 2.4GHz & 5GHz" },
      { label: "Deployment Modes", value: "Cisco Catalyst Wireless Controller หรือ Embedded Wireless Controller (EWC)" },
      { label: "Powering", value: "802.3at PoE+ (Class 4)" },
      { label: "Warranty", value: "Cisco Limited Lifetime Hardware Warranty" },
    ],
    cover_image_url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
    ],
    compatible_products: ["Cisco Catalyst 9300 48-Port PoE+ Switch"],
    datasheet_en_url: "https://www.cisco.com",
    tor_th_url: "https://www.topprovider.co.th",
    is_active: true,
    is_new: false,
    bullet_specs: ["Cisco CleanAir Spectrum Intelligence", "2.5G Multigigabit Uplink"],
  },
  {
    id: 111,
    name: "Microsoft Windows Server 2025 Standard / Datacenter",
    sku: "MS-WS2025-STD",
    slug: "microsoft-windows-server-2025",
    category_id: "Network",
    sub_category: "License",
    brand: "Microsoft",
    product_type: "printer",
    short_description: "ระบบปฏิบัติการเซิร์ฟเวอร์มาตรฐานสากล รองรับ Hybrid Cloud, ระบบความปลอดภัยขั้นสูง และ Virtualization",
    full_description: "Windows Server 2025 มอบนวัตกรรมระดับชั้นนำสำหรับศูนย์ข้อมูลโรงพยาบาลและองค์กร พร้อมฟีเจอร์ Hotpatching สำหรับอัปเดตระบบความปลอดภัยโดยไม่ต้องรีสตาร์ตเซิร์ฟเวอร์, ความเร็วไฟล์แชร์ SMB over QUIC และ Active Directory รุ่นปรับปรุงเพื่อเสถียรภาพสูงสุด",
    specifications: [
      { label: "License Model", value: "Core-based licensing (16 Core Base Pack / 2 Core Add-on Packs)" },
      { label: "Virtual Instances", value: "Standard: 2 VMs per license / Datacenter: Unlimited VMs" },
      { label: "Key Features", value: "Hotpatching, Next-Gen Active Directory, SMB over QUIC, Storage Spaces Direct" },
      { label: "Security", value: "Secured-core server, TPM 2.0 support, VBS (Virtualization-based Security)" },
      { label: "Compliance", value: "Authentic Microsoft OEM / Volume Licensing with Certificate of Authenticity (COA)" },
    ],
    cover_image_url: "https://images.unsplash.com/photo-1551808525-51a94da548ce?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1551808525-51a94da548ce?auto=format&fit=crop&w=800&q=80",
    ],
    compatible_products: ["HPE ProLiant DL380 Gen11 Rack Server", "Dell PowerEdge R760 Enterprise Server"],
    datasheet_en_url: "https://www.microsoft.com",
    tor_th_url: "https://www.topprovider.co.th",
    is_active: true,
    is_new: true,
    bullet_specs: ["Hotpatching Zero-Downtime Update", "Secured-Core Server Shield"],
  },
  {
    id: 112,
    name: "VMware vSphere Enterprise Plus License",
    sku: "VMW-VSP-ENT-PLUS",
    slug: "vmware-vsphere-enterprise-plus",
    category_id: "Network",
    sub_category: "License",
    brand: "VMware by Broadcom",
    product_type: "printer",
    short_description: "แพลตฟอร์มจำลองเสมือนระดับ Enterprise สำหรับรวมทรัพยากรเซิร์ฟเวอร์ ให้ระบบทำงานต่อเนื่องแบบ High Availability",
    full_description: "VMware vSphere Enterprise Plus คือมาตรฐานทองคำของระบบ Server Virtualization ในโรงพยาบาล ช่วยให้ระบบฐานข้อมูลคนไข้ ระบบเคลม และระบบห้องยาทำงานได้ต่อเนื่อง 99.999% ด้วยระบบ Failover อัตโนมัติ (vSphere HA) และการย้ายเครื่องเสมือนข้ามเซิร์ฟเวอร์แบบไร้รอยต่อ (vMotion)",
    specifications: [
      { label: "License Type", value: "Per-Core Subscription License (16 Core Minimum per CPU)" },
      { label: "High Availability", value: "vSphere HA, vSphere Fault Tolerance (FT up to 8 vCPUs)" },
      { label: "Resource Management", value: "Distributed Resource Scheduler (DRS), Distributed Power Management (DPM)" },
      { label: "Live Migration", value: "vSphere vMotion, Storage vMotion, Cross-vCenter vMotion" },
      { label: "Network Virtualization", value: "vSphere Distributed Switch (VDS) with Network I/O Control" },
      { label: "Support", value: "Production 24x7 Technical Support and Software Updates" },
    ],
    cover_image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    ],
    compatible_products: ["HPE ProLiant DL380 Gen11 Rack Server", "Dell EMC PowerVault ME5024 SAN Storage"],
    datasheet_en_url: "https://www.vmware.com",
    tor_th_url: "https://www.topprovider.co.th",
    is_active: true,
    is_new: false,
    bullet_specs: ["99.999% HA & Fault Tolerance", "Zero-Downtime Live vMotion"],
  },
  {
    id: 113,
    name: "Automated Client Deployment & OS Imaging Solution",
    sku: "TOP-DEPLOY-CLIENT",
    slug: "automated-client-deployment-solution",
    category_id: "Network",
    sub_category: "Software Install Client",
    brand: "TOP PROVIDER",
    product_type: "printer",
    short_description: "โซลูชันติดตั้งและโคลนระบบปฏิบัติการคอมพิวเตอร์ลูกข่ายอัตโนมัติผ่านเครือข่าย LAN สำหรับโรงพยาบาลและองค์กร",
    full_description: "ระบบบริหารจัดการและติดตั้งระบบปฏิบัติการ Windows/Linux อัตโนมัติผ่านระบบเครือข่าย PXE Boot ช่วยให้ฝ่ายไอทีสามารถเซ็ตอัปเครื่องคอมพิวเตอร์และโน้ตบุ๊กใหม่พร้อมใช้งาน พร้อมโปรแกรมโรงพยาบาลและแอนติไวรัสได้พร้อมกันมากกว่า 100 เครื่องในเวลาไม่เกิน 30 นาที",
    specifications: [
      { label: "Deployment Method", value: "PXE Network Boot, Multicast OS Streaming, USB Standalone Deploy" },
      { label: "Deployment Speed", value: "รองรับการโคลนและติดตั้งสูงสุด 100+ เครื่องพร้อมกัน ผ่าน Gigabit Network" },
      { label: "Driver Management", value: "Automated Hardware Model Detection & Driver Injection" },
      { label: "Post-Install Automation", value: "Auto Domain Join, Hospital Software Installation, Endpoint Security Agent" },
      { label: "Reporting", value: "Centralized Deployment Dashboard with Audit Logs & Inventory Tracking" },
      { label: "Support", value: "บริการติดตั้งระบบต้นแบบ Master Image และอบรมทีมงาน IT โรงพยาบาล" },
    ],
    cover_image_url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
    ],
    compatible_products: ["Microsoft Windows Server 2025 Standard", "Cisco Catalyst 9300 48-Port PoE+ Switch"],
    datasheet_en_url: "https://www.topprovider.co.th",
    tor_th_url: "https://www.topprovider.co.th",
    is_active: true,
    is_new: true,
    bullet_specs: ["PXE Multicast Auto-Deploy (100+ PCs)", "Auto Domain Join & Driver Injection"],
  },
];

interface NetworkSolutionViewProps {
  initialProducts?: ProductItemResponse[];
}

export function NetworkSolutionView({
  initialProducts = [],
}: NetworkSolutionViewProps) {
  const searchParams = useSearchParams();

  // Combine initial products or fallback
  const [allProducts, setAllProducts] = useState<ExtendedProductItem[]>(() => {
    if (initialProducts && initialProducts.length > 0) {
      return initialProducts.map((p) => ({
        ...p,
        is_new: true,
        bullet_specs:
          Array.isArray(p.specifications) && p.specifications.length > 0
            ? p.specifications
                .slice(0, 2)
                .map((s) => s.value || s.label || "")
                .filter(Boolean)
            : [],
      }));
    }
    return DEFAULT_NETWORK_PRODUCTS;
  });

  // Active Category state
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("Server");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [detailProduct, setDetailProduct] = useState<ExtendedProductItem | null>(null);

  // Dynamic Solution Category Tabs from /api/admin/categories
  const [categoryTabs, setCategoryTabs] = useState(SOLUTION_CATEGORY_TABS);

  // Dynamic categories from /api/admin/program-options
  const [serverCategories, setServerCategories] = useState<{ value: string; label: string }[]>(
    SIDEBAR_SERVER_CATEGORIES.map((c) => ({ value: c, label: c }))
  );
  const [networkCategories, setNetworkCategories] = useState<{ value: string; label: string }[]>(
    SIDEBAR_NETWORK_CATEGORIES.map((c) => ({ value: c, label: c }))
  );
  const [licenseCategories, setLicenseCategories] = useState<{ value: string; label: string }[]>(
    SIDEBAR_LICENSE_CATEGORIES.map((c) => ({ value: c, label: c }))
  );

  // Fetch program options for Network categories
  useEffect(() => {
    fetch("/api/admin/program-options")
      .then((res) => res.json())
      .then((json) => {
        if (json && json.success) {
          if (Array.isArray(json.networkCategories) && json.networkCategories.length > 0) {
            const apiCats: { value: string; label: string }[] = json.networkCategories;
            const servers = apiCats.filter(
              (c) =>
                c.value.toLowerCase().includes("server") ||
                c.value.toLowerCase().includes("storage")
            );
            const nets = apiCats.filter(
              (c) =>
                c.value.toLowerCase().includes("firewall") ||
                c.value.toLowerCase().includes("switch") ||
                c.value.toLowerCase().includes("router") ||
                c.value.toLowerCase().includes("wireless") ||
                c.value.toLowerCase().includes("wi-fi")
            );
            const lics = apiCats.filter(
              (c) =>
                c.value.toLowerCase().includes("license") ||
                c.value.toLowerCase().includes("client")
            );

            if (servers.length > 0) setServerCategories(servers);
            if (nets.length > 0) setNetworkCategories(nets);
            if (lics.length > 0) setLicenseCategories(lics);
          }
        }
      })
      .catch((err) => console.log("Program options fetch error:", err));
  }, []);

  // Fetch live products from /api/products
  useEffect(() => {
    if (initialProducts.length === 0) {
      setLoading(true);
    }
    fetch("/api/products?category=Network")
      .then((res) => res.json())
      .then((json) => {
        if (json && json.success && Array.isArray(json.products) && json.products.length > 0) {
          const dbProducts: ExtendedProductItem[] = json.products.map((p: ProductItemResponse) => ({
            ...p,
            is_new: true,
            bullet_specs:
              Array.isArray(p.specifications) && p.specifications.length > 0
                ? p.specifications
                    .slice(0, 2)
                    .map((s: { label?: string; value: string }) => s.value || s.label || "")
                    .filter(Boolean)
                : [],
          }));

          setAllProducts(dbProducts);

          setSelectedSubCategory((prev) => {
            const hasMatch = dbProducts.some((p) => p.sub_category === prev);
            if (!hasMatch) {
              const firstWithCat = dbProducts.find((p) => p.sub_category && p.sub_category.trim());
              return firstWithCat?.sub_category ? firstWithCat.sub_category : prev;
            }
            return prev;
          });
        }
      })
      .catch((err) => console.log("Live network products fetch error:", err))
      .finally(() => {
        setLoading(false);
      });
  }, [initialProducts.length]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json && json.success && Array.isArray(json.categories) && json.categories.length > 0) {
          const dynamicTabs = json.categories
            .filter((c: { is_active?: boolean }) => c.is_active !== false)
            .map((c: { category_id: string; name: string }) => {
              const rawId = (c.category_id || "").toLowerCase();
              let href = "/#case-studies";
              if (rawId === "printing") href = "/solutions/printing";
              else if (rawId === "software") href = "/solutions/software";
              else if (rawId === "network") href = "/solutions/network";

              return {
                id: rawId,
                label: c.name || c.category_id,
                href,
                active: rawId === "network",
              };
            });
          if (dynamicTabs.length > 0) setCategoryTabs(dynamicTabs);
        }
      })
      .catch((err) => console.log("Category tabs API fallback:", err));
  }, []);

  // Sync with URL query parameter (?type=server or ?type=network or ?sub=...)
  useEffect(() => {
    const typeParam = searchParams.get("type")?.toLowerCase();
    const subParam = searchParams.get("sub");

    if (subParam) {
      setSelectedSubCategory(subParam);
    } else if (typeParam === "server") {
      setSelectedSubCategory("Server");
    } else if (typeParam === "storage") {
      setSelectedSubCategory("Storage");
    } else if (typeParam === "firewall") {
      setSelectedSubCategory("Next-Gen Firewall");
    } else if (typeParam === "switch") {
      setSelectedSubCategory("Core & Access Switch");
    } else if (typeParam === "license") {
      setSelectedSubCategory("License");
    }
  }, [searchParams]);

  // Determine current group header
  const isServerSelected = useMemo(() => {
    const target = selectedSubCategory.toLowerCase();
    return serverCategories.some(
      (c) => c.value.toLowerCase() === target || c.label.toLowerCase() === target
    );
  }, [selectedSubCategory, serverCategories]);

  const isNetworkSelected = useMemo(() => {
    const target = selectedSubCategory.toLowerCase();
    return networkCategories.some(
      (c) => c.value.toLowerCase() === target || c.label.toLowerCase() === target
    );
  }, [selectedSubCategory, networkCategories]);

  const currentGroupTitle = isServerSelected
    ? "SERVER & STORAGE"
    : isNetworkSelected
    ? "NETWORK & SECURITY"
    : "LICENSING & DEPLOYMENT";

  // Filtered products list
  const filteredProducts = useMemo(() => {
    let list = allProducts;

    // 1. Filter by Sub-Category
    if (selectedSubCategory && selectedSubCategory !== "all") {
      const targetSub = selectedSubCategory.toLowerCase().trim();
      const matched = list.filter((p) => {
        const sub = (p.sub_category || "").toLowerCase().trim();
        return sub === targetSub || sub.includes(targetSub) || targetSub.includes(sub);
      });
      if (matched.length > 0) {
        list = matched;
      }
    }

    // 2. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.sub_category?.toLowerCase().includes(q) ||
          p.short_description?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allProducts, selectedSubCategory, searchQuery]);

  return (
    <div className="w-full bg-[#F8FAFC] text-slate-900 pb-20 select-none">
      {/* ========================================================================= */}
      {/* 1. TOP SOLUTION CATEGORY TABS (Active: Network Solution)                 */}
      {/* ========================================================================= */}
      <div className="w-full pt-4 pb-2">
        <div className="w-[94%] max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar py-1">
            {categoryTabs.map((tab) => {
              const isActive = tab.active;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  prefetch={true}
                  className={`shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#0062FF] text-white shadow-sm shadow-blue-600/30 font-semibold border border-[#0062FF]"
                      : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs hover:border-blue-200 hover:text-blue-600"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN CATALOG LAYOUT (SIDEBAR + 3-COLUMN PRODUCT GRID)                  */}
      {/* ========================================================================= */}
      <div className="w-[94%] max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6 pt-6 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ===================================================================== */}
          {/* LEFT SIDEBAR: SERVER, NETWORK, AND LICENSE CATEGORIES                 */}
          {/* ===================================================================== */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-6">
            
            {/* GROUP 1: SERVER & STORAGE */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-2">
                <Server className="w-3.5 h-3.5 text-[#0062FF]" />
                <h4 className="text-[11px] font-extrabold text-[#0062FF] uppercase tracking-wider">
                  SERVER & STORAGE
                </h4>
              </div>
              <div className="space-y-1">
                {serverCategories.map((cat) => {
                  const isSelected =
                    selectedSubCategory === cat.value || selectedSubCategory === cat.label;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setSelectedSubCategory(cat.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-[13px] font-medium transition-all cursor-pointer block ${
                        isSelected
                          ? "bg-[#EEF4FF] text-[#0062FF] font-semibold"
                          : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GROUP 2: NETWORK & SECURITY */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 px-2">
                <Shield className="w-3.5 h-3.5 text-[#0062FF]" />
                <h4 className="text-[11px] font-extrabold text-[#0062FF] uppercase tracking-wider">
                  NETWORK & SECURITY
                </h4>
              </div>
              <div className="space-y-1">
                {networkCategories.map((cat) => {
                  const isSelected =
                    selectedSubCategory === cat.value || selectedSubCategory === cat.label;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setSelectedSubCategory(cat.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-[13px] font-medium transition-all cursor-pointer block ${
                        isSelected
                          ? "bg-[#EEF4FF] text-[#0062FF] font-semibold"
                          : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GROUP 3: LICENSING & DEPLOYMENT */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 px-2">
                <Layers className="w-3.5 h-3.5 text-[#0062FF]" />
                <h4 className="text-[11px] font-extrabold text-[#0062FF] uppercase tracking-wider">
                  LICENSING & DEPLOYMENT
                </h4>
              </div>
              <div className="space-y-1">
                {licenseCategories.map((cat) => {
                  const isSelected =
                    selectedSubCategory === cat.value || selectedSubCategory === cat.label;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setSelectedSubCategory(cat.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-[13px] font-medium transition-all cursor-pointer block ${
                        isSelected
                          ? "bg-[#EEF4FF] text-[#0062FF] font-semibold"
                          : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ===================================================================== */}
          {/* RIGHT PRODUCT DISPLAY AREA (3-COLUMN PRODUCT CARDS GRID)              */}
          {/* ===================================================================== */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Header: Title, Product Count, and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/70">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {selectedSubCategory || currentGroupTitle}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Showing {filteredProducts.length} network & server solutions
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหา Server, Switch, Firewall..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Product Cards Grid: 1 แถวแสดง 3 การ์ด */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 space-y-4 animate-pulse shadow-2xs"
                  >
                    <div className="w-full aspect-[4/3] bg-slate-100 rounded-2xl flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="space-y-1.5 pt-2">
                      <div className="h-2.5 bg-slate-100 rounded w-full" />
                      <div className="h-2.5 bg-slate-100 rounded w-4/5" />
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="h-8 w-24 bg-slate-100 rounded-lg" />
                      <div className="h-8 w-16 bg-slate-100 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {filteredProducts.map((prod) => (
                  <NetworkProductCard
                    key={prod.id}
                    product={prod}
                    onViewProduct={(p) => setDetailProduct(p)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <p className="text-slate-500 text-sm">
                  ไม่พบสินค้าในหมวดหมู่นี้ หรือคำค้นหา &ldquo;{searchQuery}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSubCategory("Server");
                  }}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  ล้างตัวกรองและแสดงสินค้าทั้งหมด
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CALL TO ACTION BANNER (Vibrant Blue Enterprise matching mockup)        */}
      {/* ========================================================================= */}
      <div className="w-[94%] max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6 pt-14 sm:pt-16">
        <div className="rounded-[28px] sm:rounded-[34px] bg-[#0062FF] p-8 sm:p-12 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white inline-block">
              ENTERPRISE NETWORK & SERVER SOLUTIONS
            </span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              ต้องการวางระบบโครงสร้างพื้นฐาน Network & Server สำหรับโรงพยาบาลและองค์กร?
            </h3>
            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal">
              ทีมวิศวกรผู้เชี่ยวชาญพร้อมให้คำปรึกษา ออกแบบสถาปัตยกรรมระบบเครือข่ายความปลอดภัยสูง ป้องกัน Ransomware ตามมาตรฐาน PDPA และบริการดูแลบำรุงรักษาแบบ Onsite ทั่วประเทศ
            </p>
            <div className="pt-3 flex flex-wrap items-center gap-3.5">
              <Link
                href="/#contact"
                className="px-6 py-3 rounded-full bg-white text-[#0062FF] font-semibold text-xs sm:text-sm hover:bg-blue-50 transition-all shadow-md flex items-center gap-2 group cursor-pointer"
              >
                <span>ติดต่อขอคำปรึกษาและใบเสนอราคา</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/products"
                className="px-6 py-3 rounded-full bg-blue-700/60 hover:bg-blue-700/80 border border-white/20 text-white font-medium text-xs sm:text-sm transition-all"
              >
                ดูแคตตาล็อกสินค้าทั้งหมด
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. PRODUCT DETAIL MODAL                                                   */}
      {/* ========================================================================= */}
      {detailProduct && (
        <div
          onClick={() => setDetailProduct(null)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-4xl lg:max-w-5xl overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-bold px-3 py-1 rounded-full bg-slate-900 text-white uppercase tracking-wider">
                  {detailProduct.brand || "TOP PROVIDER"}
                </span>
                {detailProduct.sku &&
                  detailProduct.sku.trim() !== "" &&
                  detailProduct.sku.trim() !== "-" && (
                    <span className="text-xs sm:text-sm text-slate-600 font-mono font-medium">
                      SKU: {detailProduct.sku}
                    </span>
                  )}
              </div>
              <button
                type="button"
                onClick={() => setDetailProduct(null)}
                className="w-9 h-9 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content: 2 Columns */}
            <div className="p-6 md:p-8 max-h-[78vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
                
                {/* ฝั่งซ้าย: รูปสินค้าหลัก และเอกสารดาวน์โหลด */}
                <div className="md:col-span-5 space-y-4 md:sticky md:top-0">
                  <div className="w-full aspect-[4/3] rounded-2xl bg-white border border-slate-200/90 flex items-center justify-center p-4 shadow-xs overflow-hidden">
                    <img
                      src={detailProduct.cover_image_url || "/images/logo.png"}
                      alt={detailProduct.name}
                      className="max-h-full max-w-full object-cover rounded-xl"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/images/logo.png";
                      }}
                    />
                  </div>

                  {/* Gallery Thumbnails (ถ้ามี) */}
                  {detailProduct.gallery_images && detailProduct.gallery_images.length > 0 && (
                    <div className="flex gap-2.5 overflow-x-auto pb-1">
                      {detailProduct.gallery_images.map((gImg, gIdx) => (
                        <div
                          key={gIdx}
                          className="w-16 h-16 rounded-xl border border-slate-200 bg-white p-1 shrink-0 overflow-hidden"
                        >
                          <img
                            src={gImg}
                            alt=""
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Download Documents */}
                  {(detailProduct.datasheet_en_url || detailProduct.tor_th_url) && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider">
                        เอกสารดาวน์โหลด (PDF / Datasheet)
                      </h4>
                      <div className="flex flex-col gap-2">
                        {detailProduct.datasheet_en_url ? (
                          <a
                            href={detailProduct.datasheet_en_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 text-xs sm:text-sm font-medium flex items-center justify-center gap-2.5 transition-all"
                          >
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>Datasheet & Specification (EN)</span>
                          </a>
                        ) : null}

                        {detailProduct.tor_th_url ? (
                          <a
                            href={detailProduct.tor_th_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 text-xs sm:text-sm font-medium flex items-center justify-center gap-2.5 transition-all"
                          >
                            <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>คุณสมบัติเฉพาะ TOR (TH)</span>
                          </a>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>

                {/* ฝั่งขวา: รายละเอียด สเปก และสินค้าที่ใช้ร่วมกัน */}
                <div className="md:col-span-7 space-y-6">
                  {/* Title & Description */}
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug tracking-tight">
                      {detailProduct.name}
                    </h2>
                    {detailProduct.sub_category && (
                      <p className="text-sm sm:text-base text-blue-600 font-semibold mt-1.5 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                        <span>หมวดหมู่: {detailProduct.sub_category}</span>
                      </p>
                    )}
                    {detailProduct.short_description && (
                      <p className="text-slate-600 text-sm sm:text-[15px] leading-relaxed mt-3">
                        {detailProduct.short_description}
                      </p>
                    )}
                    {detailProduct.full_description && (
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-2 whitespace-pre-line">
                        {detailProduct.full_description}
                      </p>
                    )}
                  </div>

                  {/* Specifications Table */}
                  {detailProduct.specifications && detailProduct.specifications.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-blue-600" />
                        <span>รายละเอียดสเปกทางเทคนิค (Specifications)</span>
                      </h4>
                      <div className="rounded-2xl border border-slate-200/90 overflow-hidden divide-y divide-slate-100 bg-slate-50/50 p-4">
                        {detailProduct.specifications.map((s, i) => (
                          <div
                            key={i}
                            className="text-xs sm:text-sm flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-6 py-2.5 first:pt-0 last:pb-0"
                          >
                            <span className="text-slate-600 font-medium shrink-0">
                              {s.label}:
                            </span>
                            <span className="text-slate-900 font-semibold sm:text-right">
                              {s.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Compatible Systems */}
                  {detailProduct.compatible_products && detailProduct.compatible_products.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <span>อุปกรณ์และระบบที่ทำงานร่วมกัน (Integration Ready)</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {detailProduct.compatible_products.map((cp, i) => (
                          <span
                            key={i}
                            className="px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70 text-xs font-medium flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>{cp}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDetailProduct(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
              <Link
                href={`/#contact?subject=${encodeURIComponent(detailProduct.name)}`}
                onClick={() => setDetailProduct(null)}
                className="px-5 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0052CC] text-white text-xs font-medium flex items-center gap-2 shadow-sm transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>ขอใบเสนอราคา & สเปกระบบ</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * NetworkProductCard: 3-column card matching Printing & Supply catalog card design
 */
function NetworkProductCard({
  product,
  onViewProduct,
}: {
  product: ExtendedProductItem;
  onViewProduct: (product: ExtendedProductItem) => void;
}) {
  const modelText =
    product.sku && product.sku.trim() !== "" && product.sku.trim() !== "-"
      ? (product.sku.toLowerCase().startsWith("รุ่น") ? product.sku : `รุ่น: ${product.sku}`)
      : (product.short_description || "");

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between relative group">
      
      {/* Top Section: Product Image & Info */}
      <div>
        {/* Product Image */}
        <div className="w-full h-44 sm:h-48 flex items-center justify-center p-3 mb-2 overflow-hidden bg-slate-50/50 rounded-xl">
          <img
            src={product.cover_image_url || "/images/logo.png"}
            alt={product.name}
            className="max-h-full max-w-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/images/logo.png";
            }}
            loading="lazy"
          />
        </div>

        {/* Product Name */}
        <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mt-1">
          {product.name}
        </h3>

        {/* Brand & Sub-Category */}
        <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
          {product.brand ? `${product.brand} • ` : ""}{product.sub_category || "Network Solution"}
        </p>

        {/* Model / Subtitle */}
        {modelText && (
          <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-1 mt-1 font-normal">
            {modelText}
          </p>
        )}

        {/* Key Specification Bullet Points */}
        {product.bullet_specs && product.bullet_specs.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
            {product.bullet_specs.slice(0, 2).map((b, i) => (
              <p
                key={i}
                className="text-[11px] text-slate-600 line-clamp-1 flex items-center gap-1.5"
              >
                <span className="w-1 h-1 rounded-full bg-blue-600 shrink-0" />
                <span>{b}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Section: Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onViewProduct(product)}
          className="flex-1 py-2 sm:py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-[#EEF4FF] text-slate-700 hover:text-[#0062FF] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>ดูรายละเอียด</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <Link
          href={`/#contact?subject=${encodeURIComponent(product.name)}`}
          className="py-2 sm:py-2.5 px-3.5 rounded-xl bg-[#0062FF] hover:bg-[#0052CC] text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-2xs shadow-blue-500/20"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">ขอใบเสนอราคา</span>
        </Link>
      </div>

    </div>
  );
}

