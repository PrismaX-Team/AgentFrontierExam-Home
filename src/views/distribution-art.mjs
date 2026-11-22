import {escape} from './layout.mjs';

const tau = 2 * Math.PI;
const n = value => Math.round(value * 100) / 100;
const pair = point => point.map(n).join(' ');
const loop = points => 'M' + points.map(pair).join('L') + 'Z';
const path = (d, css, paint) => `<path class="${css}" d="${d}"${paint ? ` fill="url(#${paint})"` : ''}/>`;
const pigment = (view, i) => `da-${view}-${i}`;

function glassPaint(view, entries) {
  const colors = entries.map(({color}, i) => {
    const id = pigment(view,i);
    // The change of face is a broad roll through the corner of the square casting.
    const corner = view === 'levels' ? .57 : .79;
    return `<g style="--sample:${escape(color)}">
      <linearGradient id="${id}-top" x1="0" y1=".03" x2=".85" y2="1">
        <stop class="da-lit"/><stop offset=".53" class="da-milk"/><stop offset="1" class="da-body"/>
      </linearGradient>
      <linearGradient id="${id}-wall" x1="0" x2="1" y1=".3" y2=".32">
        <stop class="da-turn"/><stop offset=".15" class="da-front"/><stop offset="${corner-.06}" class="da-mid"/>
        <stop offset="${corner+.05}" class="da-flank"/><stop offset=".96" class="da-side"/><stop offset="1" class="da-turn"/>
      </linearGradient></g>`;
  }).join('');
  return `<defs>${colors}
    <linearGradient id="da-${view}-casting" x2=".85" y2="1"><stop class="da-cast-lit"/><stop offset=".53" class="da-cast-mid"/><stop offset="1" class="da-cast-dim"/></linearGradient>
    <linearGradient id="da-${view}-shoulder" x2=".24" y2="1"><stop class="da-soft-lit"/><stop offset=".55" class="da-soft-mid"/><stop offset="1" class="da-soft-foot"/></linearGradient>
    <radialGradient id="da-${view}-hollow" cx=".37" cy=".3" r=".76"><stop class="da-well-mid"/><stop offset=".72" class="da-well-fade"/><stop offset="1" class="da-well-edge"/></radialGradient>
    ${view === 'levels' ? '<linearGradient id="da-levels-air" x1="0" y1=".78" x2=".7" y2=".14"><stop class="da-air-bottom"/><stop offset=".6" class="da-air-body"/><stop offset="1" class="da-air-tip"/></linearGradient>' : ''}
    <radialGradient id="da-${view}-shadow"><stop class="da-shadow"/><stop offset=".58" class="da-penumbra"/><stop offset="1" class="da-fade"/></radialGradient>
    <filter id="da-${view}-satin" color-interpolation-filters="sRGB" x="-3%" y="-4%" width="106%" height="108%">
      <feTurbulence type="fractalNoise" baseFrequency=".88" numOctaves="2" seed="19" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".19"/></feComponentTransfer>
      <feComposite in2="SourceAlpha" operator="in" result="frost"/><feBlend in="frost" in2="SourceGraphic" mode="soft-light"/>
    </filter>
  </defs>`;
}

function shadow(view, cx, cy, rx, ry) {
  return `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="url(#da-${view}-shadow)"/>`;
}
function item(index, color, hit, art) {
  return `<g data-art-index="${index}" style="--sample:${escape(color)}">${path(hit,'da-hit')}<g class="da-specimen">${art}</g></g>`;
}

// Horizontal sections carry the same mould radius through the lip, body and foot.
// Five intervals per quarter turn give a subpixel chord error at this display size.
function roundedRectangle(width, depth, radius) {
  const x = width / 2, z = depth / 2, r = Math.min(radius,x,z);
  const centers = [[r-x,r-z], [x-r,r-z], [x-r,z-r], [r-x,z-r]];
  return centers.flatMap(([cx,cz], corner) => Array.from({length:6}, (_, j) => {
    const angle = Math.PI + (corner + j / 5) * Math.PI / 2;
    return [cx + r * Math.cos(angle), cz + r * Math.sin(angle)];
  }));
}

function between(points, start, end) {
  return start <= end ? points.slice(start,end+1) : [...points.slice(start), ...points.slice(0,end+1)];
}
function section(points) {
  let left = 0, right = 0;
  points.forEach(([x], i) => {
    if (x < points[left][0]) left = i;
    if (x > points[right][0]) right = i;
  });
  return {all:points, back:between(points,left,right), front:between(points,right,left)};
}
const band = (a,b) => loop([...a,...b.toReversed()]);
const body = (foot, crown) => loop([...crown.back,...foot.front]);
const front = (foot, crown) => band(crown.front,foot.front);
const rim = (outer,inner) => loop(outer.all) + loop(inner.all);
function frostedWall(foot, shoulder, neck, lip, color, density) {
  return `<g opacity="${n(density)}">${path(front(shoulder,neck),'da-wall',color+'-wall')}
    ${path(front(foot,shoulder),'da-heel',color+'-wall')}
    ${path(front(neck,lip),'da-roll',color+'-top')}</g>`;
}
function contents(foot, surface, color, opacity) {
  return `<g opacity="${n(opacity)}">${path(front(foot,surface),'da-liquid-wall',color+'-wall')}
    ${path(loop(surface.all),'da-liquid-surface',color+'-top')}</g>`;
}

const dish = {x:177,y:114,tilt:.575};
function polar(r, a) { return [r * Math.cos(a), r * Math.sin(a)]; }
function platter([x,z], height) { return [dish.x + x, dish.y + dish.tilt * z - height]; }
function ellipse(rx, ry, y, css, paint) {
  return `<ellipse class="${css}" cx="${dish.x}" cy="${n(y)}" rx="${n(rx)}" ry="${n(ry)}" fill="url(#${paint})"/>`;
}

// Build the sector in its physical plane. Its rounded liquid profile is scaled
// about the inner end, so the visible sample area is exactly proportional to count.
function sectorPath(inner, outer, a, b, height, scale = 1) {
  const corner = Math.min(5.4,(outer-inner)*.32,inner*(b-a)*.28);
  const da = corner / outer, db = corner / inner;
  const anchor = polar(inner,(a+b)/2);
  const point = (r,angle) => {
    const [x,z] = polar(r,angle);
    return pair(platter([anchor[0] + (x-anchor[0])*scale, anchor[1] + (z-anchor[1])*scale],height));
  };
  const arc = (r, start, end) => [(start+end)/2,end].map(angle =>
    'A' + n(r*scale) + ' ' + n(r*scale*dish.tilt) + ' 0 0 ' + (end>start?1:0) + ' ' + point(r,angle)).join('');
  return 'M' + point(outer,a+da) + arc(outer,a+da,b-da) +
    'Q' + point(outer,b) + ' ' + point(outer-corner,b) + 'L' + point(inner+corner,b) +
    'Q' + point(inner,b) + ' ' + point(inner,b-db) + arc(inner,b-db,a+db) +
    'Q' + point(inner,a) + ' ' + point(inner+corner,a) + 'L' + point(outer-corner,a) +
    'Q' + point(outer,a) + ' ' + point(outer,a+da) + 'Z';
}
function fieldsDish(entries) {
  const view='fields', radius=143, inside=131;
  const left=dish.x-radius,right=dish.x+radius, y=dish.y, ry=radius*dish.tilt;
  const heel=radius-4.5;
  // The turned drum rolls into its bottom edge. The continuous top surface has
  // recessed wells, with the interstitial glass itself forming their dividers.
  const apron = `M${left} ${y-5}Q${left-1} ${y+9} ${dish.x-heel} ${y+15}A${heel} ${n(heel*dish.tilt)} 0 0 0 ${dish.x+heel} ${y+15}
    Q${right+1} ${y+9} ${right} ${y-5}A${radius} ${n(ry)} 0 0 1 ${left} ${y-5}Z`;
  const peak=Math.max(1,...entries.map(e=>e.count)), step=tau/Math.max(1,entries.length);
  const wells=entries.map(({color,count},i)=>{
    const start=-Math.PI*.87+i*step, gap=Math.min(.014,step*.05);
    const a=start+gap, b=start+step-gap, inner=12.5;
    const mould=sectorPath(inner,inside,a,b,5);
    const floor=sectorPath(inner+1.7,inside-2.1,a,b,2.7);
    const share=Math.sqrt(count/peak), id=pigment(view,i);
    const liquid=count ? path(sectorPath(inner+.8,inside-1.7,a,b,4,share),'da-submerged',id+'-wall')+
      path(sectorPath(inner+.8,inside-1.7,a,b,6.6,share),'da-liquid-surface',id+'-top') : '';
    const recess=`<defs><clipPath id="${id}-opening"><path d="${mould}"/></clipPath></defs>` +
      path(mould,'da-port') + `<g clip-path="url(#${id}-opening)">${path(floor,'da-reagent-floor','da-fields-casting')}${liquid}</g>`;
    return item(i,color,sectorPath(inner-1,inside+2,start,start+step,5),recess+path(mould,'da-inspect',id+'-top'));
  }).join('');
  const shoulder=`M${dish.x-radius+1} ${y-5.5}A${radius-1} ${n(ry-1)} 0 0 0 ${dish.x+radius-1} ${y-5.5}
    Q${right} ${y-5.5} ${right} ${y-4}A${radius} ${n(ry)} 0 0 1 ${left} ${y-4}Q${left} ${y-5.5} ${dish.x-radius+1} ${y-5.5}Z`;
  return shadow(view,185,162,155,60)+shadow(view,180,168,139,46)+
    path(apron,'da-drum','da-fields-casting')+path(apron,'da-drum-turn','da-fields-shoulder')+
    ellipse(radius,ry,y-5,'da-dish-face','da-fields-casting')+path(shoulder,'da-rolled-lip','da-fields-shoulder')+
    ellipse(11,11*dish.tilt,y-4,'da-dish-hub','da-fields-hollow')+wells;
}

function typePlate(entries) {
  const view='types', columns=Math.max(1,Math.min(entries.length,Math.ceil(Math.sqrt(1.55*entries.length))));
  const rows=Math.max(1,Math.ceil(entries.length/columns)), pitch=.73, yaw=.25;
  const dx=Math.cos(yaw),dz=Math.sin(yaw), pitchX=50,pitchZ=76,height=30;
  const width=(columns-1)*pitchX+54, depth=(rows-1)*pitchZ+53;
  const scale=Math.min(327/(width*dx+depth*dz),210/((width*dz+depth*dx)*Math.sin(pitch)+height*Math.cos(pitch)),1.85);
  function project(x,z,y) {
    return [178+scale*(x*dx-z*dz),141+scale*((x*dz+z*dx)*Math.sin(pitch)-y*Math.cos(pitch))];
  }
  const tray=(inset,y) => section(roundedRectangle(width-2*inset,depth-2*inset,14-inset*.45).map(([x,z])=>project(x,z,y)));
  const base=tray(2.8,-6), belt=tray(0,-3.4), deck=tray(.8,0);
  const peak=Math.max(1,...entries.map(e=>e.count));
  const wells=entries.map(({color,count}, i)=>{
    const x=(i%columns-(columns-1)/2)*pitchX, z=(Math.floor(i/columns)-(rows-1)/2)*pitchZ;
    const square=(w,y) => section(roundedRectangle(w,w,w*.195).map(([u,v])=>project(x+u,z+v,y)));
    const foot=square(32,1),shoulder=square(35,3.5),neck=square(40,27.7), lip=square(38.8,height);
    const bore=square(33.3,height-.3), floor=square(28,4.8), share=count/peak, id=pigment(view,i);
    const surface=square(28+share*4.8,4.8+share*(height-7.2));
    const hit=body(foot,lip), [sx,sy]=project(x+2,z+2,.4);
    const chamber=path(hit,'da-well-shell','da-types-casting') + path(loop(bore.all),'da-inner','da-types-hollow') +
      (count ? contents(floor,surface,id,.24+.76*Math.sqrt(share)) : '') +
      frostedWall(foot,shoulder,neck,lip,id,.22) + path(rim(lip,bore),'da-mouth','da-types-casting') +
      path(loop(lip.all),'da-inspect',id+'-top');
    return shadow(view,sx,sy+2,22*scale,11*scale)+item(i,color,hit,chamber);
  }).join('');
  return shadow(view,187,172,161,66)+shadow(view,181,173,143,55)+
    path(front(base,belt),'da-plinth','da-types-casting')+path(front(belt,deck),'da-tray-roll','da-types-shoulder')+
    path(loop(deck.all),'da-tray','da-types-casting')+wells;
}

const heights=[0,.52,1.05,1.8];
function levelPyramid(entries) {
  const view='levels', total=entries.reduce((sum,e)=>sum+e.count,0);
  const yaw=.64, pitch=.34, unit=89;
  const widthAt=y=>Math.max(0,1-y/heights[3]);
  const tiers=entries.map(({color,count},i)=>{
    const low=heights[i], high=heights[i+1], cap=i===2;
    function square(y, inset=0) {
      const half=Math.max(.002,widthAt(y)-inset);
      return section(roundedRectangle(2*half,2*half,half*.185).map(([x,z])=>[
        178+unit*(x*Math.cos(yaw)-z*Math.sin(yaw)),
        204+unit*(x*Math.sin(yaw)+z*Math.cos(yaw))*Math.sin(pitch)-72*y-27*i,
      ]));
    }
    const foot=square(low,.041), shoulder=square(low+.032,.004);
    const neck=square(high-(cap?.052:.033)), lip=square(high-(cap?.029:.005),cap?.009:.012);
    const bore=square(high-.008,.055), id=pigment(view,i), share=total ? count/total : 0;
    let liquid='';
    if(count) {
      // Homothetic rounded-square sections preserve the cubic frustum law.
      const y0=low+.034, y1=high-.045, inset=.031;
      const bottom=widthAt(y0)-inset, top=Math.max(0,widthAt(y1)-inset);
      const filled=Math.cbrt(bottom**3+(top**3-bottom**3)*share);
      liquid=contents(square(y0,inset),square(heights[3]*(1-filled-inset),inset),id,.67+.32*share);
    }
    const hit=body(foot,lip);
    const chamberBody=body(square(low+.035,.065),square(high-.115,.025));
    const glass=path(hit+(cap?chamberBody:''),'da-tier-shell',id+'-top') +
      (cap ? path(chamberBody,'da-cap-cavity','da-levels-air') : path(loop(bore.all),'da-tier-hollow','da-levels-hollow')) + liquid +
      frostedWall(foot,shoulder,neck,lip,id,cap?.39:.33) +
      (cap?path(loop(lip.all),'da-mouth',id+'-top'):path(rim(lip,bore),'da-mouth',id+'-top')) +
      path(hit,'da-inspect',id+'-top');
    return item(i,color,hit,glass);
  }).join('');
  return shadow(view,190,207,140,36)+shadow(view,181,216,110,21)+tiers;
}

export function distributionArt(view,entries) {
  const draw={fields:fieldsDish,types:typePlate,levels:levelPyramid}[view];
  return `<svg class="distribution-art da-${view}" viewBox="0 0 360 260" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
    ${glassPaint(view,entries)}<g filter="url(#da-${view}-satin)">${draw(entries)}</g></svg>`;
}
