/* ============================================================
   Lógica compartida por las 20 páginas de proyecto.
   - Transición del botón Volver (fundido a negro -> home).
   - "Overscroll" al final de la galería para pasar al siguiente
     proyecto: si seguís scrolleando un poco más abajo del final,
     un indicador se llena y al completarse navega al próximo.
   ============================================================ */
(function () {
    'use strict';

    const TOTAL_PROYECTOS = 12;
    const FADE_MS = 600;          // duración del fundido a negro (igual que el CSS)
    const OVERSCROLL_THRESHOLD = 2300; // px de "carga" para disparar el cambio (más alto = tarda más)
    const RESIST_LEAD_VH = 1.2;   // cuántos viewports antes de la zona empieza la desaceleración
    const CHARGE_VH = 0.6;        // la barra SOLO carga en el último tramo (siempre al FINAL)
    const MIN_FACTOR = 0.08;      // avance mínimo del scroll (para que el fondo sea alcanzable)

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Proyecto actual / siguiente (a partir del nombre de archivo) ---
    // Orden de los proyectos (carpetas), igual que en el carrusel del home.
    const ORDER = [
        'Reign-of-Titans', 'Ultimate-Cup', 'Extra-Life', 'Trinity-College',
        'Oxen-Jersey', 'UATRE', 'Camaleon', 'Oxen-Campus',
        'Spreen-WORLD', 'Magic-by-ZeKo', 'Polkadot', 'VirtualClub'
    ];
    // Carpeta actual = último segmento del path; el siguiente es el próximo del array (loop).
    const segs = location.pathname.split('/').filter(Boolean);
    const currentSlug = decodeURIComponent(segs[segs.length - 1] || '');
    let idx = ORDER.indexOf(currentSlug);
    if (idx === -1) idx = 0;
    const nextHref = '../' + ORDER[(idx + 1) % ORDER.length] + '/';

    // --- Navegación con fundido a negro (reutiliza .page-leave-overlay) ---
    let navigating = false;
    function navigateWithFade(href) {
        if (navigating) return;
        navigating = true;
        if (reduceMotion) {
            window.location.href = href;
            return;
        }
        document.body.classList.add('page-leaving');
        setTimeout(function () {
            window.location.href = href;
        }, FADE_MS);
    }

    // --- Botón Volver ---
    const backLink = document.querySelector('.back-link');
    if (backLink) {
        backLink.addEventListener('click', function (e) {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
            if (reduceMotion) return; // navegación normal
            e.preventDefault();
            navigateWithFade(backLink.getAttribute('href'));
        });
    }

    // --- Zona "Scroll to next project" (espacio real de scroll bajo la galería) ---
    // Se inserta después del <main> para que sume altura scrolleable de verdad.
    const zone = document.createElement('section');
    zone.className = 'next-project-zone';
    zone.setAttribute('aria-hidden', 'true');
    zone.innerHTML =
        '<div class="next-project-inner">' +
        '<span class="next-project-label">Scroll to next project</span>' +
        '<div class="next-project-ring">' +
        '<svg viewBox="0 0 48 48">' +
        '<circle class="ring-track" cx="24" cy="24" r="20"></circle>' +
        '<circle class="ring-progress" cx="24" cy="24" r="20"></circle>' +
        '</svg>' +
        '<span class="ring-arrow">&darr;</span>' +
        '</div>' +
        '</div>';
    // Dentro de la columna derecha: solo la galería scrollea, la izquierda queda quieta.
    const gallery = document.querySelector('.project-gallery');
    if (gallery) {
        gallery.appendChild(zone);
    } else {
        document.body.appendChild(zone);
    }
    const inner = zone.querySelector('.next-project-inner');
    const ring = zone.querySelector('.ring-progress');
    const RING_R = 20;
    const RING_CIRC = 2 * Math.PI * RING_R;
    ring.style.strokeDasharray = RING_CIRC.toFixed(2);
    ring.style.strokeDashoffset = RING_CIRC.toFixed(2); // arranca vacío

    // El mensaje aparece cuando la zona entra en viewport
    function onScroll() {
        const rect = zone.getBoundingClientRect();
        inner.classList.toggle('revealed', rect.top < window.innerHeight * 0.92);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // --- Estado de la "carga" para pasar de proyecto ---
    // Al entrar en la zona, el scroll se frena cada vez más (resistencia). La energía
    // que NO se traduce en scroll se acumula como "carga" y llena la barra; al llenarse,
    // cambia de proyecto.
    let charge = 0;
    let lastInputTime = 0;

    function metrics() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        // La resistencia se ANCLA a la zona del mensaje (final real de la galería), no a un
        // valor fijo de viewports: así nunca arranca en el medio de las imágenes en páginas
        // cortas. Empieza RESIST_LEAD_VH viewports antes de la zona.
        const zoneTopDoc = zone.getBoundingClientRect().top + scrollTop;
        const resistStart = Math.max(0, Math.min(zoneTopDoc - window.innerHeight * RESIST_LEAD_VH, maxScroll - 1));
        const resistDist = Math.max(1, maxScroll - resistStart);
        // La barra solo carga en el último tramo (siempre al final).
        const chargeStart = Math.max(resistStart, maxScroll - window.innerHeight * CHARGE_VH);
        return { scrollTop, maxScroll, resistStart, resistDist, chargeStart };
    }

    // Factor de avance del scroll: 1 = normal (fuera de la zona), -> MIN_FACTOR cuanto más
    // profundo (cada vez cuesta más scrollear, pero el fondo siempre es alcanzable).
    function scrollFactor(m) {
        if (m.scrollTop <= m.resistStart) return 1;
        const p = Math.min(1, (m.scrollTop - m.resistStart) / m.resistDist);
        return Math.max(MIN_FACTOR, Math.pow(1 - p, 1.8));
    }

    function updateHint() {
        const ratio = Math.max(0, Math.min(1, charge / OVERSCROLL_THRESHOLD));
        ring.style.strokeDashoffset = (RING_CIRC * (1 - ratio)).toFixed(2);
        inner.classList.toggle('charging', charge > 4);
    }

    function applyResistance(delta, gain) {
        if (navigating) return false;
        const m = metrics();
        if (m.scrollTop < m.resistStart) {
            // Fuera de la zona: scroll normal, sin carga.
            return false;
        }
        const factor = scrollFactor(m);
        const move = delta * factor;
        if (move > 0.1) window.scrollBy(0, move);
        // La barra SOLO carga en el tramo final (chargeStart -> fondo): así el cambio
        // ocurre siempre al final y nunca en el medio de las imágenes.
        if (m.scrollTop >= m.chargeStart) {
            charge += delta * (1 - factor) * gain;
            lastInputTime = performance.now();
            if (charge >= OVERSCROLL_THRESHOLD) {
                charge = OVERSCROLL_THRESHOLD;
                updateHint();
                navigateWithFade(nextHref);
                return true;
            }
        }
        updateHint();
        return true; // manejamos nosotros el scroll (preventDefault) en la zona de resistencia
    }

    // Rueda del mouse / trackpad
    window.addEventListener('wheel', function (e) {
        if (navigating) { e.preventDefault(); return; }
        if (e.deltaY <= 0) {                 // hacia arriba: libre y se descarga
            if (charge > 0) { charge = 0; updateHint(); }
            return;
        }
        if (applyResistance(e.deltaY, 1)) e.preventDefault();
    }, { passive: false });

    // Touch (mobile)
    let touchY = null;
    window.addEventListener('touchstart', function (e) {
        touchY = e.touches[0].clientY;
    }, { passive: true });
    window.addEventListener('touchmove', function (e) {
        if (touchY === null) return;
        const y = e.touches[0].clientY;
        const dy = touchY - y;               // positivo al deslizar hacia arriba (scroll down)
        touchY = y;
        if (navigating) { e.preventDefault(); return; }
        if (dy <= 0) {
            if (charge > 0) { charge = 0; updateHint(); }
            return;
        }
        if (applyResistance(dy, 1.3)) e.preventDefault();
    }, { passive: false });
    window.addEventListener('touchend', function () { touchY = null; }, { passive: true });

    // Si el usuario deja de scrollear, la barra se descarga de a poco.
    function decayLoop() {
        if (!navigating && charge > 0 && (performance.now() - lastInputTime) > 160) {
            charge = Math.max(0, charge - 14);
            updateHint();
        }
        requestAnimationFrame(decayLoop);
    }
    requestAnimationFrame(decayLoop);
}());
