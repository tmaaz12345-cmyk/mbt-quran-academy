export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maaz Bin Tariq Online Quran Academy",
  description:
    "Learn Noorani Qaida, Tajweed, Nazra, Hifz, Masnoon Duaen, Namaz and the 6 Kalmas with certified online tutors.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Amiri+Quran&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}

