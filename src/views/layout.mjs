import path from 'node:path';

export function escape(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
}

export function taskHref(task) {
  return `/tasks/${task.id}/`;
}

export function filteredHref(key, value) {
  return `/tasks/?${new URLSearchParams({[key]: value})}`;
}

export const levelNames = {
  1: 'Scientific workflows',
  2: 'Scientific breakthroughs',
  3: 'Major scientific breakthroughs',
};

// Every generated document can be served from a domain root or a subdirectory.
function relativeUrls(html, route) {
  return html.replace(/\b(href|src|action)="\/(?!\/)([^"]*)"/g, (_, attr, target) => {
    const cut = target.search(/[?#]/);
    const pathname = cut < 0 ? target : target.slice(0, cut);
    const suffix = cut < 0 ? '' : target.slice(cut);
    const relative = path.posix.relative(route, '/' + pathname) || '.';
    const slash = pathname === '' || pathname.endsWith('/') ? '/' : '';
    return `${attr}="${relative}${slash}${suffix}"`;
  });
}

function navLink(route, url, label, accessibleName) {
  const position = route === url ? 'page' : 'location';
  const current = route.startsWith(url) ? ` aria-current="${position}"` : '';
  const name = accessibleName ? ` aria-label="${accessibleName}"` : '';
  return `<a href="${url}"${current}${name}>${label}</a>`;
}

export function page({route, title, description, body, home = false, catalog = false, community = false}) {
  const brand = `<a class="brand" href="/" aria-label="Agent Frontier Exam home, AFE Taskonomy"${home ? ' aria-current="page"' : ''}>
    <span class="brand-mark" aria-hidden="true">AFE</span>
    <span class="brand-signature" aria-hidden="true"><span class="brand-name">Agent Frontier Exam</span><span class="brand-edition">Taskonomy</span></span>
  </a>`;
  const css = ['pyramid', 'site', ...(community || home ? ['community'] : [])]
    .map(name => `<link rel="stylesheet" href="/assets/${name}.css">`).join('\n');
  const js = ['site', ...(home ? ['pyramid'] : []), ...(catalog ? ['catalog'] : [])]
    .map(name => `<script src="/assets/${name}.js" defer></script>`).join('\n');
  return relativeUrls(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#f6f4ed"><meta name="description" content="${escape(description)}">
<title>${escape(home ? 'Agent Frontier Exam' : title + ' · Agent Frontier Exam')}</title>
${css}
${js}</head>
<body id="top">
<a class="skip-link" href="#main-content">Skip to content</a>
<header class="site-header"><div class="site-frame header-inner">${brand}
<nav aria-label="Main navigation">${navLink(route, '/tasks/', 'Tasks')}${navLink(route, '/contribute/', 'Contribute')}${navLink(route, '/authorship/', 'Authorship', 'Authorship and participation')}</nav></div></header>
<main id="main-content">${body}</main>
<footer class="site-footer"><div class="site-frame footer-inner">
<a class="footer-brand" href="/">Agent Frontier Exam</a>
<nav aria-label="Footer navigation"><a href="/tasks/">Tasks</a><a href="/contribute/">Contribute</a><a href="/contribute/task-package/">Task package guide</a><a href="/authorship/">Authorship</a></nav>
</div></footer>
</body></html>\n`, route);
}
