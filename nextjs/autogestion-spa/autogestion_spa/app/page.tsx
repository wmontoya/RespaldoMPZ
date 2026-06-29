import { PublicHeader } from "@/components/layout/PublicHeader";
import { MunicipalityLogo } from "@/components/landing/MunicipalityLogo";
import { SearchForm } from "@/components/landing/SearchForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <PublicHeader />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="rounded-lg border border-gray-300 bg-white shadow-xl">
          <div className="grid min-h-[560px] grid-cols-1 items-center gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:p-14">
            <MunicipalityLogo />
            <div className="mx-auto w-full max-w-xl">
              <SearchForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}