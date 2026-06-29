import { z } from 'zod';

export const TimeInformationSchema = z.object({
    startDate: z.date(),
    startTime: z.date(),
    parkingRateId: z.array(z.number()).nonempty({ message: 'Es necesario seleccionar al menos una boleta para continuar' })
}).superRefine((data, ctx) => {

    const timeDifference =  data.startTime.getTime() - new Date().getTime();
    if(timeDifference < 0 ){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'No se permite usar horas menores a la actual, agregar 5 minutos más',
            path: ['startDate'],
        });
    }
});
