# Sesión del 8 y 9 de noviembre de 2026: idioma y rediseño con Glisse

Rama: `feat/idioma-y-glisse`. Sin commits todavía.

## Idioma (ES/EN)

- El botón es un solo `LanguageToggle`, hijo de `IonApp`, fijo arriba a la derecha en todas las pantallas.
- `src/i18n/LanguageContext.tsx` da `t()` (interfaz), `tx()` (textos del contenido), `localizeArticle()` y `apiError()`.
- `es.ts` es el diccionario base y `en.ts` se tipa contra él: una llave faltante no compila.
- `content.en.json` guarda el inglés del contenido: artículos por `_id`, y evaluaciones, cartas y reglas por su texto original. Se carga bajo demanda.
- `localize` solo cambia lo que se pinta. La lógica sigue leyendo el español (ejes, búsqueda de recomendados, nivel, URL).
- Un artículo nuevo en Atlas se ve en español hasta agregarlo al JSON.
- Backend: `POST /user/forgot-password` acepta `lang` para el correo. Sin desplegar. El `.js` lleva solo ese fragmento; el diff compilado anterior sigue sin subirse.

**Pendiente de revisión humana:** las 137 preguntas traducidas. Un matiz mal traducido cambia lo que marca el alumno.

## Rediseño

La primera versión, en claro, se rechazó. La vigente es oscura, y la vara es que se vea caro.

- **Fondo:** follaje nocturno generado para Sostek, inspirado en la hoja del logo; no es material de terceros. Hay cuatro composiciones en `public/assets/canopy*.webp`. El generador no está en el repo.
- **Paleta:** verde botella `#0B1F14`, marfil `#F3F1E5` para texto y acción principal, liquen `#C6DEA3` y el verde de marca `#80B259` como acentos. Todo en `src/theme/variables.css`.
- **Tipografía:** Kiona solo trae mayúsculas: se usa enorme en títulos y cifras. Raleway ligera para titulares largos y regular para texto. El tamaño base crece con la pantalla (16 a 21 px).
- **Vidrio:** panel de acceso, barra lateral, barra inferior, menú, panel de recientes, resultado, avance de preguntas y controles sobre fotos. La lectura y los formularios no llevan vidrio.
- **Fotos de terceros:** se oscurecen con una veladura neutra, sin teñirlas, para que convivan con el fondo.
- **Movimiento:** una sola coreografía de entrada, en el acceso. Lo demás responde a acciones. Se respetan `prefers-reduced-motion`, `prefers-reduced-transparency` y `prefers-contrast`.
- **Estructura:** `AuthLayout` reemplaza las cuatro copias de acceso. Artículo, resultado, favoritos y perfil usan una sola maquetación responsive. El buscador de Aprende queda siempre visible y no pierde el foco cuando la portada desaparece.

## Límites conocidos

- Vidrio esmerilado en todos los navegadores. Falta verlo en un iPhone real.
- Los `<input type="date">` siguen el idioma del navegador.
- Las diapositivas son imágenes y no cambian con el botón.

## Rendimiento

- La refracción de Glisse (filtro SVG en `backdrop-filter`) está apagada con una regla en `App.css`. Con 30 vidrios, Aprende corría a 9 fps a 2000 px en una RTX 3050 Ti. Sin ella pasó a unos 130 fps, y la entrada del login de 13 a unos 85 o más. El cambio visual es mínimo. No la vuelvas a encender en elementos sobre contenido que se mueve.
- `src/utils/image.ts` pide el tamaño justo a Cloudinary y a Unsplash. Las fotos de otros hosts siguen en su tamaño original; una pesada se arregla subiéndola a Cloudinary.
- `localhost` corre en modo desarrollo: 1.25 MB de JS frente a 243 KB en el `main` de producción, y peticiones duplicadas por `StrictMode`.

## Cómo se verificó

Capturas por CDP a 2000, 1440, 1024, 390 y 360 px; clic real en el botón de idioma; error real del servidor en inglés; recorrido del DOM en modo EN buscando español; crítica independiente de las capturas; `tsc`, tests y `npm run build`.

No se probó con una cuenta real ni con el autorrelleno real de Chrome: favoritos con contenido, subir foto y el envío del correo quedaron sin ejercitar.
