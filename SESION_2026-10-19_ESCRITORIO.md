# Sesión 19 de octubre de 2026: Sostek en escritorio

> Resumen de lo que se trabajó en esta sesión: levantar el proyecto en local y darle a Sostek una
> versión de escritorio propia, sin cambiar la versión móvil.

| | |
|---|---|
| **Rama** | `feat/escritorio-editorial` (sale de `feat/juega-layout-desktop`) |
| **Commits** | 20, separados por tipo de cambio |
| **Tests** | 35 de 35 pasan (3 nuevos) |
| **Móvil** | Sin cambios, verificado midiendo cada pantalla a 390 px antes y después |

---

## Contenido

1. [Levantar el proyecto en local](#1-levantar-el-proyecto-en-local)
2. [El problema](#2-el-problema)
3. [La dirección de diseño](#3-la-dirección-de-diseño)
4. [Tamaños de pantalla](#4-tamaños-de-pantalla)
5. [Qué cambió en cada pantalla](#5-qué-cambió-en-cada-pantalla)
6. [Piezas nuevas en el código](#6-piezas-nuevas-en-el-código)
7. [Cómo se cuidó el móvil](#7-cómo-se-cuidó-el-móvil)
8. [Commits](#8-commits)
9. [Pendientes y cosas a saber](#9-pendientes-y-cosas-a-saber)

---

## 1. Levantar el proyecto en local

Al empezar la sesión el backend ya estaba corriendo en `8081` y el servidor de desarrollo en `3000`.
Para ver la app como en producción se compiló el build optimizado y se sirvió aparte:

```bash
npm run build                      # genera /build
npx serve@14.2.4 -s build -l 5000  # sirve el build como lo haría Vercel (rutas SPA incluidas)
```

| Puerto | Qué es |
|---|---|
| `3000` | Desarrollo con recarga en caliente (`ionic serve`) |
| `5000` | Build de producción |
| `8081` | Backend (`Sostek-backend`) |

**Ojo:** el puerto `5000` muestra la app pero no carga datos, porque el backend solo acepta
peticiones de `localhost:3000` y `localhost:8100` (CORS). Para usarlo con datos hay que agregar
`http://localhost:5000` a `CORS_ORIGIN` en el `.env` del backend.

---

## 2. El problema

Sostek nació como app móvil. En la computadora se veía igual que en el teléfono: una columna angosta
al centro de la pantalla y la barra de tabs abajo. El objetivo de la sesión fue tener dos
experiencias distintas, cada una pensada para su pantalla:

- **Móvil:** igual que hoy, con su barra de íconos abajo para usar con el pulgar.
- **Escritorio:** navegación lateral y un acomodo que aproveche el espacio.

Las dos reglas: el móvil no cambia ni empeora, y todo el contenido y todas las funciones siguen en
las dos versiones.

---

## 3. La dirección de diseño

Se propusieron tres direcciones (revista editorial, biblioteca inmersiva y panel de estudio) y se
eligió **revista editorial**: barra lateral fija, contenido acomodado como revista y una buena vista
de lectura.

### La idea que une todo: los tres ejes

Revisando los datos reales salió algo útil: los artículos tienen exactamente tres categorías,
**Ambiental**, **Económico** y **Social**. Son los mismos tres ejes de las cartas de JUEGA y de las
áreas de EVALÚATE. En escritorio cada eje tiene su color y aparece en toda la app:

| Eje | Color | Dónde aparece |
|---|---|---|
| Ambiental | `#80b259` | Etiquetas de artículos, filtros, cartas, preguntas, resultado |
| Económico | `#ecaf80` | Lo mismo |
| Social | `#7db8ba` | Lo mismo |

Así un artículo, una carta del juego y tu eje más débil en una evaluación se reconocen como parte del
mismo sistema.

### Decisiones de diseño

- **Letra:** Kiona (la de la marca) para los títulos grandes; Raleway para el texto.
- **Lectura:** líneas de unos 68 caracteres e interlineado amplio en los artículos.
- **El elemento protagonista:** la portada de APRENDE, con el artículo más reciente en grande.
  Todo lo demás se mantiene sobrio.
- **Lo que se evitó a propósito:** etiquetas en mayúsculas sobre cada título, tarjetas idénticas en
  todos lados, flechas "→" pegadas a los botones y animaciones de entrada en cada sección.
- **Accesibilidad:** foco visible con teclado, efectos de hover solo con mouse, y respeto a
  `prefers-reduced-motion`.

---

## 4. Tamaños de pantalla

| Ancho | Experiencia | Navegación |
|---|---|---|
| Menos de 768 px | **Móvil, igual que antes** | Tabs abajo y menú en el header |
| 768 a 1199 px (tablet, laptop chica) | Escritorio compacto | Riel de íconos de 84 px a la izquierda |
| 1200 px o más | Escritorio completo | Barra lateral de 260 px con textos |

El contenido nunca pasa de 1240 px de ancho, así que en monitores grandes queda aire a los lados.

---

## 5. Qué cambió en cada pantalla

Todo esto aplica **solo desde 768 px**.

### Navegación (todas las pantallas)

- La barra de tabs de abajo se esconde y aparece una **barra lateral** con:
  - El logo y una franja con los tres colores de los ejes como firma.
  - Aprende, Juega y Evalúate, cada uno con una línea que dice qué hay adentro.
  - Favoritos (con sesión).
  - Abajo, una tarjeta de perfil con tu correo y "Cerrar sesión". Sin sesión, un botón "Iniciar
    sesión".
- La sección activa lleva una marca al borde y sigue marcada en las subpantallas: al leer un
  artículo sigue activo Aprende, y al contestar una evaluación sigue activo Evalúate.
- En login y registro la barra lateral no aparece.
- La barra superior ya no repite logo ni menú. En APRENDE solo lleva el buscador, siempre abierto; en
  las demás pantallas desaparece porque quedaba vacía.

### APRENDE

- **Portada de revista:** el artículo más reciente en grande, con la foto de fondo, la etiqueta de su
  eje, el título en Kiona, el subtítulo y el autor. Al lado, "También reciente" con los cuatro
  siguientes en filas con miniatura.
- La portada solo aparece con "Todos" y sin búsqueda. Sus artículos no se repiten en la cuadrícula de
  abajo, que pasa a llamarse "Más artículos".
- **Presentaciones:** portadas grandes, dos por fila, con flechas para recorrerlas cuando no caben.
- **Filtro de temas:** se queda fijo arriba al bajar por la lista, y cada tema lleva el color de su
  eje.
- **Tarjetas:** etiqueta y borde con el color del eje, y un acercamiento suave de la foto al pasar el
  mouse.

### Artículo

- Portada a todo lo ancho con la categoría, el título grande y el subtítulo encima.
- Texto a 68 caracteres con letra capitular en el color del eje.
- Columna lateral que se queda fija al bajar, con el autor, los minutos de lectura, el crédito de la
  imagen, "Guardar en favoritos" y "Volver a Aprende".
- **Barra de progreso de lectura** arriba, en el color del eje. Cuando la portada sale de la vista,
  aparece el título del artículo en la barra superior.
- La bibliografía va al final como lista numerada.

### Presentación

- La diapositiva al máximo tamaño que cabe, con flechas grandes a los lados.
- Se puede avanzar con las flechas del teclado.
- Contador ("11 de 24"), miniaturas abajo que siguen a la diapositiva actual, y pantalla completa con
  botón o con la tecla F.
- El título de la presentación va en la barra superior.

### JUEGA

- Título "Survivor" grande y video en su proporción correcta. Antes se estiraba y dejaba franjas
  negras.
- Los tipos de carta usan los colores de los ejes.
- **Las cartas parecen naipes:** proporción de carta y marco interior. Las de solución toman el color
  del eje que más suma y muestran los recursos como barras de colores en vez de solo emojis.
- Las reglas salen completas en columnas, sin el "Ver todas las reglas" del celular.

### EVALÚATE

- Recuadro "Cómo funciona" con los 3 pasos: elegir el nivel, contestar y revisar el resultado.
- Cada carrera tiene sus niveles 1, 2 y 3 como una **ruta**: círculos numerados unidos por una línea,
  con el semestre, la descripción, el número de preguntas y "Empezar evaluación".

### Evaluación en curso

- El progreso ("0 de 23 contestadas") pasa al panel lateral, junto a los números de pregunta.
- Cada pregunta lleva la etiqueta de su eje con su color.
- Las opciones van en dos columnas cuando son cuatro o más y son cortas.

### Resultado

- A la izquierda, un **anillo** con tu puntaje que se llena al cargar, y el mensaje de feedback.
- A la derecha, tu eje más débil con su color y **tres artículos recomendados** que llevan
  directamente a cada uno. El botón "Ver todos los artículos recomendados" funciona igual que antes.

### Favoritos

- Título con contador ("6 guardados") y filtro Todos / Artículos / Presentaciones.
- Cuadrícula de tres o cuatro columnas, con las tarjetas en el color de su eje.
- Si no hay favoritos, una invitación con el botón "Explorar Aprende".

### Perfil

- A la izquierda, una tarjeta de identidad con la foto grande, el nombre, el correo, la ocupación y
  "Cambiar foto".
- A la derecha, el formulario con dos campos por fila.
- "Eliminar cuenta" va aparte, en una zona de peligro que explica qué se borra.
- El recorte de la foto se abre como diálogo centrado y se cierra con Esc.

### Registro y recuperación de contraseña

- Tienen el mismo panel de marca que el login, cada uno con su frase. Las cuatro pantallas de acceso
  ahora se ven como una familia.

---

## 6. Piezas nuevas en el código

| Archivo | Para qué |
|---|---|
| `src/components/layout/SideNav.tsx` / `.css` | La barra lateral. Va dentro de un `IonSplitPane` en `App.tsx` |
| `src/hooks/useMediaQuery.ts` | Saber si se está en escritorio (`DESKTOP_QUERY` = 768 px) |
| `src/utils/axis.ts` | `axisOf(categoria)` dice a qué eje pertenece algo (tiene tests) |
| `src/utils/session.ts` → `readAvatar()` | Lee la foto y su encuadre en un solo lugar |
| `src/utils/search.ts` → `CATEGORY_RECOMMENDATIONS` | Se movió aquí desde `ArticleCarrousel` para que también la use el resultado |
| `src/theme/variables.css` | Tokens de escritorio (`--d-*`) y colores de los ejes (`--axis-*`) |
| `src/App.css` | Clases `.axis-ambiental`, `.axis-economico` y `.axis-social` |

### Cómo funciona la navegación de escritorio

`IonSplitPane` es la herramienta de Ionic para paneles laterales: muestra el menú solo cuando la
pantalla mide 768 px o más. Debajo de eso no se pinta nada y el menú no se puede abrir (no tiene
gesto ni botón), así que el móvil queda exactamente igual. La barra de tabs sigue en el código porque
Ionic la necesita; en escritorio solo se esconde con CSS.

### Cómo se separan móvil y escritorio

Dos formas, según el caso:

- **Solo CSS:** las reglas de escritorio van dentro de `@media (min-width: 768px)`. No se tocó
  ninguna regla de las que ya aplicaban al móvil.
- **JSX distinto:** cuando el escritorio necesita otra estructura (la portada de APRENDE, la vista de
  artículo, el escenario de presentaciones, el resultado), se elige con `useMediaQuery` y la rama
  móvil se deja intacta.

---

## 7. Cómo se cuidó el móvil

- Antes de cada cambio se midió la posición y el tamaño de los elementos de cada pantalla a 390 px
  (`getBoundingClientRect`, con Chrome sin ventana). Al terminar se volvió a medir y se comparó.
- **Resultado final:** APRENDE, JUEGA y EVALÚATE miden exactamente igual que antes de la sesión.
  En APRENDE se compararon 175 elementos, con sesión y sin ella. Artículo, presentación, evaluación,
  resultado, favoritos, perfil y registro también se compararon: los elementos que ya existían
  conservan su posición y tamaño.
- **Un caso que se encontró y se corrigió:** la etiqueta de eje en las preguntas hacía crecer cada
  pregunta 8 px en el celular. Se movió para que no afectara.

---

## 8. Commits

Separados por tipo, del más viejo al más nuevo:

```
d9e8595 refactor(session): lee avatar y encuadre en un solo lugar
789be76 feat(nav): barra lateral de escritorio con IonSplitPane
e474ca3 style(header): adapta la barra superior al escritorio
f670529 feat(ejes): asocia cada categoria a su eje de sostenibilidad
00e2492 style(tema): agrega los tokens de escritorio y los colores de los tres ejes
8d9b216 refactor(search): mueve las recomendaciones por eje a utils
33a1dc6 style(nav): da jerarquia a la barra lateral
4060856 style(card): pinta las tarjetas con el color de su eje en escritorio
2f72981 feat(aprende): portada de revista en escritorio
d7d5a67 feat(articulo): vista de lectura de revista en escritorio
7f0f3c3 feat(presentacion): escenario con flechas, miniaturas y pantalla completa
37da591 fix(card): estira el fondo de la tarjeta en filas de distinta altura
63472bd feat(favoritos): cuadricula con filtro por tipo y estado vacio en escritorio
203ebbf feat(perfil): perfil en dos columnas con zona de peligro en escritorio
f9a3242 style(acceso): panel de marca en registro y recuperacion de contrasena
314a0ae feat(evalua): niveles como ruta y recuadro de como funciona en escritorio
798727a feat(eval): progreso en el panel y eje de cada pregunta en escritorio
d76d03f feat(score): anillo de puntaje y articulos recomendados en escritorio
dde5fd6 feat(tab2): cartas tipo naipe con recursos por eje y reglas completas en escritorio
7c7acb4 fix(hooks): usa addListener donde matchMedia no trae addEventListener
```

---

## 9. Pendientes y cosas a saber

### Para revisar a mano

- **Recorrer la app con mouse y en un celular real.** La extensión de Chrome no estaba conectada, así
  que la revisión se hizo con capturas y medidas en Chrome sin ventana, no haciendo clic.
- **Pantalla completa de las presentaciones:** no se pudo probar porque Chrome sin ventana no la
  soporta. Las flechas del teclado sí se probaron.
- **Favoritos y perfil con datos reales:** se revisaron con datos simulados dentro del navegador de
  prueba, sin crear cuentas.
- **iPad en horizontal:** mide más de 768 px, así que verá la versión de escritorio. Es lo esperado,
  pero conviene probarlo en el simulador de iOS.

### Cosas del proyecto que salieron en la sesión

- ~~**`npm test` no funciona en Windows.**~~ Resuelto el 2026-10-26 (`60301a0`). El script del `package.json` citaba mal las comillas y la
  terminal de Windows lo rompía. Ya pasaba antes de esta sesión. Mientras se arregla, se corre así:
  ```bash
  CI=true npx react-scripts test --watchAll=false --transformIgnorePatterns 'node_modules/(?!(@ionic/react|@ionic/react-router|@ionic/core|@stencil/core|ionicons)/)'
  ```
- **Un error que se encontró y se arregló:** `useMediaQuery` usaba `addEventListener`, que Safari
  anterior a la versión 14 no tiene. Hacía fallar dos tests de la pantalla de resultado y la habría
  tumbado en iPhones viejos. Ahora usa la API vieja (`addListener`) cuando hace falta.
- **Reglas de JUEGA:** la segunda columna empieza con un renglón en blanco. Viene de un salto de
  línea doble en el texto que guarda el backend, no del diseño.
- **CORS del puerto 5000:** ver la [sección 1](#1-levantar-el-proyecto-en-local).

### Posibles siguientes pasos

- ~~Unificar los menús de Documents y Presentation con `AppBarPopOver`.~~ Hecho el 2026-10-26 (`3b02662`).
- ~~Decidir qué hacer con `ArticleCardModal.tsx`.~~ Se borró el 2026-10-26 (`2970d3b`).
- Actualizar `ARQUITECTURA.md` para mencionar el split pane y el sistema de ejes.
