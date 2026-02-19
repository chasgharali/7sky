import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const GA_ID = "G-EBM5E63CW7";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://7sky.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default:
      "Shop & Office for Sale in G-14 Markaz Islamabad | 7Sky Commercial Plaza",
    template: "%s | 7Sky",
  },
  description:
    "Premium shops & offices for sale in G-14 Markaz, Islamabad on easy installments. 7Sky commercial plaza by One Capital Builders — book your unit today.",
  keywords: [
    "7Sky",
    "shop for sale in Islamabad",
    "office for sale in Islamabad",
    "shop for sale in G-14",
    "office for sale in G-14",
    "shop for sale in G-14 Markaz Islamabad",
    "office for sale in G-14 Markaz Islamabad",
    "shop for sale in Islamabad on installment",
    "office for sale in Islamabad on installment",
    "shop for sale in G-14 on installment",
    "office for sale in G-14 on installment",
    "commercial plaza Islamabad",
    "commercial plaza G-14 Markaz",
    "commercial property for sale in Islamabad",
    "G-14 Markaz commercial property for sale",
    "buy shop in G-14 Markaz Islamabad",
    "buy office in G-14 Islamabad",
    "shops on installment in Islamabad",
    "office space for sale in Islamabad",
    "payment plan for shops in Islamabad",
    "best commercial investment in Islamabad",
    "G-14 Markaz",
    "Islamabad",
    "One Capital Builders",
    "commercial plaza",
    "retail shops Islamabad",
    "executive offices G-14",
  ],
  openGraph: {
    title:
      "Shop & Office for Sale in G-14 Markaz Islamabad | 7Sky Commercial Plaza",
    description:
      "Premium shops & offices for sale in G-14 Markaz, Islamabad on easy installments. 7Sky by One Capital Builders.",
    url: BASE_URL,
    siteName: "7Sky",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Shop & Office for Sale in G-14 Markaz Islamabad | 7Sky Commercial Plaza",
    description:
      "Premium shops & offices for sale in G-14 Markaz, Islamabad on easy installments. 7Sky by One Capital Builders.",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Place",
    name: "7Sky Commercial Plaza",
    description:
      "Premium shops and offices for sale in G-14 Markaz, Islamabad. 7Sky is a state-of-the-art commercial plaza by One Capital Builders offering retail shops and executive office spaces on easy installments.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "G-14 Markaz",
      addressLocality: "Islamabad",
      addressRegion: "Islamabad Capital Territory",
      postalCode: "44000",
      addressCountry: "PK",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 33.641804,
      longitude: 72.9425409,
    },
    hasMap: "https://www.google.com/maps/place/33%C2%B038'30.5%22N+72%C2%B056'33.2%22E",
    image: `${BASE_URL}/media/logos/7sky-logo.png`,
    url: BASE_URL,
    telephone: "+923347444432",
    owner: {
      "@type": "Organization",
      name: "One Capital Builders",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "One Capital Builders",
    description:
      "One Capital Builders is a premier real estate developer in Islamabad offering commercial shops and offices for sale in G-14 Markaz on easy installment plans.",
    url: BASE_URL,
    telephone: "+923347444432",
    address: {
      "@type": "PostalAddress",
      streetAddress: "G-14 Markaz",
      addressLocality: "Islamabad",
      addressRegion: "Islamabad Capital Territory",
      postalCode: "44000",
      addressCountry: "PK",
    },
    image: `${BASE_URL}/media/logos/one-capital-logo.png`,
    areaServed: {
      "@type": "City",
      name: "Islamabad",
    },
    makesOffer: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: "Commercial Shops for Sale in G-14 Markaz Islamabad",
          description:
            "Premium commercial shops for sale in G-14 Markaz, Islamabad at 7Sky commercial plaza. Available on easy quarterly installments with 25% down payment.",
        },
        priceCurrency: "PKR",
        availability: "https://schema.org/InStock",
        url: `${BASE_URL}/payment-plan`,
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: "Executive Offices for Sale in G-14 Markaz Islamabad",
          description:
            "Purpose-built executive offices for sale in G-14 Markaz, Islamabad at 7Sky commercial plaza. Ideal for IT firms, consultants, and corporate setups.",
        },
        priceCurrency: "PKR",
        availability: "https://schema.org/InStock",
        url: `${BASE_URL}/payment-plan`,
      },
    ],
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
        {jsonLd.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
