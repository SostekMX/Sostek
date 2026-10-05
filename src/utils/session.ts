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
