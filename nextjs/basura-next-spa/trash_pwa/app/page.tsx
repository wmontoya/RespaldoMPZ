"use client"

import { useEffect } from "react"
import { useStore } from "@/lib/store"

export default function HomePage() {
  const setCurrentPage = useStore((state) => state.setCurrentPage)

  useEffect(() => {
    setCurrentPage("/")
  }, [setCurrentPage])

  // Map is rendered in MainLayout, so this page is empty
  return null
}
