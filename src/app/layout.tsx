import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Document Processor",
  description: "Developer test starter for processing messy logistics documents.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

