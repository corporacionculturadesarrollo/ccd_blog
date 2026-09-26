<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" omit-xml-declaration="yes" indent="yes"/>

  <xsl:template match="/">
    <html lang="es">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title><xsl:value-of select="rss/channel/title"/> | RSS</title>
        <style>
          :root { color-scheme: light dark; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: #fffdfb;
            color: #3f302b;
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
            line-height: 1.65;
          }
          a { color: #9a5f3f; }
          a:hover { color: #24130f; }

          /* Barra superior (réplica de .blog-navbar) */
          .bar {
            background: #fffdfb;
            border-bottom: 1px solid #e4d7cf;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
            position: sticky;
            top: 0;
            z-index: 10;
          }
          .bar-inner {
            align-items: center;
            display: flex;
            height: 65px;
            justify-content: space-between;
            margin: 0 auto;
            max-width: 850px;
            padding: 0 1.5rem;
          }
          .bar-inner img {
            height: 46px;
            object-fit: contain;
            transform: scale(1.08);
            transform-origin: left center;
            width: 84px;
          }
          .bar-inner .navlink {
            color: #3f302b;
            font-size: 0.82rem;
            font-weight: 600;
            text-decoration: none;
          }
          .bar-inner .navlink:hover { color: #9a5f3f; }

          /* Contenedor (réplica de .blog-container) */
          main {
            margin: 0 auto;
            max-width: 850px;
            padding: 2rem 1.5rem 1rem;
          }

          /* Cabecera de página (réplica de .page-heading + .eyebrow) */
          .page-heading {
            border-bottom: 2px solid #e4d7cf;
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
          }
          .eyebrow {
            color: #9a5f3f;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.12em;
            margin: 0;
            text-transform: uppercase;
          }
          .page-heading h1 {
            color: #24130f;
            font-size: clamp(2.2rem, 5vw, 3.4rem);
            line-height: 1.25;
            margin: 0.3rem 0;
          }
          .page-heading .lead { color: #667085; margin: 0; }

          /* Nota de suscripción (réplica de .about-filosofia) */
          .note {
            background: #f8f1ec;
            border: 1px dashed #e4d7cf;
            border-radius: 0.75rem;
            color: #3f302b;
            font-size: 0.92rem;
            margin: 0 0 1.25rem;
            padding: 0.9rem 1.15rem;
          }
          .count {
            color: #9a5f3f;
            font-size: 0.78rem;
            font-weight: 700;
            letter-spacing: 0.07em;
            margin: 0 0 0.75rem;
            text-transform: uppercase;
          }

          /* Lista de entradas (réplica de .posts-list + .post-item) */
          .list {
            display: grid;
            gap: 1rem;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .post {
            background: #f8f1ec;
            border-left: 5px solid #9a5f3f;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
            padding: clamp(1.25rem, 4vw, 2rem);
          }
          .post .date { color: #667085; font-size: 0.78rem; margin: 0; }
          .post h2 {
            font-size: clamp(1.4rem, 3vw, 1.7rem);
            font-weight: 700;
            line-height: 1.3;
            margin: 0.4rem 0 0.5rem;
          }
          .post h2 a { color: #24130f; text-decoration: none; }
          .post h2 a:hover { color: #9a5f3f; text-decoration: underline; }
          .post .desc { color: #3f302b; margin: 0 0 0.8rem; }
          .cats { display: flex; flex-wrap: wrap; gap: 0.4rem; }
          .cats span {
            background: #fffdfb;
            border: 1px solid #e4d7cf;
            border-radius: 999px;
            color: #9a5f3f;
            font-size: 0.75rem;
            padding: 0.1rem 0.65rem;
          }

          /* Pie (réplica de SiteFooter) */
          footer {
            background: #f8f1ec;
            border-top: 1px solid #e4d7cf;
            color: #667085;
            font-size: 0.85rem;
            margin-top: 2.5rem;
            padding: 1.75rem 1.25rem;
            text-align: center;
          }
          footer p { margin: 0.3rem 0; }
          footer .tagline { color: #24130f; font-weight: 600; }
          footer a { color: #9a5f3f; }

          @media (max-width: 720px) {
            .list { grid-template-columns: 1fr; }
            .bar-inner img { height: 42px; width: 74px; }
          }

          @media (prefers-color-scheme: dark) {
            body { background: #211816; color: #f3e9e3; }
            a { color: #e7a27b; }
            a:hover { color: #f1c8ae; }
            .bar { background: #211816; border-bottom-color: #59443b; }
            .bar-inner .navlink { color: #f3e9e3; }
            .bar-inner .navlink:hover { color: #e7a27b; }
            .page-heading { border-bottom-color: #59443b; }
            .eyebrow, .count { color: #e7a27b; }
            .page-heading h1 { color: #f1c8ae; }
            .page-heading .lead { color: #d8c4bb; }
            .note { background: #30231f; border-color: #59443b; color: #f3e9e3; }
            .post { background: #30231f; border-left-color: #e7a27b; }
            .post .date { color: #d8c4bb; }
            .post h2 a { color: #f1c8ae; }
            .post h2 a:hover { color: #e7a27b; }
            .post .desc { color: #f3e9e3; }
            .cats span { background: #211816; border-color: #59443b; color: #e7a27b; }
            footer { background: #30231f; border-top-color: #59443b; color: #d8c4bb; }
            footer .tagline { color: #f1c8ae; }
            footer a { color: #e7a27b; }
          }
        </style>
      </head>
      <body>
        <nav class="bar">
          <div class="bar-inner">
            <a href="https://culturaydesarrollo.org" aria-label="Cultura y Desarrollo">
              <img src="/images/logo.svg" alt="Cultura y Desarrollo"/>
            </a>
            <a class="navlink" href="https://blog.culturaydesarrollo.org/">Ir al blog</a>
          </div>
        </nav>
        <main>
          <header class="page-heading">
            <p class="eyebrow">RSS</p>
            <h1><xsl:value-of select="rss/channel/title"/></h1>
            <p class="lead"><xsl:value-of select="rss/channel/description"/></p>
          </header>
          <p class="note">
            <xsl:text>Suscríbete a este feed en tu lector RSS favorito: </xsl:text>
            <a href="https://blog.culturaydesarrollo.org/rss.xml">blog.culturaydesarrollo.org/rss.xml</a>
          </p>
          <p class="count">
            <xsl:value-of select="count(rss/channel/item)"/>
            <xsl:text> publicaciones</xsl:text>
          </p>
          <div class="list">
            <xsl:apply-templates select="rss/channel/item"/>
          </div>
        </main>
        <footer>
          <p class="tagline">Cultura · Memoria · Comunidad · Territorio</p>
          <p>Tolima · Colombia</p>
          <p>
            <xsl:text>© Corporación Cultura y Desarrollo · Desarrollo y Webmaster: Rafael Dimitri Guzmán Camacho</xsl:text>
          </p>
          <p>
            <a href="https://blog.culturaydesarrollo.org/">blog.culturaydesarrollo.org</a>
            <xsl:text> · </xsl:text>
            <a href="https://www.instagram.com/corporacioncyd/">Instagram</a>
          </p>
        </footer>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="item">
    <article class="post">
      <p class="date">
        <xsl:value-of select="substring(pubDate, 6, 11)"/>
        <xsl:if test="author">
          <xsl:text> · </xsl:text>
          <xsl:value-of select="author"/>
        </xsl:if>
      </p>
      <h2>
        <a href="{link}">
          <xsl:value-of select="title"/>
        </a>
      </h2>
      <p class="desc">
        <xsl:value-of select="description"/>
      </p>
      <div class="cats">
        <xsl:for-each select="category">
          <span>
            <xsl:value-of select="."/>
          </span>
        </xsl:for-each>
      </div>
    </article>
  </xsl:template>
</xsl:stylesheet>
