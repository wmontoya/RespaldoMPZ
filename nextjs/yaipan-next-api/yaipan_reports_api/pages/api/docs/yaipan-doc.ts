import { fincaDocs } from "@/docs/yaipan/finca";
import { pendienteDocs } from "@/docs/yaipan/pendiente";
import { NextApiRequest, NextApiResponse } from "next";
import { createSwaggerSpec } from "next-swagger-doc";
import { peopleInformationDocs } from "@/docs/yaipan/peopleInformation";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: any,
) {
  const spec = createSwaggerSpec({
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Yaipan Conection API",
        version: "1.0.0",
        description:
          " Esta API permite consultar información relacionada con:\n" +
          "- Solicitudes de uso de suelo\n" +
          "- Información de fincas registradas\n" +
          "- Información sobre el estado de cuenta de una persona o entidad \n" +
          "\n**IMPORTANTE**:\n" +
          "- Se requiere autenticación con un token JWT en el header \`Authorization\`.\n" +
          "- Para formar el token se requiere los datos que proveerá la Municipalidad para formar un JWT con el siguiente formato:\n" +
          "\`jwt.sign( { sub: 'identificador', empresa: 'nombre_empresa' }, 'token_secreto', { expiresIn: '(tiempo)h' } );\`",
      },
      servers: [
        {
          url: "https://www.perezzeledon.go.cr:6908",
          description: "Servidor producción",
        },
        {
          url: "http://localhost:3000",
          description: "Servidor local",
        },
      ],
      paths: {
        ...pendienteDocs,
        ...fincaDocs,
        ...peopleInformationDocs,
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
    },
  });

  res.status(200).json(spec);
}
