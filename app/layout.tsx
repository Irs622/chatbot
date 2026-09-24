import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="id">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
