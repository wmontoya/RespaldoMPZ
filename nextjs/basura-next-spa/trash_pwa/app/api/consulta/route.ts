import { type NextRequest, NextResponse } from "next/server"

const ciudadanosData: Record<string, any> = {
  "1-2345-6789": {
    cedula: "1-2345-6789",
    nombre: "Juan Pérez Rodríguez",
    propiedades: [
      {
        direccion: "Barrio Luján, Casa #45, San Isidro del General",
        zona: "Zona Residencial A",
        tarifa: 12500,
        unidadesHabitacionales: 1,
        periodosPendientes: [
          {
            periodo: "Trimestre I-2025",
            fechaCorte: "31 de marzo, 2025",
            monto: 12500,
          },
          {
            periodo: "Trimestre IV-2024",
            fechaCorte: "31 de diciembre, 2024",
            monto: 11800,
          },
        ],
      },
      {
        direccion: "Centro, Edificio Plaza, Local 5, San Isidro del General",
        zona: "Zona Comercial",
        tarifa: 25000,
        unidadesHabitacionales: 1,
        periodosPendientes: [
          {
            periodo: "Trimestre I-2025",
            fechaCorte: "31 de marzo, 2025",
            monto: 25000,
          },
        ],
      },
    ],
  },
  "2-3456-7890": {
    cedula: "2-3456-7890",
    nombre: "María González Castro",
    propiedades: [
      {
        direccion: "Los Ángeles, Apartamento 3B, San Isidro del General",
        zona: "Zona Residencial B",
        tarifa: 18000,
        unidadesHabitacionales: 3,
        periodosPendientes: [],
      },
    ],
  },
  "3-4567-8901": {
    cedula: "3-4567-8901",
    nombre: "Carlos Ramírez Mora",
    propiedades: [
      {
        direccion: "Centro, Casa #102, San Isidro del General",
        zona: "Zona Residencial A",
        tarifa: 15000,
        unidadesHabitacionales: 2,
        periodosPendientes: [
          {
            periodo: "Trimestre I-2025",
            fechaCorte: "31 de marzo, 2025",
            monto: 15000,
          },
        ],
      },
    ],
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cedula } = body

    if (!cedula) {
      return NextResponse.json({ error: "Cédula es requerida" }, { status: 400 })
    }

    const ciudadano = ciudadanosData[cedula]

    if (!ciudadano) {
      return NextResponse.json({ error: "Ciudadano no encontrado" }, { status: 404 })
    }

    return NextResponse.json(ciudadano)
  } catch (error) {
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
