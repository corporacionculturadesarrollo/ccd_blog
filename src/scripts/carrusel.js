// ——— Carruseles (portada y secciones): flechas, puntos y altura adaptable ———
// Compartido por la portada y por la sección «Artículos relacionados» de cada
// artículo. Cada carrusel necesita, dentro de su <section>, los botones
// .carousel-btn.prev/.next y el contenedor .carousel-dots.
(function () {
    var fits = [];
    var mqMovil = window.matchMedia('(max-width: 560px)');
    Array.prototype.forEach.call(document.querySelectorAll('.carousel'), function (carousel) {
        var section = carousel.closest('section') || document;
        var prev = section.querySelector('.carousel-btn.prev');
        var next = section.querySelector('.carousel-btn.next');
        if (!prev || !next) return;
        var track = carousel.querySelector('.carousel-track');
        var dotsBox = section.querySelector('.carousel-dots');
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.carousel-slide'));
        var dots = Array.prototype.slice.call(section.querySelectorAll('.carousel-dot'));
        // Puntos: como máximo se muestran MAX_PUNTOS a la vez; al llegar al
        // final de la tanda visible se refresca con la siguiente (10, o las
        // que queden si es la última tanda)
        var MAX_PUNTOS = 10;
        var inicio = 0;   // primer punto de la ventana visible
        var ventana = -1;  // ventana ya pintada (-1 = pintar al iniciar)
        // Escritorio: bloques de 2 del servidor; móvil: 1 tarjeta por bloque (sin apilar)
        var porBloque = 2;
        function porDefecto() { return mqMovil.matches ? 1 : 2; }
        function regroup(n) {
            porBloque = n;
            var cards = Array.prototype.slice.call(track.querySelectorAll('li'));
            var frag = document.createDocumentFragment();
            var slide = null;
            cards.forEach(function (card, i) {
                if (i % n === 0) {
                    slide = document.createElement('div');
                    slide.className = 'carousel-slide';
                    var ul = document.createElement('ul');
                    ul.className = 'posts-list';
                    slide.appendChild(ul);
                    frag.appendChild(slide);
                }
                slide.querySelector('ul').appendChild(card);
            });
            track.replaceChildren(frag);
            slides = Array.prototype.slice.call(track.querySelectorAll('.carousel-slide'));
            carousel.scrollLeft = 0;
            if (dotsBox && dots.length) {
                var base = dots[0].getAttribute('aria-label').replace(/\d+$/, '');
                var dfrag = document.createDocumentFragment();
                for (var j = 0; j < slides.length; j++) {
                    var dot = document.createElement('button');
                    dot.className = 'carousel-dot';
                    dot.type = 'button';
                    dot.setAttribute('aria-label', base + (j + 1));
                    dot.setAttribute('aria-current', j === 0 ? 'true' : 'false');
                    dfrag.appendChild(dot);
                }
                dotsBox.replaceChildren(dfrag);
                dots = Array.prototype.slice.call(dotsBox.querySelectorAll('.carousel-dot'));
                inicio = 0;
                ventana = -1;
            }
        }
        function offsets() {
            var base = carousel.getBoundingClientRect().left;
            return slides.map(function (s) { return s.getBoundingClientRect().left - base + carousel.scrollLeft; });
        }
        function activeIndex() {
            var pos = carousel.scrollLeft, best = 0, bestDiff = Infinity;
            offsets().forEach(function (o, i) {
                var d = Math.abs(o - pos);
                if (d < bestDiff) { bestDiff = d; best = i; }
            });
            return best;
        }
        function fitHeight() {
            var h = slides[activeIndex()].offsetHeight + 'px';
            if (carousel.style.height !== h) carousel.style.height = h;
        }
        function update() {
            var max = carousel.scrollWidth - carousel.clientWidth - 2;
            prev.disabled = carousel.scrollLeft <= 2;
            next.disabled = carousel.scrollLeft >= max;
            var idx = activeIndex();
            recalcularVentana(idx);
            pintarVentana();
            dots.forEach(function (d, i) { d.setAttribute('aria-current', i === idx ? 'true' : 'false'); });
            fitHeight();
        }
        // Ventana de puntos: si el activo llega al último punto visible, se salta
        // a la siguiente tanda; la última se alinea para no pasar del total.
        function recalcularVentana(idx) {
            if (dots.length <= MAX_PUNTOS) { inicio = 0; return; }
            if (idx < inicio) inicio = idx;
            else if (idx >= inicio + MAX_PUNTOS - 1) inicio = Math.min(idx, dots.length - MAX_PUNTOS);
        }
        function pintarVentana() {
            if (ventana === inicio) return;
            ventana = inicio;
            dots.forEach(function (d, i) { d.hidden = i < inicio || i >= inicio + MAX_PUNTOS; });
        }
        function step(dir) { carousel.scrollBy({ left: dir * carousel.clientWidth, behavior: 'smooth' }); }
        function bindDots() {
            dots.forEach(function (d, i) {
                d.addEventListener('click', function () {
                    carousel.scrollTo({ left: offsets()[i], behavior: 'smooth' });
                });
            });
        }
        prev.addEventListener('click', function () { step(-1); });
        next.addEventListener('click', function () { step(1); });
        carousel.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', function () {
            if (porDefecto() !== porBloque) { regroup(porDefecto()); bindDots(); }
            update();
        });
        carousel.addEventListener('load', fitHeight, true);
        carousel.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
        });
        if (porDefecto() !== porBloque) regroup(porDefecto());
        bindDots();
        fits.push(fitHeight);
        update();
    });
    window.__refitCarousels = function () { fits.forEach(function (f) { f(); }); };
})();
