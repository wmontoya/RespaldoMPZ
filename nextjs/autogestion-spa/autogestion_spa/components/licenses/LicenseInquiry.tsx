"use client";

import { useState } from "react";
import { LicenseDetail } from "./LicenseDetail";
import { LicensesList } from "./LicensesList";
import type { BusinessLicense } from "@/types/license";

type LicenseInquiryProps = {
  licenses: BusinessLicense[];
};

export function LicenseInquiry({ licenses }: LicenseInquiryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedLicense =
    licenses.find((license) => license.id === selectedId) ?? licenses[0];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold text-gray-900">
          Patentes asociadas
        </h2>

        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-900 px-2 text-xs font-semibold text-white">
          {licenses.length}
        </span>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[440px_1fr]">
        <section className="min-w-0">
          <LicensesList
            licenses={licenses}
            selectedId={selectedLicense.id}
            onSelect={setSelectedId}
          />
        </section>

        <section className="min-w-0">
          <LicenseDetail license={selectedLicense} />
        </section>
      </div>
    </div>
  );
}