import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json(
        { error: "Token no encontrado" },
        { status: 401 }
      )
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET_KEY)
    )

    return NextResponse.json({
      email: payload.email,
      department: payload.department,
      department_name: payload.department_name,
      user_id: payload.user_id,
      roles: payload.roles ?? []
    })

  } catch (error) {
    console.error("VERIFY TOKEN ERROR:", error)

    return NextResponse.json(
      { error: "Token inválido o expirado" },
      { status: 401 }
    )
  }
}
