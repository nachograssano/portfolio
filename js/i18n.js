/* ============================================================
   Multilenguaje (ES / EN) — compartido por todas las páginas.
   - Inyecta el selector de banderas (Argentina = ES, EE.UU. = EN) y sus estilos.
   - Traduce cualquier elemento con atributos data-es / data-en (usa innerHTML).
   - Recuerda el idioma elegido en localStorage y actualiza <html lang>.
   - Expone window.applyLang() para re-traducir contenido inyectado por JS.
   ============================================================ */
(function () {
    'use strict';

    var STORAGE_KEY = 'lang';
    var SUPPORTED = ['es', 'en'];
    var DEFAULT_LANG = 'es';

    function currentLang() {
        var saved = localStorage.getItem(STORAGE_KEY);
        return SUPPORTED.indexOf(saved) !== -1 ? saved : DEFAULT_LANG;
    }

    // Banderas como SVG inline (se ven igual en todos los sistemas).
    var FLAG_AR =
        '<svg viewBox="0 0 24 16" aria-hidden="true">' +
        '<rect width="24" height="16" fill="#fff"/>' +
        '<rect width="24" height="5.33" fill="#74ACDF"/>' +
        '<rect width="24" height="5.33" y="10.67" fill="#74ACDF"/>' +
        '<circle cx="12" cy="8" r="2.5" fill="none" stroke="#F6B40E" stroke-width="1.1" stroke-dasharray="0.5 0.8"/>' +
        '<circle cx="12" cy="8" r="1.5" fill="#F6B40E"/>' +
        '</svg>';

    var FLAG_US =
        '<svg viewBox="0 0 24 16" aria-hidden="true">' +
        '<rect width="24" height="16" fill="#fff"/>' +
        '<g fill="#B22234">' +
        '<rect width="24" height="1.23" y="0"/><rect width="24" height="1.23" y="2.46"/>' +
        '<rect width="24" height="1.23" y="4.92"/><rect width="24" height="1.23" y="7.38"/>' +
        '<rect width="24" height="1.23" y="9.85"/><rect width="24" height="1.23" y="12.31"/>' +
        '<rect width="24" height="1.23" y="14.77"/>' +
        '</g>' +
        '<rect width="9.6" height="8.62" fill="#3C3B6E"/>' +
        '<g fill="#fff">' +
        '<circle cx="1.8" cy="1.6" r="0.5"/><circle cx="4.2" cy="1.6" r="0.5"/><circle cx="6.6" cy="1.6" r="0.5"/>' +
        '<circle cx="3" cy="3.4" r="0.5"/><circle cx="5.4" cy="3.4" r="0.5"/><circle cx="7.8" cy="3.4" r="0.5"/>' +
        '<circle cx="1.8" cy="5.2" r="0.5"/><circle cx="4.2" cy="5.2" r="0.5"/><circle cx="6.6" cy="5.2" r="0.5"/>' +
        '<circle cx="3" cy="7" r="0.5"/><circle cx="5.4" cy="7" r="0.5"/><circle cx="7.8" cy="7" r="0.5"/>' +
        '</g>' +
        '</svg>';

    var CSS =
        '.lang-switch{position:fixed;top:1.6rem;right:1.6rem;z-index:9001;display:flex;gap:.35rem;' +
        'background:#0d0d0d;padding:.35rem;border-radius:11px;box-shadow:0 5px 18px rgba(0,0,0,.4);}' +
        '.lang-switch button{display:block;width:32px;height:22px;padding:0;border:none;background:none;cursor:pointer;' +
        'border-radius:5px;overflow:hidden;box-shadow:0 0 0 1px rgba(255,255,255,.12);' +
        'filter:brightness(.4);transition:filter .25s ease,transform .2s ease;}' +
        '.lang-switch button svg{width:100%;height:100%;display:block;}' +
        '.lang-switch button:hover{filter:brightness(.7);}' +
        '.lang-switch button.active{filter:none;}' +
        '@media (max-width:820px){.lang-switch{top:1.4rem;left:1.1rem;right:auto;}}' +
        '@media (prefers-reduced-motion:reduce){.lang-switch button{transition:none;}}';

    function applyLang(lang) {
        lang = SUPPORTED.indexOf(lang) !== -1 ? lang : currentLang();
        document.documentElement.lang = lang;
        var nodes = document.querySelectorAll('[data-es],[data-en]');
        for (var i = 0; i < nodes.length; i++) {
            var val = nodes[i].getAttribute('data-' + lang);
            if (val !== null) nodes[i].innerHTML = val;
        }
        var btns = document.querySelectorAll('.lang-switch button');
        for (var j = 0; j < btns.length; j++) {
            var on = btns[j].getAttribute('data-lang') === lang;
            btns[j].classList.toggle('active', on);
            btns[j].setAttribute('aria-pressed', on ? 'true' : 'false');
        }
    }
    window.applyLang = applyLang;

    function mount() {
        var style = document.createElement('style');
        style.textContent = CSS;
        document.head.appendChild(style);

        var sw = document.createElement('div');
        sw.className = 'lang-switch';
        sw.setAttribute('role', 'group');
        sw.setAttribute('aria-label', 'Idioma / Language');
        sw.innerHTML =
            '<button type="button" data-lang="es" aria-label="Español (Argentina)">' + FLAG_AR + '</button>' +
            '<button type="button" data-lang="en" aria-label="English (United States)">' + FLAG_US + '</button>';
        document.body.appendChild(sw);

        var btns = sw.querySelectorAll('button');
        for (var i = 0; i < btns.length; i++) {
            btns[i].addEventListener('click', function () {
                var lang = this.getAttribute('data-lang');
                localStorage.setItem(STORAGE_KEY, lang);
                applyLang(lang);
            });
        }
        applyLang(currentLang());
    }

    if (document.body) mount();
    else document.addEventListener('DOMContentLoaded', mount);
}());
