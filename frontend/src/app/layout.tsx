import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/provider/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Nikki",
  description: "A website to track your meals by Adam",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>       
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
