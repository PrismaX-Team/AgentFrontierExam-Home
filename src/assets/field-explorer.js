(() => {
  'use strict';
  const root = document.querySelector('[data-field-explorer]');
  if (!root) return;

  const picker = root.querySelector('select');
  const plot = root.querySelector('.field-plot');
  const list = root.querySelector('.field-activities');
  const pager = root.querySelector('.field-pages');
  const buttons = [...pager.querySelectorAll('button')];
  const origin = root.querySelector('.origin-port');
  const canvas = root.querySelector('canvas');
  const context = canvas.getContext('2d');
  const pageSize = Number(root.dataset.pageSize);
  const fields = new Map();
  // Capture the complete published matrix before the directory applies its search filters.
  for (const link of document.querySelectorAll('.task-matrix .matrix-cell')) {
    const {domain, workflow} = link.dataset;
    if (!fields.has(domain)) fields.set(domain, {total: 0, activities: []});
    const field = fields.get(domain);
    const count = Number(link.textContent);
    field.total += count;
    field.activities.push({name: workflow, count, href: link.getAttribute('href')});
  }
  for (const field of fields.values()) {
    field.activities.sort((a,b) => b.count-a.count || a.name.localeCompare(b.name,'en'));
  }
  let page = 0, frame = 0;
  const quantity = (n, singular, plural) => n + ' ' + (n === 1 ? singular : plural);

  function draw() {
    frame = 0;
    if (!context) return;
    const box = plot.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const factor = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(box.width * factor), height = Math.round(box.height * factor);
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    context.setTransform(width/box.width,0,0,height/box.height,0,0);
    context.clearRect(0,0,box.width,box.height);
    context.lineCap = 'round';
    const station = origin.getBoundingClientRect();
    const x = station.left + station.width/2 - box.left, y = station.top + station.height/2 - box.top;
    const active = list.querySelector('a:focus-visible, a:hover');
    const total = fields.get(picker.value).total;
    for (const link of list.querySelectorAll('a')) {
      const port = link.querySelector('.activity-port').getBoundingClientRect();
      const endX = port.left + port.width/2 - box.left, endY = port.top + port.height/2 - box.top;
      const reach = endX-x;
      context.beginPath();
      context.moveTo(x,y);
      context.bezierCurveTo(x+reach*.42,y,endX-reach*.51,endY,endX,endY);
      context.strokeStyle = link===active ? '#235942' : active ? '#b2c1b3' : '#72957e';
      context.lineWidth = 1 + 2.6*Math.sqrt(Number(link.dataset.count)/total);
      context.stroke();
    }
    plot.setAttribute('data-drawn','');
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(draw); }

  function render(announce) {
    const name = picker.value, {activities,total} = fields.get(name);
    const start = page * pageSize, visible = activities.slice(start,start+pageSize);
    const taskTotal = quantity(total,'task','tasks'), activityTotal = quantity(activities.length,'activity','activities');
    root.querySelector('[data-origin-name]').textContent = name;
    root.querySelector('[data-field-total]').textContent = taskTotal;
    root.querySelector('[data-activity-total]').textContent = activityTotal;
    list.setAttribute('aria-label','Research activities in '+name);
    list.replaceChildren(...visible.map(activity => {
      const item = document.createElement('li'), link = document.createElement('a');
      const port = document.createElement('i'), label = document.createElement('span'), count = document.createElement('span');
      port.className = 'activity-port'; port.setAttribute('aria-hidden','true');
      label.textContent = activity.name; count.textContent = activity.count; count.className = 'field-count';
      link.setAttribute('href',activity.href); link.dataset.count = activity.count;
      link.setAttribute('aria-label',activity.name + ', ' + quantity(activity.count,'task','tasks') + ' in ' + name);
      link.append(port,label,count); item.append(link); return item;
    }));
    pager.hidden = activities.length<=pageSize;
    const range = 'Activities ' + (start+1) + '–' + (start+visible.length) + ' of ' + activities.length;
    root.querySelector('[data-field-range]').textContent = range;
    buttons[0].setAttribute('aria-disabled',String(start===0));
    buttons[1].setAttribute('aria-disabled',String(start+visible.length===activities.length));
    if (announce) root.querySelector('[data-field-announcement]').textContent = name + '. ' + taskTotal + ', ' + activityTotal + (pager.hidden ? '.' : '. '+range+'.');
    schedule();
  }
  picker.addEventListener('change',() => { page=0; render(true); });
  for (const button of buttons) button.addEventListener('click',() => {
    if (button.getAttribute('aria-disabled')==='true') return;
    page += Number(button.dataset.fieldPage); render(true);
  });
  for (const event of ['pointerover','pointerout','focusin','focusout']) list.addEventListener(event,schedule);
  const local = location.protocol==='file:' && location.hash.startsWith('#?');
  const requested = new URLSearchParams(window.afePreviewAddress?.search ?? (local ? location.hash.slice(2) : location.search)).get('domain');
  if (fields.has(requested)) picker.value=requested;
  picker.hidden = false;
  root.querySelector('.field-chevron').hidden = false;
  canvas.hidden = !context;
  render(false);
  new ResizeObserver(schedule).observe(plot);
  document.fonts.ready.then(schedule);
})();
