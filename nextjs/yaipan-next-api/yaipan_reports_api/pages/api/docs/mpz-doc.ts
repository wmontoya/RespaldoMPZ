import { pendientesDocs } from "@/docs/mpz/pendiente";
import { personaDocs } from "@/docs/mpz/persona";
import { pagarDocs } from "@/docs/mpz/pagar";
import { NextApiRequest, NextApiResponse } from "next";
import { createSwaggerSpec } from "next-swagger-doc";

export default function handler(req: NextApiRequest, res: NextApiResponse, user: any) {

  const spec = createSwaggerSpec({
    definition: {
      openapi: "3.0.0",
      info: {
        title: "MPZ Conection API",
        version: "1.0.0",
            description: " Esta API permite consultar información relacionada con:\n"+
        "- Información sobre los tributos municipales pendientes\n" +
        "\n**IMPORTANTE**:\n" +
        "- Se requiere autenticación con un token JWT en el header \`Authorization\`.\n" +
        "- Para formar el token se requiere los datos que proveerá la Municipalidad para formar un JWT con el siguiente formato:\n" + 
        "\`jwt.sign( { sub: 'identificador', empresa: 'nombre_empresa' }, 'token_secreto', { expiresIn: '(tiempo)h' } );\`" 
      },
      servers: [
        {
          url: "https://www.perezzeledon.go.cr:6908"
        },
      ],
      paths: {
        ...personaDocs,
        ...pendientesDocs,
        ...pagarDocs
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Token JWT. Debe iniciar con `Bearer `.",
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    }
  });

  res.status(200).json(spec);
}
