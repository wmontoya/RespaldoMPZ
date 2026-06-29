//ESTE ARCHIVO DEFINE UN ENDPOINT DE LA API QUE PERMITE CONSULTAR INFORMACIÓN DE FINCAS ASOCIADAS A UNA PERSONA A PARTIR DE SU CÉDULA. SE UTILIZA PARA OBTENER LOS DATOS DE LAS FINCAS ASOCIADAS A UNA PERSONA EN ODOO Y DEVOLVERLOS EN UN FORMATO ESTRUCTURADO AL CLIENTE QUE HACE LA PETICIÓN.
import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { verifyJWT } from "@/utils/verifyJwt";

const allowedOrigins = process.env.API_DOMAINS
  ? process.env.API_DOMAINS.split(",")
  : [];

const cors = Cors({
  methods: ["POST", "OPTIONS"],
  origin: (origin, callback) => {
    if (origin && allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
});

function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: (
    req: NextApiRequest,
    res: NextApiResponse,
    callback: (result: unknown) => void,
  ) => void,
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: unknown) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "3mb",
    },
  },
};

const allowedMethodsByPath: Record<string, string[]> = {
  //Añado las rutas de los nuevos métodos
  finca: ["POST"],
  pendiente: ["POST"],
  peopleInformation: ["POST"],
  people_information: ["POST"],
  patent_information: ["POST"],
  housting_units: ["POST"],
  land_use: ["POST"],
  visados: ["POST"],
  constructions: ["POST"],
  permits_const: ["POST"],
  pendientes: ["POST"],
  payment_history: ["POST"],
  services: ["POST"],
  procedure_types: ["POST"],
  procedure_requests: ["POST"],
  procedure_request_create: ["POST"],
  account_statement: ["POST"],
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  const { path } = req.query;

  try {
    await runMiddleware(req, res, cors);

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    const allowedMethods = allowedMethodsByPath[path as string];
    if (!allowedMethods) {
      return res
        .status(404)
        .json({ success: false, error: "Ruta no configurada" });
    }
    if (!req.method || !allowedMethods.includes(req.method)) {
      return res.status(405).json({
        success: false,
        error: `Método ${req.method} no permitido para ${path}`,
      });
    }

    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Token JWT no agregado o formato incorrecto",
      });
    }

    const jwtResult = verifyJWT(req);
    if (!jwtResult.valid) {
      return res
        .status(403)
        .json({ success: false, error: "Token JWT inválido o expirado " });
    }

    const clienteId = jwtResult.payload.sub;
    const empresaNombre = jwtResult.payload.empresa;

    const clientesAutorizados = JSON.parse(
      process.env.API_ODOO_USERNAMES || "[]",
    );
    const emprezasAutorizados = process.env.API_EMPRESA_ATH?.split(",") || [];
    if (
      !clientesAutorizados.some((c: any) => c.alias === clienteId) &&
      !emprezasAutorizados.includes(empresaNombre)
    ) {
      return res.status(403).json({
        success: false,
        error: "Cliente no autorizado para acceder a este recurso",
      });
    }

    const method = String(path);
    const utilModule = await import(`@/lib/yaipan/${method}`);
    const user = clientesAutorizados.find((c: any) => c.alias === clienteId);

    if (!user) {
      return res.status(403).json({
        success: false,
        error: "Usuario autorizado no encontrado para el alias del token",
      });
    }

    return utilModule.default(req, res, user);
  } catch (error) {
    console.error("ERROR EN /api/v1/yaipan/[path]:", error);

    return res.status(500).json({
      success: false,
      error:
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message?: string }).message
          : "Ruta o método no encontrado",
    });
  }
}
