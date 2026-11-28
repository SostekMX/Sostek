# Accesos y cuentas

> Qué cuentas usa Sostek, quién las administra y cómo pedir acceso.
> **Aquí no van contraseñas, llaves ni datos personales: el repo es público.** Las credenciales viven en las variables de cada servicio (ver [`DESPLIEGUE.md`](DESPLIEGUE.md)). Los datos de contacto se los pides a la encargada del servicio social.
> Última revisión: 27 de noviembre de 2026.

## Cuentas en uso

| Servicio | Para qué | Quién lo administra | Cómo pedir acceso | Al cambiar de responsable |
|---|---|---|---|---|
| **GitHub**, org `SostekMX` | Los dos repos, CI y el disparo de los deploys | **La encargada del servicio social**, que es admin de la org. Los owners aparecen en [github.com/orgs/SostekMX/people](https://github.com/orgs/SostekMX/people) | Pídele a la encargada del servicio social que te invite a la org con permiso de escritura | Quitar el acceso de quien sale y dejar al menos dos owners que sigan en el proyecto |
| **Vercel**, proyecto del frontend | Publica `sostek.vercel.app` | Sigue en la cuenta de un alumno anterior | No se puede pedir: la cuenta no se va a transferir. Para publicar no hace falta entrar, porque Vercel publica solo al integrar a `main` | Se decide con la migración a Supabase (ve abajo) |
| **Render**, servicio `sostek-backend` | Corre la API | Sigue en la cuenta de un alumno anterior | No se puede pedir: la cuenta no se va a transferir. Render publica solo al integrar a `main` | No se transfiere: el backend se va a migrar a Supabase (ve abajo) |
| **MongoDB Atlas**, base `SostekDB` | Todos los datos, incluidos los datos personales de los usuarios | Sigue en la cuenta de un alumno anterior | No se puede pedir: la cuenta no se va a transferir. Para trabajar en el código no hace falta (ve abajo) | No se transfiere: la base se va a migrar a Supabase (ve abajo) |
| **Cloudinary** | Las slides de las presentaciones y las fotos de perfil | Sigue en la cuenta de un alumno anterior | No se puede pedir: la cuenta no se va a transferir | Se decide con la migración a Supabase (ve abajo) |
| **Gmail**, correo que manda la recuperación de contraseña | Los correos de recuperación de contraseña | Sin identificar | No hace falta entrar a la cuenta: su contraseña de aplicación vive en Render | Generar una contraseña de aplicación nueva y actualizarla en el servidor. De preferencia, usar un correo del proyecto o institucional |
| **UptimeRobot** | Hace ping a `/health` para que Render no duerma el backend | Sin identificar | Crear un monitor HTTP nuevo a `https://sostek-backend.onrender.com/health` cada 5 minutos con el correo del proyecto | Pasar el monitor a otra cuenta |
| **Google Drive**, zip del juego físico | El botón de descarga de JUEGA (`src/pages/tab2/Tab2.tsx`) | Sin identificar | No hace falta: el archivo es público | Copiarlo a un Drive institucional y cambiar el link |

**Para trabajar en el código no necesitas ninguna de estas cuentas**, salvo GitHub. `npm run dev:memoria`, en el backend, levanta la app completa con el contenido real sin Atlas ni ninguna otra credencial (ve «Tus primeros 30 minutos» en [`ONBOARDING_FRONTEND.md`](ONBOARDING_FRONTEND.md)). Con acceso de escritura en GitHub ya puedes publicar: Vercel y Render despliegan solos lo que se integra a `main`.

## Migración a Supabase (próximo semestre)

- **Qué cambia.** El backend y la base de datos van a pasar de Render y MongoDB Atlas a Supabase.
- **Quién la hace.** El alumno anterior (ve «Contactos»).
- **Mientras tanto,** la app sigue funcionando en las cuentas actuales. Esas cuentas no se van a transferir.
- **Vercel y Cloudinary** se deciden en la migración.

Este repo y `ARQUITECTURA.md` describen lo que corre hoy: Express, Mongo y Render.

## Cuentas y sitios que ya no se usan o se descartaron

| Qué | Estado |
|---|---|
| Render, sitio estático `sostek-frontend` | Abandonado y **pendiente de baja**: el frontend oficial está en Vercel desde junio de 2026. Está en la misma cuenta que el backend |
| Cloudflare Pages, `sostek.pages.dev` | Versión de 2022, de antes del backend. La administra un colaborador anterior. **Pendiente de baja o redirección** a `sostek.vercel.app` |
| Google Sheets de las evaluaciones | Fuente histórica: el contenido vive en `seed/content` del backend. Conviene copiarlas a un Drive institucional como archivo |
| Proyecto de Google Cloud de la versión vieja | Era de la API de Sheets y Drive que se usaba en 2022. Ya no se usa: conviene que su dueño lo dé de baja |
| Dominio propio | **Descartado** (noviembre de 2026): la app se queda en `sostek.vercel.app` |
| Apple Developer y Google Play | **Descartados** (noviembre de 2026): no habrá apps en App Store ni en Google Play. Los pasos de Capacitor quedan como referencia en `DESPLIEGUE.md` |

## Contactos

| Rol | Para qué | Cómo contactarlo |
|---|---|---|
| La encargada del servicio social | Acceso a GitHub, dudas del servicio social y los contactos de los demás | Por la coordinación del servicio social |
| El alumno anterior | Contacto técnico: el código, el despliegue y la migración a Supabase | Pídele su contacto a la encargada del servicio social |
| El autor del contenido del quiz | Las preguntas, los puntos y la retroalimentación del quiz | Por medio de la encargada del servicio social |

Aquí solo van cargos. Nada de nombres, correos ni teléfonos personales.

## Al entrar y al salir

**Al entrar:**
1. Pídele a la encargada del servicio social acceso de escritura a los dos repos en GitHub.
2. Sigue «Tus primeros 30 minutos» en `ONBOARDING_FRONTEND.md`.
3. Si tienes dudas técnicas, búscala a ella o al alumno anterior.

**Al salir o al cambiar de responsable:**
1. Si alguna cuenta del proyecto quedó a tu nombre, déjale acceso a la encargada del servicio social o pásala a una cuenta institucional.
2. Cambia lo que conocías:
   - tus contraseñas y usuarios de base de datos;
   - las llaves de los servicios (Cloudinary, Gmail).
   Después actualiza las variables del servidor.
3. Deja actualizado este archivo.
