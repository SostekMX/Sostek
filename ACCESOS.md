# Accesos y cuentas

> Qué cuentas usa Sostek, quién las administra y cómo pedir acceso.
> **Aquí no van contraseñas, llaves ni datos personales: el repo es público.** Las credenciales viven en las variables de cada servicio (ver [`DESPLIEGUE.md`](DESPLIEGUE.md)), y los datos de contacto personales, en el documento de entrega que tiene coordinación.
> Última revisión: 24 de noviembre de 2026.

## Cuentas en uso

| Servicio | Para qué | Quién lo administra | Cómo pedir acceso | Al cambiar de responsable |
|---|---|---|---|---|
| **GitHub**, org `SostekMX` | Los dos repos, CI y el disparo de los deploys | Los owners que aparecen en [github.com/orgs/SostekMX/people](https://github.com/orgs/SostekMX/people). Responsable del proyecto: **sin identificar, pendiente para coordinación** | Pedirle a un owner que te invite a la org con permiso de escritura | Quitar el acceso de quien sale y dejar al menos dos owners que sigan en el proyecto |
| **Vercel**, proyecto del frontend | Publica `sostek.vercel.app` | **Sin identificar, pendiente para coordinación** | Pedirle al dueño que te agregue o que te transfiera el proyecto | Transferir el proyecto si estaba en una cuenta personal |
| **Render**, servicio `sostek-backend` | Corre la API | **Sin identificar, pendiente para coordinación** | Pedirle al dueño de la cuenta acceso al servicio | Transferir el servicio si estaba en una cuenta personal; rotar las variables que conocía quien sale |
| **MongoDB Atlas**, base `SostekDB` | Todos los datos, incluidos los datos personales de los usuarios | **Sin identificar, pendiente para coordinación** | Pedir un usuario de base de datos propio (**Database Access**) y que agreguen tu IP (**Network Access**). No se comparte un mismo usuario | Borrar el usuario de quien sale |
| **Cloudinary** | Las slides de las presentaciones y las fotos de perfil | **Sin identificar, pendiente para coordinación** | Pedir que te agreguen como usuario de la cuenta | Rotar el API secret y actualizarlo en Render |
| **Gmail**, correo que manda la recuperación de contraseña | Los correos de recuperación de contraseña | **Sin identificar, pendiente para coordinación** | No hace falta entrar a la cuenta: su contraseña de aplicación vive en Render | Generar una contraseña de aplicación nueva y actualizarla en Render. De preferencia, usar un correo del proyecto o institucional |
| **UptimeRobot** | Hace ping a `/health` para que Render no duerma el backend | **Sin identificar, pendiente para coordinación** | Pedir acceso, o crear un monitor HTTP nuevo a `https://sostek-backend.onrender.com/health` cada 5 minutos con el correo del proyecto | Pasar el monitor a otra cuenta |
| **Google Drive**, zip del juego físico | El botón de descarga de JUEGA (`src/pages/tab2/Tab2.tsx`) | **Sin identificar, pendiente para coordinación** | No hace falta: el archivo es público | Copiarlo a un Drive institucional y cambiar el link |

**Para trabajar en el código no necesitas ninguna de estas cuentas**, salvo GitHub. `npm run dev:memoria`, en el backend, levanta la app completa con el contenido real sin Atlas ni ninguna otra credencial (ve «Tus primeros 30 minutos» en [`ONBOARDING_FRONTEND.md`](ONBOARDING_FRONTEND.md)). Las demás cuentas solo hacen falta para publicar o para tocar producción.

## Cuentas y sitios que ya no se usan

| Qué | Estado |
|---|---|
| Render, sitio estático `sostek-frontend` | Abandonado y **pendiente de baja**: el frontend oficial está en Vercel desde junio de 2026 |
| Cloudflare Pages, `sostek.pages.dev` | Versión de 2022, de antes del backend. La administra un colaborador anterior. **Pendiente de baja o redirección** a `sostek.vercel.app` |
| Google Sheets de las evaluaciones | Fuente histórica: el contenido vive en `seed/content` del backend. Conviene copiarlas a un Drive institucional como archivo |
| Proyecto de Google Cloud de la versión vieja | Era de la API de Sheets y Drive que se usaba en 2022. Ya no se usa: conviene que su dueño lo dé de baja |
| Apple Developer y Google Play | No hay registro de que existan: las apps nativas nunca se publicaron (ver `DESPLIEGUE.md`) |

## Contactos

| Rol | Para qué | Contacto |
|---|---|---|
| Coordinación del servicio social | Accesos, dueños de las cuentas y dominio propio | Pendiente: lo llena coordinación |
| Carlos, autor del quiz de proyectos de negocio | El contenido y la retroalimentación del quiz | Pendiente: lo llena coordinación |
| Quien revisa la app (QA manual) | Correcciones de contenido y de diseño | Pendiente: lo llena coordinación |

Aquí solo van cargos y canales institucionales. Nada de correos ni teléfonos personales.

## Al entrar y al salir

**Al entrar:**
1. Pide acceso de escritura a los dos repos en GitHub.
2. Sigue «Tus primeros 30 minutos» en `ONBOARDING_FRONTEND.md`.
3. Pide los demás accesos solo cuando vayas a publicar o a tocar producción, y solo los que necesites.

**Al salir o al cambiar de responsable:**
1. Pasa a la siguiente persona, o a una cuenta institucional, todo lo que esté a tu nombre: el proyecto de Vercel, los servicios de Render y el monitor de UptimeRobot.
2. Cambia lo que conocías:
   - la contraseña de tu usuario de Atlas (o bórralo);
   - el API secret de Cloudinary;
   - la contraseña de aplicación de Gmail.
   Después actualiza las variables en Render.
3. Deja actualizado este archivo y la columna «Quién lo administra».
