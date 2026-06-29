"use client";

import { ServiceCard } from "./ServiceCard";
import { useServices } from "@/hooks/useServices";
import { Loading } from "@/components/ui/Loading";

export function ServiceGrid() {
  const { services, loading, error } = useServices();

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        {error}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-6 text-gray-500">
        No hay servicios disponibles por el momento.
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          title={service.title}
          description={service.description}
          url={service.url}
          icon={service.icon}
          color={service.color}
          isExternal={service.isExternal}
        />
      ))}
    </section>
  );
}
