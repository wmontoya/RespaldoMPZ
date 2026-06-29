export const pagarDocs = {
    "/api/v1/mpz/pagar": {
        post: {
            summary: "Realiza el pago de los pendientes de un contribuyente",
            description: "Recibe la información del contribuyente junto con los pendientes seleccionados y devuelve un identificador único de pago (`pago_id`).",
            tags: ["Pagar"],
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
                                    description: "Cédula del contribuyente que realiza el pago.",
                                },
                                authorization: {
                                    type: "string",
                                    example: "550807",
                                    description: "Código de autorización opcional para validar el pago.",
                                },
                                pendientes: {
                                    type: "array",
                                    description: "Lista de pendientes a pagar. Debe incluir al menos un objeto con la información del servicio.",
                                    items: {
                                        type: "object",
                                        properties: {
                                            codigoServicio: { type: "string", example: "56" },
                                            tipoCobro: { type: "string", example: "MPO" },
                                            year: { type: "string", example: "2025" },
                                            periodo: { type: "string", example: "03" },
                                            fechaCorte: { type: "string", example: "31/10/2025" },
                                            monto: { type: "number", example: 527.35 },
                                            saldo: { type: "number", example: 527.35 },
                                            saldoInteres: { type: "number", example: 0 },
                                            estado: { type: "string", example: "al cobro" },
                                            descripcion: { type: "string", example: "Mant de Parques y Ornato" },
                                            auxiliarContable: { type: "string", example: "CUF" },
                                            numeroCuenta: { type: "number", example: 69180 },
                                            tipoTransaccion: { type: "string", example: "MPO" },
                                            numeroDocumento: { type: "string", example: "2025.03" },
                                            montoMulta: { type: "number", example: 0 },
                                            numeroFinca: { type: "string", example: "604519" },
                                        },
                                    },
                                },
                            },
                            required: ["cedula", "pendientes"],
                        },
                        examples: {
                            PagoConAutorizacion: {
                                summary: "Pago con autorización",
                                value: {
                                    cedula: "0115290830",
                                    authorization: "550807",
                                    pendientes: [
                                        {
                                            codigoServicio: "56",
                                            tipoCobro: "MPO",
                                            year: "2025",
                                            periodo: "03",
                                            fechaCorte: "31/10/2025",
                                            monto: 527.35,
                                            saldo: 527.35,
                                            saldoInteres: 0,
                                            estado: "al cobro",
                                            descripcion: "Mant de Parques y Ornato",
                                            auxiliarContable: "CUF",
                                            numeroCuenta: 69180,
                                            tipoTransaccion: "MPO",
                                            numeroDocumento: "2025.03",
                                            montoMulta: 0,
                                            numeroFinca: "604519",
                                        },
                                    ],
                                },
                            },
                            PagoSinAutorizacion: {
                                summary: "Pago sin autorización",
                                value: {
                                    cedula: "0115290830",
                                    pendientes: [
                                        {
                                            codigoServicio: "56",
                                            tipoCobro: "MPO",
                                            year: "2025",
                                            periodo: "03",
                                            fechaCorte: "31/10/2025",
                                            monto: 527.35,
                                            saldo: 527.35,
                                            saldoInteres: 0,
                                            estado: "al cobro",
                                            descripcion: "Mant de Parques y Ornato",
                                            auxiliarContable: "CUF",
                                            numeroCuenta: 69180,
                                            tipoTransaccion: "MPO",
                                            numeroDocumento: "2025.03",
                                            montoMulta: 0,
                                            numeroFinca: "604519",
                                        },
                                    ],
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Pago procesado exitosamente.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    pago_id: { type: "string", example: "SPO-000001-2025" },
                                },
                            },
                            examples: {
                                PagoExitoso: {
                                    summary: "Ejemplo de respuesta exitosa",
                                    value: {
                                        success: true,
                                        pago_id: "SPO-000001-2025",
                                    },
                                },
                            },
                        },
                    },
                },
                400: {
                    description: "Solicitud inválida (falta de datos o formato incorrecto).",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    error: { type: "string", example: "Datos inválidos o incompletos." },
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
                                    error: { type: "string", example: "Token JWT inválido o expirado." },
                                },
                            },
                        },
                    },
                },
                500: {
                    description: "Error interno del servidor.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    error: { type: "string", example: "Error al procesar el pago." },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};
