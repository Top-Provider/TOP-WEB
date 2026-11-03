import type { Metadata } from "next";
import { Prompt, Geist_Mono } from "next/font/google";
import { LocatorProvider } from "@/components/locator-provider";
import "./globals.css";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["latin", "thai"],
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
      className={`${prompt.variable} ${geistMono.variable} scroll-smooth antialiased font-sans`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-slate-50/50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white"
      >
        <LocatorProvider />
        {children}
      </body>
    </html>
  );
}
