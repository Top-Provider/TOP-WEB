"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ToastContainer } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  Package,
  Layers,
  FolderTree,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

const navigation = [
  { name: "แดชบอร์ด", href: "/admin", icon: LayoutDashboard },
  { name: "จัดการสินค้า (Master)", href: "/admin/products", icon: Package },
  { name: "จัดการโปรแกรม (Programs)", href: "/admin/programs", icon: Layers },
  { name: "ข้อมูลหลัก (Master Data)", href: "/admin/categories", icon: FolderTree },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [displayUsername, setDisplayUsername] = useState("admin");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {}
  }, []);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("admin_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  React.useEffect(() => {
    // ถ้าอยู่ที่หน้า Login ไม่ต้องตรวจสิทธิ์
    if (pathname === "/admin/login") {
      setCheckingAuth(false);
      return;
    }

    let isMounted = true;

    async function checkUserSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          if (isMounted) {
            setIsAuthenticated(false);
            setCheckingAuth(false);
            router.replace("/admin/login");
          }
          return;
        }

        if (isMounted) {
          setIsAuthenticated(true);
          setCheckingAuth(false);
          if (session.user?.email) {
            const name = session.user.email.split("@")[0];
            setDisplayUsername(name);
          }
        }
      } catch (err) {
        console.error("Auth session check error:", err);
        if (isMounted) {
          setIsAuthenticated(false);
          setCheckingAuth(false);
          router.replace("/admin/login");
        }
      }
    }

    checkUserSession();

    // ฟังสถานะเปลี่ยน session (เช่น Logout หรือ Token หมดอายุ)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
        router.replace("/admin/login");
      } else if (session) {
        setIsAuthenticated(true);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  // ถ้าเป็นหน้า login ให้แสดง children ธรรมดา โดยไม่มี Sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // กำลังตรวจสอบ Auth: แสดง Loading หน้าจอแอดมิน
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="relative w-12 h-12 mb-4 animate-pulse">
          <Image
            src="/images/logo.png"
            alt="Logo"
            fill
            className="object-contain"
          />
        </div>
        <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span>กำลังตรวจสอบสิทธิ์การเข้าใช้งานระบบแอดมิน...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_username");
      }
    } catch (e) {
      console.error(e);
    }
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-slate-100 flex flex-col justify-between transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0 w-64 shadow-2xl"
            : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        <div>
          {/* Logo & Header */}
          <div
            className={`h-16 flex items-center border-b border-slate-800 transition-all duration-300 ${
              isCollapsed ? "px-3 justify-center" : "px-5 justify-between"
            }`}
          >
            <Link
              href="/admin"
              className="flex items-center gap-3 overflow-hidden"
              title="TOP PROVIDER Back-Office"
            >
              <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center p-1 shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              {!isCollapsed && (
                <div className="whitespace-nowrap transition-opacity duration-200">
                  <span className="font-bold text-sm tracking-wide text-white block">
                    TOP PROVIDER
                  </span>
                  <span className="text-[10px] text-blue-400 font-medium block">
                    Back-Office Admin
                  </span>
                </div>
              )}
            </Link>

            {/* Mobile Close Button */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Desktop Collapse Button */}
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleCollapsed}
                className="hidden lg:flex text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer rounded-lg"
                title="หุบเมนู (Collapse menu)"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Desktop Uncollapse Button when collapsed */}
          {isCollapsed && (
            <div className="hidden lg:flex justify-center py-2 border-b border-slate-800/60">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleCollapsed}
                className="text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer rounded-lg"
                title="กางเมนูออก (Expand menu)"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="p-3 space-y-1.5">
            {!isCollapsed ? (
              <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                จัดการระบบ
              </p>
            ) : (
              <div className="h-1" />
            )}
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  title={item.name}
                  className={`flex items-center rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isCollapsed
                      ? "justify-center p-3"
                      : "gap-3 px-3 py-2.5"
                  } ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            title="ดูหน้าบ้าน (Storefront)"
            className={`flex items-center rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all ${
              isCollapsed
                ? "justify-center p-3"
                : "justify-between px-3 py-2"
            }`}
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              {!isCollapsed && <span>ดูหน้าบ้าน (Storefront)</span>}
            </span>
          </Link>
          <Button
            variant="ghost"
            onClick={handleLogout}
            title="ออกจากระบบ"
            className={`w-full text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 h-9 cursor-pointer ${
              isCollapsed ? "justify-center p-0" : "justify-start gap-2"
            }`}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span>ออกจากระบบ</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth < 1024) {
                  setSidebarOpen(!sidebarOpen);
                } else {
                  toggleCollapsed();
                }
              }}
              className="text-slate-600 hover:bg-slate-100 cursor-pointer rounded-lg"
              title={isCollapsed ? "กางเมนูออก" : "หุบเมนูเข้า"}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-base sm:text-lg font-bold text-slate-800">
              ระบบจัดการหลังบ้าน (Back-Office)
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center uppercase">
                {displayUsername.charAt(0) || "A"}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-semibold text-slate-800 block">
                  {displayUsername}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {displayUsername.includes("@") ? displayUsername : `${displayUsername}@topprovider.co.th`}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full transition-all duration-300">
          <React.Suspense
            fallback={
              <div className="flex h-64 w-full items-center justify-center">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>กำลังโหลดข้อมูล...</span>
                </div>
              </div>
            }
          >
            {children}
          </React.Suspense>
        </main>
      </div>

      {/* Global Toast Notification System */}
      <ToastContainer />
    </div>
  );
}
