"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Calendar } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const lastScrollY = useRef(0);
  const upScrollCount = useRef(0);
  const lastUpEventTime = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollY.current;

      // Always show when near the very top of the page
      if (currentScrollY <= 20) {
        setIsVisible(true);
        upScrollCount.current = 0;
        lastScrollY.current = currentScrollY;
        return;
      }

      // Scrolling down -> collapse/hide navbar and reset upward gesture count
      if (diff > 4) {
        setIsVisible(false);
        upScrollCount.current = 0;
      } else if (diff < -4) {
        // Scrolling up -> count distinct upward scroll gestures (separated by >120ms pause)
        const now = Date.now();
        if (now - lastUpEventTime.current > 120) {
          upScrollCount.current += 1;
        }
        lastUpEventTime.current = now;

        if (upScrollCount.current >= 2) {
          setIsVisible(true);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle hash scrolling on page load / route change
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash && pathname === "/") {
      const targetId = window.location.hash.replace("#", "");
      const timer = setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          const navOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - navOffset;
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: "smooth",
          });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "IT Solution & Product", href: "/solutions/software" },
    { label: "Service Solution", href: "/#capabilities" },
    { label: "News & Activities", href: "/#activities" },
    { label: "About Us", href: "/#team" },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/solutions")) return pathname.startsWith("/solutions") || pathname.startsWith("/products");
    return false;
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    onComplete?: () => void
  ) => {
    if (pathname === "/") {
      if (href === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.pushState(null, "", "/");
        if (onComplete) onComplete();
        return;
      }

      if (href.startsWith("/#") || href.startsWith("#")) {
        const targetId = href.replace(/^\/?#/, "");
        const element = document.getElementById(targetId);
        if (element) {
          e.preventDefault();
          const navOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - navOffset;
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: "smooth",
          });
          window.history.pushState(null, "", href.startsWith("/") ? href : `/${href}`);
          if (onComplete) onComplete();
          return;
        }
      }
    }
    if (onComplete) onComplete();
  };

  return (
    <div
      className={`sticky top-0 z-50 w-full px-4 sm:px-6 pt-3 sm:pt-4 pb-2 transition-all duration-300 ease-in-out ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="w-[94%] max-w-[1680px] mx-auto bg-white/95 backdrop-blur-md rounded-full shadow-lg shadow-slate-200/50 border border-slate-100/90 px-4 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between transition-all">
        {/* Brand Logo matching the user's uploaded image */}
        <Link
          href="/"
          onClick={(e) => handleNavClick(e, "/")}
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <div className="relative h-8 sm:h-9 w-20 sm:w-24">
            <Image
              src="/images/logo.png"
              alt="TOP PROVIDER SYSTEM GROUP CO., LTD."
              fill
              sizes="(max-width: 640px) 80px, 96px"
              className="object-contain object-left group-hover:scale-105 transition-transform"
              priority
            />
          </div>
        </Link>

        {/* Center Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`text-[13px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? "text-[#0062FF] font-bold"
                    : "text-slate-600 hover:text-blue-600"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Action Button & Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Button
            asChild
            className="hidden sm:inline-flex rounded-full bg-[#0062FF] hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2 shadow-sm hover:shadow-md hover:shadow-blue-500/25 transition-all h-9"
          >
            <Link
              href="/#contact"
              onClick={(e) => handleNavClick(e, "/#contact")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>contact</span>
            </Link>
          </Button>

          {/* Mobile Navigation Trigger */}
          <div className="lg:hidden flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-full cursor-pointer">
                  <Menu className="w-5 h-5" />
                  <span className="sr-only">Open Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[360px] p-6 bg-white">
                <div className="flex flex-col h-full justify-between pt-6">
                  <div className="space-y-6">
                    <div className="pb-4 border-b border-slate-100 flex items-center">
                      <div className="relative h-9 w-24">
                        <Image
                          src="/images/logo.png"
                          alt="TOP PROVIDER SYSTEM GROUP CO., LTD."
                          fill
                          sizes="96px"
                          className="object-contain object-left"
                        />
                      </div>
                    </div>
                    <nav className="flex flex-col gap-3.5">
                      {navLinks.map((link) => {
                        const active = isLinkActive(link.href);
                        return (
                          <Link
                            key={link.label}
                            href={link.href}
                            onClick={(e) => handleNavClick(e, link.href, () => setIsOpen(false))}
                            className={`text-sm py-1 transition-colors cursor-pointer ${
                              active
                                ? "text-[#0062FF] font-bold"
                                : "text-slate-700 font-medium hover:text-blue-600"
                            }`}
                          >
                            {link.label}
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                  <div className="pt-6 border-t border-slate-100">
                    <Button
                      asChild
                      className="w-full rounded-full bg-[#0062FF] hover:bg-blue-700 text-white py-2.5 font-semibold text-xs"
                    >
                      <Link
                        href="/#contact"
                        onClick={(e) => handleNavClick(e, "/#contact", () => setIsOpen(false))}
                        className="flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>contact</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}
