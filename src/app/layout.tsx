import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "G-Tech ISP OS | Kenyan ISP, WISP & Hotspot Billing SaaS",
  description: "Carrier-grade MikroTik, FreeRADIUS, M-Pesa automated billing and subscriber management platform for Kenyan ISPs and Hotspot operators.",
  keywords: ["ISP Billing Kenya", "MikroTik Hotspot", "PPPoE Billing", "M-Pesa STK Push", "FreeRADIUS SaaS"],
  authors: [{ name: "G-Tech Networks" }],
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0284c7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
