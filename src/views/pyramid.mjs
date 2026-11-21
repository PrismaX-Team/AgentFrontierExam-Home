const workflows = [
  {
    name: 'Literature review',
    description: 'Trace a claim across published work and weigh the evidence for it.',
  },
  {
    name: 'Experimental design',
    description: 'Choose measurements or interventions that distinguish competing explanations under a fixed budget.',
  },
  {
    name: 'Data analysis',
    description: 'Recover a scientific measurement from observations and quantify its uncertainty.',
  },
  {
    name: 'Figure reproduction',
    description: 'Reconstruct a published figure from its data and see which findings survive the reconstruction.',
  },
  {
    name: 'Data preparation',
    description: 'Turn source observations into a dataset, map or view that another researcher can use.',
  },
  {
    name: 'Property prediction',
    description: 'Predict a measurable property of a scientific system and test the predictions on unseen cases.',
  },
  {
    name: 'Model validation',
    description: 'Determine where a scientific model gives reliable results and where its assumptions break down.',
  },
];

const research = [
  {
    name: 'Scientific breakthroughs',
    description: 'Resolve an open scientific question with independently verifiable evidence.',
    evidence: 'State what existing work leaves open and which observation, calculation or proof would settle it.',
  },
  {
    name: 'Major scientific breakthroughs',
    description: 'Resolve a question whose answer would change what an entire field can explain or predict.',
    evidence: 'Explain the consequence for the field and how another group could independently establish the result.',
  },
];

function catalogueLink(label, params = {}) {
  const query = new URLSearchParams(params).toString();
  return { label, href: './tasks/' + (query ? '?' + query : '') };
}

function reference(task) {
  if (!task) return null;
  return {
    title: task.title,
    domain: task.domain,
    summary: task.summary,
    href: './tasks/' + encodeURIComponent(task.id) + '/',
    related: task.level == null,
  };
}

function selectFacets(tasks) {
  const rank = task => task.showcase ?? Number.MAX_SAFE_INTEGER;
  const ordered = [...tasks].sort((a, b) => rank(a) - rank(b));
  const allTasks = catalogueLink('Browse all tasks');
  const workflowFacets = workflows.map((type, typeIndex) => {
    const candidates = ordered.filter(task => task.workflow === type.name);
    const sample = candidates.find(task => task.level === 1) ?? candidates.find(task => task.level == null);
    return {
      type: typeIndex,
      task: reference(sample),
      browse: candidates.length ? catalogueLink('Browse this workflow', { workflow: type.name }) : allTasks,
    };
  });

  function researchFacets(level, count) {
    const candidates = ordered.filter(task => task.level === level);
    const browse = candidates.length ? catalogueLink('Browse this level', { level }) : allTasks;
    return Array.from({ length: count }, (_, position) => ({
      type: workflows.length + level - 2,
      task: reference(candidates.length ? candidates[position % candidates.length] : null),
      browse,
    }));
  }

  return {
    types: [...workflows, ...research],
    pieces: [...workflowFacets, ...researchFacets(2, 4), ...researchFacets(3, 1)],
  };
}

export function pyramid(tasks) {
  // Escaping "<" keeps editorial text inside inert script data, including a literal </script>.
  const config = JSON.stringify(selectFacets(tasks)).replaceAll('<', '\\u003c');
  return `<section id="taskonomy" aria-label="Agent Frontier Exam and its scientific task levels">
    <div class="spread">
      <div class="copy">
        <div class="intro">
          <h1>Agent<br><span><em>Frontier</em> Exam</span></h1>
          <p><span>A benchmark for AI agents in science,</span> <span>from demanding research workflows</span> <span>to verifiable breakthroughs.</span></p>
        </div>
        <section class="detail" id="type-detail" aria-label="Selected task type" hidden>
          <p class="level-name"></p>
          <h2></h2>
          <p class="definition"></p>
          <article class="task" hidden>
            <small></small>
            <h3><a></a></h3>
            <p></p>
          </article>
          <p class="evidence" hidden></p>
          <div class="detail-links">
            <a class="browse"></a>
            <a class="contribute" href="./contribute/" hidden>Contribute a task</a>
          </div>
        </section>
      </div>
      <figure class="plate" aria-label="Explore the scientific task levels" hidden>
        <canvas aria-label="Three levels of scientific work. Select a layer to bring it forward.">The layer buttons provide keyboard access to this diagram.</canvas>
        <div class="layer-labels" role="group" aria-label="Scientific task levels">
          <button type="button" data-level="3" aria-controls="type-detail" aria-label="L3 · Major scientific breakthroughs">L3</button>
          <button type="button" data-level="2" aria-controls="type-detail" aria-label="L2 · Scientific breakthroughs">L2</button>
          <button type="button" data-level="1" aria-controls="type-detail" aria-label="L1 · Scientific workflows">L1</button>
        </div>
        <button class="motion" type="button" aria-label="Pause rotation" aria-pressed="false"><span aria-hidden="true"></span></button>
        <div class="facet-keys" role="group" aria-label="Pieces in the selected layer" hidden></div>
        <p class="assembly-hint" hidden>Select a faded layer to reassemble.</p>
        <figcaption class="object-note" hidden><strong></strong><span></span></figcaption>
      </figure>
      <div class="pyramid-alternative">
        <dl>
          <dt>L1 · Scientific workflows</dt><dd>Carry out a demanding part of scientific work.</dd>
          <dt>L2 · Scientific breakthroughs</dt><dd>Resolve an open scientific question.</dd>
          <dt>L3 · Major scientific breakthroughs</dt><dd>Establish a result with consequences across a field.</dd>
        </dl>
        <a href="./tasks/">Browse all tasks</a>
      </div>
    </div>
    <p class="live" aria-live="polite" aria-atomic="true"></p>
    <script type="application/json" data-pyramid-content>${config}</script>
  </section>`;
}
