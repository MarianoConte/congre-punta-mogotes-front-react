/**
 * Decodifica el payload de un JWT y devuelve si ya venció.
 * Ante cualquier token ausente, corrupto o sin `exp` se considera vencido:
 * es preferible mandar al login que arrastrar una sesión rota.
 */
export function isTokenExpirado(token) {
  if (!token) return true;

  try {
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(atob(payloadBase64));
    if (!payload?.exp) return true;
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}
