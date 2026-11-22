import path from 'node:path';
import {footer} from './footer.mjs';

export function escape(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
}

// Keep the final words of editorial copy on the same line even in long
// paragraphs. Match the trailing text only, leaving existing inline markup intact.
export function keepEnding(html, lang) {
  const ending = lang === 'zh' ? /\p{Script=Han}{2}\p{P}*$/u : /[^\s<>]+ [^\s<>]+$/u;
  return html.replace(ending, '<span class="text-phrase">$&</span>');
}

export function taskHref(task) {
  return `/tasks/${task.id}/`;
}

export function filteredHref(key, value) {
  return `/tasks/?${new URLSearchParams({[key]: value})}`;
}

export const levelNames = {1:'Scientific workflows', 2:'Scientific breakthroughs', 3:'Foundational discoveries'};
const chineseLevels = {1:'科研流程', 2:'科学突破', 3:'奠基性发现'};
export const levelLabels = lang => lang === 'zh' ? chineseLevels : levelNames;

export function localizedPath(route, lang) {
  return lang === 'zh' ? `/zh${route}` : route;
}

// Paths are written from the site root in templates, then made portable for Pages and disk copies.
function relativePath(from, to) {
  const cut = to.search(/[?#]/);
  const pathname = cut < 0 ? to : to.slice(0, cut);
  const suffix = cut < 0 ? '' : to.slice(cut);
  const relative = path.posix.relative(from, pathname) || '.';
  return relative + (pathname.endsWith('/') ? '/' : '') + suffix;
}

function relativeUrls(html, from, lang, assetUrls) {
  return html.replace(/\b(href|src|action)="(\/(?!\/)[^"]*)"/g, (_, attr, target) => {
    const url = target.startsWith('/assets/') ? (assetUrls.get(target) ?? target) : localizedPath(target, lang);
    return `${attr}="${relativePath(from, url)}"`;
  });
}

function navLink(route, url, label, relatedRoutes = []) {
  const position = route === url ? 'page' : 'location';
  const current = route.startsWith(url) || relatedRoutes.includes(route) ? ` aria-current="${position}"` : '';
  return `<a href="${url}"${current}>${label}</a>`;
}

const siteUrl = 'https://prismax-team.github.io/AgentFrontierExam-Home';
const sun = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.5 1.5m11.2 11.2 1.5 1.5m0-14.2-1.5 1.5M6.4 17.6l-1.5 1.5"/>';
const moon = '<path d="M19.9 14.2A8.4 8.4 0 0 1 9.8 4.1a8.5 8.5 0 1 0 10.1 10.1Z"/>';
const icon = (name, drawing) => `<svg class="icon-${name}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${drawing}</svg>`;

export function page({route, lang = 'en', title, description, body, home = false, catalog = false, community = false}, assetUrls = new Map()) {
  const zh = lang === 'zh';
  const source = localizedPath(route, lang);
  const otherLang = zh ? 'en' : 'zh';
  const otherHref = relativePath(source, localizedPath(route, otherLang));
  const brand = `<a class="brand" href="/" aria-label="${zh ? 'Agent Frontier Exam 首页' : 'Agent Frontier Exam home'}"${home ? ' aria-current="page"' : ''}>
    <img class="brand-emblem" src="/assets/afe-mark.svg" alt="" width="32" height="32">
    <span class="brand-mark" aria-hidden="true">AFE</span>
    <span class="brand-signature" aria-hidden="true"><span class="brand-name">Agent Frontier Exam</span><span class="brand-edition">Taskonomy</span></span>
  </a>`;
  const css = ['pyramid', 'site', ...(community || home ? ['community'] : []), ...(route.startsWith('/tasks/') ? ['field-explorer'] : []), ...(catalog ? ['distribution-art'] : []), ...(zh ? ['typography'] : [])]
    .map(name => `<link rel="stylesheet" href="/assets/${name}.css">`).join('\n');
  const js = ['site', ...(home ? ['pyramid'] : []), ...(catalog ? ['catalog', 'distribution'] : [])]
    .map(name => `<script src="/assets/${name}.js" defer></script>`).join('\n');
  const languageLabel = zh ? 'Read this page in English' : '用中文阅读本页';
  return relativeUrls(`<!doctype html>
<html lang="${zh ? 'zh-CN' : 'en'}"${home && !zh ? ' data-language-entry' : ''}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark"><meta name="theme-color" content="#f6f4ed"><meta name="description" content="${escape(description)}">
<title>${escape(home ? 'Agent Frontier Exam' : title + ' · Agent Frontier Exam')}</title>
<link rel="icon" type="image/svg+xml" href="/assets/afe-mark.svg">
<link rel="alternate" hreflang="en" href="${siteUrl}${route}"><link rel="alternate" hreflang="zh-Hans" href="${siteUrl}/zh${route}">
<script src="/assets/preferences.js"></script>
${css}
${js}</head>
<body id="top">
<a class="skip-link" href="#main-content">${zh ? '跳至正文' : 'Skip to content'}</a>
<header class="site-header"><div class="site-frame header-inner">${brand}
<div class="header-actions"><nav aria-label="${zh ? '主导航' : 'Main navigation'}">${navLink(route, '/tasks/', zh ? '任务' : 'Tasks')}${navLink(route, '/contribute/', zh ? '参与共建' : 'Contribute', ['/authorship/'])}</nav>
<div class="site-preferences"><a class="language-choice" data-language="${otherLang}" href="${otherHref}" lang="${zh ? 'en' : 'zh-CN'}" hreflang="${zh ? 'en' : 'zh-Hans'}" aria-label="${languageLabel}" title="${languageLabel}">${zh ? 'EN' : '中文'}</a>
<button class="theme-choice" type="button" data-theme-toggle hidden aria-label="${zh ? '切换外观' : 'Switch colour theme'}">${icon('moon',moon)}${icon('sun',sun)}</button></div></div></div></header>
<main id="main-content">${body}</main>
${footer(lang)}
</body></html>\n`, source, lang, assetUrls);
}
