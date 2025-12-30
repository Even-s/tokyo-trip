import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { APP_TITLE } from "@/config/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: APP_TITLE,
  description: "A Swiss Style Itinerary",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} font-sans antialiased bg-white text-black selection:bg-[#FF0000] selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
