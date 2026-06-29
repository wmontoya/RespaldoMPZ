//funcion mascara de telefono y correo electronico
export function maskPhone(phone?: string | null) {
  if (!phone) return null;

  const clean = phone.replace(/\D/g, "");

    const localNumber =
    clean.length > 8 ? clean.slice(-8) : clean;

    return `${localNumber.slice(0, 2)}****${localNumber.slice(-2)}`;
}

export function maskEmail(email?: string | null) {
  if (!email) return null;

  const [user, domain] = email.trim().split("@");

  if (!user || !domain) {
    return null;
  }

  const visible = user.slice(0, 3);

  return `${visible}*****@${domain}`;
}