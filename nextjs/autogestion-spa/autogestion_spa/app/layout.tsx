import type { Metadata } from "next";
import localFont from "next/font/local";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const geistSans = localFont({
  src: [
    {
      path: "../fonts/Geist-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Geist-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/Geist-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "../fonts/GeistMono-Regular.woff2",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Portal Municipal | Pérez Zeledón",
  description: "Portal ciudadano de la Municipalidad de Pérez Zeledón",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}