# Integración Backend — SOSTEK

> Documento de referencia para el servidor Node.js/Express en `http://localhost:8080`  
> Última actualización: 2026-05-29  
> Cubre: endpoints requeridos, contratos de respuesta, seguridad, rate limiting

---

## Stack esperado del backend

| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Autenticación | JWT (`jsonwebtoken`) |
| Hash de contraseñas | `bcrypt` |
| Base de datos | MongoDB (u otra — los campos del modelo son los relevantes) |
| Rate limiting | `express-rate-limit` |
| CORS | Habilitado para `http://localhost:3000` (desarrollo) |

---

## Modelo de usuario

```js
{
  _id,
  email,          // String, único, requerido
  password,       // String hasheado con bcrypt, nunca se devuelve en respuestas
  name,           // String, requerido
  surname,        // String, requerido
  birth_date,     // Date, opcional
  occupation,     // String, opcional
  gender,         // String, opcional  ← ver nota de valores abajo
  score_test,     // Number, default 0
  score_game,     // Number, default 0
}
```

> **Nota sobre `gender`:** El frontend actualmente envía `'masculino'` o `'femenino'`. El backend debe aceptar esos valores o el backend y frontend deben acordar el formato (p.ej. `'M'`/`'F'`) y actualizarlo en ambos lados de forma consistente.

---

## Autenticación JWT

- El token se firma con una clave secreta en el servidor
- Payload del token: `{ id: usuario._id, email: usuario.email }`
- Expiración recomendada: 7 días (o la que acuerden)
- El token se devuelve en login y signup exitosos
- El frontend lo guarda en `localStorage` con la clave `'token'`
- Los endpoints protegidos leen el token del header `Authorization: Bearer <token>`

**Middleware de autenticación requerido:**
```js
// Aplicar a todos los endpoints protegidos
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

## Rate Limiting

Aplicar a `/user/signup` y `/user/login`:

- **Límite:** 10 requests por IP cada 15 minutos
- **Respuesta al superar el límite:**
```json
{ "success": false, "error": "Demasiados intentos, intenta más tarde" }
```

---

## Endpoints requeridos

### `POST /user/signup` — público

**Validaciones requeridas:**
- `email`: formato válido de correo; no puede estar ya registrado
- `password`: mínimo 6 caracteres
- `name`: requerido, no vacío
- `surname`: requerido, no vacío
- `birth_date`, `occupation`, `gender`: opcionales

**Comportamiento:**
1. Validar campos
2. Hashear password con bcrypt
3. Crear usuario en BD
4. Generar y devolver JWT

**Respuesta exitosa:**
```json
{ "success": true, "token": "<jwt>" }
```

**Errores posibles:**
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

**Validaciones requeridas:**
- `email`: formato válido
- `password`: no vacío; comparar con bcrypt contra el hash almacenado

**Comportamiento:**
1. Buscar usuario por email
2. Comparar password con bcrypt
3. Generar y devolver JWT

**Respuesta exitosa:**
```json
{ "success": true, "token": "<jwt>" }
```

**Errores posibles:**
```json
{ "success": false, "error": "Correo inválido" }
{ "success": false, "error": "La contraseña es requerida" }
{ "success": false, "error": "Cuenta no registrada" }
{ "success": false, "error": "Contraseña incorrecta" }
{ "success": false, "error": "Demasiados intentos, intenta más tarde" }
```

---

### `POST /user/edit` — requiere JWT ⚠️

**Headers requeridos:** `Authorization: Bearer <token>`

**Body aceptado:**
```json
{
  "name": "Juan",
  "surname": "Pérez",
  "birth_date": "1999-05-15",
  "occupation": "Estudiante",
  "gender": "masculino"
}
```

> El campo `email` puede llegar en el body pero debe **ignorarse** — el email se lee del token JWT, nunca del body.

**Validaciones:**
- `name`: requerido, no vacío
- `surname`: requerido, no vacío
- `birth_date`, `occupation`, `gender`: opcionales

**Comportamiento:**
1. Leer `email` (o `id`) del token decodificado
2. Actualizar los campos del usuario en BD
3. No actualizar `email` ni `password` desde este endpoint

**Respuesta exitosa:**
```json
{ "success": true, "message": "Usuario actualizado" }
```

**Errores posibles:**
```json
{ "success": false, "error": "Token requerido" }
{ "success": false, "error": "Token inválido o expirado" }
{ "success": false, "error": "El nombre es requerido" }
{ "success": false, "error": "El apellido es requerido" }
{ "success": false, "message": "No se pudo actualizar información del usuario" }
```

---

### `GET /user/profile` — requiere JWT 🆕

**Headers requeridos:** `Authorization: Bearer <token>`

**Comportamiento:**
1. Leer `id` del token decodificado
2. Buscar usuario en BD por `id`
3. Devolver todos los campos **excepto** `password`

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

> La `password` **nunca** debe incluirse en la respuesta.

**Errores posibles:**
```json
{ "success": false, "error": "Token requerido" }
{ "success": false, "error": "Token inválido o expirado" }
{ "success": false, "error": "Usuario no encontrado" }
```

---

### `POST /user/score` — requiere JWT 🆕

Llamado al terminar una evaluación (Tab 3) o una partida del juego (Tab 2).

**Headers requeridos:** `Authorization: Bearer <token>`

**Body** — uno o ambos campos:
```json
{ "score_test": 130 }
{ "score_game": 75 }
{ "score_test": 130, "score_game": 75 }
```

**Validaciones:**
- Se debe enviar al menos uno de los dos campos
- Los valores deben ser números

**Comportamiento:**
1. Leer `id` del token
2. Actualizar `score_test` y/o `score_game` en BD
3. Solo actualizar los campos que lleguen en el body

**Respuesta exitosa:**
```json
{ "success": true, "message": "Puntaje actualizado" }
```

**Errores posibles:**
```json
{ "success": false, "error": "Token requerido" }
{ "success": false, "error": "Token inválido o expirado" }
{ "success": false, "error": "El puntaje del test debe ser un número" }
{ "success": false, "error": "El puntaje del juego debe ser un número" }
{ "success": false, "error": "Se requiere al menos score_test o score_game" }
```

---

### `DELETE /user` — requiere JWT 🆕

Elimina permanentemente la cuenta del usuario autenticado.

**Headers requeridos:** `Authorization: Bearer <token>`

**Comportamiento:**
1. Leer `id` del token
2. Buscar y eliminar el usuario de la BD
3. No requiere body

**Respuesta exitosa:**
```json
{ "success": true, "message": "Cuenta eliminada" }
```

**Errores posibles:**
```json
{ "success": false, "error": "Token requerido" }
{ "success": false, "error": "Token inválido o expirado" }
{ "success": false, "error": "Usuario no encontrado" }
```

---

## CORS

El servidor debe aceptar requests desde el frontend durante desarrollo:

```js
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8100'], // puerto Ionic
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## Resumen de endpoints

| Método | Ruta | Auth | Estado |
|--------|------|------|--------|
| `POST` | `/user/signup` | No | ✅ Requerido |
| `POST` | `/user/login` | No | ✅ Requerido |
| `POST` | `/user/edit` | JWT ⚠️ | ✅ Requerido (ahora protegido) |
| `GET` | `/user/profile` | JWT | 🆕 Nuevo |
| `POST` | `/user/score` | JWT | 🆕 Nuevo |
| `DELETE` | `/user` | JWT | 🆕 Nuevo |
