import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Jivara",
      "applicationCategory": "HealthApplication",
      "operatingSystem": "Web, Android, iOS",
      "description": "Platform kesehatan berbasis AI untuk pengingat obat, deteksi interaksi makanan-obat, dan pemantauan pasien jarak jauh.",
      "url": "https://www.jivara.web.id",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "IDR"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Jivara Health"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Jivara",
      "url": "https://www.jivara.web.id/",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.jivara.web.id/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Jivara Health",
      "url": "https://www.jivara.web.id",
      "logo": "https://www.jivara.web.id/images/logo/splash.png",
      "sameAs": [
        "https://twitter.com/JivaraHealth",
        "https://www.instagram.com/jivarahealth"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": "Indonesian",
        "email": "contact@jivara.web.id"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Jivara | Platform Kesehatan AI & Pengingat Obat",
      "description": "Jivara adalah platform kesehatan cerdas berbasis AI untuk pengingat minum obat yang tepat dan deteksi interaksi obat-makanan.",
      "url": "https://www.jivara.web.id"
    }
  ];

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
