import { type NextRequest, NextResponse } from "next/server"

const quejasDatabase: Record<string, any[]> = {
  "1-2345-6789": [
    {
      id: "QJ-1704067200000",
      cedula: "1-2345-6789",
      nombre: "Juan Pérez Rodríguez",
      tipo: "tarifa-incorrecta",
      descripcion: "La tarifa cobrada no corresponde a mi propiedad",
      fecha: "2024-12-15T10:30:00Z",
      estado: "resuelta",
      respuesta:
        "Se revisó su caso y se confirmó que la tarifa es correcta según el catastro municipal. Su propiedad cuenta con 1 unidad habitacional.",
    },
  ],
  "3-4567-8901": [
    {
      id: "QJ-1705276800000",
      cedula: "3-4567-8901",
      nombre: "Carlos Ramírez Mora",
      tipo: "servicio-no-prestado",
      descripcion: "No pasaron a recoger la basura el día programado",
      fecha: "2025-01-10T14:20:00Z",
      estado: "en-revision",
      respuesta: undefined,
    },
  ],
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const cedula = searchParams.get("cedula")

    if (!cedula) {
      return NextResponse.json({ error: "Cédula es requerida" }, { status: 400 })
    }

    const quejas = quejasDatabase[cedula] || []

    return NextResponse.json(quejas)
  } catch (error) {
    console.error("Error al obtener quejas:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, cedula, tipo, descripcion } = body

    if (!nombre || !cedula || !tipo || !descripcion) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    const nuevaQueja = {
      id: `QJ-${Date.now()}`,
      nombre,
      cedula,
      tipo,
      descripcion,
      fecha: new Date().toISOString(),
      estado: "pendiente",
    }

    if (!quejasDatabase[cedula]) {
      quejasDatabase[cedula] = []
    }
    quejasDatabase[cedula].unshift(nuevaQueja)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: "Queja registrada exitosamente",
      queja: nuevaQueja,
    })
  } catch (error) {
    console.error("Error al procesar queja:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
