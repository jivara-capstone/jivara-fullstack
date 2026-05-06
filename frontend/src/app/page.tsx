import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Jivara",
    "applicationCategory": "HealthApplication",
    "operatingSystem": "Any",
    "description": "Platform kesehatan berbasis AI untuk pengingat obat, deteksi interaksi makanan-obat, dan pemantauan pasien jarak jauh.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "IDR"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
