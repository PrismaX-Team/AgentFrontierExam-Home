import {plateFor} from '../data/plates.mjs';
import {axisLabel} from '../data/taxonomy.mjs';
import {escape, levelLabels} from './layout.mjs';

function workflowTypes(lang) {
  const zh = lang === 'zh';
  return [
    {
      example: 'review-efficient-fine-tuning',
      name: zh ? '文献调研' : 'Literature review',
      description: zh ? '追溯一项论断在不同研究中的依据，判断已有证据能支持怎样的结论。' : 'Trace a claim across published work and weigh the evidence for it.',
    },
    {
      example: 'ecological-recovery-shortfall',
      name: zh ? '证据综合' : 'Evidence synthesis',
      description: zh ? '综合多项研究的结果，估计一个共同效应，并说明研究之间的差异如何影响结论。' : 'Combine results across studies to estimate a shared effect and account for the differences between them.',
    },
    {
      example: 'm13-surface-brightness',
      name: zh ? '数据分析' : 'Data analysis',
      description: zh ? '从观测数据中提取待测的科学量，并估计测量的不确定性。' : 'Recover a scientific measurement from observations and quantify its uncertainty.',
    },
    {
      example: 'brain-connectivity-modules',
      name: zh ? '图表复现' : 'Figure reproduction',
      description: zh ? '用原始数据重建已发表的图表，检验能否得到论文报告的结果。' : 'Reconstruct a published figure from its data and see which findings survive the reconstruction.',
    },
    {
      example: 'western-cape-river-corridor',
      name: zh ? '数据制备' : 'Data preparation',
      description: zh ? '把原始观测整理成其他研究者可以继续使用的数据集、地图或科学视图。' : 'Turn source observations into a dataset, map or view that another researcher can use.',
    },
    {
      example: 'crystal-stability',
      name: zh ? '性质预测' : 'Property prediction',
      description: zh ? '预测一个科学系统的可测性质，用此前未见的样本检验预测。' : 'Predict a measurable property of a scientific system and test the predictions on unseen cases.',
    },
    {
      example: 'cosmic-ray-propagation',
      name: zh ? '假设检验' : 'Hypothesis testing',
      description: zh ? '用观测数据检验不同假设的预测，判断哪些解释与证据相符。' : 'Test the predictions of competing hypotheses against observations to see which explanations the evidence supports.',
    },
  ];
}

function researchTypes(lang, levels) {
  const zh = lang === 'zh';
  return [
    {
      name: levels[2],
      description: zh ? '解答一个开放的科学问题，提供其他研究者能够独立验证的证据。' : 'Resolve an open scientific question with independently verifiable evidence.',
      evidence: zh ? '指出已有研究留下的疑问，以及能够给出答案的观测、计算或证明。' : 'State what existing work leaves open and which observation, calculation or proof would settle it.',
      relatedTask: 'cosmic-ray-propagation',
    },
    {
      name: levels[3],
      description: zh ? '发现此前未知的现象、机制或科学原理，并使其他团队能够独立检验这项发现。' : 'Discover a previously unknown phenomenon, mechanism or scientific principle and establish evidence that others can verify independently.',
      evidence: zh ? '说明这项发现让研究者首次能够预测或探究什么，以及另一个团队可以怎样检验它。' : 'Explain what the discovery would let the field predict or investigate for the first time, and how another group could test it.',
      relatedTask: 'ecological-recovery-shortfall',
    },
  ];
}

function catalogueLink(label, params = {}) {
  const query = new URLSearchParams(params).toString();
  return { label, href: './tasks/' + (query ? '?' + query : '') };
}

function reference(task, level, lang) {
  if (!task) return null;
  return {
    id: task.id,
    title: task.title,
    domain: axisLabel(task.domain, lang),
    summary: task.summary,
    href: './tasks/' + encodeURIComponent(task.id) + '/',
    related: task.level !== level,
  };
}

function selectFacets(tasks, lang, workflows, research) {
  const zh = lang === 'zh';
  const allTasks = catalogueLink(zh ? '浏览全部任务' : 'Browse all tasks');
  const workflowFacets = workflows.map((type, index) => {
    const sample = tasks.find(task => task.id === type.example);
    return {
      type: index,
      task: reference(sample, 1, lang),
      browse: sample ? catalogueLink(zh ? '浏览同类任务' : 'Browse this workflow', { workflow: sample.workflow }) : allTasks,
    };
  });

  function researchFacets(level, count) {
    const candidates = tasks.filter(task => task.level === level);
    const illustrated = candidates.filter(task => plateFor(task.id, lang));
    const related = tasks.find(task => task.id === research[level - 2].relatedTask);
    const browse = candidates.length ? catalogueLink(zh ? '浏览本层任务' : 'Browse this level', { level }) : allTasks;
    return Array.from({ length: count }, (_, position) => ({
      type: workflows.length + level - 2,
      task: reference(illustrated.length ? illustrated[position % illustrated.length] : related, level, lang),
      browse,
    }));
  }

  return {
    types: [...workflows, ...research],
    pieces: [...workflowFacets, ...researchFacets(2, 4), ...researchFacets(3, 1)],
    labels: {
      example: zh ? '任务示例' : 'Example task',
      related: zh ? '相关科研流程' : 'Related workflow',
      research: zh ? '科学研究' : 'Scientific research',
      overview: zh ? 'Agent Frontier Exam 全貌' : 'Agent Frontier Exam overview',
      piecePosition: zh ? '第 {n} 块，共 {total} 块' : 'piece {n} of {total}',
    },
  };
}

export function pyramid(tasks, lang = 'en') {
  const zh = lang === 'zh';
  const levels = levelLabels(lang);
  const workflows = workflowTypes(lang);
  const research = researchTypes(lang, levels);
  const facets = selectFacets(tasks, lang, workflows, research);
  const legend = Object.entries(levels).map(([level, name]) =>
    `<li><button type="button" data-level="${level}" aria-controls="type-detail" aria-pressed="false"><span class="layer-swatch" aria-hidden="true"></span><span class="level-code">L${level}</span> <span class="level-title">${escape(name)}</span></button></li>`
  ).join('');
  const cardIds = new Set(facets.pieces.flatMap(piece => piece.task ? [piece.task.id] : []));
  const pictures = [...cardIds].map(id => {
    const art = plateFor(id, lang);
    if (!art) throw new Error('Missing artwork for pyramid task ' + id);
    return `<img data-task-art="${escape(id)}" src="/assets/plates/${escape(art.file)}" alt="${escape(art.alt)}" width="720" height="450" loading="lazy" decoding="async" hidden>`;
  }).join('');
  const config = JSON.stringify(facets).replaceAll('<', '\\u003c');
  const scientificLevels = zh ? '科学任务层级' : 'Scientific task levels';
  return `<section id="taskonomy" aria-label="${zh ? 'Agent Frontier Exam 与科学任务层级' : 'Agent Frontier Exam and its scientific task levels'}">
    <div class="spread">
      <div class="copy">
        <div class="intro">
          <h1 lang="en">Agent<br><span><em>Frontier</em> Exam</span></h1>
          <p>${zh ? '<span>评估 AI 智能体的科研能力，</span><span>从有挑战的科研流程，</span><span>到可独立验证的科学突破。</span>' : '<span>A benchmark for AI agents in science,</span> <span>from demanding research workflows</span> <span>to verifiable breakthroughs.</span>'}</p>
        </div>
        <section class="detail" id="type-detail" aria-label="${zh ? '所选任务类型' : 'Selected task type'}" hidden>
          <p class="level-name"></p>
          <h2></h2>
          <p class="definition"></p>
          <article class="task" hidden>
            <a class="task-card" aria-labelledby="selected-task-title">
              <span class="task-art">${pictures}</span>
              <small></small>
              <h3 id="selected-task-title"></h3>
              <p></p>
            </a>
          </article>
          <p class="evidence" hidden></p>
          <div class="detail-links">
            <a class="browse"></a>
            <a class="contribute" href="./contribute/" hidden>${zh ? '参与共建' : 'Contribute a task'}</a>
          </div>
        </section>
      </div>
      <figure class="plate" aria-label="${zh ? '探索科学任务的三个层级' : 'Explore the scientific task levels'}" hidden>
        <div class="layer-labels" role="group" aria-label="${scientificLevels}">
          <button class="whole-model" type="button" data-level="0" aria-controls="type-detail" aria-pressed="true">
            <span class="mini-pyramid" aria-hidden="true"><i></i><i></i><i></i></span>${zh ? '全部层级' : 'All levels'}
          </button>
          <ol>${legend}</ol>
        </div>
        <div class="model-stage">
          <canvas aria-label="${zh ? '科学任务分为三个层级。选择一个层级，即可查看其中的任务类型。' : 'Three levels of scientific work. Select a layer to explore its pieces.'}">${zh ? '使用各层级的按钮，可通过键盘浏览模型。' : 'The level buttons provide keyboard access to this diagram.'}</canvas>
          <div class="facet-keys" role="group" aria-label="${zh ? '所选层级中的积木' : 'Pieces in the selected layer'}" hidden></div>
        </div>
        <figcaption class="object-note" hidden><strong></strong><span></span></figcaption>
      </figure>
      <div class="pyramid-alternative">
        <dl>
          <dt>L1 · ${escape(levels[1])}</dt><dd>${zh ? '完成科研工作中一项需要专业判断的任务。' : 'Carry out a demanding part of scientific work.'}</dd>
          <dt>L2 · ${escape(levels[2])}</dt><dd>${escape(research[0].description)}</dd>
          <dt>L3 · ${escape(levels[3])}</dt><dd>${escape(research[1].description)}</dd>
        </dl>
        <a href="./tasks/">${zh ? '浏览全部任务' : 'Browse all tasks'}</a>
      </div>
    </div>
    <p class="live" aria-live="polite" aria-atomic="true"></p>
    <script type="application/json" data-pyramid-content>${config}</script>
  </section>`;
}
