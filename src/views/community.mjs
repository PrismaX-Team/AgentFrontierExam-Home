import experts from '../data/experts.json' with { type: 'json' };
import {contributionCopy, guideCopy, authorshipCopy} from '../data/community-copy.mjs';
import {packageFiles, packageTree} from '../data/package-example.mjs';
import {escape as escapeHtml, levelLabels} from './layout.mjs';

const guideUrl = 'https://aicarrier.feishu.cn/wiki/L7dCwf0R0iGaWfkPCpWca5nCn9f';
const formatUrl = 'https://docs.harborframework.com/tasks/overview';
const submitUrl = 'https://discovery-home.intern-ai.org.cn/home/event/rex/index.html';
const communityUrl = 'https://github.com/PrismaX-Team/AgentFrontierExam-Tasks#-contributor-community';

function fileSection(file) {
  const rows = file.fields.map(({ label, prose, code, heading, note, source }) => `
    <div class="cc-file-row">
      <div class="cc-file-excerpt">
        <p class="cc-file-label">${escapeHtml(label)}</p>
        ${code ? `<pre><code>${escapeHtml(code)}</code></pre>` : `<p>${escapeHtml(prose)}</p>`}
      </div>
      <div class="cc-file-note">
        <h3>${escapeHtml(heading)}</h3>
        <p>${escapeHtml(note)}</p>
        ${source ? `<a href="${escapeHtml(source.url)}">${escapeHtml(source.label)}</a>` : ''}
      </div>
    </div>`).join('');

  return `<section class="cc-file" id="${file.id}" aria-labelledby="file-${file.id}">
    <header class="cc-file-heading">
      <h2 id="file-${file.id}"><code>${escapeHtml(file.name)}</code></h2>
      <p>${escapeHtml(file.purpose)}</p>
    </header>
    ${rows}
  </section>`;
}

function contributeBreadcrumb(label, lang) {
  const zh = lang === 'zh';
  return `<nav class="breadcrumbs" aria-label="${zh ? '面包屑导航' : 'Breadcrumb'}"><a href="/contribute/">${zh ? '共建' : 'Contribute'}</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(label)}</span></nav>`;
}

function expertProfile(member, field, lang) {
  const zh = lang === 'zh';
  const name = zh ? member.nameZh : member.name;
  const initials = zh ? name[0] : name.split(' ').map(word => word[0]).join('');
  const portrait = member.portrait
    ? `<img src="/assets/committee/${escapeHtml(member.portrait)}" alt="" width="200" height="250" loading="lazy" decoding="async">`
    : `<span class="cc-expert-initial" aria-hidden="true">${escapeHtml(initials)}</span>`;
  return `<li class="cc-expert"><a href="${escapeHtml(member.profile)}">${portrait}
    <span class="cc-expert-copy">
      <span class="cc-expert-field">${escapeHtml(field)}</span>
      <span class="cc-expert-name">${escapeHtml(name)}</span>
      <span class="cc-expert-affiliation">${escapeHtml(zh ? member.affiliationZh : member.affiliation)}</span>
    </span></a></li>`;
}

export function expertise(lang = 'en') {
  const zh = lang === 'zh';
  const members = experts.flatMap(({field, fieldZh, members}) =>
    members.map(member => expertProfile(member, zh ? fieldZh : field, lang))).join('');
  const profiles = zh ? '顾问名录' : 'Advisor profiles';
  const previous = zh ? '上一位顾问' : 'Previous advisor';
  const next = zh ? '下一位顾问' : 'Next advisor';
  const pause = zh ? '暂停名录滚动' : 'Pause scrolling';
  const play = zh ? '继续滚动名录' : 'Resume scrolling';
  const icon = (drawing) => `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${drawing}</svg>`;

  return `<section class="cc-expertise" id="scientific-expertise" aria-labelledby="expertise-heading">
    <div class="site-frame cc-expertise-inner">
      <header>
        <h2 id="expertise-heading">${zh ? '科学顾问委员会' : 'Scientific expertise behind the benchmark'}</h2>
        <p>${zh ? '顾问委员会参与任务遴选和科学审核，确保评测依据充分、结果可信。' : 'The Advisory Committee supports task selection, scientific review and evaluation integrity.'}</p>
        <div class="cc-expert-controls" role="group" aria-label="${profiles}" hidden>
          <button type="button" data-expert-prev aria-controls="advisor-profiles" aria-label="${previous}" title="${previous}">${icon('<path d="m12 5-5 5 5 5"/>')}</button>
          <button type="button" data-expert-motion data-pause="${pause}" data-play="${play}" aria-controls="advisor-profiles" aria-label="${pause}" title="${pause}">${icon('<path class="cc-pause" d="M7.25 5v10m5.5-10v10"/><path class="cc-play" d="m7 4.5 8 5.5-8 5.5z"/>')}</button>
          <button type="button" data-expert-next aria-controls="advisor-profiles" aria-label="${next}" title="${next}">${icon('<path d="m8 5 5 5-5 5"/>')}</button>
        </div>
      </header>
      <div class="cc-expert-viewport" id="advisor-profiles" role="region" aria-label="${profiles}" tabindex="0">
        <div class="cc-expert-rail"><ul class="cc-expert-list" role="list">${members}</ul></div>
      </div>
    </div>
  </section>`;
}

function definitions(entries) {
  return entries.map(([label, body]) => `<div><dt>${label}</dt><dd>${body}</dd></div>`).join('\n');
}

export function contribute(lang = 'en') {
  const c = contributionCopy(lang);
  const levels = levelLabels(lang);
  const sheets = c.goals.map(({level}) => `<li class="cc-sheet cc-level-${level}"><span class="cc-sheet-code">L${level}</span><span>${escapeHtml(levels[level])}</span></li>`).join('');
  const goals = c.goals.map(({level, goal, evidence}) =>
    `<section class="cc-level-${level}">
      <header><p class="cc-meta">L${level}</p><h3>${escapeHtml(levels[level])}</h3></header>
      <p>${goal}</p><dl class="cc-goal-evidence"><dt>${c.evidenceLabel}</dt><dd>${evidence}</dd></dl>
    </section>`
  ).join('');

  return `<article class="site-frame cc-page cc-contribute">
    <header class="cc-contribute-hero">
      <div class="cc-contribute-intro">
        <h1>${c.title}</h1><p>${c.intro}</p>
        <div class="cc-links"><a class="cc-action" href="#submit">${c.prepare}</a>
          <a href="/contribute/task-package/">${c.guide}</a><a href="/authorship/">${c.authorship}</a></div>
      </div>
      <figure class="cc-folio" aria-labelledby="folio-caption">
        <figcaption id="folio-caption">${c.levels}</figcaption><ol class="cc-sheets">${sheets}</ol>
        <div class="cc-folder">
          <div class="cc-folder-package"><span class="cc-folder-title">${c.package}</span><a class="cc-folder-format" href="${formatUrl}">${c.format}</a></div>
          <span class="cc-folder-destination">${c.platform}</span>
        </div>
      </figure>
    </header>
    <section class="cc-section cc-goal-section" aria-labelledby="cc-goal">
      <h2 id="cc-goal">${c.goalsTitle}</h2><div class="cc-choices">${goals}</div>
    </section>
    <section class="cc-section cc-section-split cc-submission" id="submit" aria-labelledby="cc-submit">
      <div>
        <h2 id="cc-submit">${c.submitTitle}</h2><p>${c.submitIntro}</p>
        <div class="cc-links"><a class="cc-action" href="${submitUrl}">${c.submit}</a></div>
        <p class="cc-submission-source"><a href="${guideUrl}">${c.template}</a></p>
      </div>
      <dl class="cc-definitions">${definitions(c.details)}</dl>
    </section>
    <section class="cc-section cc-section-split cc-participation" id="participation" aria-labelledby="cc-participate">
      <div>
        <h2 id="cc-participate">${c.participationTitle}</h2><p>${c.participationIntro}</p>
      </div>
      <div class="cc-participation-roles">
        <section><h3><a href="/authorship/#participants">${c.participants}</a></h3><p>${c.participantRole}</p></section>
        <section><h3><a href="/authorship/#area-chairs">${c.chairs}</a></h3><p>${c.chairRole}</p></section>
      </div>
    </section>
  </article>`;
}

export function packageGuide(lang = 'en') {
  const c = guideCopy(lang);
  const files = packageFiles(lang);
  return `<article class="site-frame cc-page cc-package">
    ${contributeBreadcrumb(c.title, lang)}
    <header class="cc-hero">
      <h1>${c.title}</h1><p>${c.intro}</p>
      <div class="cc-links"><a class="cc-action" href="${guideUrl}">${c.template}</a><a href="/contribute/#submit">${c.submit}</a></div>
    </header>
    <div class="cc-article-layout">
      <aside class="cc-index" aria-labelledby="cc-files-index">
        <h2 id="cc-files-index">${c.files}</h2>
        <ul><li><a href="#package-layout">${c.layout}</a></li>
          ${files.map(file => `<li><a href="#${file.id}"><code>${escapeHtml(file.name)}</code></a></li>`).join('')}
          <li><a href="#delivery">${c.before}</a></li>
        </ul>
      </aside>
      <div class="cc-article-main">
        <section class="cc-prose cc-layout-intro" id="package-layout">
          <h2>${c.layout}</h2><p>${c.layoutIntro}</p>
          <pre class="cc-tree" aria-label="${c.treeLabel}"><code>${escapeHtml(packageTree(lang))}</code></pre><p>${c.supplemental}</p>
        </section>
        ${files.map(fileSection).join('')}
        <section class="cc-prose cc-delivery" id="delivery">
          <h2>${c.before}</h2><p>${c.preflight}</p><p>${c.permissions}</p>
          <div class="cc-links"><a class="cc-action" href="/contribute/#submit">${c.prepare}</a></div>
        </section>
      </div>
    </div>
  </article>`;
}

export function authorship(lang = 'en') {
  const c = authorshipCopy(lang);
  const contents = [
    ['participants', c.participants], ['area-chairs', c.chairs], ['acceptance', c.accepted],
    ['paper', c.paper], ['faq', c.faq], ['scientific-expertise', c.committee],
  ];
  const questions = c.questions.map(({question, answer, link, communityLink}) => {
    const target = communityLink ? {href: communityUrl, label: communityLink} : link;
    return `<details><summary>${question}</summary><p>${answer}${target ? ` <a href="${target.href}">${target.label}</a>` : ''}</p></details>`;
  }).join('');
  return `<article class="site-frame cc-page cc-authorship">
    ${contributeBreadcrumb(c.breadcrumb, lang)}
    <header class="cc-hero">
      <h1>${c.title}</h1><p>${c.intro}</p>
      <div class="cc-links"><a class="cc-action" href="/contribute/">${c.contribute}</a><a href="#area-chairs">${c.join}</a></div>
    </header>
    <div class="cc-article-layout">
      <aside class="cc-index" aria-labelledby="cc-authorship-index">
        <h2 id="cc-authorship-index">${c.contents}</h2>
        <ul>${contents.map(([id, label]) => `<li><a href="#${id}">${label}</a></li>`).join('')}</ul>
      </aside>
      <div class="cc-article-main cc-authorship-main">
        <section class="cc-prose" id="participants">
          <h2>${c.participants}</h2>
          <p class="cc-lead"><strong>${c.threshold}</strong></p><p>${c.firstTask}</p><p>${c.record}</p>
          <p class="cc-text-link"><a href="/contribute/task-package/#configuration">${c.recordLink}</a></p>
        </section>
        <section class="cc-prose" id="area-chairs">
          <h2>${c.chairs}</h2><p>${c.chairIntro}</p>
          <dl class="cc-definitions cc-role-list">${definitions(c.responsibilities)}</dl><p>${c.joinIntro}</p>
          <p class="cc-text-link"><a href="${communityUrl}">${c.joinLink}</a></p>
        </section>
        <section class="cc-prose" id="acceptance">
          <h2>${c.counts}</h2><p>${c.review}</p><p>${c.example}</p><p>${c.changes}</p>
        </section>
        <section class="cc-prose" id="paper">
          <h2>${c.paper}</h2><p>${c.paperIntro}</p><p>${c.order}</p>
          <p class="cc-text-link"><a href="${guideUrl}">${c.guide}</a></p>
        </section>
        <section class="cc-prose cc-faq" id="faq"><h2>${c.faq}</h2>${questions}</section>
      </div>
    </div>
  </article>${expertise(lang)}`;
}
