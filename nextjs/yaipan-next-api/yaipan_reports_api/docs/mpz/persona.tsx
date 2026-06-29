export const personaDocs = {
    "/api/v1/mpz/persona": {
        post: {
            summary: "Consulta los datos de una persona por cédula",
            description: "Devuelve la información básica de una persona registrada en el sistema según la cédula consultada.",
            tags: ["Persona"],
            parameters: [
                {
                    name: "Origin",
                    in: "header",
                    required: true,
                    schema: {
                        type: "string",
                        example: "https://perezzeledon.go.cr",
                    },
                    description: "Dominio desde el cual se realiza la solicitud.",
                },
                {
                    name: "Authorization",
                    in: "header",
                    required: true,
                    schema: {
                        type: "string",
                        example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...",
                    },
                    description: "Token JWT. Debe iniciar con `Bearer `.",
                },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                cedula: {
                                    type: "string",
                                    example: "0115290830",
                                    description: "Cédula de la persona a consultar.",
                                },
                            },
                            required: ["cedula"],
                        },
                        examples: {
                            BuscarPorCedula: {
                                summary: "Buscar persona por cédula",
                                value: {
                                    cedula: "0115290830",
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Consulta realizada correctamente.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    persona: {
                                        type: "object",
                                        properties: {
                                            nombre: {
                                                type: "string",
                                                example: "WILLIAM ALEJANDRO MONTOYA ARGUEDAS",
                                            },
                                            tipoIdentificacion: {
                                                type: "string",
                                                example: "01",
                                            },
                                            identificacion: {
                                                type: "string",
                                                example: "115290830",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                400: {
                    description: "Petición incorrecta, faltan parámetros o token inválido.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    error: { type: "string", example: "Datos inválidos" },
                                    details: {
                                        type: "object",
                                        properties: {
                                            formErrors: { type: "array", items: { type: "string" }, example: ["Debe proporcionar la cédula"] },
                                            fieldErrors: { type: "object" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                403: {
                    description: "Token inválido o expirado.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    error: { type: "string", example: "Token JWT inválido o expirado" },
                                },
                            },
                        },
                    },
                },
                500: {
                    description: "Error interno del servidor (CORS o conexión fallida).",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    error: { type: "string", example: "Not allowed by CORS" },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};
