import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  // `default` — what every child page gets unless it overrides.
  // `template` — internal Storinka pages (/login, /admin/*) can set just
  // their own short title (e.g. "Вхід") and Next appends "| Storinka".
  // Per-subdomain client sites bypass this template via `title.absolute`
  // in their own generateMetadata — their brand stands alone.
  title: {
    default: "Storinka",
    template: "%s | Storinka",
  },
  description: "Платформа для створення сайтів на піддоменах",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
