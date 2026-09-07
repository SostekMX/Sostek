# Avance — Guillermo

Log de trabajo. Cada entrada dice qué se tocó, qué se decidió y por qué.

---

## 2026-09-07 — Rediseño de layout de la página JUEGA (Tab2)

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
