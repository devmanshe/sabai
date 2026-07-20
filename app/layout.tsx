import type { Metadata } from "next";
import "./globals.css";
import "../style.css";
import { AppProvider } from "@/lib/store";
import { cn } from "@/lib/utils";
import QueryProvider from "@/lib/provider";

export const metadata: Metadata = {
  title: "Sabai Merch",
  description: "Group order hub for Thailand merchandise"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("font-sans")}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@100..900&family=Manrope:wght@200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="m-10">
        <AppProvider>
            <QueryProvider>
              {children}
            </QueryProvider>
        </AppProvider>
        
      </body>
    </html>
  );
}
