export const pendientesDocs = {
    "/api/v1/mpz/pendientes": {
        post: {
            summary: "Consulta los pendientes de un contribuyente por cédula",
            description:
                "Devuelve una lista de pendientes tributarios filtrados por tipo de tributo y estado. Permite consultar todos o solo algunos tipos específicos (BAS, MPO, IBI, PAT, LIC, BUS, MER).",
            tags: ["Pendientes"],
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
                                    description: "Cédula del contribuyente a consultar.",
                                },
                                filtro: {
                                    type: "string",
                                    enum: ["BAS", "MPO", "IBI", "PAT", "LIC", "BUS", "MER", "todos"],
                                    example: "todos",
                                    description:
                                        "Tipo de tributo a consultar. Puede ser uno específico o 'todos'.",
                                },
                                estado: {
                                    type: "string",
                                    enum: ["al cobro", "pendiente", "vencido", "todos"],
                                    example: "todos",
                                    description:
                                        "Estado de los pendientes a consultar. Puede incluir todos o filtrar por estado.",
                                },
                            },
                            required: ["cedula"],
                        },
                        examples: {
                            BuscarPendientes_Cedula: {
                                summary: "Sin filtros (todos los tipos y estados)",
                                value: {
                                    cedula: "0115290830"
                                },
                            },
                            BuscarPendientes_Todos: {
                                summary: "Todos los tipos de atributos y estados",
                                value: {
                                    cedula: "0115290830",
                                    filtro: "todos",
                                    estado: "todos",
                                },
                            },
                            BuscarPendientes_BAS: {
                                summary: "Filtro BAS (Basura)",
                                value: {
                                    cedula: "0115290830",
                                    filtro: "BAS",
                                    estado: "todos",
                                },
                            },
                            BuscarPendientes_MPO: {
                                summary: "Filtro MPO (Mantenimiento de parques y ornato)",
                                value: {
                                    cedula: "0115290830",
                                    filtro: "MPO",
                                    estado: "todos",
                                },
                            },
                            BuscarPendientes_IBI: {
                                summary: "Filtro IBI (Impuesto de Bienes Inmuebles)",
                                value: {
                                    cedula: "0115290830",
                                    filtro: "IBI",
                                    estado: "todos",
                                },
                            },
                            BuscarPendientes_PAT: {
                                summary: "Filtro PAT (Licencia comercial)",
                                value: {
                                    cedula: "0115290830",
                                    filtro: "PAT",
                                    estado: "todos",
                                },
                            },
                            BuscarPendientes_LIC: {
                                summary: "Filtro LIC (Licencias licores)",
                                value: {
                                    cedula: "0115290830",
                                    filtro: "LIC",
                                    estado: "todos",
                                },
                            },
                            BuscarPendientes_BUS: {
                                summary: "Filtro BUS (Ruta de buses)",
                                value: {
                                    cedula: "0115290830",
                                    filtro: "BUS",
                                    estado: "todos",
                                },
                            },
                            BuscarPendientes_MER: {
                                summary: "Filtro MER (Alquiler de mercado)",
                                value: {
                                    cedula: "0115290830",
                                    filtro: "MER",
                                    estado: "todos",
                                },
                            },
                            BuscarPendientes_AlCobro: {
                                summary: "Estado al cobro",
                                value: {
                                    cedula: "0115290830",
                                    filtro: "todos",
                                    estado: "al cobro",
                                },
                            },
                            BuscarPendientes_Pendiente: {
                                summary: "Estado pendiente",
                                value: {
                                    cedula: "0115290830",
                                    filtro: "todos",
                                    estado: "pendiente",
                                },
                            },
                            BuscarPendientes_Vencido: {
                                summary: "Estado vencido",
                                value: {
                                    cedula: "0115290830",
                                    filtro: "todos",
                                    estado: "vencido",
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Consulta procesada correctamente.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    pendientes: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                codigoServicio: { type: "string", example: "2" },
                                                tipoCobro: { type: "string", example: "BAS" },
                                                year: { type: "string", example: "2025" },
                                                periodo: { type: "string", example: "03" },
                                                fechaCorte: { type: "string", example: "31/10/2025" },
                                                monto: { type: "number", example: 14185 },
                                                saldo: { type: "number", example: 14185 },
                                                saldoInteres: { type: "number", example: 0 },
                                                estado: { type: "string", example: "al cobro" },
                                                descripcion: { type: "string", example: "Rec. de Basura" },
                                                auxiliarContable: { type: "string", example: "CUF" },
                                                numeroCuenta: { type: "number", example: 69180 },
                                                tipoTransaccion: { type: "string", example: "BAS" },
                                                numeroDocumento: { type: "string", example: "2025.03" },
                                                montoMulta: { type: "number", example: 0 },
                                                numeroFinca: { type: "string", example: "604519" },
                                            },
                                        },
                                    },
                                },
                            },
                            examples: {
                                Ejemplo: {
                                    value: {
                                        success: true,
                                        pendientes: [
                                            {
                                                codigoServicio: "2",
                                                tipoCobro: "BAS",
                                                year: "2025",
                                                periodo: "03",
                                                fechaCorte: "31/10/2025",
                                                monto: 14185,
                                                saldo: 14185,
                                                saldoInteres: 0,
                                                estado: "al cobro",
                                                descripcion: "Rec. de Basura",
                                                auxiliarContable: "CUF",
                                                numeroCuenta: 69180,
                                                tipoTransaccion: "BAS",
                                                numeroDocumento: "2025.03",
                                                montoMulta: 0,
                                                numeroFinca: "604519",
                                            },
                                            {
                                                codigoServicio: "2",
                                                tipoCobro: "BAS",
                                                year: "2025",
                                                periodo: "04",
                                                fechaCorte: "31/01/2026",
                                                monto: 14185,
                                                saldo: 14185,
                                                saldoInteres: 0,
                                                estado: "pendiente",
                                                descripcion: "Rec. de Basura",
                                                auxiliarContable: "CUF",
                                                numeroCuenta: 69180,
                                                tipoTransaccion: "BAS",
                                                numeroDocumento: "2025.04",
                                                montoMulta: 0,
                                                numeroFinca: "604519",
                                            },
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
                                            {
                                                codigoServicio: "56",
                                                tipoCobro: "MPO",
                                                year: "2025",
                                                periodo: "04",
                                                fechaCorte: "31/01/2026",
                                                monto: 527.35,
                                                saldo: 527.35,
                                                saldoInteres: 0,
                                                estado: "pendiente",
                                                descripcion: "Mant de Parques y Ornato",
                                                auxiliarContable: "CUF",
                                                numeroCuenta: 69180,
                                                tipoTransaccion: "MPO",
                                                numeroDocumento: "2025.04",
                                                montoMulta: 0,
                                                numeroFinca: "604519",
                                            },
                                            {
                                                codigoServicio: "1",
                                                tipoCobro: "IBI",
                                                year: "2025",
                                                periodo: "03",
                                                fechaCorte: "31/10/2025",
                                                monto: 2810.25,
                                                saldo: 2810.25,
                                                saldoInteres: 0,
                                                estado: "al cobro",
                                                descripcion: "Bienes Inmuebles",
                                                auxiliarContable: "CUF",
                                                numeroCuenta: 69180,
                                                tipoTransaccion: "IBI",
                                                numeroDocumento: "2025.03",
                                                montoMulta: 0,
                                                numeroFinca: "604519",
                                            },
                                            {
                                                codigoServicio: "1",
                                                tipoCobro: "IBI",
                                                year: "2025",
                                                periodo: "04",
                                                fechaCorte: "31/01/2026",
                                                monto: 2810.25,
                                                saldo: 2810.25,
                                                saldoInteres: 0,
                                                estado: "pendiente",
                                                descripcion: "Bienes Inmuebles",
                                                auxiliarContable: "CUF",
                                                numeroCuenta: 69180,
                                                tipoTransaccion: "IBI",
                                                numeroDocumento: "2025.04",
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
                                            formErrors: {
                                                type: "array",
                                                items: { type: "string" },
                                                example: ["Debe proporcionar la cédula"],
                                            },
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
