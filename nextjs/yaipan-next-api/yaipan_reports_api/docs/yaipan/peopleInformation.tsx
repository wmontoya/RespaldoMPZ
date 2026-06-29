export const peopleInformationDocs = {
  "/api/v1/yaipan/peopleInformation": {
    post: {
      summary: "Consulta de información del contribuyente",
      description:
        "Obtiene la información básica del contribuyente a partir de su número de cédula.",
      tags: ["Información del Contribuyente"],
      parameters: [
        {
          name: "Authorization",
          in: "header",
          required: true,
          schema: {
            type: "string",
            example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...",
          },
          description: 'Token JWT. Debe iniciar con "Bearer ".',
        },
        {
          name: "Origin",
          in: "header",
          required: true,
          schema: {
            type: "string",
            example: "https://www.perezzeledon.go.cr",
          },
          description: "Dominio desde el cual se realiza la solicitud.",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["cedula"],
              properties: {
                cedula: {
                  type: "string",
                  example: "0118130899",
                },
              },
            },
            examples: {
              ConsultaContribuyente: {
                summary: "Consultar información por cédula",
                value: {
                  cedula: "0118130899",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Solicitud procesada correctamente.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true,
                  },
                  contribuyente: {
                    type: "object",
                    properties: {
                      cedula_persona: {
                        type: "string",
                        example: "0118130899",
                      },
                      nombre_completo: {
                        type: "string",
                        example: "MARISOL VALVERDE RETANA",
                      },
                      tipo_cedula: {
                        type: "string",
                        example: "01",
                      },
                      direccion_principal: {
                        type: "string",
                        example:
                          "BARRIO NUEVO PAVONES, CALLE ZURQUI, PENÚLTIMA CASA A MANO DERECHA.",
                      },
                      ultima_actualizacion: {
                        type: "string",
                        nullable: true,
                        example: null,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Petición incorrecta.",
        },
        401: {
          description: "No autorizado.",
        },
        500: {
          description: "Error interno del servidor.",
        },
      },
    },
  },
};