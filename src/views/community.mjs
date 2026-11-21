import experts from '../data/experts.json' with { type: 'json' };
import { escape as escapeHtml, levelNames } from './layout.mjs';

const guideUrl = 'https://aicarrier.feishu.cn/wiki/L7dCwf0R0iGaWfkPCpWca5nCn9f';
const submitUrl = 'https://discovery-home.intern-ai.org.cn/home/event/rex/index.html';
const communityUrl = 'https://github.com/PrismaX-Team/AgentFrontierExam-Tasks#-contributor-community';

function contributeBreadcrumb(label) {
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/contribute/">Contribute</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(label)}</span></nav>`;
}

function expertProfile(member) {
  const photo = member.portrait
    ? `<img src="/assets/committee/${escapeHtml(member.portrait)}" alt="" width="200" height="250" loading="lazy" decoding="async">`
    : '';
  return `<li class="cc-expert">${photo}
    <div><a href="${escapeHtml(member.profile)}">${escapeHtml(member.name)}</a>
      <p>${escapeHtml(member.affiliation)}</p></div>
  </li>`;
}

export function expertise() {
  const fields = experts.map(({ field, members }) => `
    <div class="cc-expertise-field${members.length > 1 ? ' cc-expertise-field-wide' : ''}">
      <h3>${escapeHtml(field)}</h3>
      <ul>${members.map(expertProfile).join('')}</ul>
    </div>`).join('');

  return `<section class="cc-expertise" id="scientific-expertise" aria-labelledby="expertise-heading">
    <div class="site-frame cc-expertise-inner">
      <header>
        <h2 id="expertise-heading">Scientific expertise behind the benchmark</h2>
        <p>The Advisory Committee supports task selection, scientific review and evaluation integrity.</p>
      </header>
      <div class="cc-expertise-roster">${fields}</div>
    </div>
  </section>`;
}

const contributionLevels = [
  {
    level: 1,
    goal: 'Choose a measurement, analysis or experiment that calls for scientific judgment. Describe the observations, tools and limits the agent will work with.',
    evidence: 'Name the output and the reference measurement, tolerance or control that would make it usable.'
  },
  {
    level: 2,
    goal: 'Identify a question the closest published work leaves open. State the claim the agent could establish by resolving it.',
    evidence: 'Describe the observation, comparison or proof that would settle the question and how a second team could check it.'
  },
  {
    level: 3,
    goal: 'Describe an unknown phenomenon or scientific principle whose discovery would change what the field can explain or predict.',
    evidence: 'Explain what would distinguish a first discovery from a known effect and how an independent group could test it.'
  }
];

function folioIntro() {
  const sheets = contributionLevels.map(({ level }) =>
    `<li class="cc-sheet cc-level-${level}"><span class="cc-sheet-code">L${level}</span><span>${escapeHtml(levelNames[level])}</span></li>`
  ).join('');
  return `<header class="cc-contribute-hero">
      <div class="cc-contribute-intro">
        <h1>Contribute a scientific task</h1>
        <p>Set a scientific goal for an agent. Give it the starting materials and say what evidence would convince a colleague that it succeeded.</p>
        <div class="cc-links">
          <a class="cc-action" href="#submit">Prepare a submission</a>
          <a href="/contribute/task-package/">Task package guide</a>
          <a href="/authorship/">Authorship</a>
        </div>
      </div>
      <figure class="cc-folio" aria-labelledby="folio-caption">
        <figcaption id="folio-caption">Choose one scientific level</figcaption>
        <ol class="cc-sheets">${sheets}</ol>
        <div class="cc-folder"><span>One task package</span><span>Duanyan ReX</span></div>
      </figure>
    </header>`;
}

function scientificGoals() {
  const goals = contributionLevels.map(({ level, goal, evidence }) =>
    `<section class="cc-level-${level}">
      <header><p class="cc-meta">L${level}</p><h3>${escapeHtml(levelNames[level])}</h3></header>
      <p>${goal}</p>
      <dl class="cc-goal-evidence"><dt>Evidence to include</dt><dd>${evidence}</dd></dl>
    </section>`
  ).join('');
  return `<section class="cc-section cc-goal-section" aria-labelledby="cc-goal">
      <h2 id="cc-goal">What would count as success?</h2>
      <div class="cc-choices">${goals}</div>
    </section>`;
}

export function contribute() {
  return `<article class="site-frame cc-page cc-contribute">
    ${folioIntro()}
    ${scientificGoals()}
    <section class="cc-section cc-section-split cc-submission" id="submit" aria-labelledby="cc-submit">
      <div>
        <h2 id="cc-submit">Prepare your submission</h2>
        <p>Submit one ZIP per task in English or Chinese. On Duanyan ReX, open <span lang="zh-Hans">提交科学问题</span> (Submit a scientific question).</p>
        <div class="cc-links"><a class="cc-action" href="${submitUrl}">Submit a task via Duanyan ReX</a></div>
        <p class="cc-submission-source"><a href="${guideUrl}">Contributor guide and template (Chinese)</a></p>
      </div>
      <dl class="cc-definitions">
        <div><dt>Team and collaboration</dt><dd>Provide a contact for the submitting team. Under <span lang="zh-Hans">合作来源</span> (collaboration source), select <span lang="zh-Hans">学术合作</span> (academic collaboration).</dd></div>
        <div><dt>Proposed level</dt><dd>Use L1 for a scientific workflow, L2 for a verifiable breakthrough or L3 for a foundational discovery. If the level is unclear, choose <span lang="zh-Hans">暂不确定</span> (undecided). Describe the scientific target in your own words so reviewers can confirm the classification.</dd></div>
        <div><dt>Package contents</dt><dd>Place <code>task_package/</code> at the archive root, alongside any supplementary materials. Identify the inputs, runtime, expected output and success conditions. If some materials are still in preparation, select the corresponding completeness option and say where you would like help.</dd></div>
        <div><dt>Permissions and follow-up</dt><dd>Record access conditions, attribution and redistribution terms. The form asks separately about task execution, use for model improvement and public release. Keep the submitted version so the team can refer to it when discussing review or revisions.</dd></div>
      </dl>
    </section>

    <section class="cc-section cc-section-split cc-participation" id="participation" aria-labelledby="cc-participate">
      <div>
        <h2 id="cc-participate">Authorship and participation</h2>
        <p>Help shape the benchmark by contributing tasks from your field or coordinating scientific review.</p>
        <div class="cc-links"><a href="/authorship/">Read the authorship guide</a></div>
      </div>
      <div class="cc-participation-roles">
        <section><h3><a href="/authorship/#participants">Participants</a></h3>
          <p>Participants develop scientific tasks. Three tasks accepted into the benchmark qualify a participant for co-authorship of the AFE paper.</p></section>
        <section><h3><a href="/authorship/#area-chairs">Area chairs</a></h3>
          <p>Area chairs recruit at least five participants, help define fields and workflows, and review tasks at project milestones.</p></section>
      </div>
    </section>
  </article>`;
}

const packageFiles = [
  {
    id: 'instructions',
    name: 'instruction.md',
    purpose: 'The question, the evidence available to the agent and the point at which the work is complete.',
    fields: [
      {
        label: 'Scientific question',
        prose: 'Forecast hourly storm surge at 24 North Sea tide gauges over the next 72 hours. Use the station records and weather forecasts available at issue time. Improve on the reference forecast in both the northern and southern regions.',
        heading: 'Make the scientific decision visible',
        note: 'The agent chooses a forecasting approach. State the observation window, comparison and geographic scope. For a breakthrough task, add the open question, the closest prior result and the claim that new evidence could establish.'
      },
      {
        label: 'Final deliverable',
        code: '/work/output/forecast.csv\n\nstation_id,window_id,lead_hour,surge_cm\nN01,W001,1,12.5\nN01,W001,2,13.1',
        heading: 'Specify an artifact another program can read',
        note: 'Require one finite prediction in centimetres for every station, forecast window and lead hour from 1 to 72. Explain how missing or duplicate rows are handled. Use the same path and field names in the verifier.'
      },
      {
        label: 'Acceptance criteria',
        prose: 'Calculate root mean square error separately for the two regions. The forecast earns 50 points for each region in which its error is strictly below the reference error. Both improvements are required for 100.',
        heading: 'Define a complete result before the run',
        note: 'A pooled average could hide a failure at one coast. This rule makes improvement in each region independently necessary. Define the equivalent comparisons, constraints or expert checks for your question.'
      }
    ]
  },
  {
    id: 'configuration',
    name: 'task.toml',
    purpose: 'Task identity, authorship, artifact collection and the resources for solving and scoring.',
    fields: [
      {
        label: 'Identity and artifacts',
        code: 'schema_version = "1.4"\nartifacts = ["/work/output"]\n\n[task]\nname = "afe/north-sea-storm-surge"\nversion = "0.1.0"\ndescription = "North Sea storm-surge forecasts"\nauthors = [{ name = "Example coastal research team" }]',
        heading: 'Keep authors and outputs attached to a version',
        note: 'Give the task an English short name under afe/, record its contributors and update its version when the package changes. Harbor restores collected artifacts at their declared absolute paths in the independent scoring environment.'
      },
      {
        label: 'Scientific metadata',
        code: '[metadata.afe]\nprotocol_version = "1.0"\nlevel = "L1"\ndomains = ["地球"]\nsupports_over_target = false\n\n[metadata.afe.score_mapping]\nurl = "tests/score.py"\ndescription = "50 points for each region improved."',
        heading: 'Connect the level and score to the objective',
        note: 'This bounded forecasting exercise is an L1 workflow in Earth science. Use the domain names specified by the template. Point the score mapping at the implementation of the scientific criteria.'
      },
      {
        label: 'Runtime settings',
        code: '[agent]\ntimeout_sec = 3600\n\n[environment]\nworkdir = "/work"\ncpus = 2\nmemory_mb = 4096\nnetwork_mode = "no-network"\n\n[verifier]\nenvironment_mode = "separate"\ntimeout_sec = 300',
        heading: 'Budget the agent and verifier independently',
        note: 'These are excerpts from the configuration. Fill in storage, build limits and verifier resources in the template. Document the software, computing time, data access and any query or observation budget the scientific work requires.'
      }
    ]
  },
  {
    id: 'environment',
    name: 'environment/',
    purpose: 'The image, data and tools the agent can use.',
    fields: [
      {
        label: 'Dockerfile and inputs',
        code: 'FROM python:3.11.11-slim-bookworm\nWORKDIR /work\nCOPY input/ /work/input/\nRUN mkdir -p /work/output',
        heading: 'Make the documented inputs available',
        note: 'For this example, input/ holds station IDs and regions, earlier tide-gauge readings, weather forecasts and issue times. Document units and data sources. Copy tools into the image when the task calls for specialist software.'
      },
      {
        label: 'Evidence boundary',
        prose: 'The agent can use observations up to each forecast issue time. Later water levels and the scored reference forecast are available to the verifier.',
        heading: 'Separate solving evidence from scoring evidence',
        note: 'For a forecasting task, a temporal cutoff preserves the research question. Specify equivalent boundaries for other tasks. For data with access restrictions, provide the retrieval conditions and the permissions needed to reproduce the evaluation.'
      }
    ]
  },
  {
    id: 'verification',
    name: 'tests/',
    purpose: 'An independent verifier checks the submitted artifact against the scientific conditions.',
    fields: [
      {
        label: 'test.sh',
        code: '#!/bin/sh\nset -eu\nmkdir -p /logs/verifier\npython3 /tests/score.py',
        heading: 'Use a single scoring entry point',
        note: 'Harbor runs tests/test.sh. Build the independent scoring image with tests/Dockerfile. Here score.py reads /work/output/forecast.csv, checks the station, window and lead-hour keys, and compares predictions with held-out observations in each region.'
      },
      {
        label: '/logs/verifier/afe_result.json',
        code: '{\n  "status": "evaluated",\n  "score": 50,\n  "raw": {"regions_improved": 1, "regions_total": 2}\n}',
        heading: 'Preserve the scientific result',
        note: 'A score of 50 records improvement in one region. Keep the original scientific metrics in raw when available. An evaluated score is finite and ranges from 0 to 100, with 100 reserved for meeting every necessary condition.'
      },
      {
        label: '/logs/verifier/reward.json',
        code: '{"reward": 0}',
        heading: 'Record full goal attainment',
        note: 'For the example above, the partial scientific score gives a binary reward of 0. An evaluated score of 100 gives 1. Invalid submissions receive a zero score and reward with an error. A verifier failure or pending human review has a null score and no final reward file.'
      }
    ]
  },
  {
    id: 'reference',
    name: 'solution/',
    purpose: 'Optional reference methods and their provenance.',
    fields: [
      {
        label: 'gtsm/info.json',
        code: '{\n  "name": "Global Tide and Surge Model v3.0",\n  "proposed_at": "2020",\n  "description": "Hydrodynamic tide and surge model.",\n  "source_urls": ["https://doi.org/10.3389/fmars.2020.00263"]\n}',
        heading: 'Give a reference method its own record',
        note: 'Record the method, date, principle and source. Add its score only after measuring it under the conditions of this task. Store observations or baselines needed by the verifier in its own environment.',
        source: { label: 'Muis et al., 2020', url: 'https://doi.org/10.3389/fmars.2020.00263' }
      },
      {
        label: 'Register a method in task.toml',
        code: '[metadata.afe]\nreference_urls = ["solution/gtsm/info.json"]',
        heading: 'Identify the record the package uses',
        note: 'Add reference_urls to the existing metadata.afe table when supplying a reference method. You can submit an open research question with its scientific objectives, materials and evaluation criteria while a reference solution is still unknown.'
      }
    ]
  }
];

const packageTree = `north-sea-storm-surge.zip
├── task_package/
│   ├── instruction.md
│   ├── task.toml
│   ├── environment/
│   │   ├── Dockerfile
│   │   └── input/
│   ├── tests/
│   │   ├── Dockerfile
│   │   ├── test.sh
│   │   └── score.py
│   └── solution/              (optional)
│       └── gtsm/info.json
└── 补充材料/                    (optional)`;

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

export function packageGuide() {
  return `<article class="site-frame cc-page cc-package">
    ${contributeBreadcrumb('Task package guide')}
    <header class="cc-hero">
      <h1>Task package guide</h1>
      <p>A task package gives an agent a scientific question, an environment to work in and a way to tell whether the result holds up. Follow a North Sea storm-surge forecasting example through the files of a Harbor package.</p>
      <div class="cc-links"><a class="cc-action" href="${guideUrl}">Contributor guide and template (Chinese)</a><a href="/contribute/#submit">Submission instructions</a></div>
    </header>
    <div class="cc-article-layout">
      <aside class="cc-index" aria-labelledby="cc-files-index">
        <h2 id="cc-files-index">Package files</h2>
        <ul><li><a href="#package-layout">Archive layout</a></li>
          ${packageFiles.map(file => `<li><a href="#${file.id}"><code>${escapeHtml(file.name)}</code></a></li>`).join('')}
          <li><a href="#delivery">Before uploading</a></li>
        </ul>
      </aside>
      <div class="cc-article-main">
        <section class="cc-prose cc-layout-intro" id="package-layout">
          <h2>Archive layout</h2>
          <p>Start with <code>AFE_task_package_template_v1.0.1.zip</code>, attached at the end of the contributor guide. It targets Harbor 0.25.0 on Linux, with an independent verifier. The folder below shows the files used in the forecasting example.</p>
          <pre class="cc-tree" aria-label="Example ZIP contents"><code>${escapeHtml(packageTree)}</code></pre>
          <p>Place the agent instructions, environment and verifier together under <code>task_package/</code>. An optional sibling folder, <code lang="zh-Hans">补充材料/</code>, can hold a background paper, explanatory figures or other supporting material.</p>
        </section>
        ${packageFiles.map(fileSection).join('')}
        <section class="cc-prose cc-delivery" id="delivery">
          <h2>Before uploading</h2>
          <p>Read the instructions from the agent’s perspective. Does it receive the inputs the question promises? Can it write the requested artifact to the declared path? Does the verifier apply exactly the criteria in the instructions?</p>
          <p>Keep the scoring code and its dependencies with the package. Describe any external data access, licensing or computing requirements. If an input or part of the verifier is still being prepared, identify it in the form’s material-completeness field.</p>
          <div class="cc-links"><a class="cc-action" href="/contribute/#submit">Prepare the ZIP for Duanyan ReX</a></div>
        </section>
      </div>
    </div>
  </article>`;
}

export function authorship() {
  return `<article class="site-frame cc-page cc-authorship">
    ${contributeBreadcrumb('Authorship')}
    <header class="cc-hero">
      <h1>Authorship and participation</h1>
      <p>Researchers contribute the questions that define Agent Frontier Exam. Participants turn scientific work into tasks. Area chairs bring colleagues together and help review what each task measures.</p>
      <div class="cc-links"><a class="cc-action" href="/contribute/">Contribute a task</a><a href="#area-chairs">Become an area chair</a></div>
    </header>
    <div class="cc-article-layout">
      <aside class="cc-index" aria-labelledby="cc-authorship-index">
        <h2 id="cc-authorship-index">On this page</h2>
        <ul>
          <li><a href="#participants">Participant credit</a></li>
          <li><a href="#area-chairs">Area chair recruitment</a></li>
          <li><a href="#acceptance">Task acceptance</a></li>
          <li><a href="#paper">The AFE paper</a></li>
          <li><a href="#faq">Frequently asked questions</a></li>
          <li><a href="#scientific-expertise">Advisory Committee</a></li>
        </ul>
      </aside>
      <div class="cc-article-main cc-authorship-main">
        <section class="cc-prose" id="participants">
          <h2>Participant credit</h2>
          <p class="cc-lead"><strong>A participant becomes a co-author of the AFE paper when three of their tasks have passed review and entered the benchmark.</strong></p>
          <p>You can start with one question. For a scientific workflow, identify a decision that requires expertise and the evidence that would distinguish good work. For a breakthrough question, identify the gap in current research and the conditions under which another researcher could verify an advance.</p>
          <p>Each task has its own author record. List the people who developed the task under <code>[task].authors</code> in <code>task.toml</code>. For a joint submission, confirm individual credit with the coordinating team.</p>
          <p class="cc-text-link"><a href="/contribute/task-package/#configuration">See where to record task authors</a></p>
        </section>
        <section class="cc-prose" id="area-chairs">
          <h2>Area chair recruitment</h2>
          <p>Area chairs (ACs) connect the project with research communities they know well. The role has three responsibilities.</p>
          <dl class="cc-definitions cc-role-list">
            <div><dt>Recruit at least five participants</dt><dd>Invite colleagues who can turn work from their fields into scientific tasks. Researchers with different instruments, methods or kinds of evidence can broaden the set of questions a field contributes.</dd></div>
            <div><dt>Help define fields and workflows</dt><dd>Work with the team on the classification of scientific domains and workflows. Draw on examples from your discipline to clarify where a task belongs and which research decision it tests.</dd></div>
            <div><dt>Review tasks at project milestones</dt><dd>Assess the scientific goal, the evidence available and whether the proposed evaluation supports the claim. Bring field-specific concerns to the authors while they can still revise the package.</dd></div>
          </dl>
          <p>To discuss an area chair role, introduce your field and the kinds of tasks you can review in the contributor WeChat group. The coordinating team can confirm the scope of the role and how your contributions will be credited.</p>
          <p class="cc-text-link"><a href="${communityUrl}">Find the contributor WeChat group</a></p>
        </section>
        <section class="cc-prose" id="acceptance">
          <h2>When a task counts</h2>
          <p>After submission, reviewers consider the scientific value of the question, the level, the resources and the evidence required for evaluation. They may ask the authors for a revised verifier, further observations or a more precise success condition.</p>
          <p>If two tasks have been accepted and a third is awaiting validation data, the participant has two accepted tasks. Once the team confirms inclusion of the third, the participant meets the co-authorship requirement.</p>
          <p>When discussing a revision or checking an acceptance record, give the task name, version, submitting team and a short account of what changed.</p>
        </section>
        <section class="cc-prose" id="paper">
          <h2>The AFE paper</h2>
          <p>Engineers at Shanghai AI Laboratory and on the AFE team maintain and update the benchmark. The team plans to submit a paper describing the work to a leading AI conference or to <em>Nature</em>.</p>
          <p>The contributor guide records the participant co-authorship threshold and the duties of an area chair. Discuss author order, shared task credit and credit for chairing directly with the coordinating team.</p>
          <p class="cc-text-link"><a href="${guideUrl}">Read the contributor guide (Chinese)</a></p>
        </section>
        <section class="cc-prose cc-faq" id="faq">
          <h2>Frequently asked questions</h2>
          <details><summary>Can I contribute one task at a time?</summary><p>Yes. Submit one ZIP per task. Your participation record accumulates as individual tasks are accepted. <a href="/contribute/#submit">Read the submission instructions</a>.</p></details>
          <details><summary>What if I have the science but need help building the package?</summary><p>On Duanyan, select <span lang="zh-Hans">部分材料待补充</span> (materials to follow) or <span lang="zh-Hans">需协助构建任务</span> (help needed to build the task). Describe what already exists and what you still need. For example, specify how to access the observations if the remaining work is to build the scoring environment.</p></details>
          <details><summary>Can my team contribute data licensed only for evaluation?</summary><p>Document the source, access conditions and attribution. Declare permission for execution, use in model improvement and public release separately on the submission form. The project checks the applicable permissions before making material public.</p></details>
          <details><summary>Can a negative scientific finding satisfy a task?</summary><p>Yes, if testing the hypothesis or establishing a limitation is the objective. Set the coverage, controls and quality checks in advance so another researcher can judge whether the evidence supports the finding.</p></details>
          <details><summary>Who can confirm credit for a shared task?</summary><p>Contact the coordinating team with the task name, version and the contributions of each person listed in the package. The team can confirm how the accepted task is recorded for each participant. <a href="${communityUrl}">Contact the contributor community</a>.</p></details>
        </section>
      </div>
    </div>
  </article>${expertise()}`;
}
