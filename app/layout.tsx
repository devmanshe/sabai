import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import "../style.css";
import { AppProvider } from "@/lib/store";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces"
});

export const metadata: Metadata = {
  title: "Sabai Merch",
  description: "Group order hub for Thailand merchandise"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${manrope.variable} ${fraunces.variable}`}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
