'use client'
import { useSevri } from "@/hooks/useSevri";
import { useShared } from "@/hooks/useShared";
import { useGlobalState } from "@/store/globalState";
import { useSevriStore } from "@/store/sevriModel/sevriStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

import { FaBuilding, FaSignOutAlt, FaSpinner } from "react-icons/fa";

export default function RootLayout({ children, params }: Readonly<{ children: React.ReactNode, params: { id: number } }>) {
  useSevri()
  useShared()
  const { actualSevriProcess, getActualSevriProcess } = useSevriStore()
  const [loading, setLoading] = useState(true)
  const { department_name } = useGlobalState()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const fetchActualSevriProcess = async () => {
    await getActualSevriProcess()
    setLoading(false)
  }
  useEffect(() => {
    setMounted(true)
    fetchActualSevriProcess()
  }, [])
  const handleSignOut = () => {
    Cookies.remove("token");
    localStorage.clear()
    sessionStorage.clear()
    window.location.href = "/"; // Fuerza una recarga completa
  };
  if (loading) {
    return (
      <section className="mx-auto p-10 min-h-screen from-dark_primary-500 to-dark_primary-600 bg-gradient-to-b text-white flex justify-center items-center">
        <div className="animate-spinner-ease-spin text-4xl text-white"><FaSpinner /></div>
      </section>
    );
  }
  return (
    <main className="bg-dark_primary-600">
      <header className="w-full bg-[#001440] border-b border-blue-900 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

          <div className="flex items-center gap-2 text-white">
            <FaBuilding className="text-blue-400" size={16} />
            <span className="font-medium">Departamento:</span>
            <span className="font-bold">{mounted ? (department_name || "No especificado") : "Cargando..."}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors"
          >
            <FaSignOutAlt size={16} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </header>
      {children}
    </main>
  );
}
