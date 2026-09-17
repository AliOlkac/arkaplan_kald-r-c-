import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beyaz Arka Plan Kaldırıcı",
  description:
    "Görseldeki beyaz ve beyaza yakın pikselleri tarayıcıda şeffaflaştırır, sonucu gerçek transparan PNG olarak indirir.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
