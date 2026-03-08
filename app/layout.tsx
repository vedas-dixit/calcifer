import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "./lib/settings-store";

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

const BASE_URL = "https://calcifer-nine.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Calcifer — AI GitHub Repo Analyser by Vedas Dixit",
    template: "%s | Calcifer",
  },
  description:
    "Calcifer is an AI-powered GitHub repository analysis tool built by Vedas Dixit, software engineer. Paste any GitHub URL and get instant architecture docs, contribution guides, or security bug reports — powered by Gemini.",
  keywords: [
    "Calcifer",
    "Vedas Dixit",
    "GitHub repo analyser",
    "AI code analysis",
    "GitHub repository documentation",
    "Gemini AI",
    "open source contribution guide",
    "bug finder",
    "software engineer",
    "Next.js AI tool",
    "repo explorer",
    "code intelligence",
  ],
  authors: [{ name: "Vedas Dixit", url: BASE_URL }],
  creator: "Vedas Dixit",
  publisher: "Vedas Dixit",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "Calcifer by Vedas Dixit",
    title: "Calcifer — AI GitHub Repo Analyser by Vedas Dixit",
    description:
      "Feed Calcifer a GitHub URL. Get back architecture docs, contribution guides, or a security scan — all powered by Gemini AI. Built by Vedas Dixit, software engineer.",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Calcifer — AI GitHub Repo Analyser by Vedas Dixit",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calcifer — AI GitHub Repo Analyser by Vedas Dixit",
    description:
      "Paste a GitHub URL. Calcifer lights the way — architecture docs, contribution guides, and bug reports powered by Gemini AI.",
    images: [`${BASE_URL}/og-image.png`],
    creator: "@vedasdixit",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  category: "technology",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": BASE_URL,
      name: "Calcifer",
      url: BASE_URL,
      description:
        "AI-powered GitHub repository analysis tool. Get architecture overviews, contribution guides, and bug reports for any public GitHub repo.",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      author: {
        "@type": "Person",
        name: "Vedas Dixit",
        jobTitle: "Software Engineer",
        url: BASE_URL,
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      keywords:
        "GitHub analysis, AI code review, repository documentation, Gemini AI, open source",
    },
    {
      "@type": "Person",
      "@id": `${BASE_URL}/#vedas-dixit`,
      name: "Vedas Dixit",
      jobTitle: "Software Engineer",
      url: BASE_URL,
      knowsAbout: [
        "Software Engineering",
        "Next.js",
        "TypeScript",
        "AI Applications",
        "GitHub API",
        "Gemini AI",
      ],
      sameAs: [],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={ibmPlexMono.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <SettingsProvider>{children}</SettingsProvider>
      </body>
    </html>
  );
}
