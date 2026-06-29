"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Map, List, Search, MessageSquare, Moon, Sun } from "lucide-react"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Mapa", icon: Map },
  { href: "/rutas", label: "Rutas", icon: List },
  // { href: "/consulta", label: "Consulta", icon: Search },
  // { href: "/quejas", label: "Quejas", icon: MessageSquare },
]

export function Navbar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useStore()

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 h-20 bg-card/80 backdrop-blur-lg border-b border-border z-50">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/logo-municipalidad.jpg`} 
              alt="Municipalidad de Pérez Zeledón"
              width={60}
              height={60}
              className="rounded-lg"
              priority
            />
            <div className="flex flex-col">
              <span className="font-bold text-lg text-primary">Pérez Zeledón</span>
              <span className="text-xs text-muted-foreground">Recolección de Residuos</span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2 rounded-lg transition-colors flex items-center gap-2",
                    isActive
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Cambiar tema"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Sun className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-lg border-t border-border z-50 safe-area-pb">
        <div className="grid grid-cols-2 h-full">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 transition-colors relative",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="mobile-navbar-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Mobile Logo Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-lg border-b border-border z-40 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={`${process.env.NEXT_PUBLIC_BASE_PATH}/logo-municipalidad.jpg`} 
            alt="Municipalidad"
            width={40}
            height={40}
            className="rounded-lg"
            priority
          />
          <div className="flex flex-col">
            <span className="font-bold text-sm text-primary">Pérez Zeledón</span>
            <span className="text-[10px] text-muted-foreground">Recolección</span>
          </div>
        </Link>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Cambiar tema"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 text-muted-foreground" />
          ) : (
            <Sun className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>
    </>
  )
}
