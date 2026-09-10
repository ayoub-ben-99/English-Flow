import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import { SmoothScroll } from "@/components/english/SmoothScroll";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-latin" });
const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
});

export const metadata: Metadata = {
  title: "تعلم الإنجليزية",
  description:
    "مسار شخصي لتعلم الإنجليزية: مفردات وقواعد وجمل، بالتعرّض المفهوم والاستخدام الفعلي.",
  icons: { icon: "/logo.svg" },
};

/** Sets the initial theme before paint to avoid a light/dark flash. */
function themeInitScript() {
  return `(function(){try{var t=localStorage.getItem('roadmap-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="dark" lang="ar" dir="rtl" data-scroll-behavior="smooth" suppressHydrationWarning>
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
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
