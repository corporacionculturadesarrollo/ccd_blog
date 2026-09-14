# Blog CCD

Blog editorial en Astro, TypeScript y MDX, preparado para publicación estática en GitHub Pages.

## Desarrollo y validación

```bash
npm install
npm run dev
npm run validate
```

El contenido editorial está en `src/content/blog/*.mdx` y los perfiles en
`src/content/autores/*.mdx`. La integración oficial `@astrojs/mdx` está
habilitada en `astro.config.mjs`; los loaders de Astro aceptan únicamente
archivos `.mdx`.

## Mejoras recomendadas

### (A) Implementado ahora, sin servicios externos

- Portada editorial con destacados, búsqueda, filtro por autor y estados vacíos.
- Navegación de descubrimiento: categorías, etiquetas, autores y archivo agrupado por año.
- Artículos con breadcrumbs, TOC automático desde headings MDX, lectura estimada, navegación cronológica y relacionados con fallback reciente.
- Modo oscuro persistente y control de tamaño de texto persistente.
- Skip link, foco visible, `prefers-reduced-motion`, semántica de navegación y texto alternativo explícito en imágenes.
- JSON-LD de artículo y breadcrumbs, RSS, sitemap, robots y manifest estático.
- Componentes MDX existentes y perfiles de autor renderizados como contenido. El ejemplo de `Callout` se demuestra en `src/content/blog/componentes-mdx.mdx`.
- Índice de búsqueda global generado en build (`/search-index.json`) y componente MDX reutilizable `Callout.astro`.
- El índice global se solicita bajo demanda desde la portada, incluye título, descripción, autor, categorías, etiquetas y cuerpo normalizado, y no registra consultas.

### (B) Posterior, con servicios externos

1. **Analítica privacy-friendly:** Umami o Plausible para visitas por post; definir consentimiento, retención, eventos mínimos y panel editorial.
2. **Comentarios y respuestas:** Giscus + GitHub Discussions como opción de bajo mantenimiento; Supabase si se necesitan respuestas propias, identidad y moderación dentro del sitio.
3. **Datos y antiabuso:** Supabase Free para valoraciones 1–5, visitas agregadas y suscripciones, con RLS, deduplicación, rate limiting y borrado. La valoración debe limitar repeticiones por post y periodo, validar en servidor y permitir recalcular o desactivar resultados.
4. **Suscripciones:** Buttondown para newsletter sin backend propio o Supabase para listas globales/por autor; ambos deben cubrir double opt-in, baja inmediata, preferencias y privacidad.
5. **PWA/offline:** service worker solo si se confirma la necesidad de lectura offline y se define invalidación de caché.
6. **Gobernanza:** documentar revisión, licencias, autoría, correcciones, moderación, exportación/borrado y responsables.

### Comparativa breve

| Opción | Coste/capacidad | Limitaciones y encaje |
| --- | --- | --- |
| **Supabase Free** | Base de datos, Auth, Storage y APIs para visitas agregadas, estrellas, comentarios y suscripciones; buen control de datos. | Cuotas, suspensión/inactividad y límites del plan gratuito; exige diseñar RLS, validación server-side y antiabuso. Recomendado para datos propios. |
| **Giscus** | Comentarios y respuestas sobre GitHub Discussions, sin backend propio ni coste de infraestructura del sitio. | Requiere cuenta GitHub y Discussions; moderación y experiencia dependen de GitHub. Recomendado para comentarios sencillos. |
| **Umami / Plausible** | Analítica privacy-friendly, ligera y orientada a métricas agregadas por post sin cookies invasivas. | Son servicios separados con límites/coste y menor control de datos que una solución propia; validar residencia, exportación y retención. |
| **Buttondown** | Newsletter, double opt-in, bajas y entregabilidad sin construir backend. | Dependencia de tercero, límites/precios cambiantes y menos control sobre el modelo de suscripciones por autor. |

La arquitectura recomendada es **Supabase Free para datos + Giscus para comentarios**. Si se necesitan respuestas propias, perfiles, suscripciones por autor dentro del producto o reglas de moderación integradas, usar Supabase también para comentarios. GitHub Pages no ofrece backend: nunca exponer claves privilegiadas; usar solo `anon key` con RLS o un endpoint/proxy seguro.

### Criterios de aceptación del roadmap

- Funciona con HTML estático y build reproducible en GitHub Pages.
- No requiere claves privilegiadas en el navegador; solo `anon key` con RLS o un endpoint/proxy seguro.
- Cada función externa tiene consentimiento, política de privacidad, retención y alternativa accesible.
- Las métricas no identifican innecesariamente a lectores ni degradan Core Web Vitals.
- Las cuotas/precios se verifican en las páginas oficiales antes de contratar y no se fijan como promesas en esta documentación.

### Pendientes locales revisados

- El índice global es estático y se carga bajo demanda desde la portada; no registra consultas ni depende de una API.
- La paginación y el archivo usan constantes centralizadas en `src/lib/pagination.ts`; las rutas vacías no se generan.
- Los componentes MDX deben limitarse a mejoras semánticas y mantener una alternativa legible si JavaScript no está disponible.
- Antes de añadir analítica, comentarios o suscripciones siguen siendo necesarias decisiones de proveedor, privacidad, moderación y credenciales.

### Validación actual

`npm run validate` ejecuta `tsc --noEmit` y `astro build`. El build debe
generar también `/search-index.json`, `/rss.xml`, `/sitemap.xml`, `/robots.txt`,
las páginas de archivo y las rutas de contenido MDX. Cualquier incorporación
de un componente MDX debe conservar lectura lineal, HTML semántico y una
alternativa útil sin JavaScript.

## Despliegue

El workflow de `.github/workflows/deploy.yml` ejecuta la validación y publica
`dist/` mediante GitHub Pages. Ajusta `site` y `base` en `astro.config.mjs`
si el repositorio se publica bajo una ruta distinta.

## Estructura de archivo y paginación

- La portada raíz (`/`) es la primera página editorial y muestra hasta 9 posts (`HOME_PAGE_SIZE` en `src/lib/pagination.ts`).
- Las páginas siguientes viven en `/pagina/2/`, `/pagina/3/`, etc.; los enlaces anterior/siguiente son semánticos y accesibles.
- `/archivo/` agrupa los años y enlaza solo meses que tienen publicaciones.
- `/archivo/:year/` muestra los meses disponibles de ese año.
- `/archivo/:year/:month/` muestra el primer bloque mensual.
- Si un mes supera `MONTH_PAGE_SIZE = 12` (configurable en `src/lib/pagination.ts`), se generan páginas adicionales en `/archivo/:year/:month/2/`, `/3/`, etc. Los meses con 12 o menos posts no crean rutas adicionales.

## Manual y generador MDX

- El manual, el generador local y sus artefactos se mantienen fuera de este
  repositorio, en `C:\Users\kutzm\Desktop\blog_utils`.
- El generador rellena frontmatter, contenido, imagen/audio/video, controles
  multimedia, preview, copia y descarga `.mdx`. Los bloques multimedia se
  pueden subir, bajar o eliminar y las imágenes sin `alt` se rechazan.
- Flujo seguro: descarga o copia el resultado, guárdalo manualmente en
  `src/content/blog/nombre-del-post.mdx`, añade recursos a `public/images/` y
  ejecuta `npm run validate`. El navegador nunca escribe en el repositorio.

### Generar el PDF fuera del repositorio

```bash
cd "C:\Users\kutzm\Desktop\blog_utils"
node scripts/generate-manual-pdf.mjs
```

El script usa Chrome o Edge instalado localmente. También acepta
`CHROME_PATH` para indicar otra ubicación. Si no hay navegador Chromium
disponible, el HTML del manual sigue siendo imprimible con el diálogo del navegador:
**Imprimir → Guardar como PDF**. El PDF no se genera en GitHub Actions salvo
que el workflow instale/configure un navegador.
