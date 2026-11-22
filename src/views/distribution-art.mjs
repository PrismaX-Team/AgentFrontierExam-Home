import {escape} from './layout.mjs';

const tau = Math.PI * 2;
const number = value => Math.round(value * 100) / 100;
const pair = point => point.map(number).join(' ');
const outline = points => 'M' + points.map(pair).join('L') + 'Z';
const shape = (path, style, paint = '') => `<path class="${style}" d="${path}"${paint ? ` fill="${paint}"` : ''}/>`;
const face = (points, style, paint) => shape(outline(points), style, paint);
const plane = (base, top, side) => [base[side], base[(side + 1) % 4], top[(side + 1) % 4], top[side]];

function paintbox(view, entries) {
  const pigments = entries.map(({color}, i) => {
    const id = `da-${view}-sample-${i}`;
    const pigment = `style="--sample:${escape(color)}"`;
    const top = `<linearGradient id="${id}" x2=".82" y2="1" ${pigment}>
      <stop class="da-sample-lit"/><stop offset=".58" class="da-sample-mid"/><stop offset="1" class="da-sample-dim"/>
    </linearGradient>`;
    return view === 'fields' ? top : top + `<linearGradient id="${id}-near" x1=".15" y1="0" x2=".8" y2="1" ${pigment}>
      <stop class="da-sample-frontlight"/><stop offset="1" class="da-sample-frontfoot"/>
    </linearGradient>
    <linearGradient id="${id}-side" x1="0" y1="0" x2="1" y2=".65" ${pigment}>
      <stop class="da-sample-flank"/><stop offset="1" class="da-sample-foot"/>
    </linearGradient>`;
  }).join('');
  const dishGlass = view === 'fields' ? `<linearGradient id="da-fields-edge" x1="0" y1="0" x2="1" y2=".3">
      <stop class="da-edge-deep"/><stop offset=".17" class="da-edge-lit"/>
      <stop offset=".55" class="da-edge-mid"/><stop offset="1" class="da-edge-deep"/>
    </linearGradient>
    <linearGradient id="da-fields-bevel" x2=".18" y2="1">
      <stop class="da-bevel-lit"/><stop offset=".54" class="da-bevel-soft"/><stop offset="1" class="da-bevel-dim"/>
    </linearGradient>` : '';
  return `<defs>${pigments}${dishGlass}
    <radialGradient id="da-${view}-shadow"><stop class="da-shadow-core"/><stop offset=".62" class="da-shadow-soft"/><stop offset="1" class="da-shadow-end"/></radialGradient>
  </defs>`;
}

function shadow(view, cx, cy, rx, ry) {
  return `<ellipse class="da-ground" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#da-${view}-shadow)"/>`;
}

function specimen(index, color, hitArea, material) {
  return `<g data-art-index="${index}" style="--sample:${escape(color)}">${shape(hitArea, 'da-hit')}<g class="da-specimen">${material}</g></g>`;
}

// A shallow annular dish. Equal-angle chambers keep even the smallest field easy to inspect.
const dish = {x: 177, y: 114, pitch: .58};
function radial(radius, angle, height) {
  return [dish.x + radius * Math.cos(angle), dish.y + dish.pitch * radius * Math.sin(angle) - height];
}

function arc(radius, start, end, height) {
  const radiusY = number(radius * dish.pitch);
  const sweep = end > start ? 1 : 0;
  // Two arcs also describe the full rim of a dish containing a single field.
  return [(start + end) / 2, end].map(angle =>
    `A${number(radius)} ${radiusY} 0 0 ${sweep} ${pair(radial(radius, angle, height))}`
  ).join('');
}

function sector(inner, outer, start, end, height) {
  return 'M' + pair(radial(outer, start, height)) + arc(outer, start, end, height) +
    'L' + pair(radial(inner, end, height)) + arc(inner, end, start, height) + 'Z';
}

function apron(radius, start, end, base, top) {
  return 'M' + pair(radial(radius, start, top)) + arc(radius, start, end, top) +
    'L' + pair(radial(radius, end, base)) + arc(radius, end, start, base) + 'Z';
}

function fieldsDish(entries) {
  const rim = 142, inner = 15, outer = 128;
  const largest = Math.max(1, ...entries.map(e => e.count));
  const step = tau / entries.length, datum = -Math.PI * .87;
  const wells = entries.map(({color, count}, i) => {
    const start = datum + i * step, end = start + step;
    const divider = Math.min(.016, step * .08);
    const a = start + divider, b = end - divider;
    const glass = shape(sector(inner - 1, outer + 2, a, b, 0), 'da-dish-well');
    // Area of an annular sector is proportional to the difference of its squared radii.
    const filled = Math.sqrt(inner ** 2 + (outer ** 2 - inner ** 2) * count / largest);
    let liquid = '';
    if (count) {
      const level = 4.2;
      liquid = shape(apron(filled, a, b, .25, level), 'da-liquid-edge') +
        shape(sector(inner, filled, a, b, level), 'da-liquid-surface', `url(#da-fields-sample-${i})`) +
        shape(sector(Math.max(inner, filled - 2.5), filled, a, b, level), 'da-liquid-collar') +
        shape('M' + pair(radial(filled, a, level)) + arc(filled, a, b, level), 'da-meniscus');
    }
    const dividerFace = face([radial(inner, start, 0), radial(outer + 2, start, 0), radial(outer + 2, start, 6), radial(inner, start, 6)], 'da-partition');
    const opening = shape(sector(inner - 1, outer + 2, a, b, 4), 'da-inspect');
    return specimen(i, color, sector(inner - 2, outer + 4, start, end, 2), glass + liquid + dividerFace + opening);
  }).join('');

  const ticks = Array.from({length: 60}, (_, i) => {
    const angle = datum + tau * i / 60;
    return 'M' + pair(radial(i % 5 ? 136.5 : 134.2, angle, 8)) + 'L' + pair(radial(139, angle, 8));
  }).join('');
  const outerWall = apron(rim, 0, Math.PI, -17, 8);
  const front = shape(outerWall, 'da-dish-apron', 'url(#da-fields-edge)') +
    shape(outerWall, 'da-bevel', 'url(#da-fields-bevel)');
  const footing = shape('M' + pair(radial(rim - 1, 0, -13)) + arc(rim - 1, 0, Math.PI, -13), 'da-glass-line');
  return shadow('fields', 187, 165, 152, 59) +
    `<ellipse class="da-glass-bed" cx="${dish.x}" cy="${dish.y + 17}" rx="${rim}" ry="${number(rim * dish.pitch)}"/>` +
    shape(apron(rim, Math.PI, tau, -17, 8), 'da-dish-back', 'url(#da-fields-edge)') +
    `<ellipse class="da-dish-floor" cx="${dish.x}" cy="${dish.y}" rx="${outer + 2}" ry="${number((outer + 2) * dish.pitch)}"/>` +
    front + footing +
    shape(apron(outer + 3, Math.PI, tau, -1, 8), 'da-dish-recess', 'url(#da-fields-edge)') +
    wells + shape(apron(outer + 3, 0, Math.PI, -1, 8), 'da-refracted-lip', 'url(#da-fields-bevel)') +
    shape(apron(inner - 1, 0, Math.PI, 0, 5.2), 'da-hub-wall') +
    `<ellipse class="da-hub" cx="${dish.x}" cy="${dish.y - 5.2}" rx="${inner - 1}" ry="${number((inner - 1) * dish.pitch)}"/>` +
    shape(sector(outer + 3, rim, 0, tau, 8), 'da-dish-lip') +
    shape(sector(outer + 4.5, rim - 1.5, 0, tau, 8), 'da-bevel', 'url(#da-fields-bevel)') +
    shape(ticks, 'da-graduations');
}

// Project a square vessel's four corners from back to front.
function ring(project, cx, cz, half, height) {
  return [[-1,-1], [1,-1], [1,1], [-1,1]].map(([x,z]) =>
    project(cx + half * x, cz + half * z, height)
  );
}

function walls(base, top, sides, classes) {
  return sides.map((side, i) => face(plane(base, top, side), classes[i])).join('');
}

function fluid(base, top, paintId) {
  return face(plane(base, top, 2), 'da-fluid-near', `url(#${paintId}-near)`) +
    face(plane(base, top, 1), 'da-fluid-side', `url(#${paintId}-side)`) +
    face(top, 'da-liquid-surface', `url(#${paintId})`);
}

function typePlate(entries) {
  const columns = Math.max(1, Math.min(entries.length, Math.ceil(Math.sqrt(1.55 * entries.length))));
  const rows = Math.max(1, Math.ceil(entries.length / columns));
  const pitch = .73, yaw = .25, dx = Math.cos(yaw), dz = Math.sin(yaw);
  const pitchX = 50, pitchZ = 76, height = 28;
  const width = (columns - 1) * pitchX + 53, depth = (rows - 1) * pitchZ + 53;
  const span = width * dx + depth * dz;
  const front = (width * dz + depth * dx) * Math.sin(pitch);
  const unit = Math.min(327 / span, 210 / (front + height * Math.cos(pitch)), 1.85);
  function project(x, z, y) {
    return [178 + unit * (x * dx - z * dz), 141 + unit * ((x * dz + z * dx) * Math.sin(pitch) - y * Math.cos(pitch))];
  }
  const slab = y => [[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,z]) => project(x * width / 2, z * depth / 2, y));
  const foot = slab(-5), deck = slab(0);
  const peak = Math.max(1, ...entries.map(e => e.count));
  const wells = entries.map(({color, count}, i) => {
    const x = (i % columns - (columns - 1) / 2) * pitchX;
    const z = (Math.floor(i / columns) - (rows - 1) / 2) * pitchZ;
    const square = (r, y) => ring(project, x, z, r, y);
    const bottom = square(16.4, 1), mouth = square(20.3, height), bore = square(17.7, height);
    const floor = square(14.8, 3.2), share = count / peak;
    const surface = square(14.8 + share * 2.6, 3.2 + share * (height - 5.5));
    const well = face(bottom, 'da-well-base') + walls(bottom, mouth, [3,0], ['da-glass-back','da-glass-far']) +
      (count ? `<g opacity="${number(.21 + .79 * Math.sqrt(share))}">${fluid(floor, surface, `da-types-sample-${i}`)}</g>` : '') +
      walls(bottom, mouth, [2,1], ['da-glass-near','da-glass-side']) +
      shape(outline(mouth) + outline(bore), 'da-mouth') + face(mouth, 'da-inspect');
    const hit = outline([mouth[0],mouth[1],bottom[1],bottom[2],bottom[3],mouth[3]]);
    return specimen(i, color, hit, well);
  }).join('');
  return shadow('types', 186, 170, 162, 66) +
    walls(foot, deck, [2,1], ['da-tray-edge','da-tray-end']) + face(deck, 'da-tray-deck') + wells;
}

const tierHeights = [0, .52, 1.05, 1.8];
function levelPyramid(entries) {
  const total = entries.reduce((sum, e) => sum + e.count, 0);
  const yaw = .64, pitch = .34, unit = 89;
  const tiers = entries.map(({color, count}, i) => {
    const low = tierHeights[i], high = tierHeights[i + 1], cap = i === 2;
    const r = y => 1 - y / tierHeights[3];
    const planeAt = (height, inset = 0) => ring((x,z,y) => [
      178 + unit * (x * Math.cos(yaw) - z * Math.sin(yaw)),
      204 + unit * (x * Math.sin(yaw) + z * Math.cos(yaw)) * Math.sin(pitch) - 72 * y - 27 * i,
    ], 0, 0, Math.max(0, r(height) - inset), height);
    const base = planeAt(low), roof = planeAt(high);
    const inside = planeAt(low + .025, .027), rim = planeAt(high, .023);
    const share = total ? count / total : 0;
    let liquid = '';
    if (count) {
      // The capacity of a narrowing square frustum follows the difference of two cubes.
      const floor = low + .033, ceiling = high - .035, inset = .024;
      const footRadius = r(floor) - inset, rimRadius = Math.max(0, r(ceiling) - inset);
      const fit = Math.cbrt(footRadius ** 3 + (rimRadius ** 3 - footRadius ** 3) * share);
      const fillHeight = tierHeights[3] * (1 - fit - inset);
      liquid = `<g opacity="${number(.62 + .38 * share)}">${fluid(planeAt(floor,inset), planeAt(fillHeight,inset), `da-levels-sample-${i}`)}</g>`;
    }
    const glass = face(base, 'da-tier-bed') + face(inside, 'da-tier-inset') +
      walls(base, roof, [3,0], ['da-tier-back','da-tier-far']) + liquid +
      walls(base, roof, [2,1], ['da-tier-near','da-tier-side']) +
      walls(base, inside, [2,1], ['da-tier-bevel','da-tier-bevel']) +
      (cap ? '' : shape(outline(roof) + outline(rim), 'da-tier-mouth')) +
      shape('M' + [base[3],base[2],base[1]].map(pair).join('L'), 'da-tier-foot') +
      shape('M' + [roof[3],base[3],base[2],base[1],roof[1],roof[2],roof[3]].map(pair).join('L'), 'da-inspect');
    return specimen(i, color, outline([base[3],base[2],base[1],roof[1],roof[0],roof[3]]), glass);
  }).join('');
  return shadow('levels', 190, 207, 135, 35) + tiers;
}

export function distributionArt(view, entries) {
  const draw = {fields: fieldsDish, types: typePlate, levels: levelPyramid}[view];
  return `<svg class="distribution-art da-${view}" viewBox="0 0 360 260" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
    ${paintbox(view, entries)}${draw(entries)}
  </svg>`;
}
