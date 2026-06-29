import { Home } from "lucide-react";

export function PublicHeader() {
  return (
    <header className="w-full border-b-4 border-sky-400 bg-[#082b63]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <img
            src="/autogestion/img/escudo.png"
            alt="Municipalidad de Pérez Zeledón"
            className="h-12 w-12 object-contain"
          />

          <div className="leading-tight">
            <p className="text-sm font-medium text-sky-300">Municipalidad de</p>
            <h1 className="text-lg font-bold text-white sm:text-xl">
              Pérez Zeledón
            </h1>
          </div>
        </div>

        <a
          href="https://www.perezzeledon.go.cr/"
          className="hidden items-center gap-2 font-semibold text-white transition hover:text-sky-200 sm:flex"
        >
          <Home size={18} strokeWidth={2.5} />
          Volver a Inicio
        </a>
      </div>
    </header>
  );
}