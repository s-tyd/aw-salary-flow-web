import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DateProvider } from "@/contexts/DateContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agileware給与計算",
  description: "Employee salary and work data management system",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <DateProvider>
            <AuthProvider>{children}</AuthProvider>
          </DateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
