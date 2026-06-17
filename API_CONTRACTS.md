# API_CONTRACTS — Contratos del backend

> Reemplaza la info de contratos que antes vivía en `INFO_FRONTEND.md` / `INFO_PARA_BACKEND.md` (ya borrados, ver `ONBOARDING_FRONTEND.md`). Documenta el comportamiento **actual** de cada endpoint tal como lo consume el frontend en `src/api/` (`auth.ts`, `user.ts`, `content.ts`).
>
> El backend no está en este repo — si algo de aquí queda desactualizado respecto al backend real, corregir este archivo y avisar al equipo de backend directamente (ya no hay un archivo de comunicación dedicado).
>
> Todas las respuestas son JSON. `success: false` siempre viene con `error` (string). Los endpoints protegidos requieren el header `Authorization: Bearer <token>`.

---

## Autenticación (`src/api/auth.ts`)

### `POST /user/signup` — público

**Body**
```json
{
  "email": "juan@ejemplo.com",
  "password": "minimo8caracteres",
  "name": "Juan",
  "surname": "Pérez",
  "birth_date": "2000-01-15",
  "occupation": "Estudiante",
  "gender": "masculino"
}
```
> `birth_date`, `occupation` y `gender` son opcionales.

**Respuesta exitosa**
```json
{ "success": true, "token": "<jwt>" }
```

**Errores**
| `error` | Causa |
|---|---|
| `"Correo inválido"` | Email mal formado |
| `"La contraseña debe tener al menos 8 caracteres"` | Password corto |
| `"El nombre es requerido"` | `name` vacío o ausente |
| `"El apellido es requerido"` | `surname` vacío o ausente |
| `"Correo ingresado está ya registrado en la plataforma"` | Email duplicado |
| `"Demasiados intentos, intenta más tarde"` | Rate limit (10 req / 15 min) |

---

### `POST /user/login` — público

**Body**
```json
{ "email": "juan@ejemplo.com", "password": "micontraseña" }
```

**Respuesta exitosa**
```json
{ "success": true, "token": "<jwt>" }
```

**Errores**
| `error` | Causa |
|---|---|
| `"Correo inválido"` | Email mal formado |
| `"La contraseña es requerida"` | `password` vacío |
| `"Correo o contraseña incorrectos"` | Email no registrado **o** password incorrecto — mensaje unificado a propósito, no distinguir cuál de los dos en la UI |
| `"Demasiados intentos, intenta más tarde"` | Rate limit (10 req / 15 min) |

---

### `POST /user/forgot-password` — público

Envía un email con un link de recuperación válido por **1 hora**. El token **no** viene en la respuesta — solo llega por email.

**Body**
```json
{ "email": "juan@ejemplo.com" }
```

**Respuesta exitosa**
```json
{ "success": true, "message": "Si el correo está registrado, recibirás instrucciones en tu bandeja de entrada" }
```
> ⚠️ La respuesta es **siempre la misma** exista o no el email — así no se puede usar este endpoint para averiguar qué correos están registrados. El frontend solo muestra el mensaje, no hace nada más.

El email contiene un link: `https://<dominio-frontend>/ResetPassword?token=<token>` (y el token en texto plano por si el link falla).

**Errores**
| `error` | Causa |
|---|---|
| `"Correo inválido"` | Email mal formado |
| `"Demasiados intentos, intenta más tarde"` | Rate limit (10 req / 15 min) |

---

### `POST /user/reset-password` — público

Cambia la contraseña usando el token de `/user/forgot-password`. El token se invalida tras usarse.

**Body**
```json
{ "token": "<token recibido por email>", "new_password": "nuevacontraseña" }
```

**Respuesta exitosa**
```json
{ "success": true, "message": "Contraseña actualizada" }
```

**Errores**
| `error` | Causa |
|---|---|
| `"El token es requerido"` | Campo `token` ausente |
| `"La contraseña debe tener al menos 8 caracteres"` | `new_password` corto |
| `"Token inválido"` | Token no existe en la base de datos |
| `"Token expirado"` | Pasaron más de 60 minutos desde que se generó |

> El frontend lee el token de la URL con `new URLSearchParams(window.location.search).get('token')`, no de `sessionStorage`.

---

## Usuario (`src/api/user.ts`)

### `GET /user/profile` — requiere JWT

**Respuesta exitosa**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "Juan",
    "surname": "Pérez",
    "email": "juan@ejemplo.com",
    "birth_date": "2000-01-15",
    "occupation": "Estudiante",
    "gender": "masculino",
    "score_test": 0,
    "score_game": 0,
    "avatar": "https://res.cloudinary.com/.../sostek/avatars/foto.jpg"
  }
}
```
> `password`, `reset_token` y `reset_token_expiry` nunca deben venir en la respuesta.
> `avatar` es `""` si el usuario no subió foto.
> `favorites` **no** viene aquí — usar `GET /user/favorites`.

**Errores**
| `error` | Causa |
|---|---|
| `"Token requerido"` | Header `Authorization` ausente |
| `"Token inválido o expirado"` | JWT corrupto o vencido (7 días) |
| `"Usuario no encontrado"` | El usuario del token ya no existe |

---

### `POST /user/edit` — requiere JWT

Actualiza datos del perfil. El usuario se identifica por el JWT — **no enviar `email` en el body**, el backend lo ignora.

**Body**
```json
{ "name": "Juan", "surname": "Pérez", "birth_date": "2000-01-15", "occupation": "Ingeniero", "gender": "masculino" }
```
> Todos los campos son opcionales salvo `name`/`surname`; los que no se envían no se modifican.

**Respuesta exitosa**
```json
{ "success": true, "message": "Usuario actualizado" }
```

**Errores**
| `error` / `message` | Causa |
|---|---|
| `"Token requerido"` / `"Token inválido o expirado"` | Problema de JWT |
| `"El nombre es requerido"` / `"El apellido es requerido"` | Campo vacío |
| `"No se pudo actualizar información del usuario"` | Error interno de DB |

---

### `POST /user/avatar` — requiere JWT, `multipart/form-data`

**Form data**
| Campo | Tipo | Descripción |
|---|---|---|
| `avatar` | Archivo | JPG, PNG o WebP, máximo 5 MB |

**Respuesta exitosa**
```json
{ "success": true, "avatar_url": "https://res.cloudinary.com/.../sostek/avatars/foto.jpg" }
```

**Errores**
| `error` | Causa |
|---|---|
| `"Token requerido"` / `"Token inválido o expirado"` | Problema de JWT |
| `"La imagen es requerida"` | No se envió archivo |
| `"Formato no válido. Solo jpg, png o webp"` | Formato no permitido |
| `"La imagen no debe superar 5MB"` | Archivo muy grande |
| `"Error al subir imagen"` | Falla de conexión con Cloudinary |

---

### `DELETE /user` — requiere JWT

Elimina la cuenta permanentemente. Sin body.

**Respuesta exitosa**
```json
{ "success": true, "message": "Cuenta eliminada" }
```

**Errores**
| `error` | Causa |
|---|---|
| `"Token requerido"` / `"Token inválido o expirado"` | Problema de JWT |
| `"Usuario no encontrado"` | El usuario ya no existe |

---

### `POST /user/score` — requiere JWT

Actualiza puntaje de test, de juego, o ambos.

**Body** (al menos uno de los dos)
```json
{ "score_test": 145, "score_game": 80 }
```

**Respuesta exitosa**
```json
{ "success": true, "message": "Puntaje actualizado" }
```

**Errores**
| `error` | Causa |
|---|---|
| `"Token requerido"` / `"Token inválido o expirado"` | Problema de JWT |
| `"Se requiere al menos score_test o score_game"` | Body vacío |
| `"El puntaje del test debe ser un número"` / `"El puntaje del juego debe ser un número"` | Tipo inválido |

> El frontend solo llama este endpoint si hay token en `sessionStorage` (usuario logueado). Si es invitado, no se llama.

---

### `POST /user/favorites` — requiere JWT

**Body**
```json
{ "content_id": "<_id del artículo o presentación>", "type": "article" }
```
> `type` acepta solo `"article"` o `"presentation"`.

**Respuesta exitosa**
```json
{ "success": true, "message": "Favorito agregado" }
```

**Errores**
| `error` | Causa |
|---|---|
| `"Token requerido"` | Header ausente |
| `"El ID del contenido es requerido"` | `content_id` vacío |
| `"El tipo debe ser article o presentation"` | `type` inválido |
| `"Ya está en favoritos"` | Duplicado |
| `"Usuario no encontrado"` | El usuario ya no existe |

---

### `GET /user/favorites` — requiere JWT

**Respuesta exitosa**
```json
{
  "success": true,
  "favorites": [
    { "content_id": "664abc...", "type": "article" },
    { "content_id": "664def...", "type": "presentation" }
  ]
}
```

---

### `DELETE /user/favorites/:content_id` — requiere JWT

El `content_id` va en la URL.

**Respuesta exitosa**
```json
{ "success": true, "message": "Favorito eliminado" }
```

**Errores**
| `error` | Causa |
|---|---|
| `"Token requerido"` | Header ausente |
| `"Usuario no encontrado"` | El usuario ya no existe |
| `"No se pudo eliminar el favorito"` | Error interno de DB |

---

## Contenido (`src/api/content.ts`)

### `GET /articles` — público

```json
{
  "success": true,
  "articles": [
    {
      "_id": "...",
      "title": "...",
      "subtitle": "...",
      "type": "article",
      "body": "Primer párrafo.\nSegundo párrafo.",
      "image": "https://...",
      "author": "...",
      "author_image": "https://...",
      "page_image": "https://...",
      "category": "Ambiental",
      "tags": ["..."],
      "bibliography": "..."
    }
  ]
}
```
> `category` debe ser uno de `"Ambiental"`, `"Social"` o `"Económico"` — el frontend matchea contra esto al recomendar artículos tras una evaluación.
> El frontend invierte el array (`[...articles].reverse()`) para mostrar el más reciente primero, y divide `body` por `\n` para párrafos separados.

### `GET /articles/:id` — público

Mismo esquema que arriba, un solo artículo en `article`.

### `GET /presentations` — público

```json
{
  "success": true,
  "presentations": [
    { "_id": "...", "name": "...", "cover": "https://...", "slides": ["https://...", "https://..."] }
  ]
}
```
> `cover` es opcional — si no llega, el frontend usa `slides[0]` como portada.

### `GET /evaluations` — público

Lista **sin** preguntas.

```json
{
  "success": true,
  "evaluations": [
    { "_id": "...", "name": "Arquitectura Nivel 1", "career": "Arquitectura", "description": "...", "question_count": 8 }
  ]
}
```
> `career` acepta `"Arquitectura"`, `"Diseño Industrial"`, cualquier otro valor cae en el filtro "Otros" del frontend.

### `GET /evaluations/:id` — público

```json
{
  "success": true,
  "evaluation": {
    "_id": "...",
    "name": "Arquitectura Nivel 1",
    "career": "Arquitectura",
    "questions": [
      {
        "category": "Ambiental",
        "text": "...",
        "options": [{ "text": "Sí, completamente", "value": 10 }]
      }
    ]
  }
}
```
> `category` de cada pregunta debe ser exactamente `"Ambiental"` o `"Económico y Social"` — son los 2 únicos valores que el frontend mapea contra `articles.category` al recomendar artículos (`"Ambiental"` → artículos `category: "Ambiental"`; `"Económico y Social"` → artículos `category: "Económico"` **o** `"Social"`). Si esto no matchea, "Artículos recomendados" deja de funcionar — ver bug histórico C12/B6 en `AVANCE_SOSTEK.md`.

**Errores**
| `error` | Causa |
|---|---|
| `"Evaluación no encontrada"` | El `_id` no existe |

### `GET /tutorial` — público

```json
{
  "success": true,
  "tutorial": {
    "title": "Instructivo SOSTEK",
    "rules": "...",
    "cards": [
      { "name": "...", "description": "...", "type": "scenario", "resources": { "ambiental": 0, "economico": 0, "social": 0 } }
    ]
  }
}
```
> `type: "scenario"` (16 tarjetas) o `"solution"` (32 tarjetas), 48 en total.

**Errores**
| `error` | Causa |
|---|---|
| `"Tutorial no encontrado"` | Colección `tutorial` vacía en MongoDB |

---

## Variables de entorno relevantes del backend

No están en este repo, pero afectan directamente cómo se comporta el frontend en cada ambiente:

| Variable | Para qué |
|---|---|
| `CORS_ORIGIN` | Debe matchear la URL real del frontend desplegado, si no, todo lo que requiere JWT falla en producción aunque el endpoint esté bien. Ver estado actual en `AVANCE_SOSTEK.md` → "Despliegue". |
| Connection string de MongoDB | Sin esto el backend no levanta. |
| Credenciales de Cloudinary | Necesarias para `POST /user/avatar`; sin esto el upload de foto de perfil falla con `"Error al subir imagen"`. |
