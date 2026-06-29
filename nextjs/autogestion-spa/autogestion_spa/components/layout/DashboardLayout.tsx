"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { Menu } from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#f3f5f7]">
      <div className="flex min-h-screen">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {open && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div className="w-72">
  <Sidebar onClose={() => setOpen(false)} />
</div>

            <button
              className="flex-1 bg-black/30"
              aria-label="Cerrar menú"
              onClick={() => setOpen(false)}
            />
          </div>
        )}

        <section className="flex min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-30 border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
            <button
              onClick={() => setOpen(true)}
              className="rounded-xl bg-[#082b63] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#061f49]"
            >
              <div className="flex items-center gap-2">
                <Menu className="h-4 w-4" />
                <span>Menú</span>
              </div>
            </button>
          </div>

          <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <DashboardHeader />

            <div className="mt-6">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}