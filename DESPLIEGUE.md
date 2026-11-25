# Despliegue

> Cómo llega cada pieza de Sostek a producción, qué variables necesita y cómo se deshace un deploy.
> De quién es cada cuenta y cómo pedir acceso está en [`ACCESOS.md`](ACCESOS.md).

## Resumen

| Pieza | Servicio | URL | Cómo se publica |
|---|---|---|---|
| Frontend (oficial) | Vercel | https://sostek.vercel.app | Solo, al integrar a `main` de `SostekMX/Sostek` |
| Backend | Render (web service `sostek-backend`) | https://sostek-backend.onrender.com | Solo, al integrar a `main` de `SostekMX/Sostek-backend` |
| Base de datos | MongoDB Atlas, base `SostekDB` | — | No se despliega: el contenido se carga con los seeds |
| Imágenes | Cloudinary | `res.cloudinary.com/...` | Con `seed:presentations`, o desde la app (avatares) |
| Monitor | UptimeRobot | — | Le pega a `/health` cada 5 minutos para que Render no duerma el backend |

**El flujo normal** es el mismo en los dos repos:
1. Rama → PR a `development` (corre CI).
2. PR de `development` a `main` (corre CI otra vez).
3. Al integrarse, Vercel o Render publican solos en unos minutos.

Después revisa dos cosas:
- `https://sostek-backend.onrender.com/health` responde `{"status":"ok"}`;
- `https://sostek.vercel.app` muestra artículos en APRENDE. Ábrelo en una ventana privada: la app guarda contenido en caché y puede esconder un backend caído.

**Si un cambio toca los dos repos**, publica primero el backend, de forma que siga aceptando lo que manda el frontend actual. Ya publicado el backend, publica el frontend.

## Frontend en Vercel

- **Configuración en el repo:** `vercel.json`. Compila con `npm run build`, publica la carpeta `build/` y manda todas las rutas a `index.html`, para que funcionen los links directos como `/quiz`.
- **Variable del proyecto en Vercel:** `REACT_APP_BACKEND_URL=https://sostek-backend.onrender.com`. Se inyecta al compilar: si la cambias, hay que volver a desplegar.
- **Node:** sale de `engines` en `package.json` (24.x).
- **Vercel compila con `CI=1`.** Así, Create React App convierte cualquier warning de ESLint en error y el deploy falla. CI del repo corre el mismo build, de modo que el problema aparece en el PR.
- **Previews:** cada PR recibe una URL de preview, pero CORS del backend solo deja pasar `sostek.vercel.app`. En un preview la app abre, pero no carga datos del backend.
- **Rollback:** en Vercel, ve a **Deployments**, elige el deploy anterior y usa **Instant Rollback**. También puedes hacer `git revert` del merge en `main`.

## Backend en Render

- **Servicio web `sostek-backend`**, conectado a `main` del repo del backend con auto-deploy.
- **Comandos.** Revísalos en **Settings → Build & Deploy**; lo esperado es build `npm install` y start `npm start` (`node -r dotenv/config src/index.js`).
  - Render no compila TypeScript: corre los `.js` commiteados.
  - CI revisa que esos `.js` coincidan con los `.ts`.
- **Node:** sale de `engines` en `package.json` (24.x).
- **Variables** (en **Environment**). Todas están explicadas en el `.env.example` del backend.

| Variable | Valor en producción | Nota |
|---|---|---|
| `DB_URL` | Connection string de Atlas | Requerida |
| `JWT_CODE` | Secreto largo y aleatorio | Requerida. Si cambia, todas las sesiones abiertas se cierran |
| `CORS_ORIGIN` | `https://sostek.vercel.app` | Orígenes extra, separados por coma (ver «CORS y dominio propio») |
| `FRONTEND_URL` | `https://sostek.vercel.app` | Arma el link del correo de recuperación de contraseña |
| `EMAIL_USER`, `EMAIL_PASS` | Cuenta de Gmail y su contraseña de aplicación | Sin ellas, la recuperación de contraseña no manda correos |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Credenciales de Cloudinary | Para subir avatares |

`PORT` lo pone Render.

- **Si el servidor no arranca**, el log del deploy dice por qué: `[config] Falta JWT_CODE…` o `[db] No se pudo conectar a MongoDB en …`.
- **Si el servicio está en el plan gratuito**, se duerme tras unos minutos sin visitas, y la primera petición tarda cerca de un minuto en despertarlo. Para eso está el monitor de UptimeRobot.
- **Rollback:** en el panel de Render, ve a los deploys anteriores y usa **Rollback**. También puedes hacer `git revert` del merge en `main`.

## Base de datos (MongoDB Atlas)

- **Base `SostekDB`.** Las colecciones están descritas en `ARQUITECTURA.md` §3. La de `users` tiene datos personales.
- **Acceso:**
  - un usuario de base de datos por persona (**Database Access**);
  - la IP de quien se conecta, en **Network Access**.
- **Cargar o actualizar contenido** desde una máquina con el `DB_URL` de Atlas en el `.env` del backend:
  - `npm run seed:content`, `npm run seed:quiz` y `npm run seed:tutorial`;
  - los dos primeros son idempotentes y no borran nada.
- **Respaldo**, con [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools):
  ```bash
  mongodump --uri="<DB_URL>" --out=respaldo/<fecha>
  ```
  El respaldo incluye datos personales: guárdalo en un lugar privado, **nunca en el repo**, que es público. Si el cluster es el gratuito (M0), Atlas no hace respaldos automáticos.
- **Restaurar una sola colección:**
  ```bash
  mongorestore --uri="<DB_URL>" --nsInclude=SostekDB.<coleccion> --drop respaldo/<fecha>
  ```

## CORS y dominio propio

El backend solo responde a los orígenes de su lista: `localhost:3000`, `localhost:8100` y los de `CORS_ORIGIN`. Un origen que no esté ahí no puede pedir **nada**, ni siquiera el contenido público.

Para publicar en un dominio nuevo (por ejemplo, `app.sostek.com.mx`, si la facultad asigna uno):
1. En Vercel, ve a **Domains** y agrega el dominio. Configura en el proveedor el DNS que pida Vercel.
2. En Render, agrega el dominio a `CORS_ORIGIN` (separado por coma) y cambia `FRONTEND_URL` a ese dominio.
3. Revisa en una ventana privada que el dominio nuevo cargue contenido y que el correo de recuperación apunte a él.

## Sitios abandonados

| Sitio | Qué es | Estado |
|---|---|---|
| `sostek-frontend.onrender.com` | Sitio estático de Render que se usó antes de Vercel | Se sigue publicando con cada push a `main`, pero CORS no lo deja pasar, así que no carga contenido. **Pendiente de baja** |
| `sostek.pages.dev` | Cloudflare Pages con la versión de 2022, de antes del backend | Lo administra un colaborador anterior. **Pendiente de baja o redirección** a `sostek.vercel.app` |

Quién puede darlos de baja está en `ACCESOS.md`.

## Apps nativas (iOS y Android)

El frontend está envuelto en Capacitor 4 (`capacitor.config.ts`: `appId` `com.itesm.sostek`, `webDir` `build`). **Las apps nunca se publicaron**: el proyecto de iOS no tiene equipo de firma y `android/` no existe (está en `.gitignore`). Nada de esta sección se probó en la entrega de noviembre de 2026, porque no había Mac disponible.

**iOS** (necesita macOS, Xcode y CocoaPods):

```bash
npm run build
npx cap sync ios
npx cap open ios      # en Xcode: elige el equipo de firma y corre en simulador o en un iPhone
```

**Android** (necesita Android Studio):

```bash
npx cap add android   # solo la primera vez: crea android/. Si se adopta, quítalo de .gitignore y versiónalo
npm run build
npx cap sync android
npx cap open android
```

**Íconos y splash:** `npx @capacitor/assets generate` parte de `assets/logo.png`.

**Antes de publicar en las tiendas:**
- **CORS.** La app nativa le pide al backend desde su propio origen: `capacitor://localhost` en iOS y `http://localhost` en Android. Hay que agregar los dos a `CORS_ORIGIN`; si no, la app abre vacía.
- **Versión de Capacitor.** Capacitor 4 es de 2022, y las tiendas exigen SDKs recientes: Google Play pide un `targetSdkVersion` actual y Apple, un Xcode reciente. Lo más probable es que haya que actualizar Capacitor, y con él Ionic, antes de publicar.
- **Cuentas.** Publicar requiere Apple Developer Program (pago anual) y Google Play Console (pago único), de preferencia a nombre de la institución (ve `ACCESOS.md`).
