import type { Metadata } from "next";
import { Inter, Noto_Sans_Thai, Geist_Mono } from "next/font/google";
import { LocatorProvider } from "@/components/locator-provider";
import { ConnectionStatusBanner } from "@/components/ui/connection-status-banner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://topprovider.co.th"),
  title: "TOP PROVIDER | Software Engineered for Speed and Scale",
  description: "TOP PROVIDER SYSTEM CO., LTD. - Enterprise Software Engineering, Cloud Platforms, and Modern Digital Systems.",
  keywords: ["Software Engineering", "Next.js", "Web Development", "Cloud Systems", "Top Provider System", "Bangkok Thailand"],
  authors: [{ name: "TOP PROVIDER SYSTEM CO., LTD." }],
  openGraph: {
    title: "TOP PROVIDER | Software Engineered for Speed and Scale",
    description: "Enterprise Software Engineering, High-Performance Cloud Architecture, and Modern Digital Systems.",
    url: "https://topprovider.co.th",
    siteName: "TOP PROVIDER SYSTEM",
    images: [
      {
        url: "/images/office_hq.jpg",
        width: 1200,
        height: 675,
        alt: "TOP PROVIDER Headquarter",
      },
    ],
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TOP PROVIDER | Software Engineered for Speed and Scale",
    description: "Enterprise Software Engineering, Cloud Platforms, and Modern Digital Systems.",
    images: ["/images/office_hq.jpg"],
  },
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      className={`${inter.variable} ${notoSansThai.variable} ${geistMono.variable} scroll-smooth antialiased font-sans`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-slate-50/50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white"
      >
        <LocatorProvider />
        <ConnectionStatusBanner />
        {children}
      </body>
    </html>
  );
}
