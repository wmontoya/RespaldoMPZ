import { z } from 'zod';


export const SearchTicketSchema = z.object({
    ticketNumber: z.string().trim().min(1, { message: "El número de boleta es requerido" }).refine(val => /^[0-9]+$/.test(val), {
        message: "El número debe contener solo números",
      }),
});
