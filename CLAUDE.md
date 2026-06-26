# Portfolio — Juan I. Grassano

Portfolio web **estático** (HTML/CSS/JS vanilla, sin framework ni build). Bilingüe ES/EN.
Publicado con **GitHub Pages** en el dominio **https://www.ngrassano.com**
(repo: https://github.com/nachograssano/portfolio).

## Estructura

```
PORTFOLIO2/
├── index.html                 # Home: carrusel 3D de 12 cards (cilindro giratorio). URL: /
├── about/index.html           # Página About (fondo rojo). URL: /about
├── <slug>/index.html          # 12 páginas de proyecto, cada una en su carpeta. URL: /<slug>
├── css/
│   ├── style.css              # Estilos del home
│   ├── project.css            # Estilos COMPARTIDOS por las 12 páginas de proyecto
│   └── about.css              # Estilos de la página About
├── js/
│   ├── i18n.js                # Multilenguaje + selector de banderas (compartido por TODAS)
│   └── project.js             # JS COMPARTIDO por las 12 páginas (volver + overscroll a siguiente)
├── images/<proyectoN>/        # imágenes; YA convertidas a .webp (referenciadas), + originales PNG/JPG
├── .vscode/                   # launch.json + tasks.json (F5 = server local) — versionados
├── .nojekyll, CNAME           # GitHub Pages (CNAME = www.ngrassano.com)
└── CLAUDE.md
```

### URLs limpias (sin .html)
Cada página es una **carpeta con `index.html`** → GitHub Pages la sirve sin extensión (`/about`,
`/Reign-of-Titans`). Las rutas internas de las páginas de carpeta usan `../` (ej. `../css/`,
`../js/`, `../images/`, Volver → `../`). El home (raíz) usa rutas directas (`css/`, `js/`, `images/`).

### Mapa proyecto ↔ carpeta (orden del carrusel)
1 `Reign-of-Titans` · 2 `Ultimate-Cup` · 3 `Extra-Life` · 4 `Trinity-College` ·
5 `Oxen-Jersey` · 6 `UATRE` · 7 `Camaleon` · 8 `Oxen-Campus` · 9 `Spreen-WORLD` ·
10 `Magic-by-ZeKo` · 11 `Polkadot` · 12 `VirtualClub`.
Las imágenes internas siguen nombradas por su carpeta vieja `images/proyectoN/` (N = número de arriba).

## Home (index.html + css/style.css)

- Carrusel 3D: cilindro de cards (`.carousel`) que gira con perspectiva, distorsión "lens" en los
  costados y hover que frena el giro. Lógica en `<script>` inline (loop `requestAnimationFrame`).
  El blur de profundidad está desactivado (`MAX_BLUR = 0`).
- Cada card escala con **supersampling** (`SS = 2`): se dibuja a 2× y se reescala (`renderScale`)
  para que no se vea pixelada bajo la magnificación de la perspectiva.
- Texto central "Juan I. Grassano" + rol (traducible). Navbar **centrada arriba** (Work / About;
  se sacó Contact). Logo strip abajo. Fuente **Inter**. Fondo `#f4f4f4`, texto `#111`.
- Cada card está envuelta en `<a href="<slug>/">` (mapeo 1↔1 con las 12 carpetas).
- **Importante:** el carrusel va envuelto en `.carousel-zoom` (entre `.carousel-tilt` y
  `.carousel`). Ese wrapper se anima en las transiciones; NO tocar el transform de `.carousel`,
  que lo reescribe el loop cada frame.
- **Mobile (≤820px):** el cilindro gira en **vertical** (eje X; las cards suben/bajan). El loop
  detecta `VERTICAL = matchMedia('(max-width:820px)')` (se actualiza en vivo al redimensionar) y
  arma los transforms con helpers `cardCSS()` / `carouselCSS()`. El tamaño/radio se basa en el
  **alto** del celular. Navbar → **menú hamburguesa**. Texto central estático (sin wobble).

## Páginas de proyecto (<slug>/index.html + css/project.css)

- Layout 2 columnas (grid 40% / 60%): izquierda `.project-info` **sticky** (botón Volver, título,
  rol, descripción, etiquetas/chips, metadatos Cliente/Rol/Año); derecha `.project-gallery`
  **scrolleable**. Fondo negro `#0d0d0d`, texto claro, sin navbar.
- Comparten **un solo** `css/project.css` y **un solo** `js/project.js`.
- Cargan `i18n.js` ANTES de `project.js`. Referencias con **versión de caché** (`?v=N`) para
  invalidar la caché de Cloudflare al cambiar JS/CSS — **subir el número al editar** esos archivos.

## Multilenguaje (js/i18n.js)

- Default **Español**. Selector con banderas **🇦🇷 ES / 🇺🇸 EN** (SVG inline) que `i18n.js` inyecta
  en una esquina (arriba-derecha desktop; arriba-izquierda mobile). Recuerda el idioma en
  `localStorage` y actualiza `<html lang>`.
- Traduce todo elemento con atributos **`data-es` / `data-en`** (asigna `innerHTML`). Para texto
  inyectado por JS (ej. "Scroll to next project"), `project.js` llama a `window.applyLang()`.
- Nombres propios (marcas, clientes, herramientas: Blender, etc.) quedan igual en ambos idiomas.

## Transiciones

- **Home → proyecto** (click): `.carousel-zoom` zoom-out (`scale 1→2.6`) + blur por card (0→20px,
  vía `extraBlur`) + overlay negro `.page-leave-overlay`, navega. El texto central no escala.
- **Home → About** (navbar): un **cuadrado rojo** crece desde el centro (con motion-blur) tapando
  todo, y navega (empalma con el rojo del About). Lógica en el inline script del home (`.to-about`).
- **Proyecto → home** (Volver): fundido a negro → navega.
- **Proyecto → siguiente** (overscroll): zona chica `.next-project-zone` (~32vh) dentro de la
  galería con "Scroll to next project". Al acercarse al final el scroll **se frena** (`factor =
  (1-p)^1.8`, tope `MIN_FACTOR`); la energía resistida llena un **anillo SVG** y al umbral
  (`OVERSCROLL_THRESHOLD ≈ 2300`) navega al siguiente slug (`../<slug>/`, orden en array `ORDER`;
  del 12 vuelve al 1). La carga NO se descarga sola.
- **Entrada al home**: `.carousel-zoom` zoom-in (2.6→1) + blur 20→0. **Entrada al proyecto**:
  overlay negro que se desvanece + fade-up escalonado.
- **bfcache**: ambos lados escuchan `pageshow` (`event.persisted`) y resetean `page-leaving` /
  `to-about` / `navigating` para que al volver con el botón atrás no quede el zoom/overlay trabado.
- Respeta `prefers-reduced-motion`. El blur va **por card** (filter sobre `preserve-3d` lo
  aplanaría).

## Imágenes

- **Convertidas a WebP** (calidad 90, dimensiones originales): biblioteca de 168.9 MB → 20.6 MB
  (~88% menos). Home ~1.6 MB, página de proyecto pesada ~2.5 MB. El HTML referencia los `.webp`.
- Los **originales PNG/JPG siguen en `images/`** (redundantes para producción). Se pueden borrar
  para alivianar el repo. La conversión se hizo con `sharp` fuera del repo (`C:\Users\nacho\img-optim`).

## Desarrollo local (F5 en VSCode)

- **F5** levanta un server local (`http-server` en `http://localhost:5500`) y abre el navegador.
  Config en `.vscode/launch.json` (Edge/Chrome) + `.vscode/tasks.json`. La tarea corre en
  **cmd.exe** (evita el bloqueo de ExecutionPolicy de PowerShell con `npx.ps1`).
- Requiere **Node** (instalado vía winget) en el PATH → si VSCode estaba abierto desde antes de
  instalar Node, reiniciarlo. Hace falta servidor HTTP (no `file://`) por las URLs de carpeta.

## Deploy

- **GitHub Pages** desde rama `main`, raíz. Dominio `www.ngrassano.com` (Cloudflare DNS + `CNAME`).
- Flujo: `git add -A` → `git commit` → `git push`. ~1-2 min para republicar.
- **Cloudflare cachea JS/CSS**: al cambiar `project.js`/`i18n.js`/`project.css`, **subir `?v=N`**
  en las referencias de las 12 páginas, o purgar caché en Cloudflare (Caching → Purge Everything).

## Convenciones

- Idioma de comentarios/UI: español. Sin dependencias ni build; editar HTML/CSS/JS directo.
- Textos de cada proyecto: en su `<slug>/index.html` (`.project-title`, `.project-description`,
  `.project-tags`, `.project-meta`, `.project-gallery`), con `data-es`/`data-en` para bilingüe.

## Estado / pendientes

- ✅ 12 proyectos con galerías reales, portadas (miniaturas) en el home, textos reales ES + EN.
- ✅ Bilingüe, URLs limpias, dominio propio, responsive (carrusel vertical en mobile), F5 local.
- ✅ Imágenes optimizadas a WebP (originales PNG/JPG todavía presentes en el repo).
- ⬜ Opcional: borrar originales PNG/JPG del repo para alivianarlo (el sitio ya usa solo `.webp`).
- ⬜ Opcional: traducir `<title>` de las pestañas y `aria-label` del botón Volver (siguen en ES).
- ⬜ Opcional: pausar el loop del carrusel cuando la pestaña no está visible (ahorro de batería).
