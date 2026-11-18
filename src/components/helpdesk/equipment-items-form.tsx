"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GalleryUpload } from "@/components/ui/gallery-upload";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EQUIPMENT_LABELS, type EquipmentType } from "@/lib/helpdesk-constants";

export interface EquipmentFormItem {
  key: number;
  equipmentType: EquipmentType;
  productId: number | null;
  customEquipment: boolean;
  selectedBrand: string;
  brand: string;
  model: string;
  serialNumber: string;
  isPatientCritical: boolean;
  title: string;
  description: string;
  images: string[];
}

interface ProductOption {
  productId: number;
  productName: string;
  sku: string;
  subCategory: string;
  brand: string;
  productType: string;
}

const TYPE_MAP: Partial<Record<EquipmentType, string>> = {
  PRINTER: "printer",
  COMPUTER: "hardware",
  NETWORK: "network",
  SOFTWARE: "software",
};
const OTHER = "__other__";
let nextKey = 1;

export function createEquipmentItem(): EquipmentFormItem {
  return {
    key: nextKey++, equipmentType: "PRINTER", productId: null, customEquipment: false,
    selectedBrand: "", brand: "", model: "", serialNumber: "",
    isPatientCritical: false, title: "", description: "", images: [],
  };
}

export function EquipmentItemsForm({
  items,
  onChange,
}: {
  items: EquipmentFormItem[];
  onChange: (items: EquipmentFormItem[]) => void;
}) {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [brands, setBrands] = useState<Array<{ value: string; label: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState<number>(() => items[0]?.key ?? 1);
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/products?type=all", { cache: "no-store" }),
      fetch("/api/admin/brands", { cache: "no-store" }),
    ]).then(async ([productResponse, brandResponse]) => {
      const [productResult, brandResult] = await Promise.all([productResponse.json(), brandResponse.json()]);
      if (!active) return;
      if (productResponse.ok && productResult.success) {
        setProducts((productResult.products || []).map((product: Record<string, unknown>) => ({
          productId: Number(product.id), productName: String(product.name || ""),
          sku: String(product.sku || ""), subCategory: String(product.sub_category || ""),
          brand: String(product.brand || "").trim(), productType: String(product.product_type || "").toLowerCase(),
        })));
      }
      if (brandResponse.ok && brandResult.success) {
        setBrands((brandResult.brands || []).map((brand: { value: string; label: string }) => ({
          value: brand.value === "Other" ? OTHER : brand.value,
          label: brand.label || brand.value,
        })));
      }
    }).catch(() => {}).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const availableTypes = useMemo(() => new Set(products.map((product) => product.productType)), [products]);
  const typeOptions = (Object.keys(EQUIPMENT_LABELS) as EquipmentType[])
    .filter((type) => type === "OTHER" || type === "SOFTWARE" || !products.length || availableTypes.has(TYPE_MAP[type] || ""))
    .map((value) => ({ value, label: EQUIPMENT_LABELS[value] }));
  const brandOptions = [...brands.filter((brand) => brand.value !== OTHER), { value: OTHER, label: "อื่น ๆ" }];

  const update = (key: number, changes: Partial<EquipmentFormItem>) =>
    onChange(items.map((item) => item.key === key ? { ...item, ...changes } : item));

  const activeIndex = Math.max(0, items.findIndex((entry) => entry.key === activeKey));
  const item = items[activeIndex] ?? items[0];
  if (!item) return null;

  const typeProducts = products.filter((product) => product.productType === TYPE_MAP[item.equipmentType]);
  const productOptions = [
    ...typeProducts.map((product) => ({
      value: String(product.productId),
      label: product.sku && !product.productName.toLowerCase().includes(product.sku.toLowerCase())
        ? `${product.sku} — ${product.productName}` : product.productName,
    })),
    { value: OTHER, label: "อุปกรณ์อื่น ๆ" },
  ];

  const handleAddItem = () => {
    const created = createEquipmentItem();
    onChange([...items, created]);
    setActiveKey(created.key);
    requestAnimationFrame(() => {
      if (tabsScrollRef.current) {
        tabsScrollRef.current.scrollTo({
          left: tabsScrollRef.current.scrollWidth,
          behavior: "smooth",
        });
      }
    });
  };

  const handleRemoveItem = (keyToRemove: number) => {
    const remaining = items.filter((entry) => entry.key !== keyToRemove);
    onChange(remaining);
    if (keyToRemove === item.key && remaining.length > 0) {
      setActiveKey(remaining[Math.max(0, activeIndex - 1)].key);
    }
  };

  return <div className="space-y-4">
    {/* Machine Selector Tabs (Horizontal Scroll + Pinned Add Button on Right) */}
    <div className="flex items-center gap-2">
      <div
        ref={tabsScrollRef}
        className="flex-1 min-w-0 overflow-x-auto pb-1"
      >
        <div className="flex items-center gap-2 w-max">
          {items.map((entry, idx) => {
            const isSelected = entry.key === item.key;
            const isReady = Boolean(entry.title.trim());
            return (
              <button
                key={entry.key}
                type="button"
                onClick={() => setActiveKey(entry.key)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40"
                }`}
              >
                <span>เครื่องที่ {idx + 1}</span>
                {entry.model && (
                  <span className={`max-w-[110px] truncate font-normal ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                    ({entry.model})
                  </span>
                )}
                {isReady && (
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-white" : "text-emerald-600"}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        onClick={handleAddItem}
        className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-dashed border-blue-300 text-blue-700 bg-blue-50/50 hover:bg-blue-100/70 transition cursor-pointer whitespace-nowrap"
      >
        <Plus className="h-3.5 w-3.5" /> เพิ่มอุปกรณ์อีกเครื่อง
      </button>
    </div>

    <section key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold text-slate-900">เครื่องที่ {activeIndex + 1} จาก {items.length}</h3>
        {items.length > 1 && <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveItem(item.key)}>
          <Trash2 className="h-4 w-4" /> ลบเครื่องนี้
        </Button>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Field label="ประเภทอุปกรณ์"><Select value={item.equipmentType} options={typeOptions} onChange={(value) => update(item.key, { equipmentType: value as EquipmentType, productId: null, customEquipment: false, selectedBrand: "", brand: "", model: "" })} /></Field>
        <Field label="อุปกรณ์"><Select value={item.customEquipment ? OTHER : item.productId ? String(item.productId) : ""} options={productOptions} disabled={loading} placeholder={loading ? "กำลังโหลด..." : "เลือกอุปกรณ์..."} onChange={(value) => {
          if (value === OTHER) return update(item.key, { productId: null, customEquipment: true, selectedBrand: "", brand: "", model: "" });
          const product = products.find((entry) => entry.productId === Number(value));
          const masterBrand = brands.find((brand) => brand.value !== OTHER && brand.value.toLowerCase() === product?.brand.toLowerCase());
          update(item.key, { productId: product?.productId || null, customEquipment: false, selectedBrand: product?.brand ? masterBrand?.value || OTHER : "", brand: product?.brand || "", model: product?.sku || product?.subCategory || product?.productName || "" });
        }} /></Field>
        <Field label="ยี่ห้อ"><Select value={item.selectedBrand} options={brandOptions} placeholder="เลือกยี่ห้อ..." onChange={(value) => update(item.key, { selectedBrand: value, brand: value === OTHER ? "" : value })} />
          {item.selectedBrand === OTHER && <TextInput value={item.brand} onChange={(value) => update(item.key, { brand: value })} placeholder="ระบุยี่ห้อ" extraClass="mt-2" />}
        </Field>
        <Field label="รุ่น"><TextInput value={item.model} onChange={(value) => update(item.key, { model: value })} placeholder="ระบุรุ่น" readOnly={Boolean(item.productId)} /></Field>
        <Field label="Serial Number (S/N)"><TextInput value={item.serialNumber} onChange={(value) => update(item.key, { serialNumber: value })} placeholder="ดูจากสติกเกอร์บนตัวเครื่อง" /></Field>
        <Field label={<>อาการเสียโดยย่อ <span className="text-rose-500">*</span></>}><TextInput value={item.title} onChange={(value) => update(item.key, { title: value })} placeholder="เช่น พิมพ์ไม่ออก, กระดาษติด" /></Field>
      </div>
      <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3 cursor-pointer">
        <input type="checkbox" checked={item.isPatientCritical} onChange={(event) => update(item.key, { isPatientCritical: event.target.checked })} className="mt-1 h-4 w-4" />
        <span className="text-sm"><strong className="block">กระทบจุดบริการผู้ป่วยสำคัญ</strong><span className="text-xs text-slate-600">ระบบจะปรับเป็นงานเร่งด่วนอัตโนมัติ</span></span>
      </label>
      <Field label="รายละเอียดเพิ่มเติม"><Textarea rows={2} value={item.description} onChange={(event) => update(item.key, { description: event.target.value })} className="p-3 bg-white" placeholder="ระบุ Error หรือสิ่งที่ลองแก้ไขแล้ว" /></Field>
      <GalleryUpload images={item.images} onChange={(images) => update(item.key, { images })} maxFiles={5} label={`รูปภาพเครื่องที่ ${activeIndex + 1} (สูงสุด 5 รูป)`} description="ถ่ายรูปตัวเครื่อง สติกเกอร์ S/N หรือข้อความ Error" />
    </section>
  </div>;
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return <div><label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>{children}</div>;
}
function TextInput({ value, onChange, placeholder, readOnly = false, extraClass = "" }: { value: string; onChange: (value: string) => void; placeholder: string; readOnly?: boolean; extraClass?: string }) {
  return <Input type="text" value={value} onChange={(event) => onChange(event.target.value)} readOnly={readOnly} placeholder={placeholder} className={`h-11 px-3.5 ${readOnly ? "bg-slate-100 text-slate-600" : "bg-white"} ${extraClass}`} />;
}
