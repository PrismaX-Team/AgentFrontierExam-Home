// The catalogue already contains the complete printed register. The diagram
// and its keys share one selection, with a temporary preview on hover or focus.
for (const panel of document.querySelectorAll('.distribution-panel')) {
  const list = panel.querySelector('.distribution-keys');
  const keys = [...list.querySelectorAll('[data-entry]')];
  const shapes = new Map([...panel.querySelectorAll('[data-art-index]')].map(shape => [shape.dataset.artIndex, shape]));
  const reading = panel.querySelector('.distribution-reading');
  const number = reading.querySelector('strong');
  const name = reading.querySelector('span');
  const total = number.textContent;
  const totalLabel = name.textContent;
  let pinned = null;
  let active = null;
  let focused = null;
  let pointer;

  for (const key of keys) {
    key.disabled = false;
    key.setAttribute('aria-pressed','false');
  }

  function scrollEdges() {
    list.toggleAttribute('data-above',list.scrollTop > 1);
    list.toggleAttribute('data-below',list.scrollHeight - list.clientHeight - list.scrollTop > 1);
  }
  new ResizeObserver(scrollEdges).observe(list);
  list.addEventListener('scroll',scrollEdges,{passive:true});

  function entryAt(node) {
    const item = node?.closest?.('[data-entry],[data-art-index]');
    return item?.dataset.entry ?? item?.dataset.artIndex ?? null;
  }

  function reveal(key) {
    // Move only the register. Hovering the object must never scroll the page.
    const box = key.getBoundingClientRect();
    const viewport = list.getBoundingClientRect();
    const inset = 10;
    if (box.top < viewport.top + inset) list.scrollTop += box.top - viewport.top - inset;
    else if (box.bottom > viewport.bottom - inset) list.scrollTop += box.bottom - viewport.bottom + inset;
  }

  function show(index, follow = false) {
    if (active !== index) {
      keys[active]?.removeAttribute('data-active');
      shapes.get(active)?.removeAttribute('data-active');
      active = index;
      const key = keys[index];
      key?.setAttribute('data-active','');
      shapes.get(index)?.setAttribute('data-active','');
      number.textContent = key ? key.querySelector('.distribution-count').textContent : total;
      name.textContent = key ? key.querySelector('.distribution-name').textContent : totalLabel;
    }
    if (follow && keys[index]) reveal(keys[index]);
  }

  function select(index) {
    keys[pinned]?.setAttribute('aria-pressed','false');
    pinned = index;
    keys[pinned]?.setAttribute('aria-pressed','true');
    show(pinned,true);
  }

  // Scrolling a focused key into view moves rows under a stationary mouse.
  // Preview a new row only when the pointer itself has moved.
  panel.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || (event.clientX === pointer?.x && event.clientY === pointer?.y)) return;
    pointer = {x:event.clientX, y:event.clientY};
    const index = entryAt(event.target);
    show(index ?? focused ?? pinned,index !== null && Boolean(event.target.closest('[data-art-index]')));
  });
  panel.addEventListener('pointerleave', event => {
    if (event.pointerType === 'touch') return;
    pointer = null;
    show(focused ?? pinned);
  });
  panel.addEventListener('focusin', event => {
    focused = entryAt(event.target);
    show(focused,true);
  });
  panel.addEventListener('focusout', event => {
    focused = null;
    if (!list.contains(event.relatedTarget)) show(pinned);
  });
  panel.addEventListener('click', event => {
    const index = entryAt(event.target);
    if (index === null) return;
    if (event.target.closest('[data-art-index]')) keys[index].focus({preventScroll:true});
    focused = null;
    select(index === pinned ? null : index);
  });
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      focused = null;
      select(null);
      return;
    }
    const index = entryAt(event.target);
    if (index === null) return;
    const positions = {ArrowUp:Number(index) - 1, ArrowDown:Number(index) + 1, Home:0, End:keys.length - 1};
    if (Object.hasOwn(positions,event.key)) {
      event.preventDefault();
      keys[Math.min(keys.length - 1, Math.max(0,positions[event.key]))].focus();
    }
  });
}
