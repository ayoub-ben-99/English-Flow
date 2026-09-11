import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import { SmoothScroll } from "@/components/english/SmoothScroll";
import { ThemeProvider } from "@/components/english/ThemeProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-latin" });
const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://en-flow.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: "English Flow | Learn English Naturally",
  description:
    "English Flow is a self-directed English learning platform for Arabic speakers, built around vocabulary, sentences, listening, practice, and real-world use.",

  icons: {
    icon: "/logo.svg",
  },

  openGraph: {
    title: "English Flow | Learn English Naturally",
    description:
      "Learn English through meaningful exposure, practice, and real-world use with a learning path adapted to your level.",
    type: "website",
    locale: "en_US",
    siteName: "English Flow",
    images: [
      {
        url: `${siteUrl}/og-image1.png`,
        width: 1200,
        height: 630,
        alt: "English Flow - Learn English Naturally",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "English Flow | Learn English Naturally",
    description:
      "Learn English through exposure, understanding, practice, and real-world use.",
    images: [
      {
        url: `${siteUrl}/og-image1.png`,
        width: 1200,
        height: 630,
        alt: "English Flow - Learn English Naturally",
      },
    ],
  },
};

/** Sets the initial theme before paint to avoid a light/dark flash. Defaults to light. */
function themeInitScript() {
  return `(function(){try{var t=localStorage.getItem('roadmap-theme');if(t==='dark'){document.documentElement.setAttribute('data-theme','dark');}else{document.documentElement.setAttribute('data-theme','light');}}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
      </head>
      <body
        className={`${inter.variable} ${arabic.variable} antialiased`}
        style={{
          fontFamily:
            '"Notion Sans", var(--font-latin), var(--font-arabic), system-ui, sans-serif',
        }}
      >
        <ThemeProvider>
          <SmoothScroll />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
