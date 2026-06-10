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

// ✅ YE SABSE ZAROORI HAI - YE PHONE KE HALF PAGE ISSUE KO FIX KAREGA
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "TradeNova - AI Crypto Exchange",
  description: "Institutional-grade crypto trading with AI analytics and bank-grade security.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      {/* Body mein max-w aur overflow-x-hidden direct lagaya hai taaki pakka fix ho */}
      <body className="min-h-screen flex flex-col max-w-[100vw] overflow-x-hidden bg-[#0B0F19] text-white">
        {children}
      </body>
    </html>
  );
}