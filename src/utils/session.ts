/* Foto y encuadre que se pintan en el header y en la barra lateral. */
export function readAvatar(): { url: string; pos: { x: number; y: number } } {
  const url = localStorage.getItem('avatar') || '';
  const raw = localStorage.getItem('avatar_position');
  let pos = { x: 50, y: 50 };
  try { if (raw) pos = JSON.parse(raw) ?? pos; } catch { /* encuadre corrupto: se centra */ }
  return { url, pos };
}

/* Todo lo que identifica al usuario en este navegador. El avatar y su encuadre viven en
 * localStorage y sobrevivian al logout: quien entraba despues en el mismo navegador veia
 * la foto del anterior en el header (al registrarse) o su encuadre (al iniciar sesion). */
export function clearSession() {
  sessionStorage.setItem('login', 'false');
  sessionStorage.removeItem('token');
  localStorage.removeItem('avatar');
  localStorage.removeItem('avatar_position');
  localStorage.removeItem('user_email');
}
