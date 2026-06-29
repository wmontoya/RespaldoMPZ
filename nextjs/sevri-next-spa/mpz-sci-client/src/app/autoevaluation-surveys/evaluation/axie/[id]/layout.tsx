'use client'

import { useEffect, useState } from "react";
import { useSurvey } from "@/hooks/useSurvey";
import { useGlobalState } from "@/store/globalState";
import { FaBuilding } from "react-icons/fa";


export default function RootLayout({ children }: Readonly<{ children: React.ReactNode, params: { id: number } }>) {
  useSurvey()
  const { department_name } = useGlobalState()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main className="bg-gray-50">
      <header className="w-full bg-[#001440] border-b border-blue-900 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-end">
          <div className="flex items-center gap-2 text-white">
            <FaBuilding className="text-blue-400" size={16} />
            <span className="font-medium">Departamento:</span>
            <span className="font-bold">{mounted ? (department_name || "No especificado") : "Cargando..."}</span>
          </div>
        </div>
      </header>
      {children}
    </main>
  );
}
