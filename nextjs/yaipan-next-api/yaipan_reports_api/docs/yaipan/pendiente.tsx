export const pendienteDocs = {
    "/api/v1/yaipan/pendiente": {
        post: {
            summary: "Consulta si un contribuyente tiene pendientes en estado vencido por cédula",
            description: "Devuelve un valor true si la persona tiene cobros en estado vencido y false si la persona se encuentra al día con sus tributos.",
            tags: ["Pendiente"],
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
                }
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
                                    example: "3010045279",
                                    description: "Cédula del contribuyente a consultar.",
                                },
                            },
                            required: ["cedula"],
                        },
                        examples: {
                            BuscarPorCedula: {
                                summary: "Buscar pendiente por cédula",
                                value: {
                                    cedula: "3010045279",
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
                                    success: { type: "boolean", example: true },
                                    pediente: { type: "boolean", example: true },
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
                                            formErrors: { type: "array", items: { type: "string" }, example: ["Debe proporcionar al menos una cédula"] },
                                            fieldErrors: { type: "object" },
                                        }
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
                    description: "Error interno del servidor (CORS).",
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
    }
};
