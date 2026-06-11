import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ FIX 1: Mobile Half-Page Issue - Bina iske phone page ko zoom out kar deta hai
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// ✅ FIX 2: Professional Metadata
export const metadata: Metadata = {
  title: "TradeNova - AI Crypto Exchange",
  description: "Institutional-grade crypto trading with live AI analytics and bank-grade security.",
  icons: { icon: "/favicon.ico" }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // ✅ dark class add ki hai taaki theme stable rahe
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      {/* ✅ FIX 3: Body mein direct dark bg aur overflow-x-hidden lagaya hai pakka fix ke liye */}
      <body className="min-h-screen flex flex-col bg-[#0B0E11] text-white max-w-[100vw] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}