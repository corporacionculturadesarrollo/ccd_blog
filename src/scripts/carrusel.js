// ——— Carruseles (portada y secciones): flechas, puntos y altura adaptable ———
// Compartido por la portada (búsqueda y filtro por autor) y por la sección
// «Artículos relacionados» de cada artículo. Cada carrusel necesita, dentro de
// su <section>, los botones .carousel-btn.prev/.next y el contenedor .carousel-dots.
//
// Los puntos se repintan cada vez que cambian las tarjetas visibles: uno por
// bloque (en móvil un bloque es una tarjeta). Si hay 10 puntos o menos se
// muestran todos; si hay más, al llegar al final de la tanda se pasa a la
// siguiente (10, o las que queden si es la última).
(function () {
    var mqMovil = window.matchMedia('(max-width: 560px)');
    var MAX_PUNTOS = 10;
    var repintados = [];

    Array.prototype.forEach.call(document.querySelectorAll('.carousel'), function (carousel) {
        var section = carousel.closest('section') || document;
        var prev = section.querySelector('.carousel-btn.prev');
        var next = section.querySelector('.carousel-btn.next');
        if (!prev || !next) return;

        var track = carousel.querySelector('.carousel-track');
        var nav = section.querySelector('.carousel-nav');
        var hint = section.querySelector('.carousel-hint');
        var dotsBox = section.querySelector('.carousel-dots');
        var slides = [];
        var dots = [];

        // Orden original de las tarjetas (visibles y ocultas): permite
        // reconstruir el carrusel cuando un filtro cambia lo que se ve
        var todas = Array.prototype.slice.call(track.querySelectorAll('li'));
        var prefijoPunto = dotsBox && dotsBox.querySelector('.carousel-dot')
            ? dotsBox.querySelector('.carousel-dot').getAttribute('aria-label').replace(/\d+$/, '')
            : 'Ir al bloque ';

        // Almacén fuera de la pista para las tarjetas que oculta el filtro:
        // fuera de ahí no dejan hueco ni descuadran los bloques
        var reserva = document.createElement('ul');
        reserva.className = 'carousel-pool';
        reserva.hidden = true;
        carousel.appendChild(reserva);

        var porBloque = 0;
        var inicio = 0;   // primer punto de la ventana visible
        var ventana = -1;  // ventana ya pintada (-1 = pintar al iniciar)

        function porDefecto() { return mqMovil.matches ? 1 : 2; }

        function offsets() {
            var base = carousel.getBoundingClientRect().left;
            return slides.map(function (s) { return s.getBoundingClientRect().left - base + carousel.scrollLeft; });
        }

        function activeIndex() {
            if (!slides.length) return 0;
            var pos = carousel.scrollLeft, best = 0, bestDiff = Infinity;
            offsets().forEach(function (o, i) {
                var d = Math.abs(o - pos);
                if (d < bestDiff) { bestDiff = d; best = i; }
            });
            return best;
        }

        function fitHeight() {
            if (!slides.length) {
                if (carousel.style.height !== '0px') carousel.style.height = '0px';
                return;
            }
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

        // Agrupa de nuevo las tarjetas visibles en bloques y repinta los puntos
        // para que coincidan exactamente con los bloques que se ven
        function repintar() {
            var n = porDefecto();
            porBloque = n;

            var visibles = [];
            var ocultas = [];
            todas.forEach(function (card) { (card.hidden ? ocultas : visibles).push(card); });
            ocultas.forEach(function (card) { reserva.appendChild(card); });

            var frag = document.createDocumentFragment();
            var bloque = null;
            visibles.forEach(function (card, i) {
                if (i % n === 0) {
                    var slide = document.createElement('div');
                    slide.className = 'carousel-slide';
                    bloque = document.createElement('ul');
                    bloque.className = 'posts-list';
                    slide.appendChild(bloque);
                    frag.appendChild(slide);
                }
                bloque.appendChild(card);
            });
            track.replaceChildren(frag);
            slides = Array.prototype.slice.call(track.querySelectorAll('.carousel-slide'));

            // Un punto por bloque visible (la ventana de 10 se aplica al pintar)
            if (dotsBox) {
                var dfrag = document.createDocumentFragment();
                slides.forEach(function (_, i) {
                    var dot = document.createElement('button');
                    dot.className = 'carousel-dot';
                    dot.type = 'button';
                    dot.setAttribute('aria-label', prefijoPunto + (i + 1));
                    dot.setAttribute('aria-current', i === 0 ? 'true' : 'false');
                    dfrag.appendChild(dot);
                });
                dotsBox.replaceChildren(dfrag);
                dots = Array.prototype.slice.call(dotsBox.querySelectorAll('.carousel-dot'));
                inicio = 0;
                ventana = -1;
            }

            // Con un solo bloque no hay nada que desplazar
            if (nav) nav.hidden = slides.length <= 1;
            if (hint) hint.hidden = slides.length <= 1;

            var comportamiento = carousel.style.scrollBehavior;
            carousel.style.scrollBehavior = 'auto';
            carousel.scrollLeft = 0;
            carousel.style.scrollBehavior = comportamiento;

            bindDots();
            update();
        }

        prev.addEventListener('click', function () { step(-1); });
        next.addEventListener('click', function () { step(1); });
        carousel.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', function () {
            if (porDefecto() !== porBloque) repintar();
            else update();
        });
        carousel.addEventListener('load', fitHeight, true);
        carousel.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
        });

        repintar();
        repintados.push(repintar);
    });

    // Tras un filtro (búsqueda o autor) hay que reagrupar: las tarjetas ocultas
    // no deben dejar huecos, los puntos deben reflejar lo que se ve y la altura
    // del carrusel debe corresponder al bloque activo
    window.__rebuildCarousels = function () {
        repintados.forEach(function (fn) { fn(); });
    };
})();
