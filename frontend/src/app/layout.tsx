import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/utils/styles/globals.css";
import { ThemeProvider } from "@/components/provider/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import PasswordGate from "@/components/page/PasswordGate"

const geistSans = localFont({
  src: "../utils/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../utils/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Meal Tracker",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
        >
          <PasswordGate>
            {children}
            <Toaster />
          </PasswordGate>
        </ThemeProvider>
      </body>
    </html>
  );
}
