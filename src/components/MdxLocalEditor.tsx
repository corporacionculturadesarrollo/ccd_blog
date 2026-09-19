import {
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  linkDialogPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  MDXEditor,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { useEffect, useMemo, useState } from 'react';

type Template = {
  id: string;
  name: string;
  description: string;
  content: string;
};

type Draft = {
  id: string;
  name: string;
  content: string;
  updatedAt: string;
};

const STORAGE_KEY = 'ccd-blog-local-editor-v1';

const defaultTemplates: Template[] = [
  {
    id: 'article',
    name: 'Artículo',
    description: 'Artículo editorial con categorías, etiquetas y autor.',
    content: `---
title: "Título del artículo"
description: "Resumen breve para la portada y los motores de búsqueda."
pubDate: "${new Date().toISOString().slice(0, 10)}"
author: "Corporación Cultura y Desarrollo"
authorSlug: "corporacion-cultura-y-desarrollo"
authorImage: "/images/ccd-auth.svg"
category: ["Cultura"]
tags: ["cultura"]
featured: false
---

Escribe aquí el contenido del artículo.

## Un subtítulo

Desarrolla una idea con claridad y agrega referencias o enlaces cuando sea necesario.
`,
  },
  {
    id: 'announcement',
    name: 'Convocatoria o anuncio',
    description: 'Plantilla para convocatorias, noticias y próximos anuncios.',
    content: `---
title: "Título de la convocatoria"
description: "Información esencial de la convocatoria o anuncio."
pubDate: "${new Date().toISOString().slice(0, 10)}"
author: "Corporación Cultura y Desarrollo"
authorSlug: "corporacion-cultura-y-desarrollo"
authorImage: "/images/ccd-auth.svg"
category: ["Convocatorias"]
tags: ["anuncios"]
featured: false
---

## Invitación

Presenta aquí la convocatoria, sus fechas y las instrucciones de participación.

### Información clave

- Fecha:
- Lugar:
- Inscripción:
`,
  },
];

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const getFileName = (content: string, fallback: string) => {
  const title = content.match(/^title:\s*["'](.+?)["']\s*$/m)?.[1];
  return `${slugify(title || fallback) || 'nuevo-articulo'}.mdx`;
};

export default function MdxLocalEditor() {
  const [templates, setTemplates] = useState(defaultTemplates);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [activeId, setActiveId] = useState('new');
  const [name, setName] = useState('Nuevo artículo');
  const [markdown, setMarkdown] = useState(defaultTemplates[0].content);
  const [notice, setNotice] = useState('');

  const activeDraft = drafts.find((draft) => draft.id === activeId);
  const plugins = useMemo(
    () => [
      headingsPlugin(),
      listsPlugin(),
      linkPlugin(),
      linkDialogPlugin(),
      quotePlugin(),
      thematicBreakPlugin(),
      markdownShortcutPlugin(),
    ],
    [],
  );

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (Array.isArray(saved.templates)) setTemplates([...defaultTemplates, ...saved.templates]);
      if (Array.isArray(saved.drafts)) setDrafts(saved.drafts);
    } catch {
      setNotice('No se pudieron recuperar los datos locales guardados.');
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        templates: templates.filter((template) => !defaultTemplates.some((item) => item.id === template.id)),
        drafts,
      }));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [templates, drafts]);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2800);
  };

  const loadContent = (id: string, nextName: string, content: string) => {
    setActiveId(id);
    setName(nextName);
    setMarkdown(content);
  };

  const createFromTemplate = (template: Template) => {
    const id = `draft-${Date.now()}`;
    loadContent(id, template.name, template.content);
    showNotice('Borrador creado desde la plantilla.');
  };

  const saveDraft = () => {
    const draft = { id: activeId, name: name.trim() || 'Nuevo artículo', content: markdown, updatedAt: new Date().toISOString() };
    setDrafts((current) => [...current.filter((item) => item.id !== activeId), draft]);
    showNotice('Borrador guardado en este navegador.');
  };

  const download = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = getFileName(markdown, name);
    anchor.click();
    URL.revokeObjectURL(url);
    showNotice('Archivo MDX descargado.');
  };

  const importFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      loadContent(`draft-${Date.now()}`, file.name.replace(/\.mdx?$/i, ''), String(reader.result));
      showNotice('Archivo MDX cargado.');
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const saveTemplate = () => {
    const template: Template = {
      id: `template-${Date.now()}`,
      name: name.trim() || 'Nueva plantilla',
      description: 'Plantilla creada localmente.',
      content: markdown,
    };
    setTemplates((current) => [...current, template]);
    showNotice('Plantilla guardada en este navegador.');
  };

  return (
    <div className="local-editor">
      <aside className="local-editor-sidebar">
        <div className="editor-sidebar-heading">
          <h2>Plantillas</h2>
          <span>local</span>
        </div>
        {templates.map((template) => (
          <button className="editor-list-item" type="button" key={template.id} onClick={() => createFromTemplate(template)}>
            <strong>{template.name}</strong>
            <small>{template.description}</small>
          </button>
        ))}
        <h2 className="editor-section-title">Borradores</h2>
        {drafts.length === 0 && <p className="editor-muted">Todavía no hay borradores.</p>}
        {drafts.map((draft) => (
          <button className={`editor-list-item ${draft.id === activeId ? 'is-active' : ''}`} type="button" key={draft.id} onClick={() => loadContent(draft.id, draft.name, draft.content)}>
            <strong>{draft.name}</strong>
            <small>{new Date(draft.updatedAt).toLocaleString('es-CO')}</small>
          </button>
        ))}
      </aside>
      <section className="local-editor-main">
        <div className="local-editor-toolbar">
          <label>
            Nombre
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <div className="editor-actions">
            <label className="editor-button secondary">
              Importar MDX
              <input type="file" accept=".md,.mdx,text/markdown" onChange={importFile} hidden />
            </label>
            <button className="editor-button secondary" type="button" onClick={saveTemplate}>Guardar como plantilla</button>
            <button className="editor-button" type="button" onClick={saveDraft}>Guardar borrador</button>
            <button className="editor-button primary" type="button" onClick={download}>Descargar MDX</button>
          </div>
        </div>
        <MDXEditor
          key={activeId}
          markdown={markdown}
          onChange={setMarkdown}
          plugins={plugins}
          contentEditableClassName="editor-content"
        />
        <p className="editor-help">Los borradores y plantillas se guardan solo en este navegador. Descarga el `.mdx` y colócalo en `src/content/blog/` para publicarlo.</p>
        {notice && <p className="editor-notice" role="status">{notice}</p>}
      </section>
    </div>
  );
}
