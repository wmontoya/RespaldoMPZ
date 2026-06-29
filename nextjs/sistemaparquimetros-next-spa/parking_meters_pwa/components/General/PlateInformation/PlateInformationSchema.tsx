import { z } from 'zod';

export const PlateInformationSchema = z.object({
    vehiclePlate: z
        .string()
        .min(1, { message: "El número de placa es requerido" })
        .max(6, { message: "La placa no puede contener más de 6 caracteres. Consulta el ícono de información para más detalles." })
        .refine(value => /^[A-Za-z0-9]*$/.test(value), {
            message: "El número de placa solo puede contener letras y números, sin espacios ni guiones",
        }),
    plateType: z.object({
        Description: z.string(),
    }).nullable().refine(value => value !== null, {
        message: 'El tipo de placa es requerido',
    })
});
