// Every vessel and its legend key describe the same entry in the header.
for (const overview of document.querySelectorAll('.catalog-overview')) {
  const reading = overview.querySelector('.distribution-total');
  const number = reading.querySelector('strong');
  const total = number.textContent;
  const totalLabel = reading.querySelector('.distribution-total-label');
  const selection = reading.querySelector('.distribution-selection');
  const fullLabel = selection.querySelector('[data-full]');
  const shortLabel = selection.querySelector('[data-short]');
  const entries = new WeakMap();
  let active = null;
  let pinned = null;
  let pointer;

  for (const panel of overview.querySelectorAll('.distribution-panel')) {
    const list = panel.querySelector('.distribution-keys');
    const keys = [...list.querySelectorAll('[data-entry]')];
    const stage = panel.querySelector('.distribution-stage');
    const rim = stage.querySelector('.da-dish-face, .da-tray, .da-levels [data-art-index="0"]');
    for (const key of keys) {
      const shape = stage.querySelector('[data-art-index="' + key.dataset.entry + '"]');
      const entry = {key, shape, list, keys, count:key.querySelector('.distribution-count').textContent,
        label:key.querySelector('.distribution-name').textContent.trim()};
      entries.set(key, entry);
      entries.set(shape, entry);
      key.disabled = false;
      key.setAttribute('aria-pressed', 'false');
    }

    function scrollEdges() {
      list.toggleAttribute('data-above', list.scrollTop > 1);
      list.toggleAttribute('data-below', list.scrollHeight - list.clientHeight - list.scrollTop > 1);
    }
    new ResizeObserver(scrollEdges).observe(list);
    list.addEventListener('scroll', scrollEdges, {passive:true});
    new ResizeObserver(() => {
      const box = stage.getBoundingClientRect();
      if (box.width && rim) overview.style.setProperty('--model-inset', Math.max(0, box.right - rim.getBoundingClientRect().right) + 'px');
    }).observe(stage);
  }

  function entryAt(target) {
    return entries.get(target?.closest?.('[data-entry], [data-art-index]')) ?? null;
  }

  function show(entry, follow = false) {
    if (active !== entry) {
      active?.key.removeAttribute('data-active');
      active?.shape.removeAttribute('data-active');
      active = entry;
      entry?.key.setAttribute('data-active', '');
      entry?.shape.setAttribute('data-active', '');
      number.textContent = entry?.count ?? total;
      totalLabel.hidden = Boolean(entry);
      selection.hidden = !entry;
      if (entry) {
        fullLabel.textContent = entry.label;
        shortLabel.textContent = entry.key.dataset.short || entry.label;
        selection.title = entry.label;
      }
    }
    if (follow && entry) {
      // Keep the legend entry near the drawing without scrolling the page.
      const box = entry.key.getBoundingClientRect(), list = entry.list.getBoundingClientRect();
      if (box.top < list.top + 10) entry.list.scrollTop += box.top - list.top - 10;
      else if (box.bottom > list.bottom - 10) entry.list.scrollTop += box.bottom - list.bottom + 10;
    }
  }

  function pin(entry) {
    pinned?.key.setAttribute('aria-pressed', 'false');
    pinned = entry;
    pinned?.key.setAttribute('aria-pressed', 'true');
  }

  function reset() {
    pointer = null;
    pin(null);
    show(null);
  }

  overview.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || (pointer?.x === event.clientX && pointer?.y === event.clientY)) return;
    pointer = {x:event.clientX, y:event.clientY};
    const entry = entryAt(event.target);
    if (entry !== pinned) pin(null);
    show(entry, Boolean(event.target.closest('[data-art-index]')));
  });
  overview.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'touch') reset();
  });
  overview.addEventListener('focusin', event => {
    if (event.target.matches(':focus-visible')) show(entryAt(event.target), true);
  });
  overview.addEventListener('focusout', event => {
    if (entryAt(event.target) && !entryAt(event.relatedTarget)) reset();
  });
  overview.addEventListener('click', event => {
    const entry = entryAt(event.target);
    if (!entry) return;
    pin(entry === pinned ? null : entry);
    show(pinned, true);
  });
  document.addEventListener('pointerdown', event => {
    if (!entryAt(event.target)) reset();
  });
  overview.addEventListener('change', reset);
  window.addEventListener('popstate', reset);
  overview.addEventListener('keydown', event => {
    if (event.key === 'Escape') { reset(); return; }
    const entry = entryAt(event.target);
    if (!entry) return;
    const index = entry.keys.indexOf(entry.key);
    const positions = {ArrowUp:index - 1, ArrowDown:index + 1, Home:0, End:entry.keys.length - 1};
    if (Object.hasOwn(positions, event.key)) {
      event.preventDefault();
      pin(null);
      entry.keys[Math.min(entry.keys.length - 1, Math.max(0, positions[event.key]))].focus();
    }
  });
}
