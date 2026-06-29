"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSevriStore } from "@/store/sevriModel/sevriStore";
import {
  FaArrowLeft,
  FaPlus,
  FaSearch,
  FaClipboardList,
  FaChevronRight,
} from "react-icons/fa";
import { motion } from "framer-motion";

const SevriPage = () => {
  const { actualSevriProcess } = useSevriStore();
  const [searchTerm, setSearchTerm] = useState("");

  if (!actualSevriProcess.id) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#001440] to-[#00102E] flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-white/20">
          <div className="bg-red-500/10 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <FaClipboardList className="text-red-400 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            No hay procesos pendientes
          </h2>
          <p className="text-blue-100/80 mb-8">
            Por ahora la empresa no está en proceso de evaluación, gracias por
            todo.
          </p>
          <Link
            href="/menu-Evaluations"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all duration-300 shadow-lg"
          >
            <FaArrowLeft className="text-sm" /> Volver al menú
          </Link>
        </div>
      </div>
    );
  }

  const filteredActivities = actualSevriProcess.activities.filter((activity) =>
    activity.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001440] to-[#00102E] pb-12">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link
          href="/menu-Evaluations"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all duration-300 shadow-lg"
        >
          <FaArrowLeft size={16} /> Volver
        </Link>
        {filteredActivities.length > 0 && (
          <Link
            href="/sevri-survey/newActivity"
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-all duration-300 shadow-lg"
          >
            <FaPlus size={16} /> Nueva Actividad
          </Link>
        )}
      </header>

      <main className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="bg-amber-500/20 p-2 rounded-lg">
              <FaClipboardList className="text-amber-400 text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-white">Actividades</h1>
          </div>
          <p className="text-blue-200/70">
            Gestione las actividades del proceso SEVRI actual
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar actividad..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <Link
                  href={`/sevri-survey/${activity.id}`}
                  key={activity.id}
                  className="flex items-center gap-4 p-4 hover:bg-blue-50 transition-colors group"
                >
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FaClipboardList size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {activity.title}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {activity.subtitle}
                    </p>
                  </div>
                  <FaChevronRight className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                </Link>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="py-12 px-4 text-center"
              >
                <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <FaSearch className="text-gray-400 text-xl" />
                </div>
                <h2 className="text-xl font-medium text-gray-500">
                  No se encontraron actividades
                </h2>
                <p className="text-gray-400 mt-2">
                  Intente con otra búsqueda o cree una nueva actividad
                </p>
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Link
                    href="/sevri-survey/newActivity"
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-all duration-300 shadow-lg"
                  >
                    <FaPlus size={16} /> Nueva Actividad
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SevriPage;
