import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { resolveIcon } from "@/lib/icons";

type ServiceCardProps = {
  title: string;
  description: string;
  url: string;
  icon: string;
  color: string;
  isExternal: boolean;
};

const DEFAULT_COLOR = "#082b63";

export function ServiceCard({
  title,
  description,
  url,
  icon,
  color,
  isExternal,
}: ServiceCardProps) {
  const Icon = resolveIcon(icon);
  const accent = color || DEFAULT_COLOR;
  // Versión translúcida (~10% alpha) del color para el fondo del icono.
  const iconBg = `${accent}1a`;

  const content = (
    <>
      <div
        className="absolute left-0 top-0 h-full w-1.5"
        style={{ backgroundColor: accent }}
      />

      <div className="flex min-h-[150px] items-center gap-6 pl-2">
        <div
          className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl"
          style={{ backgroundColor: iconBg, color: accent }}
        >
          <Icon className="h-12 w-12" />
        </div>

        <div className="flex flex-1 items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#082b63]">
              {title}
            </h3>

            <p className="mt-2 max-w-xs text-sm leading-relaxed text-gray-500">
              {description}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-5">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl transition group-hover:scale-105"
              style={{ backgroundColor: iconBg, color: accent }}
            >
              <ArrowRight className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const className =
    "group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md";

  if (isExternal) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={url} className={className}>
      {content}
    </Link>
  );
}
