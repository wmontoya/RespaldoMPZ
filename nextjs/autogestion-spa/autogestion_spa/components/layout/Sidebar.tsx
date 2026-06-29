"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, LogOut, X } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { resolveIcon } from "@/lib/icons";

const DEFAULT_COLOR = "#082b63";

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { services, loading } = useServices();

  const isProfileActive = pathname.startsWith("/dashboard/profile");
  const isHomeActive = pathname === "/dashboard";

  return (
    <aside className="sticky top-0 flex h-screen w-72 flex-col border-r border-gray-200 bg-white">
      <div className="flex flex-col items-center border-b border-gray-100 px-6 py-6">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-xl border border-gray-200 bg-white p-2 text-gray-500 shadow-sm transition hover:border-[#082b63] hover:text-[#082b63] lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        <img
          src="/autogestion/img/escudo.png"
          alt="Municipalidad de Pérez Zeledón"
          width={72}
          height={72}
          className="object-contain"
        />

        <p className="mt-3 text-center text-sm font-semibold text-[#082b63]">
          Municipalidad de Pérez Zeledón
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#082b63]">
          Menú
        </p>

        <div className="space-y-2">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              isHomeActive
                ? "bg-[#082b63] text-white"
                : "text-gray-600 hover:bg-blue-50 hover:text-[#082b63]"
            }`}
          >
            <Home className="h-5 w-5" />
            Inicio
          </Link>

          {loading &&
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-xl bg-gray-100"
              />
            ))}

          {!loading &&
            services.map((service) => {
              const Icon = resolveIcon(service.icon);
              const color = service.color || DEFAULT_COLOR;
              const active =
                !service.isExternal && pathname.startsWith(service.url);

              const className = `flex items-center gap-3 rounded-xl border-l-4 px-4 py-3 text-sm font-medium transition ${
                active
                  ? "text-gray-900"
                  : "border-transparent text-gray-600 hover:bg-gray-50"
              }`;

              const style = {
                borderLeftColor: active ? color : "transparent",
                backgroundColor: active ? `${color}1a` : undefined,
              };

              const inner = (
                <>
                  <Icon
                    className="h-5 w-5"
                    style={{ color: active ? DEFAULT_COLOR : color }}
                  />
                  {service.title}
                </>
              );

              if (service.isExternal) {
                return (
                  <a
                    key={service.id}
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                    style={style}
                  >
                    {inner}
                  </a>
                );
              }

              return (
                <Link
                  key={service.id}
                  href={service.url}
                  className={className}
                  style={style}
                >
                  {inner}
                </Link>
              );
            })}
        </div>
      </nav>

      <div className="mt-auto border-t border-gray-100 px-4 py-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#082b63]">
          Usuario
        </p>

        <div className="space-y-2">
          <Link
            href="/dashboard/profile"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              isProfileActive
                ? "bg-[#082b63] text-white"
                : "text-gray-600 hover:bg-blue-50 hover:text-[#082b63]"
            }`}
          >
            <User className="h-5 w-5" />
            Perfil
          </Link>

          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-[#082b63]"
          >
            <LogOut className="h-5 w-5" />
            Salir
          </Link>
        </div>
      </div>
    </aside>
  );
}
