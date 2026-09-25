import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Inpartner AI Business Consultation Assistant | inpartner.id",
  description: "AI-powered conversational assistant for business consultation, service discovery, and lead generation for Inpartner Corporate Website.",
  icons: {
    icon: "/chaboot.svg",
    shortcut: "/chaboot.svg",
    apple: "/chaboot.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <body className={`${plusJakartaSans.className} font-sans antialiased min-h-screen bg-slate-50 text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
