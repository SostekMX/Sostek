# INFO BACKEND — SOSTEK

> Documento de comunicación frontend → backend.
> Se actualiza cada vez que hay un cambio en el frontend que afecta la integración.
> Última actualización: 2026-06-06 (favoritos + tutorial agregados)
> Backend corre en: `http://localhost:8080`

---

## Cambios recientes del frontend que te afectan

| Fecha | Cambio | Qué necesita el backend |
|-------|--------|------------------------|
| 2026-06-06 | Frontend pendiente de integrar `GET /tutorial` | Backend lo implementó — falta frontend |
| 2026-06-06 | Frontend pendiente de integrar favoritos | Backend implementó `POST`, `GET` y `DELETE /user/favorites` — falta frontend |
| 2026-06-06 | Pantallas de recuperación de contraseña integradas (`/ForgotPassword`, `/ResetPassword`) | `POST /user/forgot-password` y `POST /user/reset-password` — ✅ integrado en ambos lados |
| 2026-06-06 | Botón "Eliminar cuenta" integrado en `Profile.tsx` | `DELETE /user` — ✅ integrado en ambos lados |
| 2026-06-06 | Puntaje enviado al backend al terminar evaluación | `POST /user/score` — ✅ integrado en ambos lados |
| 2026-06-05 | Migración completa — frontend ya no usa Google APIs para contenido (excepto tutorial, pendiente) | Artículos, evaluaciones y presentaciones — ✅ integrados |
| 2026-06-05 | Logout elimina el token de `localStorage` | Sin cambios en backend |
| 2026-06-05 | Signup valida contraseña ≥ 6 chars antes de llamar al backend | Sin cambios en backend |

---

## Estado de endpoints

| Endpoint | Estado frontend | Estado backend |
|----------|----------------|----------------|
| `POST /user/signup` | ✅ Integrado | ✅ Implementado |
| `POST /user/login` | ✅ Integrado | ✅ Implementado |
| `GET /user/profile` | ✅ Integrado | ✅ Implementado |
| `POST /user/edit` | ✅ Integrado | ✅ Implementado |
| `POST /user/score` | ✅ Integrado | ✅ Implementado |
| `DELETE /user` | ✅ Integrado | ✅ Implementado |
| `POST /user/forgot-password` | ✅ Integrado | ✅ Implementado |
| `POST /user/reset-password` | ✅ Integrado | ✅ Implementado |
| `GET /evaluations` | ✅ Integrado | ✅ Implementado |
| `GET /evaluations/:id` | ✅ Integrado | ✅ Implementado |
| `GET /articles` | ✅ Integrado | ✅ Implementado |
| `GET /articles/:id` | ✅ Integrado | ✅ Implementado |
| `GET /presentations` | ✅ Integrado | ✅ Implementado |
| `GET /tutorial` | ⚠️ Pendiente frontend | ✅ Implementado |
| `POST /user/favorites` | ⚠️ Pendiente frontend | ✅ Implementado |
| `GET /user/favorites` | ⚠️ Pendiente frontend | ✅ Implementado |
| `DELETE /user/favorites/:id` | ⚠️ Pendiente frontend | ✅ Implementado |

---

## Pendiente solo en el frontend

El backend tiene todo implementado. Lo único que falta es trabajo del frontend:

| Elemento | Qué falta en frontend |
|----------|-----------------------|
| **Tutorial** | Reemplazar `useGetDocuments` (Google Drive) con llamada axios a `GET /tutorial` en `InitialTutorial.tsx` |
| **Favoritos** | Botón "guardar" en `DocumentCard.tsx` y viewer de presentación + pantalla de lista de favoritos usando los 3 endpoints de `/user/favorites` |

---

## Comportamiento del frontend en recuperación de contraseña

El flujo de recuperación funciona así:

1. El usuario ingresa su email en `/ForgotPassword`
2. El frontend llama a `POST /user/forgot-password` con `{ email }`
3. El backend responde con `{ success: true, reset_token: "<token>" }`
4. El frontend guarda el token en `sessionStorage` con la clave `reset_token` y navega a `/ResetPassword`
5. En `/ResetPassword`, el usuario ve el token precargado (editable) y escribe su nueva contraseña
6. El frontend llama a `POST /user/reset-password` con `{ token, new_password }`
7. Al éxito, el frontend borra el token de `sessionStorage` y redirige a login

> Nota: El frontend muestra el token directamente al usuario para que lo copie/use. No hay envío de email desde el frontend.

---

## Comportamiento del frontend en puntaje

Cuando el usuario termina una evaluación:
- Si hay token en `localStorage` (usuario logueado), se llama `POST /user/score` con `{ score_test: <número> }`
- Si es invitado (sin token), no se hace ninguna llamada
- El puntaje enviado es el total acumulado de la evaluación

---

## Stack del backend

| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Autenticación | JWT (`jsonwebtoken`) |
| Hash de contraseñas | `bcrypt` |
| Base de datos | MongoDB |
| Rate limiting | `express-rate-limit` |
| CORS | Habilitado para `http://localhost:3000` y `http://localhost:8100` |

---

## Modelo de usuario

```js
{
  _id,
  email,              // String, único, requerido
  password,           // String hasheado con bcrypt — nunca devolver en respuestas
  name,               // String, requerido
  surname,            // String, requerido
  birth_date,         // Date, opcional
  occupation,         // String, opcional
  gender,             // String, opcional
  score_test,         // Number, default 0
  score_game,         // Number, default 0
  favorites,          // Array de { content_id: String, type: "article" | "presentation" }
  reset_token,        // String, interno — no devolver en respuestas
  reset_token_expiry  // Date, interno — no devolver en respuestas
}
```

---

## Autenticación JWT

- Payload del token: `{ id: usuario._id, email: usuario.email }`
- El frontend guarda el token en `localStorage` con la clave `'token'`
- Los endpoints protegidos deben leer el header `Authorization: Bearer <token>`
- Expiración: 7 días

**Middleware de autenticación:**
```js
function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];
  if (!token) return res.json({ success: false, error: 'Token requerido' });
  try {
    req.user = jwt.verify(token, SECRET_KEY); // { id, email }
    next();
  } catch {
    return res.json({ success: false, error: 'Token inválido o expirado' });
  }
}
```

---

## CORS

```js
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8100'],
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## Resumen de endpoints

| Método | Ruta | Auth | Estado |
|--------|------|------|--------|
| `POST` | `/user/signup` | No | ✅ Implementado |
| `POST` | `/user/login` | No | ✅ Implementado |
| `POST` | `/user/forgot-password` | No | ✅ Implementado |
| `POST` | `/user/reset-password` | No | ✅ Implementado |
| `GET` | `/user/profile` | JWT | ✅ Implementado |
| `POST` | `/user/edit` | JWT | ✅ Implementado |
| `POST` | `/user/score` | JWT | ✅ Implementado |
| `DELETE` | `/user` | JWT | ✅ Implementado |
| `POST` | `/user/favorites` | JWT | ✅ Implementado |
| `GET` | `/user/favorites` | JWT | ✅ Implementado |
| `DELETE` | `/user/favorites/:content_id` | JWT | ✅ Implementado |
| `GET` | `/evaluations` | No | ✅ Implementado |
| `GET` | `/evaluations/:id` | No | ✅ Implementado |
| `GET` | `/articles` | No | ✅ Implementado |
| `GET` | `/articles/:id` | No | ✅ Implementado |
| `GET` | `/presentations` | No | ✅ Implementado |
| `GET` | `/tutorial` | No | ✅ Implementado |

---

## Contratos de cada endpoint

### `POST /user/signup` — público

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "minimo6chars",
  "name": "Ana",
  "surname": "Martínez",
  "birth_date": "1999-05-15",
  "occupation": "Estudiante",
  "gender": "femenino"
}
```
> `birth_date`, `occupation` y `gender` son opcionales.

**Respuesta exitosa:**
```json
{ "success": true, "token": "<jwt>" }
```

**Errores:**
```json
{ "success": false, "error": "Correo inválido" }
{ "success": false, "error": "La contraseña debe tener al menos 6 caracteres" }
{ "success": false, "error": "El nombre es requerido" }
{ "success": false, "error": "El apellido es requerido" }
{ "success": false, "error": "Correo ingresado está ya registrado en la plataforma" }
{ "success": false, "error": "Demasiados intentos, intenta más tarde" }
```

---

### `POST /user/login` — público

**Body:**
```json
{ "email": "usuario@ejemplo.com", "password": "micontraseña" }
```

**Respuesta exitosa:**
```json
{ "success": true, "token": "<jwt>" }
```

**Errores:**
```json
{ "success": false, "error": "Cuenta no registrada" }
{ "success": false, "error": "Contraseña incorrecta" }
{ "success": false, "error": "Demasiados intentos, intenta más tarde" }
```

---

### `POST /user/forgot-password` — público

**Body:**
```json
{ "email": "usuario@ejemplo.com" }
```

**Respuesta exitosa:**
```json
{ "success": true, "reset_token": "<64-char-hex>" }
```
> El token es válido por 1 hora. El frontend lo muestra directamente al usuario.

**Errores:**
```json
{ "success": false, "error": "Correo inválido" }
{ "success": false, "error": "Correo no registrado" }
{ "success": false, "error": "Error al generar token" }
{ "success": false, "error": "Demasiados intentos, intenta más tarde" }
```

---

### `POST /user/reset-password` — público

**Body:**
```json
{ "token": "<reset_token>", "new_password": "nuevacontraseña" }
```

**Respuesta exitosa:**
```json
{ "success": true, "message": "Contraseña actualizada" }
```
> El token se invalida tras usarse una vez.

**Errores:**
```json
{ "success": false, "error": "El token es requerido" }
{ "success": false, "error": "La contraseña debe tener al menos 6 caracteres" }
{ "success": false, "error": "Token inválido" }
{ "success": false, "error": "Token expirado" }
```

---

### `GET /user/profile` — requiere JWT

**Header:** `Authorization: Bearer <token>`

**Respuesta exitosa:**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "Juan",
    "surname": "Pérez",
    "email": "usuario@mail.com",
    "birth_date": "1999-05-15T00:00:00.000Z",
    "occupation": "Estudiante",
    "gender": "masculino",
    "score_test": 120,
    "score_game": 85
  }
}
```
> `password`, `reset_token` y `reset_token_expiry` **nunca** deben incluirse en la respuesta.

**Errores:**
```json
{ "success": false, "error": "Token requerido" }
{ "success": false, "error": "Token inválido o expirado" }
{ "success": false, "error": "Usuario no encontrado" }
```

---

### `POST /user/edit` — requiere JWT

**Header:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Juan",
  "surname": "Pérez",
  "birth_date": "1999-05-15",
  "occupation": "Estudiante",
  "gender": "masculino"
}
```
> El campo `email` puede llegar en el body pero debe **ignorarse** — el usuario se identifica por el token.

**Respuesta exitosa:**
```json
{ "success": true, "message": "Usuario actualizado" }
```

**Errores:**
```json
{ "success": false, "error": "Token requerido" }
{ "success": false, "error": "El nombre es requerido" }
{ "success": false, "message": "No se pudo actualizar información del usuario" }
```

---

### `POST /user/score` — requiere JWT

**Header:** `Authorization: Bearer <token>`

**Body** (uno o ambos campos):
```json
{ "score_test": 130 }
{ "score_game": 75 }
```
> Actualizar solo los campos que lleguen en el body, sin tocar el otro.

**Respuesta exitosa:**
```json
{ "success": true, "message": "Puntaje actualizado" }
```

**Errores:**
```json
{ "success": false, "error": "Token requerido" }
{ "success": false, "error": "Token inválido o expirado" }
{ "success": false, "error": "Se requiere al menos score_test o score_game" }
{ "success": false, "error": "El puntaje del test debe ser un número" }
{ "success": false, "error": "El puntaje del juego debe ser un número" }
```

---

### `DELETE /user` — requiere JWT

**Header:** `Authorization: Bearer <token>`

Sin body. Elimina permanentemente la cuenta del usuario identificado por el token.

**Respuesta exitosa:**
```json
{ "success": true, "message": "Cuenta eliminada" }
```

**Errores:**
```json
{ "success": false, "error": "Token requerido" }
{ "success": false, "error": "Token inválido o expirado" }
{ "success": false, "error": "Usuario no encontrado" }
```

---

### `POST /user/favorites` — requiere JWT

**Header:** `Authorization: Bearer <token>`

**Body:**
```json
{ "content_id": "<_id del artículo o presentación>", "type": "article" }
```
> `type` acepta solo `"article"` o `"presentation"`.

**Respuesta exitosa:**
```json
{ "success": true, "message": "Favorito agregado" }
```

**Errores:**
```json
{ "success": false, "error": "Token requerido" }
{ "success": false, "error": "El ID del contenido es requerido" }
{ "success": false, "error": "El tipo debe ser article o presentation" }
{ "success": false, "error": "Ya está en favoritos" }
{ "success": false, "error": "Usuario no encontrado" }
```

---

### `GET /user/favorites` — requiere JWT

**Header:** `Authorization: Bearer <token>`

**Respuesta exitosa:**
```json
{
  "success": true,
  "favorites": [
    { "content_id": "664abc...", "type": "article" },
    { "content_id": "664def...", "type": "presentation" }
  ]
}
```

**Errores:**
```json
{ "success": false, "error": "Token requerido" }
{ "success": false, "error": "Usuario no encontrado" }
```

---

### `DELETE /user/favorites/:content_id` — requiere JWT

**Header:** `Authorization: Bearer <token>`

El `content_id` va en la URL: `/user/favorites/664abc123...`

**Respuesta exitosa:**
```json
{ "success": true, "message": "Favorito eliminado" }
```

**Errores:**
```json
{ "success": false, "error": "Token requerido" }
{ "success": false, "error": "Usuario no encontrado" }
{ "success": false, "error": "No se pudo eliminar el favorito" }
```

---

### `GET /tutorial` — público

Sin parámetros. Retorna el instructivo completo del juego con reglas y tarjetas.

**Respuesta exitosa:**
```json
{
  "success": true,
  "tutorial": {
    "_id": "...",
    "title": "Instructivo SOSTEK",
    "rules": "Recursos del pueblo: 20 fichas de c/u...",
    "cards": [
      {
        "name": "ALIANZA ESTRATÉGICA",
        "description": "Un reconocido grupo farmacéutico...",
        "type": "scenario",
        "resources": { "ambiental": 0, "economico": 0, "social": 0 }
      },
      {
        "name": "APICULTORES",
        "description": "Implementaste un programa de rescate...",
        "type": "solution",
        "resources": { "ambiental": 2, "economico": -2, "social": 0 }
      }
    ]
  }
}
```
> `type: "scenario"` = tarjeta de escenario (problema) · `type: "solution"` = tarjeta de solución
> Hay 16 tarjetas de escenario y 32 de solución (48 en total)

**Errores:**
```json
{ "success": false, "error": "Tutorial no encontrado" }
```

---

## Rate limiting

Aplicar a `/user/signup`, `/user/login` y `/user/forgot-password`: 10 requests por IP cada 15 minutos.

```json
{ "success": false, "error": "Demasiados intentos, intenta más tarde" }
```
