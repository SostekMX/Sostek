# Avance — Guillermo

Log de trabajo. Cada entrada dice qué se tocó, qué se decidió y por qué.

## Estado actual (2026-10-26)

La rama de trabajo es ahora **`feat/escritorio-editorial`** (contiene a
`feat/juega-layout-desktop`): **78 commits** sobre `main` (`70de48f`), contando el que trae este resumen. El 2026-10-26 se hizo
una limpieza general (13 commits, ver `../Sostek-bitacora/NOTAS_SESION_2026-10-26.md`) y se
subió la rama con un PR a `main`, sin merge. Lo de abajo es el estado al 2026-10-05.

**Todo es local.** La rama `feat/juega-layout-desktop` lleva **40 commits** sobre
`main` (`70de48f`, sin tocar) y **ninguno está pusheado** a `origin`
(`github.com/SostekMX/Sostek`). Este resumen se commiteó junto con el conteo: es el
commit 40.

| Fecha | Commits | Qué |
| --- | --- | --- |
| 2026-09-07 | 11 | JUEGA (Tab2): layout de escritorio, poster del video, estado de carga y error |
| 2026-09-14 | 12 | EVALÚATE (Tab3): 8 arreglos de puntaje y datos, rediseño de la lista y del cuestionario |
| 2026-09-28 | 5 | APRENDE (Tab1): rediseño contra la base real de Atlas, más este resumen |
| 2026-10-05 | 12 | Auditoría general: 11 arreglos (puntaje, sesión, favoritos, textos, estados de error) y este log |

| Pestaña | Estado |
| --- | --- |
| APRENDE (Tab1) | Rediseñada: presentaciones arriba, artículos en grid por tema |
| JUEGA (Tab2) | Rediseñada: columnas en desktop, 48 cartas en grid |
| EVALÚATE (Tab3) | Arreglada y rediseñada: lista por carrera y nivel, cuestionario con progreso, resultado acotado |

**Configuración de la máquina** (fuera de git): el backend corre contra **Atlas**,
base `SostekDB`, con el connection string no-SRV (ver la sesión del 28). Lo que se haga
en localhost **escribe en la base de producción**.

**Pendiente:**
- Rotar la contraseña del usuario de Atlas, que llegó a pasar por el chat. Revisado el
  2026-10-05: **no está en `Sostek/.env`** (solo tiene la URL del backend); vive en
  `Sostek-backend/.env`, que no se versiona.
- Confirmar en Chrome normal el ahorro de `preload="metadata"` del video de JUEGA.
- Probar con una cuenta de prueba (no la de nadie real, porque es producción) los
  arreglos que escriben: guardar puntaje una sola vez, favoritos, cerrar sesión y
  eliminar cuenta. Están verificados por código y prueba unitaria, no en el navegador.
- Push y PR a `main`, cuando se decida.

## Sesión del 2026-09-07

| # | Tema | Commits |
| --- | --- | --- |
| 1 | Levantar el stack local (Mongo + backend + frontend) | ninguno — configuración de máquina |
| 2 | Rediseño de layout de la página JUEGA | `c1ffdb6` … `93128ae` |
| 3 | Dos arreglos técnicos en JUEGA | `f192ca4`, `ed1a335`, `8099c49` |

Todo vive en la rama **`feat/juega-layout-desktop`**. `main` sigue en `70de48f`,
sin tocar, y nada se pusheó al remoto.

---

## 1 · Levantar el stack local

Punto de partida: la creencia de que faltaba "una API key de la base de datos de
MongoDB" para poder ver información en localhost.

**Eso no era el problema.** MongoDB Atlas no usa API keys: necesita un
*connection string* (`DB_URL`) con usuario, contraseña y cluster, más una entrada
en el whitelist de IPs. Y resultó que no hacía falta Atlas para trabajar — con un
Mongo local en Docker y dos seeds, casi toda la app funciona.

### Por qué el backend no arrancaba

`Sostek-backend/.env` era una **copia byte a byte de `.env.example`** (mismo md5),
o sea puros placeholders. Dos consecuencias:

- `JWT_CODE` vacío → `jsonWebToken.sign()` lanza al intentar firmar
- `DB_URL` con placeholder → `mongoose.connect()` falla y, como
  `src/models/authModel.js:4-7` no tiene `.catch()` y corre al importar, el
  proceso se muere con un stack trace de Mongoose sin explicación

### Lo que se configuró

En `Sostek-backend/.env` (gitignoreado, no sale del repo):

```
PORT=8080
JWT_CODE=<96 hex, generado con crypto.randomBytes(48)>
DB_URL=mongodb://127.0.0.1:27017/SostekDB
FRONTEND_URL=http://localhost:3000
```

No se perdió nada al reescribirlo: se verificó por md5 que era idéntico al
`.example` antes de tocarlo. Cuando tengas el connection string de Atlas, solo
reemplazas la línea de `DB_URL`.

`EMAIL_USER` / `EMAIL_PASS` (recuperación de contraseña) y `CLOUDINARY_*`
(avatares y `seed:presentations`) quedaron sin configurar: son opcionales en local.

### Mongo en Docker

No hay `mongod` ni `mongosh` instalados en la máquina, así que:

```bash
docker run -d --name sostek-mongo -p 27017:27017 mongo:6
```

### Qué se pudo sembrar y qué no

| Seed | Resultado |
| --- | --- |
| `npm run seed:tutorial` | ✅ "Instructivo SOSTEK" con **48 tarjetas** |
| `npm run seed:evaluations` | ✅ **6 evaluaciones** — Arquitectura N1/N2/N3 (23/24/21 preguntas) y Diseño Industrial N1/N2/N3 (22/22/25) |
| `npm run seed:articles` | ❌ necesita `articles.csv`, que no está versionado |
| `npm run seed:presentations` | ❌ necesita credenciales de Cloudinary |

Por eso `/articles` y `/presentations` devuelven `[]` en local. Es lo esperado, no
un error.

### Verificación de endpoints

`/health`, `/evaluations`, `/tutorial`, y la cadena de auth completa:
signup → login → JWT → `GET /user/profile` con `Authorization: Bearer`,
devolviendo el perfil **sin** `password` ni `reset_token`.

Quedó un usuario de prueba en la base local: **`prueba@local.test` /
`prueba12345`** (solo sirve contra el Mongo de Docker de tu máquina).

### Una trampa que costó dos intentos

`POST /user/signup` respondía `{"success":false,"error":"El apellido es
requerido"}` mandando `lastname` y `birthdate`. Los validadores de
`express-validator` en `src/index.js:124-144` esperan **`surname`** y
**`birth_date`**. Antes de curlear un endpoint, conviene leer su cadena de
validadores: los nombres de campo no siempre son los obvios.

### Prender y apagar

```bash
docker start sostek-mongo                      # los datos se conservan
cd Sostek-backend && npm run dev:js            # backend en :8080
cd Sostek       && ionic serve --external -p=3000
docker stop sostek-mongo                       # apagar
```

### Sobre ARQUITECTURA.md

Confirmado que lo escribí yo en una sesión anterior (aparece la llamada al Write
en el transcript del 31 de agosto). Se agregó al `.gitignore` en vez de
commitearlo.

Al analizarlo salió **un dato desactualizado**: dice que hay que pasarle el ID de
la Google Sheet a `seed:evaluations`, pero `seed/seedEvaluations.js:8-13` ya trae
los 6 IDs hardcodeados, así que el script se basta solo.

---

## 2 · Rediseño de layout de la página JUEGA (Tab2)

Rama: `feat/juega-layout-desktop`

### El problema

`Tab2.css` tenía un solo breakpoint (`min-width: 640px`) que encerraba toda la
página en una columna de **600px centrada**. En un monitor de 1920px eso usaba
el **31% del ancho**; el resto era fondo verde vacío. Las 48 cartas del juego
(16 escenario + 32 solución) se apilaban en **una sola columna**, obligando a un
scroll larguísimo para explorarlas.

### Archivos tocados

| Archivo | Qué se hizo |
| --- | --- |
| `src/pages/tab2/Tab2.tsx` | 3 divs contenedores; el bloque de reglas se movió dentro de `.juega-top` |
| `src/pages/tab2/Tab2.css` | Escalera de breakpoints 640 / 1024 / 1440 + pulido de interacción |
| `.gitignore` | + `/Claude images/` y `ARQUITECTURA.md` |

### Commits

```
c1ffdb6  chore: ignora ARQUITECTURA.md y la carpeta Claude images
dd98ae9  refactor(tab2): agrupa el contenido de JUEGA en tres bloques
da0ca68  feat(tab2): reparte JUEGA en columnas y aprovecha el ancho en desktop
2e0c027  feat(tab2): afina el feedback tactil de la pagina JUEGA
4ef45d8  fix(tab2): pasa las reglas a ancho completo y acota el video
3de3427  docs: agrega AVANCE_GUILLERMO.md con el log del rediseno
93128ae  feat(tab2): mueve descarga y aviso a la columna derecha
```

---

### Decisiones de layout

**Agrupar en 3 bloques antes de tocar CSS.**
Los 11 bloques de la página eran hermanos sueltos de `.juega-page`. Para
repartirlos en columnas hacía falta que el DOM dijera lo mismo que el diseño, así
que se envolvieron en `.juega-top__media` (video + descarga + aviso),
`.juega-top__howto` (instructivo + stats + tipos de tarjeta) y las reglas, todo
dentro de `.juega-top`.

Se descartó resolverlo solo con CSS (`grid-template-areas` sobre los hermanos
planos) porque `juega-section-header` aparece dos veces con la misma clase y
habría hecho falta apoyarse en `:nth-of-type`, que se rompe en cuanto alguien
agrega un bloque.

**Mobile no se toca: es el estado base.**
`.juega-top` y sus dos hijos son `flex column` con `gap: 20px`, el mismo que
tenía `.juega-page`. Anidar flex columns con el mismo gap deja **exactamente** el
mismo ritmo vertical que la lista plana anterior. Todo el layout de escritorio
vive dentro de media queries, así que por debajo de 640px no hay ni una regla
nueva que aplique.

**Full bleed, sin tope de ancho** (decisión tuya). `max-width: none` y padding
lateral de 40px (48px desde 1440).

**Las reglas van a ancho completo, no en columna.**
Este fue el hallazgo del día. Primero se probó el tope superior en 3 columnas
(video | instructivo | reglas) y a 1440px dejaba un **hueco de 370px** bajo el
instructivo; a 1024px el hueco llegaba a **600px**. La causa es que las reglas
son 1163 caracteres: metidas en una columna angosta se vuelven altísimas, y no
existe reparto vertical que las empareje con el video.

La solución fue sacarlas de la fila y ponerlas como banda a ancho completo
debajo, con el texto en **multicolumna nativa**:

```css
.juega-rules__text { column-width: 24rem; column-gap: 40px; }
```

Una sola declaración: el navegador reparte 2 columnas a 1024px, 3 a 1440 y 4 a
1920, y cada línea queda en ~60 caracteres. Sin esto, a ancho completo una línea
llegaría a ~200 caracteres (lo cómodo para leer son 60-75).

**Se acotó el video a 420px de alto** (`object-fit: contain`). Sin tope crecía a
530px a 1920px — desproporcionado para una animación de logo de 2 minutos — y
desbalanceaba la fila. A 1440px no llega a activarse. En mobile y tablet se deja
el `cover` de 260/340px que ya existía.

**Cartas en grid con `auto-fill`.**
`repeat(auto-fill, minmax(300px, 1fr))`: 2 columnas a 768px, 3 a 1024, 4 a 1440 y
5-6 a 1920. Se prefirió `auto-fill` sobre un número fijo por breakpoint porque se
adapta solo a cualquier ancho, incluso monitores ultrawide.

Las tarjetas pasaron a `display: flex; flex-direction: column` con
`margin-top: auto` en la fila de recursos, para que los 🌿💰👥 queden alineados al
pie cuando el grid iguala alturas dentro de una fila.

**Los filtros perdieron `flex: 1`** en desktop. A ancho completo cada pill se
estiraba a media pantalla. Ahora son `flex: 0 0 auto` con `min-width: 170px`.

---

### Pulido de interacción

Cambios de 1-3 líneas, sin tocar ni un color:

| Antes | Después | Por qué |
| --- | --- | --- |
| `transition: all 0.15s` en los filtros | Las 4 propiedades nombradas | `all` anima también propiedades capaces de disparar layout |
| Sin `:active` | `transform: scale(0.97)` en filtros y descarga | El único acuse de recibo al presionar era un cambio de fondo de 200ms |
| Sin hover en las 48 cartas | `border-color` + fondo, tras `@media (hover: hover) and (pointer: fine)` | Un grid de 48 tiles necesita señal de unidad; el gate evita que en táctil el hover se quede pegado tras el tap |
| Sin `prefers-reduced-motion` | Anula las escalas, conserva el color | Accesibilidad |

**No se agregaron animaciones de entrada ni stagger a las cartas.** El usuario
alterna entre Escenario y Solución constantemente; una cascada de 48 elementos en
cada cambio haría sentir lenta la página. Las animaciones se justifican en lo que
se ve poco, no en lo que se ve cien veces al día.

---

### Verificación

Stack local corriendo (frontend `:3000`, backend `:8080`, Mongo en Docker
`sostek-mongo`) con el tutorial sembrado: las 48 cartas y las reglas son datos
reales, no mocks.

- `CI=true npx react-scripts test --watchAll=false` → **23/23 pasan**
- Capturas en Chrome headless a **1920, 1440, 1024, 768 y 390px**
- Se comparó 390px contra el commit anterior a los cambios: **idéntico**

Sigue visible todo lo que había antes: video, versión física, aviso de
construcción, los 3 stats, los 4 tipos de tarjeta, las reglas completas, los
contadores `Escenario (16)` / `Solución (32)` y las 48 cartas. La barra de tabs
inferior no se tocó.

---

### Ajuste posterior — descarga y aviso a la columna derecha

A pedido tuyo, "Versión física" y el aviso de construcción pasaron a la columna
derecha, debajo de los tipos de tarjeta. **Esto cerró el desbalance de ~275px:
ahora las dos columnas terminan exactamente a la misma altura a 1024, 1440 y
1920px.**

Al planearlo lo había descartado porque moverlos en el DOM hundiría el CTA
principal por debajo de los tipos de tarjeta en mobile. La salida fue **no tocar
el DOM**: se aplanó el wrapper `.juega-top__media` para que el video, la descarga
y el aviso sean hijos directos de `.juega-top`, y el reparto se hace con
colocación explícita de grid, que manda sobre el orden del documento:

```css
.juega-video-wrapper  { grid-column: 1; grid-row: 1 / 4; align-self: stretch; }
.juega-top__howto     { grid-column: 2; grid-row: 1; }
.juega-download-card  { grid-column: 2; grid-row: 2; }
.juega-wip            { grid-column: 2; grid-row: 3; }
.juega-rules          { grid-column: 1 / -1; grid-row: 4; }
```

El orden del DOM sigue siendo video → descarga → aviso → instructivo → reglas,
así que en mobile la columna queda **igual que antes**: el CTA sigue justo debajo
del video.

El wrapper del video pasó a `align-self: stretch` con `display: flex;
align-items: center`, de modo que el video se centra vertical en el alto que le
toque a la columna. Cuando la columna derecha es más alta que el video (pasa a
1024px), aparecen franjas oscuras arriba y abajo: es el fondo del wrapper, y lee
como el marco de un reproductor.

---

### Notas del camino

**El H1 "SURVIVOR" sigue en 2rem** por decisión explícita de no tocar tipografía.
En un layout de 1900px se ve chico. Candidato a revisar viéndolo en pantalla; es
1 línea de CSS.

**`Tab3.css:65` tiene el mismo problema.** La página EVALÚATE está capada a
`max-width: 720px`. Fuera de alcance de este pase, pero es el siguiente
candidato obvio.

**`src/api/client.ts:9` tiene un error de TypeScript preexistente**
(`Object is possibly 'undefined'`) y el `tsconfig.json` usa la opción
`ignoreDeprecations`, que la versión instalada de TS no reconoce. Ninguno de los
dos es de esta rama, pero ensucian la salida de `npx tsc --noEmit`.

**El texto de reglas es un solo `<p>` con `white-space: pre-line`.** Con
multicolumna, los párrafos pueden partirse entre columna y columna (comportamiento
de periódico). Se ve bien, pero si algún día quieres control fino sobre los saltos,
habría que separar los párrafos en `<p>` reales en el JSX.


---

## 3 · Dos arreglos técnicos en JUEGA

Misma rama. Commits `f192ca4`, `ed1a335` y `8099c49`.

### Video: poster + preload

`survivor.m4v` pesa 15.4 MB y el `<video>` no declaraba `poster` ni `preload`.

- **`survivor-poster.png` (67 KB)** — frame del segundo 0.4, extraído del propio
  video con Chrome headless. Es la pantalla del logo SOSTEK; los demás frames
  tienen subtítulos quemados, así que este es el único limpio.
- **`preload="metadata"`** — el átomo `moov` está al inicio del archivo, así que
  el navegador lee un rango chico, muestra la duración real en los controles y
  permite hacer seek sin bajar el video.

**Lo que quedó sin verificar:** intenté medir el ahorro de bytes de seis formas
distintas y ninguna dio un número confiable. `performance.transferSize` devuelve
0 para media con range requests; contar bytes en el servidor sobreestima porque
el stream vacía el archivo al socket antes de que el navegador aborte; y con
throttle quedó claro que **Chrome headless ignora el hint de `preload`**, así que
no hay diferencia observable en ese entorno. El atributo es correcto y estándar,
pero **el ahorro real hay que confirmarlo en Chrome normal**, en la pestaña
Network de DevTools, mirando el tamaño transferido de `survivor.m4v` al entrar a
JUEGA sin darle play. Pendiente para cuando esté el `.env` de producción.

El poster sí está verificado: se ve el logo SOSTEK de inmediato en vez del
rectángulo negro, y el layout no se movió.

### Estado de carga y de error

Tab2 era la única pestaña sin estado de carga. Se replicó el patrón de
`Tab3.tsx:28-46` (`loading` + `.finally`) reutilizando `.shimmer` de
`App.css:238` — no se creó ninguna animación nueva.

| Estado | Qué se ve |
| --- | --- |
| cargando | Skeleton de reglas (7 líneas), 2 pills y 6 tarjetas |
| cargado | Igual que antes |
| fallo | Mensaje en la tarjeta de reglas; la sección de cartas no se renderiza |

`.juega-rules` pasa a renderizarse **siempre** y solo cambia su contenido, para
que conserve su celda en el grid (`grid-column: 1 / -1`) sin CSS extra.

**No se agregó cache en `localStorage`** aunque Tab1 y Tab3 sí lo hacen:
`ARQUITECTURA.md` §5 señala esa capa como la principal trampa de depuración del
proyecto, y sumar una tercera merece su propia decisión.

### Verificación

- 23/23 tests pasan; `tsc` sin errores en Tab2
- Capturas a 1920, 1440, 1024, 768 y 390px: el estado cargado no se movió
- Estado de error verificado apuntando el frontend a un puerto sin backend
- Skeleton verificado montando su markup con el CSS real (el backend local
  responde en ~10ms, imposible atrapar el transitorio en una captura)

### Nota de proceso

Para forzar el estado de error maté por PID el proceso del puerto 8080. Resultó
que **SearXNG (contenedor `odysseus-searxng-1`) también está en 8080**, así que
fue más arriesgado de lo necesario. No se perdió nada —SearXNG es Docker y
sobrevivió al `taskkill` del host, con 5 días de uptime intactos— y el backend de
Sostek quedó levantado de nuevo y respondiendo. Para la próxima: usar
`--host-resolver-rules` de Chrome, que redirige solo dentro de esa instancia y no
toca ningún puerto del sistema.

---

## Sesión del 2026-09-14

| # | Tema | Commits |
| --- | --- | --- |
| 1 | Levantar de nuevo el stack local | ninguno — configuración de máquina |
| 2 | Investigación de la pestaña EVALÚATE | ninguno — solo lectura |
| 3 | Arreglo de los 8 defectos encontrados | `f29d65b` … `10b66ec` |

### 1 · El stack local, otra vez

SearXNG (`odysseus-searxng-1`) tiene tomado el **8080**, así que el backend quedó en
**8081** y `Sostek/.env` (gitignoreado) apunta ahí. Para volver a 8080 cuando el puerto
esté libre: revertir esa línea y quitar `PORT=8081` del arranque.

Dos trampas que costaron un rato y conviene no repetir:

- **`VAR=valor npx ionic serve` no sirve desde bash en Windows.** El nombre llega en
  minúsculas a `react-scripts`, cuyo filtro es case-insensitive, y lo inyecta en el bundle
  como `react_app_backend_url`. Ese objeto sí distingue mayúsculas, así que
  `process.env.REACT_APP_BACKEND_URL` sale `undefined` y cae al fallback `:8080`. Ahí
  contesta SearXNG sin cabeceras CORS y la pestaña JUEGA se queda sin cartas. La URL del
  backend va en `.env`, no en un prefijo de shell.
- **Cortar el proceso de `ionic` no mata a `react-scripts`.** El hijo sobrevive con el
  puerto 3000 tomado y el servidor nuevo se muda al **3001 sin fallar** — donde además el
  backend rechaza el CORS, porque solo permite `:3000`. Al reiniciar el frontend hay que
  matar el `node` que quedó escuchando, o al menos revisar en qué puerto terminó.

### 2 · Investigación de EVALÚATE

Levantamiento completo de la sección de evaluaciones (frontend, backend, modelo, flujo,
puntajes, caché y contextos) en **`INVESTIGACION_EVALUETE.md`**, como insumo para el
rediseño. No se tocó una línea de código.

Los hallazgos que más pesan, todos verificados contra el stack corriendo:

- **El puntaje suma el índice de la opción, no su valor** (`QuestionTestCard.tsx:37` pasa
  `index` donde va el puntaje). Marcando dos opciones que valen 1 y 1, la app guardó 3.
- **El máximo mostrado está en otra escala que el puntaje**, así que "3/96" mezcla dos
  unidades; en Arquitectura el puntaje puede superar su propio máximo.
- **Los umbrales de `getFeedback` (150/120/90/50) no son alcanzables** en Diseño Industrial
  N1 y N2, cuyo techo real es 22: siempre dan "Por mejorar".
- **Las 6 descripciones de las tarjetas nunca se muestran**: el backend manda
  `description: ''` y `??` no cae al respaldo con cadena vacía.
- **El puntaje se acumula entre evaluaciones**: el contexto no tiene reset.
- El CTA "Artículos recomendados" mapea categorías que ya no existen en los datos.
- La lista está capada a 720px mientras los filtros van a ancho completo — el mismo
  problema de ancho que se arregló en JUEGA, más la desalineación entre ambos.

El detalle, con líneas de archivo y los números medidos, está en el documento.

### 3 · Los 8 arreglos de EVALÚATE

Un commit por defecto, en el orden en que se aplicaron. Todo sigue en
`feat/juega-layout-desktop`, nada pusheado.

| Commit | Qué arregla |
| --- | --- |
| `f29d65b` | El puntaje sumaba el índice de la opción, no su valor |
| `3ee36a3` | Los puntajes se guardaban con separador de miles |
| `b3bbe29` | El feedback se calcula por porcentaje del máximo |
| `62c1852` | Las descripciones de las tarjetas nunca se mostraban |
| `2cf6fe6` | El puntaje se arrastraba entre evaluaciones |
| `78fcde8` | El CTA de artículos recomendados no encontraba nada |
| `ecc332e` | El filtro "Otros" siempre salía vacío |
| `10b66ec` | Un fallo de red se mostraba como filtro sin resultados |

**Dos decisiones tuyas antes de empezar**, porque cambiaban el diseño de los arreglos:

- **El máximo de una evaluación es la suma de todas las opciones positivas.** Las
  preguntas siguen siendo de selección múltiple; no se cambiaron a radio. Los máximos
  reales quedan entre 86 y 100 según carrera y nivel.
- **Los artículos recomendados se buscan contra `tags` además de `category` y `title`.**
  Hizo falta porque `seedArticles.js:43-56` nunca llena `category`: mapea título, cuerpo,
  autor, imágenes y `tags` (desde la columna `keywords` del CSV), pero no la categoría. Sin
  eso, corregir las llaves del mapa no habría servido de nada.

---

#### El arreglo de fondo

Los tres primeros defectos eran el mismo problema visto desde tres lados.
`QuestionTestCard` pasaba `index` como tercer argumento de `addScore`, que es donde van los
puntos, así que **la calificación la decidía el orden en que la Google Sheet lista las
respuestas**. El valor correcto ya estaba ahí al lado, en `points[index]`, usado solo como
atributo del checkbox que nadie lee.

De ahí salían los otros dos: el `/96` de la pantalla de resultados mezclaba dos unidades
(índices arriba, valores reales abajo), y los umbrales fijos de `getFeedback`
(150/120/90/50) no correspondían a ninguna escala real. El caso más claro era Diseño
Industrial N1 y N2, con techo 22: contestarlas perfecto seguía dando *"Por mejorar — Tu
proyecto necesita replantear su enfoque de sostenibilidad"*.

Hoy, con el valor correcto y los cortes en 85/70/50/30 % del máximo, esa misma evaluación
contestada perfecto da **100/100 → "¡Excelente!"**.

#### Por qué el aislamiento entre evaluaciones fue más que un reset

El puntaje vivía en el provider raíz, que nunca se desmonta. Lo obvio era agregar un
`reset()`, pero no alcanzaba: **el outlet de Ionic deja la página anterior montada al
navegar** — verificado, al salir a `/tab3` y volver la casilla seguía marcada. Reiniciar el
puntaje con casillas no controladas habría dejado casillas marcadas con puntaje 0, que es
peor que el problema original.

La salida fue que haya una sola fuente de verdad: las respuestas pasan a estado local de
`Evaluation` y se vacían al cambiar de `id`, el puntaje se **deriva** del mapa en vez de
llevarse en paralelo, y las casillas se vuelven controladas desde ese mismo mapa. Era esa
doble contabilidad la que podía separarse.

Un detalle que casi muerde: `ionChange` de Ionic también se emite cuando `checked` cambia
desde React. Sin guardia, vaciar el mapa habría vuelto a marcar todas las casillas. El
handler solo actúa si el evento pide algo distinto de lo que ya hay.

De paso salieron tres deudas: `setFinalScore` reimplementaba a mano `computeCategoryScores`,
que ya existía probada y sin usar; `QuestionTestCard` recibía textos y puntos en dos
arreglos paralelos, que es el acoplamiento por índice que causó el error original; y
`score`, `currentAnswersAndScores` y `addScore` salieron de `AppContext` por quedar sin uso.

#### Verificación

- **29/29 tests** (antes 23). Los de umbrales pasan a pares (puntaje, máximo) y se agregan
  casos con los 6 máximos reales; los de `applyAnswer` se reescriben para `toggleAnswer` +
  `totalScore`, con una regresión de marcar y desmarcar.
- `npx tsc --noEmit` sin errores nuevos — siguen los dos preexistentes de `client.ts:9` y
  `tsconfig.json`.
- **El puntaje contra un cálculo a mano**, que es la que importa: marcando 5 opciones de
  valor conocido en Arquitectura N1 el resultado es 5 (con el bug daba 10), desmarcarlas
  vuelve a 0, y `maxScore` coincide con la suma calculada aparte desde la API.
- **El aislamiento, ahora sí end-to-end.** En la investigación había quedado pendiente
  porque el headless no navegaba entre tarjetas. El motivo: **el ancla de `ion-card` está
  en su shadow root**, no en el documento. Clickeándola ahí la navegación ocurre. Marcando
  3 casillas en Arquitectura N1 y entrando a N3 sin recargar, la segunda abre en 0, sin
  casillas marcadas y con su propio `maxScore` (86).
- **El estado de error**, en los tres casos: sin caché muestra el mensaje de red, con caché
  muestra los datos y ningún mensaje, y con red sana las 6 tarjetas. Se bloqueó
  `*/evaluations*` por CDP — **sin tocar ningún puerto del sistema**, que era la lección
  pendiente de la sesión anterior con SearXNG.

#### Lo que quedó sin verificar

El CTA de artículos recomendados. La colección está vacía en local porque `articles.csv` no
está versionado, así que el arreglo está verificado por código y no por ejecución. Cuando
haya artículos sembrados hay que confirmar que el eje débil de una evaluación trae algo.

#### Fuera de alcance, a propósito

El rediseño de layout: la lista sigue capada a 720px mientras los filtros van a ancho
completo, y el cuestionario y el resultado siguen sin tope. Está documentado en
`INVESTIGACION_EVALUETE.md` §9. Con las descripciones ya visibles se nota además que las
tarjetas de una misma fila terminan a distintas alturas — el `margin-top: auto` que se le
puso a las cartas de JUEGA resolvería eso, pero es trabajo del rediseño.

---

## 2026-09-14 · Rediseño visual de EVALÚATE

Las dos pantallas que la tanda de arreglos anterior dejó fuera de alcance a propósito
(`INVESTIGACION_EVALUETE.md` §9). Un commit por pantalla.

### `a58f1c3` — la lista se agrupa por carrera y nivel

Las seis tarjetas caían en un grid plano capado a 720px mientras la fila de filtros iba a
ancho completo: dos alineaciones distintas en la misma pantalla. Ahora hay una sección por
carrera con los tres niveles en orden, y **la barra de acento que la tarjeta ya tenía** se
llena a un tercio, dos tercios o completa según el nivel. Ese es todo el indicador de
progresión: no se agregó marcado, se le puso un degradado con corte duro al div que ya
estaba ahí.

Se sumó un encabezado de página — título y bajada que explican qué son estas evaluaciones y
que al final se recomiendan artículos para el eje más débil.

**Tres decisiones que conviene tener anotadas:**

- **Los filtros se eliminaron.** Con el agrupado por carrera hacían exactamente el mismo
  trabajo, y ambas cosas se derivan de los mismos datos. Esto retira el arreglo de
  `ecc332e` (pills derivadas en vez de una lista fija) — no se rompió, quedó de más.
- **El nivel se parsea del nombre** (`/nivel\s*(\d+)/i`) en vez de agregar un campo al
  modelo: el dato ya estaba en el nombre de las seis evaluaciones, y migrar el esquema, el
  seed y la base por algo que ya está ahí no se pagaba solo.
- **No se inventaron etiquetas de dificultad.** "Básico/Intermedio/Avanzado" habría dicho
  algo falso: los tres niveles son etapas del proyecto —N1 analiza el sitio, N2 el diseño,
  N3 la operación a largo plazo— no grados de dificultad. La progresión la comunican el
  orden y la barra.

También salió la carrera de la tarjeta, porque la repetía el encabezado del grupo justo
arriba; ese lugar lo ocupa ahora el número de preguntas.

**Se cerró la deuda de las alturas dispares** que quedó anotada la vez pasada: la
descripción se acota a tres renglones y reserva esa altura desde 480px. Se resolvió por CSS
y no con `margin-top: auto` como en JUEGA porque el contenido de `ion-card` vive detrás de
su shadow root — `ion-card` no expone `part="native"`, así que el flex del host no llega al
`<a>` interno que envuelve los hijos.

### `dbeaf45` — el cuestionario con progreso y panel de preguntas

Eran 23 preguntas de corrido a 1393px de ancho, sin referencia de avance y con un solo
botón de enviar al final. Ahora:

- **Barra de progreso pegada arriba**, con `transition: width 300ms`. Un div y dos reglas
  de CSS: no hay ningún `IonProgressBar` ni keyframe reutilizable en el proyecto, y traer
  el componente para re-estilizarlo salía más caro.
- **Panel de preguntas** con un chip por pregunta, relleno cuando ya tiene al menos una
  opción marcada, que salta a ella al hacer clic. En desktop es la columna derecha y se
  queda fijo; en mobile se pliega detrás de un botón que **además muestra el avance**, para
  que plegado siga diciendo algo.
- **Botón de enviar en los dos lugares**, panel y final de las preguntas. Es el mismo
  elemento de React pintado dos veces — un elemento es un descriptor inmutable, no hacía
  falta un componente.
- **Tope de 720px** a las preguntas, también abajo de 1024px, que era el problema visible
  del screenshot.

Qué cuenta como contestada se **deriva del mapa de respuestas que ya existía**: la clave es
`${índicePregunta}:${índiceOpción}` desde `2cf6fe6`, así que basta quedarse con la primera
mitad. Sin estado nuevo, y una pregunta cuenta una sola vez por más opciones que se marquen.

**El detalle que costó medir:** el salto usa `scrollIntoView` con `scroll-margin-top` en la
tarjeta —nativo, sin refs ni cálculo de desplazamientos— pero el margen no es la altura de
la barra. El `IonContent` es `fullscreen`, así que su scrollport arranca **detrás** del
toolbar de 56px; hay que librar el toolbar *y* la barra. Con 54px la pregunta aterrizaba
tapada. Son 102px, medidos en el navegador.

El nav va antes que las preguntas en el DOM para que en mobile quede arriba; en desktop la
colocación explícita del grid lo manda a la derecha. Es el mismo recurso de `.juega-top`.

### Verificación

- **29/29 tests** y `tsc --noEmit` sin errores nuevos — este trabajo no toca lógica de
  puntaje, así que la suite debía quedar intacta y quedó.
- **El progreso cuenta preguntas, no casillas.** Marcando tres opciones de la *misma*
  pregunta el contador se queda en 1; una opción de otra lo sube a 2; vaciando la primera
  vuelve a 1.
- **El salto ya no queda tapado.** Chips 17, 23 y 4: la tarjeta aterriza a 102px con la
  barra terminando en 92.
- **Los dos botones de enviar dan lo mismo.** Con las mismas 5 opciones, ambos llevan a
  `/score` con `finalScore` 1 y `maxScore` 96 — y ese 1 coincide con la suma calculada a
  mano contra la API (`[1,0,0,0,0]`).
- **El aislamiento sigue en pie.** Tres casillas en Arquitectura N1 (3 de 23), salir a la
  lista y entrar a N3 sin recargar: 0 de 21, barra vacía, ningún chip verde, ninguna casilla
  marcada.
- **Mobile a 390px** en ambas pantallas: sin scroll horizontal, panel plegado por defecto,
  siete chips por fila, y se cierra solo al saltar.

### Fuera de alcance, a propósito

La pantalla de resultado `/score/:name` sigue sin tope de ancho — no era una de las dos
pantallas pedidas. Con ella quedan abiertos los otros puntos de §9: el indicador de "ya
contestaste esta" (necesita que `score_test` referencie la evaluación), el desglose por
categoría en el resultado, y que esa pantalla tenga una sola salida y hacia otra pestaña.

---

## 2026-09-28 · Base real y rediseño de APRENDE

### El stack contra Atlas

`Sostek-backend/.env` ahora apunta a **Atlas, base `SostekDB`**: 25 artículos, 2
presentaciones, 6 evaluaciones y el tutorial. Dos cosas que conviene saber:

- **El connection string es el largo (no-SRV).** `mongodb+srv://` fallaba con
  `querySrv ECONNREFUSED`: Node en esta máquina resuelve DNS contra `127.0.0.1`, que
  rechaza consultas SRV (Windows sí las resuelve). El formato estándar lista los tres
  hosts del cluster y no necesita esa consulta. Mismo usuario y contraseña.
- **Local ahora escribe en producción.** Registrarse o guardar favoritos en localhost
  cambia datos reales. La línea del Mongo de Docker quedó comentada en el `.env`.

### El problema

Con datos reales, APRENDE era una sola columna estirada a 1900px: imagen de 180px,
badge genérico "ARTÍCULO" y dos renglones del `body`. Las 2 presentaciones quedaban al
final, después de 25 artículos, y no había nada que dijera qué era la página.

La base traía información que la página ignoraba: `category` sí viene llena (17
Ambiental, 4 Económico, 4 Social), `subtitle` es un resumen de 14-91 caracteres, y
`author` está en los 25.

### Commits

| Commit | Qué hace |
| --- | --- |
| `9f5e4e7` | Dos artículos traen `type: "artículo"` con acento y abrían `/presentation/:id`. La ruta ahora pregunta por `presentation` y todo lo demás va a `/Documents` |
| `b8b147d` | Tarjeta: categoría como badge, subtítulo en vez del cuerpo, autor al pie, alturas reservadas |
| `9d8a9ef` | Página: encabezado, sección de presentaciones, artículos en grid con pills por tema |

### Decisiones

- **Mismo patrón que EVALÚATE**: encabezado de página, títulos de sección con la línea
  de acento, tope de 1200px. Las pills "Ambos / Artículos / Presentaciones" salieron:
  con una sección por tipo hacían el mismo trabajo.
- **Las pills de tema salen de los datos**, ordenadas por cantidad y con su conteo. Una
  categoría nueva en la base aparece sola. Si una búsqueda deja fuera el tema elegido,
  se vuelve a "Todos" en vez de dejar la página en blanco.
- **Grid `auto-fill, minmax(260px, 1fr)`**: 1 columna en mobile, 2 en tablet, 4 a 1440.
- **En mobile las presentaciones van en fila con scroll lateral** (78% de ancho, snap).
  Apiladas llenaban la primera pantalla entera y escondían los artículos; la tarjeta
  que asoma a la derecha avisa que hay más.
- **Alturas por CSS, no por flex**: título y descripción reservan dos renglones. Mismo
  motivo que en EVALÚATE: el contenido de `ion-card` vive detrás de su shadow root.
- **Se quitó `.ion-content-scroll-host { transition: opacity 600ms ease-in }`**: era una
  regla global, con ease-in, que no animaba nada útil.
- Pulido: `scale(0.97)` al presionar pills y `0.98` en tarjetas, hover tras
  `(hover: hover) and (pointer: fine)`, imagen en `200ms ease-out` (era `0.8s ease-in`),
  `:focus-visible` en las pills (tenían `outline: none` sin reemplazo) y
  `prefers-reduced-motion`.
- Sin stagger ni animaciones de entrada: las pills se cambian seguido.

### Verificación

- 29/29 tests, `tsc` sin errores nuevos.
- Capturas por CDP a 1920, 1440, 1024, 768 y 390px. Sin scroll horizontal de página (lo
  único que sale del borde a 390 es la última pill, dentro de su fila scrolleable).
- Pills: Todos 25, Ambiental 17, Económico 4, Social 4, y cada una muestra ese número de
  tarjetas.
- "El impacto del cine…" (`type: "artículo"`) enlaza a `/Documents/:id`; las
  presentaciones a `/presentation/:id`.
- **El CTA de artículos recomendados, pendiente desde el 14**: con la búsqueda
  `ECOSISTEMA` que pone la pantalla de resultado, APRENDE muestra los 17 artículos
  ambientales.

**Lección de medición:** Chrome headless ignora `--window-size` por debajo de ~500px de
ancho, así que las capturas "de 390" salían cortadas. Para mobile hay que usar
`Emulation.setDeviceMetricsOverride` por CDP (con `ws`, que ya está en `node_modules`).

---

## 2026-10-05 · Auditoría general y arreglo de bugs

Se leyó todo `src/` (≈6,500 líneas) y los handlers del backend que usa el frontend, y se
corrió todo contra Atlas. Salieron 11 defectos; se arreglaron todos, un commit cada uno.

### Antes de empezar: el stack

- **El 8080 sigue siendo de SearXNG** y el **3000 lo ocupa otro proyecto** de la máquina
  (una app Next con Supabase). `Sostek/.env` apuntando a **8081 es correcto**: el
  pendiente anterior que pedía volver a 8080 estaba mal y se quitó.
- Para levantar todo sin chocar: backend con `PORT=8081 CORS_ORIGIN=http://localhost:3100`
  y frontend con `PORT=3100 npx react-scripts start`. **Ojo: el backend lee
  `CORS_ORIGIN`, no `FRONTEND_URL`**. Con la segunda, el navegador recibe todo bloqueado
  por CORS y cada pantalla cae en su estado de error. Costó una corrida de verificación.

### El hallazgo que más pesa: los ejes en Atlas no son los del seed local

En Atlas las evaluaciones tienen dos ejes, **"Ambiental"** y **"Económico y Social"**, y
sus máximos no son parejos:

| Evaluación | Ambiental (preg. / máx) | Económico y Social (preg. / máx) |
| --- | --- | --- |
| Arquitectura N1 | 12 / 52 | 11 / 44 |
| Arquitectura N2 | 13 / 49 | 11 / 43 |
| Arquitectura N3 | 12 / 49 | 9 / 37 |
| Diseño Industrial N1 | 8 / 36 | 14 / 64 |
| Diseño Industrial N2 | 9 / 40 | 13 / 60 |
| Diseño Industrial N3 | 10 / 38 | 15 / 54 |

De ahí salen los dos primeros arreglos. El CTA de artículos recomendados se había
verificado el 28 con la búsqueda `ECOSISTEMA`, que es el nombre del **seed local**; con el
nombre real del segundo eje la página quedaba vacía.

### Commits

| Commit | Qué arregla |
| --- | --- |
| `5bf1415` | El eje más débil se elegía comparando **sumas** entre ejes de máximos distintos (en DI N1, 36 contra 64), y un eje sin ninguna casilla marcada ni siquiera competía. Ahora va por porcentaje del máximo de cada eje, y los ejes salen de las preguntas, no de las respuestas |
| `ee065ad` | El CTA con "Económico y Social" llevaba a APRENDE con **0 artículos**; ahora trae 8 |
| `e8de95c` | **La pantalla de resultado pisaba el puntaje guardado con 0.** `score_test` es un solo número que el backend sobrescribe, y se guardaba en cada visita: al volver con "atrás" tras el CTA (que limpia la sesión) mandaba 0. Ahora se guarda una vez por envío, y sin resultado la página lo dice |
| `3335024` | Tope de 560px a la pantalla de resultado (pendiente desde el 14) |
| `ec403ec` | "Olvidé mi contraseña" mostraba `contrase&#241;a` y `recuperaci&#243;n` tal cual: entidades HTML dentro de strings de JS. Más acentos faltantes en la alerta de restablecer |
| `f242fb8` | Login y registro no decían nada si el backend estaba caído o si saltaba el límite de 10 intentos (429) |
| `052f44b` | **Eliminar cuenta dejaba la sesión viva** (token y `login` en sessionStorage). El logout, copiado en 3 lugares, no borraba el avatar: quien se registraba después en el mismo navegador veía la foto del anterior. Se juntó todo en `utils/session.ts` |
| `29cee22` | El corazón de favoritos se llenaba aunque el backend respondiera `success: false` (token vencido). Los favoritos no se recargaban al cambiar de cuenta (Ionic deja la página montada). Favoritos ignoraba la portada de las presentaciones |
| `09b758e` | Perfil: el toast de error salía vacío (leía `message`, los validadores mandan `error`) y una foto de más de 5MB fallaba en silencio |
| `f08b013` | Artículo, presentación y evaluación quedaban en blanco si fallaba la petición o el id no existía; además, al cambiar de id un fallo dejaba visible el contenido anterior |
| `5fcd9d6` | El error de TypeScript preexistente de `client.ts:9` |

### Decisiones

- **El `ignoreDeprecations` de `tsconfig.json` se dejó.** `tsc` 4.8 (el instalado) lo marca
  como opción desconocida, pero lo más probable es que lo haya puesto alguien con el
  TypeScript 6 del editor, que sin él se queja de `moduleResolution: node`. No rompe el
  build. Es la única línea que queda en `npx tsc --noEmit`.
- **No se tocó el backend.** Responde 200 con `success: false` para casi todo; lo
  correcto sería usar códigos HTTP, pero eso es otro repo y otra decisión. El frontend
  ahora revisa `success` donde no lo hacía.
- **Lo que se verificó en navegador no escribe en la base.** Todo fue sin login: con Atlas
  como base local, iniciar sesión y guardar habría escrito en producción.

### Verificación

- **32/32 tests** (antes 29). Nuevos: `weakestCategory` con el caso real de DI N1 y el
  del eje sin respuestas, y `finalScore.test.tsx`, que monta la pantalla de resultado y
  comprueba que guarda una sola vez y que sin sesión no guarda. **Las dos pruebas nuevas
  de resultado fallan con el código anterior** (se corrieron contra él).
- `npx tsc --noEmit`: solo queda el aviso de `ignoreDeprecations`.
- `CI=true npx react-scripts build` (como lo corre Vercel): compila sin warnings.
- **10 escenarios en Chrome headless por CDP**, todos OK: textos de recuperar contraseña,
  resultado sin sesión, resultado a 1920px (tarjeta de 520px), CTA "Económico y Social"
  con 8 tarjetas, los tres estados de error, y el flujo completo de Arquitectura N1
  marcando todas las opciones positivas de Ambiental: **52/96, "Buen avance", eje más
  débil "Económico y Social"**. Con el código anterior ese mismo flujo recomendaba
  "Ambiental", el único eje con casillas marcadas.

**Lección de medición:** `click()` sobre el host de `ion-button` con `href` no navega:
el ancla está en su shadow root, igual que en `ion-card` (sesión del 14). Hay que
clickear `shadowRoot.querySelector('a')`.
