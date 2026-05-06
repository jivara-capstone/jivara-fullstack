import "@/styles/globals.css";
import AppSplashScreen from "@/components/ui/AppSplashScreen";
import BackToTopButton from "@/components/ui/BackToTopButton";
import PwaPullToRefresh from "@/components/ui/PwaPullToRefresh";
import PwaInstallPromptProvider from "@/providers/PwaInstallPromptProvider";
import ScrollProvider from "@/providers/ScrollProvider";
import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import WebVitals from "@/components/WebVitals";
export const dynamic = "force-dynamic";

const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-archivo",
  weight: ["300", "400", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});
 
export const viewport: Viewport = {
  themeColor: "#147245",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.jivara.web.id"),
  title: {
    default: "Jivara | Platform Kesehatan AI & Pengingat Obat",
    template: "%s | Jivara"
  },
  description:
    "Jivara adalah platform kesehatan cerdas berbasis AI untuk pengingat minum obat yang tepat, deteksi interaksi obat-makanan, dan pemantauan pasien jarak jauh oleh tenaga medis.",
  keywords: [
    "jivara", 
    "pengingat obat", 
    "aplikasi pengingat minum obat", 
    "keamanan makanan", 
    "interaksi obat makanan", 
    "kesehatan AI", 
    "kecerdasan buatan medis", 
    "monitoring pasien", 
    "telemedicine", 
    "asisten kesehatan digital",
    "scan makanan AI",
    "aplikasi kesehatan",
    "kesehatan digital",
    "cegah interaksi obat",
    "pemantauan pasien",
    "teknologi kesehatan"
  ],
  category: "Health & Medical",
  authors: [{ name: "Tim Jivara", url: "https://www.jivara.web.id/team" }],
  creator: "Jivara",
  publisher: "Jivara Health",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
    languages: {
      'id-ID': '/',
    },
  },
  openGraph: {
    title: "Jivara | Platform Kesehatan AI & Pengingat Obat",
    description: "Pengingat minum obat otomatis, scan interaksi makanan-obat menggunakan AI, dan monitoring perawat dalam satu aplikasi.",
    url: "https://www.jivara.web.id",
    siteName: "Jivara Health",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/images/logo/splash.png",
        width: 1080,
        height: 1080,
        alt: "Logo Jivara - Platform Kesehatan AI",
        type: "image/png"
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jivara | Platform Kesehatan AI & Pengingat Obat",
    description: "Pengingat minum obat, deteksi interaksi makanan-obat dengan AI, dan pemantauan kesehatan digital.",
    images: ["/images/logo/splash.png"],
    creator: "@JivaraHealth",
    site: "@JivaraHealth"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/images/logo/splash.png", sizes: "1080x1080", type: "image/png" },
    ],
    apple: [
      { url: "/images/logo/splash.png", sizes: "1080x1080", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "Jivara",
    statusBarStyle: "default",
    startupImage: "/images/logo/splash.png",
  },
  manifest: "/manifest.json",
};

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  await headers();

  return (
    <html lang="id" className={`${archivo.variable} ${inter.variable} relative`} suppressHydrationWarning>
      <body className="font-body relative overflow-x-hidden">
        <WebVitals />
        <ScrollProvider>
          <PwaInstallPromptProvider>
            {children}
            <AppSplashScreen />
            <PwaPullToRefresh />
            <BackToTopButton />
          </PwaInstallPromptProvider>
        </ScrollProvider>
      </body>
    </html>
  );
}
