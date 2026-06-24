# Portfolio — Juan I. Grassano

Portfolio web estático (HTML/CSS/JS vanilla, sin framework ni build). Se abre directo en el navegador.

## Estructura

```
PORTFOLIO2/
├── index.html              # Home: carrusel 3D de 12 cards (cilindro giratorio)
├── project-1.html ...      # 12 páginas de detalle de proyecto (project-1 a project-12)
│   project-12.html
├── css/
│   ├── style.css           # Estilos del home
│   └── project.css         # Estilos COMPARTIDOS por las 12 páginas de proyecto
├── js/
│   └── project.js          # JS COMPARTIDO por las 12 páginas (volver + overscroll a siguiente)
├── images/
│   ├── logoss.png          # Logo strip del home
│   ├── proyecto1/          # reign-img1..4.png   (proyecto 1)
│   ├── proyecto2/          # ultimatecup-img1..4.png (proyecto 2)
│   ├── proyecto3/          # extralife-img1..7 (.png/.jpg) (proyecto 3)
│   ├── proyecto4/          # trinity-img1..4.png (proyecto 4)
│   ├── proyecto5/          # casaca-img1..8.png (proyecto 5)
│   ├── proyecto6/          # UATRE-img1..5.png (proyecto 6)
│   ├── proyecto7/          # camaleon-img1..5.png (proyecto 7)
│   ├── proyecto8/          # oxencampus-img1..5.png (proyecto 8)
│   ├── proyecto9/          # spreen-img1..5.png (proyecto 9)
│   ├── proyecto10/         # magic-img1..5.png (proyecto 10)
│   ├── proyecto11/         # polkadot-img1.jpg, img2..3.png (proyecto 11)
│   └── proyecto12/         # virtualclub-img1..6.png (proyecto 12)
└── CLAUDE.md
```

## Home (index.html + css/style.css)

- Carrusel 3D: un cilindro de cards (`.carousel`) que gira, con perspectiva, blur por
  profundidad, distorsión "lens" en los costados y hover que frena el giro. Toda la lógica
  está en el `<script>` inline (loop con `requestAnimationFrame`).
- Texto central "Juan I. Grassano" + "Graphic Designer" con leve wobble.
- Navbar fija (Work / About / Contact), logo strip abajo.
- Fuente **Inter** (Google Fonts). Fondo `#f4f4f4`, texto `#111`.
- Cada card está envuelta en `<a href="project-N.html">`; la card 1 → project-1.html, etc.
  Mapeo 1↔1 entre las 12 cards y las 12 páginas.
- **Importante:** el carrusel está envuelto en `.carousel-zoom` (entre `.carousel-tilt` y
  `.carousel`). Ese wrapper es el que se anima en las transiciones; NO tocar el transform de
  `.carousel`, que lo reescribe el loop en cada frame.
- **Mobile (≤820px):** el cilindro gira en **vertical** (las cards suben/bajan). El loop
  detecta `VERTICAL = matchMedia('(max-width:820px)')` y arma los transforms con helpers
  `cardCSS()` / `carouselCSS()` (rotateX en vez de rotateY, scaleY en vez de scaleX para el
  lens). Se computa al cargar (al rotar el device hay que recargar). El media query en
  `style.css` achica el texto central, saca el wobble lateral del cilindro y ajusta navbar/logo.

## Páginas de proyecto (project-N.html + css/project.css)

- Layout en **2 columnas** (grid 40% / 60%):
  - Izquierda `.project-info`: **fija** (`position: sticky`). Botón Volver (cuadrado
    redondeado con flecha ←), título, año, descripción, etiquetas (chips: Blender, After
    Effects…), y metadatos (Cliente / Rol / Año).
  - Derecha `.project-gallery`: **scrolleable**, imágenes apiladas en vertical.
- **Fondo negro** `#0d0d0d`, texto claro. Sin navbar (se sacó a pedido).
- Imágenes de galería: `width: 100%`, `height: auto` (se respeta el aspect ratio, sin recorte).
  La columna derecha mide 60vw − 96px de padding. Recomendado exportar ~2400px de ancho.
- Las 12 páginas comparten **un solo** `css/project.css` (decisión tomada: CSS compartido, no
  uno por página). Para cambiar el diseño de todas, se edita ese único archivo.
- Se generaron con un script a partir de un template; tienen textos placeholder ("Proyecto N",
  descripción genérica, etiquetas y metadatos de ejemplo) listos para reemplazar con datos reales.

## Transiciones (home ↔ proyecto)

Fundido a negro continuo entre páginas (son archivos HTML separados pero el negro empalma):

- **Home → proyecto** (click en card):
  - `.carousel-zoom` hace zoom-out (`scale 1 → 2.6`) + las cards se **desenfocan de menor a
    mayor** (blur 0 → 20px, vía variable `extraBlur` sumada en el loop) + overlay negro
    (`.page-leave-overlay`) que se funde. A los 600ms navega.
  - El **texto central queda estático** (sólo escala/desenfoca el cilindro de imágenes).
- **Proyecto → home** (botón Volver): el proyecto se funde a negro y navega.
- **Proyecto → siguiente proyecto** (overscroll): al final de la **columna derecha**
  (`.project-gallery`) se inserta por JS una **zona** chica (`.next-project-zone`, ~32vh,
  fondo transparente = mismo negro) con el mensaje "Scroll to next project". Como la zona va
  DENTRO de la galería, la columna izquierda (`.project-info`, sticky) **queda siempre quieta**
  y solo scrollea la derecha. Al **acercarse al final** el **scroll se frena cada vez más**: se
  intercepta el `wheel`/`touchmove` y la página avanza con `factor = (1 - p)^1.8` (con tope
  `MIN_FACTOR` para que el fondo sea alcanzable). La resistencia se **ancla a la zona** del
  mensaje (empieza `RESIST_LEAD_VH` viewports antes), NO a un nº fijo de viewports — así en
  páginas cortas no dispara en el medio. La barra **solo carga en el último tramo**
  (`CHARGE_VH`), por lo que el cambio ocurre siempre al final. La energía resistida
  llena un **círculo de carga** (anillo SVG, `.next-project-ring`); al completar el umbral
  (~2300, `OVERSCROLL_THRESHOLD`) navega al `project-(N+1).html` con el mismo fundido a negro. Del 12 vuelve al 1 (`TOTAL_PROYECTOS`). Todo sobre fondo negro `#0d0d0d`. La lógica vive
  en `js/project.js` (rueda + touch no-pasivos, con descarga si se deja de scrollear). Las 12
  páginas incluyen `<script src="js/project.js"></script>`.
- **Entrada al home** (al volver o primera carga): `.carousel-zoom` zoom-in
  (`scale 2.6 → 1`) + blur **de mayor a menor** (20px → 0) + overlay negro que se desvanece.
- **Entrada al proyecto**: overlay negro que se desvanece + contenido con fade-up escalonado.
- Curvas suaves (cubic-bezier / easeInOut). Respeta `prefers-reduced-motion` (sin animación).
- El blur va aplicado **por card** (no en el wrapper) porque `filter` sobre un elemento
  `preserve-3d` lo aplanaría y rompería el efecto 3D.

## Convenciones

- Idioma de comentarios/UI: español.
- Sin dependencias ni build; editar HTML/CSS/JS directo.
- Texto editable de cada proyecto en su `project-N.html`: `.project-title`, `.project-description`,
  `.project-tags` (los `<li>`), `.project-meta` (los `<dd>`), y los `<img>` de `.project-gallery`.

## Estado / pendientes

- ✅ Proyecto 1: galería con `images/proyecto1/reign-img1..4.png` (4 imágenes).
- ✅ Proyecto 2: galería con `images/proyecto2/ultimatecup-img1..4.png` (4 imágenes).
- ✅ Proyecto 3: galería con `images/proyecto3/extralife-img1..7` (7 imágenes, .png/.jpg).
- ✅ Proyecto 4: galería con `images/proyecto4/trinity-img1..4.png` (4 imágenes).
- ✅ Proyecto 5: galería con `images/proyecto5/casaca-img1..8.png` (8 imágenes).
- ✅ Proyecto 6: galería con `images/proyecto6/UATRE-img1..5.png` (5 imágenes).
- ✅ Proyecto 7: galería con `images/proyecto7/camaleon-img1..5.png` (5 imágenes).
- ✅ Proyecto 8: galería con `images/proyecto8/oxencampus-img1..5.png` (5 imágenes).
- ✅ Proyecto 9: galería con `images/proyecto9/spreen-img1..5.png` (5 imágenes).
- ✅ Proyecto 10: galería con `images/proyecto10/magic-img1..5.png` (5 imágenes).
- ✅ Proyecto 11: galería con `images/proyecto11/polkadot-img1.jpg, img2..3.png` (3 imágenes).
- ✅ Proyecto 12: galería con `images/proyecto12/virtualclub-img1..6.png` (6 imágenes).
- 🗑️ Proyectos 13–20: ELIMINADOS (HTML borrados y cards sacadas del home). El portfolio
  ahora tiene 12 proyectos.
- ⬜ Textos reales (título, descripción, etiquetas, cliente/rol/año) de todos los proyectos,
  incluidos el 1 y 2.
- ⚠️ Las imágenes locales son PNG pesados (1–4.7 MB c/u). Conviene optimizarlas a WebP/JPG
  para que la página cargue rápido.
- Cards 10, 11 y 12 del home todavía muestran la imagen de relleno (Unsplash) en el carrusel;
  falta ponerles su portada real (ya tienen galería propia).
