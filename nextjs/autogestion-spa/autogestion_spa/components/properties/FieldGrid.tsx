import { SIN_INFORMACION, val, type Maybe } from "@/types/property"

interface Field {
  label: string
  value: Maybe<string | number>
}

export function FieldGrid({ fields }: { fields: Field[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
      {fields.map((field) => (
        <FieldRow key={field.label} label={field.label} value={field.value} />
      ))}
    </dl>
  )
}

function FieldRow({ label, value }: Field) {
  const display = val(value)
  const isEmpty = display === SIN_INFORMACION

  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium text-gray-500">{label}</dt>

      <dd
        className={`text-sm ${
          isEmpty ? "italic text-gray-500" : "font-medium text-gray-900"
        }`}
      >
        {display}
      </dd>
    </div>
  )
}