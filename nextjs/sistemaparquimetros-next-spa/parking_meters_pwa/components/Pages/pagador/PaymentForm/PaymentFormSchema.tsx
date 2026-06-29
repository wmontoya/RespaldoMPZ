import { z } from 'zod';

export const paymentFormSchema = z.object({
  idType: z.enum(['fisica', 'juridica', 'pasaporte']),
  id: z.string()
    .min(1, { message: "La identificación es requerida" })
    .refine(val => val.trim() === val, {
      message: "La cédula no debe contener espacios vacíos al inicio o al final",
    })
    .refine(val => !val.includes(' '), {
      message: "La cédula no debe contener espacios en blanco",
    })
    .refine(val => /^[a-zA-Z0-9]+$/.test(val), {
      message: "La cédula no debe contener caracteres especiales",
    })
  ,
  name: z.string().min(1, { message: "El nombre es requerido" }),
  lastName: z.string().optional(),
  email: z.string().email({ message: "El correo electrónico no es válido" })
    .refine(val => !val.includes(' '), {
      message: "El correo electrónico no debe contener espacios en blanco",
    }),
  phone: z.string()
    .min(8, { message: "El teléfono debe tener al menos 8 dígitos" })
    .refine(val => /^[0-9]+$/.test(val), {
      message: "El teléfono debe contener solo números",
    })
    .refine(val => val.trim() === val, {
      message: "El teléfono no debe contener espacios vacíos al inicio o al final",
    })
    .refine(val => !val.includes(' '), {
      message: "El teléfono no debe contener espacios en blanco",
    }),
  isTermsAccepted: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los términos y condiciones',
  }),
}).superRefine((data, ctx) => {
  const { id, idType, lastName } = data;
  console.log(`Validating ID: ${id}, ID Type: ${idType}, Last Name: ${lastName}`);

  if (idType === 'fisica') {
    if (!id.startsWith('0') || id.length !== 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Persona física: debe iniciar con 0 y tener 10 caracteres, digite la cédula sin guiones ni espacios, pero con todos los ceros, ejemplos: Persona Física: 0107770777",
        path: ['id'],
      });
    }
    if (id.startsWith('0') && (!data.lastName || data.lastName.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Los apellidos son requeridos",
      path: ['lastName'],
    });

  }
  }else if (idType === 'juridica') {
    if (!id.startsWith('3') || id.length !== 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Persona jurídica: debe iniciar con 3 y tener 10 caracteres, digite la cédula sin guiones ni espacios, pero con todos los ceros, ejemplos: Persona Jurídica: 3811181111",
        path: ['id'],
      });
    }
  } else if (idType === 'pasaporte') {
    if (id.length < 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pasaporte: debe tener al menos 4 caracteres",
        path: ['id'],
      });
    }
  }
});
