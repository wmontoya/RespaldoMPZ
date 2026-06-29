import type React from "react"
import type { Metadata, Viewport } from "next"
import "../styles/globals.css"
import { MainLayout } from "@/components/main-layout"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export const metadata: Metadata = {
  title: "Sistema de Recolección de Basura",
  description: "Aplicación para gestionar rutas de recolección de basura municipal",
  generator: "mpz",
  icons: {
    icon: [
      {
        url: `${basePath}/icon-light-32x32.png`,
        media: "(prefers-color-scheme: light)",
      },
      {
        url: `${basePath}/icon-dark-32x32.png`,
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: `${basePath}/icon.svg`,
        type: "image/svg+xml",
      },
    ],
    apple: `${basePath}/apple-icon.png`,
  },
  manifest: process.env.NEXT_PUBLIC_MANIFEST_PATH,
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2E7D32" },
    { media: "(prefers-color-scheme: dark)", color: "#4CAF50" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <meta charSet='utf-8' />
        <meta name="google" content="notranslate" />
        <link rel='icon' type='image/png' href={process.env.NEXT_PUBLIC_ICON_ESCUDO ?? `${basePath}/images/escudo.png`} />
      </head>
      <body className={`font-sans antialiased`}>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  )
}
