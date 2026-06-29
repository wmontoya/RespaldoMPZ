"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

import { Navbar } from "./navbar"
import { ThemeProvider } from "@/lib/theme-provider"
import { MapRoutes } from "./mapa-rutas"
import { useStore } from "@/lib/store"
import { Toaster } from "@/components/ui/toaster"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const setCurrentPage = useStore((state) => state.setCurrentPage)

  useEffect(() => {
    setCurrentPage(pathname)
  }, [pathname, setCurrentPage])

  useEffect(() => {
    if (typeof window === "undefined") return
    const allowDevSw = process.env.NEXT_PUBLIC_SW_DEV === "true"
    if (process.env.NODE_ENV === "development" && !allowDevSw) return
    if (!("serviceWorker" in navigator)) return

    // With `basePath`, public assets (including `public/sw.js`) are served under `${basePath}/...`.
    const swPath = `${basePath}/sw.js`

    navigator.serviceWorker
      .register(swPath)
      .catch((err) => console.error("SW register failed:", err))
  }, [])

  const isHomePage = pathname === "/"

  return (
    <ThemeProvider>
      <div className="fixed inset-0 flex flex-col">
        <Navbar />
        <main className="flex-1 mt-16 md:mt-20 mb-16 md:mb-0 overflow-hidden">
          {isHomePage ? (
            <div className="w-full h-full">
              <MapRoutes />
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-4">{children}</div>
          )}
        </main>
      </div>
      <Toaster />
    </ThemeProvider>
  )
}
