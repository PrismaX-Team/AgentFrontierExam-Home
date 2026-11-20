(() => {
  'use strict';
  const root = document.getElementById('taskonomy');
  if (!root) return;

  const tau = 2 * Math.PI;
  const mix = (a, b, t) => a + (b - a) * t;
  const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
  const dot = (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
  const minus = (a, b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
  const addScaled = (a, b, t) => [a[0]+b[0]*t, a[1]+b[1]*t, a[2]+b[2]*t];
  function normalize(vector) {
    const length=Math.hypot(...vector)||1;
    return vector.map(v=>v/length);
  }
  const mixColor = (a, b, t) => a.map((value,i) => mix(value,b[i],t));
  const rgba = (color, opacity) => 'rgba(' + color.map(v => Math.round(clamp(v,0,255))).join(',') + ',' + opacity + ')';
  const white = [248,247,235], dark = [33,53,53];
  const light = normalize([-.95,.98,.40]);
  const heights = [0,.52,1.05,1.80];
  const tierOf = index => index < 7 ? 1 : index < 11 ? 2 : 3;
  const tints = [
    [119,162,150], [93,157,148], [77,141,130], [98,154,149], [69,136,133], [111,161,149], [91,151,142],
    [99,125,149], [83,111,140], [99,132,151], [119,143,159], [188,163,121]
  ];
  const turn = ([x,z], angle) => [x*Math.cos(angle)-z*Math.sin(angle), x*Math.sin(angle)+z*Math.cos(angle)];
  function arc(start, end, steps) {
    return Array.from({length:steps+1}, (_,i) => {
      const a=mix(start,end,i/steps);
      return [.55*Math.cos(a),.55*Math.sin(a)];
    });
  }
  const outlines=[];
  for(let i=0; i<3; i++) {
    const start=-Math.PI/2+i*tau/3;
    outlines.push([[0,0],...arc(start,start+tau/3,24)]);
  }
  const outerCorner=[[.55,0],[1,0],[1,1],[0,1],...arc(Math.PI/2,0,18).slice(0,-1)];
  for(let i=0; i<4; i++) outlines.push(outerCorner.map(p=>turn(p,i*Math.PI/2)));
  const squareQuarter=[[0,0],[1,0],[1,1],[0,1]];
  for(let i=0; i<4; i++) outlines.push(squareQuarter.map(p=>turn(p,i*Math.PI/2)));
  outlines.push([[-1,-1],[1,-1],[1,1],[-1,1]]);

  function polygonCenter(points) {
    let area=0, x=0, z=0;
    points.forEach(([u,v],i)=>{
      const [s,t]=points[(i+1)%points.length], cross=u*t-s*v;
      area+=cross; x+=(u+s)*cross; z+=(v+t)*cross;
    });
    return [x/(3*area),z/(3*area)];
  }
  const shapes=outlines.map(points=>{
    // Intersect adjacent inset edge lines so the rounded rim stays even.
    const inward=points.map(([u,v],i)=>{
      const prev=points[(i+points.length-1)%points.length], next=points[(i+1)%points.length];
      const a=Math.hypot(u-prev[0],v-prev[1]), b=Math.hypot(next[0]-u,next[1]-v);
      const ax=(prev[1]-v)/a, az=(u-prev[0])/a, bx=(v-next[1])/b, bz=(next[0]-u)/b;
      const divisor=1+ax*bx+az*bz;
      return [(ax+bx)/divisor,(az+bz)/divisor];
    });
    return {points,center:polygonCenter(points),inward};
  });

  function polygonNormal(points) {
    const n=[0,0,0];
    points.forEach((p,i)=>{
      const q=points[(i+1)%points.length];
      n[0]+=(q[1]-p[1])*(q[2]+p[2]);
      n[1]+=(q[2]-p[2])*(q[0]+p[0]);
      n[2]+=(q[0]-p[0])*(q[1]+p[1]);
    });
    return normalize(n);
  }
  function camera(width, height, angle, cut, lift) {
    const pitch=mix(.48,Math.PI/2,cut), sinP=Math.sin(pitch), cosP=Math.cos(pitch);
    const yaw=((angle%tau+3*Math.PI)%tau-Math.PI)*(1-cut);
    const cosA=Math.cos(yaw), sinA=Math.sin(yaw);
    const assembled=Math.min(width/3.12,height/2.56)*(1-.027*lift);
    let scale=mix(assembled,Math.min(width/2.74,height/2.45),cut);
    const x=width*mix(.49+.008*lift,.5,cut), y=height*mix(.723+.007*lift,.515,cut);
    if(cut>0) {
      // A square seen corner-on briefly occupies more space on the way to plan.
      const margin=Math.min(width,height)*.033*Math.min(1,cut*8);
      const extent=(Math.abs(cosA)+Math.abs(sinA))*(1.01+.055*cut);
      const back=extent*sinP+mix(1.07,.26,cut)*cosP;
      scale=Math.min(scale,(Math.min(x,width-x)-margin)/extent,(height-y-margin)/(extent*sinP),(y-margin)/back);
    }
    return {
      scale, x, y, eye:[0,sinP,cosP],
      rotate:(u,v,z)=>[u*cosA-z*sinA,v,u*sinA+z*cosA],
      project:p=>({x:x+scale*p[0],y:y+scale*(p[2]*sinP-p[1]*cosP),depth:p[1]*sinP+p[2]*cosP})
    };
  }
  function mesh(index, cam, state) {
    const level=tierOf(index), shape=shapes[index], isSection=level===state.section;
    const cut=state.cut, alpha=isSection ? 1 : clamp(1-cut*1.8);
    if(alpha<.015) return null;
    const [cx,cz]=shape.center, radius=Math.hypot(cx,cz)||1;
    const pop=state.pops[index], radialGap=.009+pop*mix(.11,.068,cut);
    const bottom=heights[level-1], top=heights[level], cap=level===3;
    function ring(rise, bevel=0) {
      const y=mix(bottom,top,rise);
      const half=mix(1-y/heights[3],1,isSection?cut:0);
      const offset=(level-1)*.033+(level>1?state.lift*.195:0)+pop*.055;
      const worldY=mix(y+offset, .22*rise+pop*.045,cut)+.022;
      return shape.points.map(([u,v],i)=>{
        const shrink=(cap?1:.987)*(1+pop*.046);
        const x=(cx+(u-cx)*shrink)*half+shape.inward[i][0]*bevel+cx/radius*radialGap;
        const z=(cz+(v-cz)*shrink)*half+shape.inward[i][1]*bevel+cz/radius*radialGap;
        return cam.rotate(x,worldY,z);
      });
    }
    const rimWidth=cap ? .010 : .013, rise=.018/(top-bottom);
    const foot=ring(0,rimWidth), shoulder=ring(rise), neck=cap?ring(1):ring(1-rise), lid=cap?neck:ring(1,rimWidth);
    const faces=[];
    function face(points, kind, large=true, exterior=false) {
      const normal=polygonNormal(points);
      const screen=points.map(cam.project);
      const mid=points.reduce((acc,p)=>addScaled(acc,p,1/points.length),[0,0,0]);
      faces.push({points,kind,large,exterior,normal,mid,screen,facing:dot(normal,cam.eye),depth:dot(mid,cam.eye)});
    }
    face([...foot].reverse(),'bottom');
    if(!cap) face(lid,'top');
    shape.points.forEach(([u,v],i)=>{
      const j=(i+1)%shape.points.length;
      const large=Math.hypot(shape.points[j][0]-u,shape.points[j][1]-v)>.2;
      const exterior=level===1&&index>=3&&(i===1||i===2);
      face([foot[i],foot[j],shoulder[j],shoulder[i]],'bevel',large,exterior);
      face(cap?[shoulder[i],shoulder[j],neck[i]]:[shoulder[i],shoulder[j],neck[j],neck[i]],'wall',large,exterior);
      if(!cap) face([neck[i],neck[j],lid[j],lid[i]],'bevel',large,exterior);
    });
    const half=mix(1-(bottom+top)/2/heights[3],1,isSection?cut:0);
    const anchor=cam.project(cam.rotate(cx*half,mix((bottom+top)*.5,.12,cut),cz*half));
    const offset=(level-1)*.033+(level>1?state.lift*.195:0)+pop*.055;
    const centerY=mix((bottom+top)*.5+offset,.11+pop*.045,cut)+.022;
    const center3=cam.rotate(cx*half+cx/radius*radialGap,centerY,cz*half+cz/radius*radialGap);
    return {index,level,alpha,pop,faces,foot,center3,anchor};
  }

  function drawPath(ctx, points) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i=1; i<points.length; i++) ctx.lineTo(points[i].x,points[i].y);
    ctx.closePath();
  }

  // Map a repeatable grain onto each glass face so the frost moves with it.
  function makeFrostGrain() {
    const size=128;
    let seed=179109;
    function random() {
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;
      return seed/4294967296;
    }
    const tile=document.createElement('canvas');
    tile.width=tile.height=size;
    const brush=tile.getContext('2d');
    const pixels=brush.createImageData(size,size);
    const cells=16, field=Array.from({length:cells*cells},()=>random()-.5);
    const cell=(x,y)=>field[(y%cells)*cells+(x%cells)];
    for(let y=0;y<size;y++) {
      for(let x=0;x<size;x++) {
        const u=x*cells/size,v=y*cells/size,i=Math.floor(u),j=Math.floor(v);
        const mottle=mix(mix(cell(i,j),cell(i+1,j),u-i),mix(cell(i,j+1),cell(i+1,j+1),u-i),v-j);
        const grain=(random()+random()+random()+random()-2)*3.9+mottle*4;
        const p=(y*size+x)*4;
        pixels.data[p]=pixels.data[p+1]=pixels.data[p+2]=grain<0?25:255;
        pixels.data[p+3]=Math.min(13,Math.abs(grain)*1.58);
      }
    }
    brush.putImageData(pixels,0,0);
    return tile;
  }
  function frostOnFace(ctx,face,cam,pattern) {
    const origin=face.points[0],u=normalize(minus(face.points[1],origin)),n=face.normal;
    const v=[n[1]*u[2]-n[2]*u[1],n[2]*u[0]-n[0]*u[2],n[0]*u[1]-n[1]*u[0]];
    const p=face.screen[0],right=cam.project(addScaled(origin,u,1/210)),down=cam.project(addScaled(origin,v,1/210));
    pattern.setTransform(new DOMMatrix([right.x-p.x,right.y-p.y,down.x-p.x,down.y-p.y,p.x,p.y]));
    ctx.fillStyle=pattern;drawPath(ctx,face.screen);ctx.fill();
  }
  function softenRim(ctx,points,scale) {
    let area=0;
    points.forEach((a,i)=>{const b=points[(i+1)%points.length];area+=a.x*b.y-b.x*a.y;});
    const winding=Math.sign(area);
    for(let i=0;i<points.length;i++) {
      const a=points[i],b=points[(i+1)%points.length],dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);
      if(length<scale*.15) continue;
      const nx=-dy*winding/length,ny=dx*winding/length;
      const breadth=Math.min(scale*.072,length*.19),x=nx*breadth,y=ny*breadth;
      const daylight=nx*.48+ny*.8;
      const tone=daylight>0?white:dark,amount=daylight>0?.13:.108;
      const fade=ctx.createLinearGradient(a.x,a.y,a.x+x,a.y+y);
      fade.addColorStop(0,rgba(tone,amount));fade.addColorStop(.42,rgba(tone,amount*.49));fade.addColorStop(1,rgba(tone,0));
      ctx.fillStyle=fade;
      drawPath(ctx,[a,b,{x:b.x+x,y:b.y+y},{x:a.x+x,y:a.y+y}]);ctx.fill();
    }
  }
  function frostFace(ctx,face,piece,cam,pattern) {
    const n=face.normal,lightness=clamp(.32+.68*(dot(n,light)+.33)/1.33);
    const tint=tints[piece.index],s=cam.scale,rim=face.kind==='bevel';
    const shade=mixColor(tint,[46,63,65],.29),milk=mixColor(tint,[241,240,228],.74);
    let body=mixColor(shade,milk,lightness);
    if(rim) body=mixColor(body,milk,.14);
    const colors=ctx.createLinearGradient(cam.x-s*.73,cam.y-s*1.59,cam.x+s*.64,cam.y+s*.55);
    colors.addColorStop(0,rgba(mixColor(body,white,.20),1));
    colors.addColorStop(.48,rgba(body,1));
    colors.addColorStop(1,rgba(mixColor(body,dark,.155),1));
    ctx.save();
    ctx.globalAlpha=piece.alpha*(rim?.94:.928);
    drawPath(ctx,face.screen);ctx.fillStyle=colors;ctx.fill();
    if(!rim && face.large && face.facing>.035) {
      ctx.clip();
      ctx.globalAlpha=piece.alpha;
      softenRim(ctx,face.screen,s);
      frostOnFace(ctx,face,cam,pattern);
    }
    ctx.restore();
  }
  function softEllipse(ctx,x,y,rx,ry,angle,stops) {
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(rx,ry);
    const gradient=ctx.createRadialGradient(0,0,0,0,0,1);
    stops.forEach(([at,color])=>gradient.addColorStop(at,color));
    ctx.fillStyle=gradient;ctx.fillRect(-1,-1,2,2);ctx.restore();
  }
  function convexHull(points) {
    const sorted=points.slice().sort((a,b)=>a.x-b.x||a.y-b.y);
    function side(list) {
      const result=[];
      for(const c of list) {
        while(result.length>1) {
          const a=result[result.length-2],b=result[result.length-1];
          if((b.x-a.x)*(c.y-a.y)>(b.y-a.y)*(c.x-a.x)) break;
          result.pop();
        }
        result.push(c);
      }
      result.pop();return result;
    }
    return [...side(sorted),...side(sorted.reverse())];
  }
  function ground(ctx,cam,pieces,cut) {
    const s=cam.scale,opacity=1-cut;
    if(opacity<.015) return;
    const origin=cam.project([0,0,0]);
    const cast=p=>cam.project([p[0]+p[1]*.76,0,p[2]+p[1]*.38]);
    const edge=pieces.flatMap(piece=>piece.foot.map(cast));
    const crown=pieces.find(piece=>piece.level===3);
    if(crown) edge.push(cast(crown.faces.find(face=>face.kind==='wall').points[2]));
    ctx.save();ctx.filter='blur('+Math.max(5,s*.093)+'px)';
    const shade=ctx.createLinearGradient(origin.x,origin.y,origin.x+s*1.72,origin.y+s*.38);
    shade.addColorStop(0,rgba([51,68,61],.19*opacity));
    shade.addColorStop(.54,rgba([92,103,93],.16*opacity));
    shade.addColorStop(1,rgba([110,114,99],.025*opacity));
    drawPath(ctx,convexHull(edge));ctx.fillStyle=shade;ctx.fill();ctx.restore();
    softEllipse(ctx,origin.x+s*.10,origin.y+s*.025,s*1.42,s*.52,-.07,[
      [0,rgba([44,61,53],.21*opacity)],[.64,rgba([86,99,85],.105*opacity)],[1,rgba([104,112,98],0)]
    ]);
    ctx.save();ctx.filter='blur('+Math.max(1,s*.035)+'px)';
    for(const piece of pieces.filter(p=>p.level===1)) {
      const contact=piece.foot.map(p=>cam.project([p[0]+.02,0,p[2]+.016]));
      drawPath(ctx,contact);ctx.fillStyle=rgba([48,67,56],.21*opacity);ctx.fill();
    }
    ctx.restore();
    // Feather the cast shadow into the paper even on a narrow mobile plate.
    ctx.save();ctx.globalCompositeOperation='destination-in';
    const w=ctx.canvas.clientWidth,h=ctx.canvas.clientHeight,fade=ctx.createLinearGradient(w*.88,0,w,0);
    fade.addColorStop(0,'#000');fade.addColorStop(1,'transparent');ctx.fillStyle=fade;ctx.fillRect(0,0,w,h);ctx.restore();
  }
  function cutSurface(ctx,piece,cam,alpha,pattern) {
    const face=piece.faces.find(f=>f.kind==='top');
    if(!face) return;
    const points=face.screen,s=cam.scale,tint=mixColor(tints[piece.index],dark,piece.pop*.24);
    ctx.save();ctx.globalAlpha=alpha;
    const gradient=ctx.createLinearGradient(cam.x-s,cam.y-s*.92,cam.x+s*.72,cam.y+s);
    gradient.addColorStop(0,rgba(mixColor(tint,white,.66-piece.pop*.12),1));
    gradient.addColorStop(.45,rgba(mixColor(tint,white,.46-piece.pop*.13),1));
    gradient.addColorStop(1,rgba(mixColor(tint,white,.20),1));
    drawPath(ctx,points);ctx.shadowColor=rgba([38,62,53],.15+piece.pop*.16);
    ctx.shadowBlur=s*(.027+piece.pop*.035);ctx.shadowOffsetY=s*(.016+piece.pop*.019);
    ctx.fillStyle=gradient;ctx.fill();ctx.shadowColor='transparent';
    ctx.clip();softenRim(ctx,points,s);frostOnFace(ctx,face,cam,pattern);
    ctx.restore();
  }
  function contains(points,x,y) {
    let inside=false;
    for(let i=0,j=points.length-1;i<points.length;j=i++) {
      const a=points[i],b=points[j];
      if((a.y>y)!==(b.y>y) && x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x) inside=!inside;
    }
    return inside;
  }

  const ui = selector => root.querySelector(selector);
  const canvas = ui('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { types, pieces: content } = JSON.parse(ui('[data-pyramid-content]').textContent);
  const frost = ctx.createPattern(makeFrostGrain(), 'repeat');

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const levels = ['', 'Scientific workflows', 'Scientific breakthroughs', 'Major scientific breakthroughs'];
  const labels = [...root.querySelectorAll('[data-level]')];
  const note = ui('.object-note'), keys = ui('.facet-keys'), motion = ui('.motion');
  let yaw = -.59, view = 0, section = 1, cut = 0, lift = 0, hovered = -1, selected = -1, pointedLevel = 0;
  let paused = reduced.matches, visible = true, width = 0, height = 0, frame = 0, lastTime = 0, hits = [];
  const pops = shapes.map(() => 0);

  const buttons = content.map((piece, index) => {
    const button = document.createElement('button');
    const type = types[piece.type];
    button.type = 'button';
    const part = tierOf(index) === 2 ? ', piece ' + (index - 6) + ' of 4' : '';
    button.setAttribute('aria-label', type.name + part + (piece.task ? ' · ' + piece.task.title : ''));
    button.addEventListener('click', () => choose(index));
    button.addEventListener('focus', () => {
      if (button.matches(':focus-visible')) previewPiece(index, buttonPosition(button));
    });
    button.addEventListener('blur', clearPreview);
    button.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch') previewPiece(index, buttonPosition(button));
    });
    button.addEventListener('pointerleave', clearPreview);
    keys.append(button);
    return button;
  });

  function setCopy(animate = false) {
    const intro = ui('.intro'), detail = ui('.detail');
    const active = selected >= 0;
    intro.hidden = active;
    detail.hidden = !active;
    if (active) {
      const level = tierOf(selected);
      const { type, task, browse } = content[selected];
      const category = types[type];
      ui('.level-name').textContent = 'L' + level + ' / ' + (level === 1 ? levels[1] : 'AFE-research');
      ui('h2').textContent = category.name;
      ui('.definition').textContent = category.description;

      ui('.task').hidden = !task;
      if (task) {
        ui('.task small').textContent = (task.related ? 'Related workflow task' : 'Example task') + ' · ' + task.domain;
        const link = ui('.task h3 a');
        link.textContent = task.title;
        link.href = task.href;
        ui('.task p').textContent = task.summary;
      }
      const evidence = ui('.evidence');
      evidence.hidden = !!task || !category.evidence;
      evidence.textContent = category.evidence ?? '';
      ui('.browse').textContent = browse.label;
      ui('.browse').href = browse.href;
      ui('.contribute').hidden = level === 1 || !!task;
      ui('.live').textContent = category.name + '. ' + (task ? task.title : category.description);
    } else if (animate) {
      ui('.live').textContent = 'Agent Frontier Exam overview';
    }

    if (animate && !reduced.matches) {
      const target = active ? detail : intro;
      target.getAnimations().forEach(animation => animation.cancel());
      target.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }],
        { duration: 220, easing: 'ease-out' });
    }
    ui('.layer-labels').hidden = !!view;
    ui('.whole').hidden = !view;
    motion.hidden = active || !!view;
    motion.setAttribute('aria-pressed', String(paused));
    motion.setAttribute('aria-label', paused ? 'Resume rotation' : 'Pause rotation');
    keys.hidden = !view;
    buttons.forEach((button, index) => {
      button.hidden = tierOf(index) !== view;
      button.setAttribute('aria-pressed', String(index === selected));
    });
  }

  function choose(index) {
    clearPreview();
    selected = index;
    setCopy(true);
    const back = ui('.back');
    back.focus({ preventScroll: true });
    if (root.clientWidth <= 660 && back.getBoundingClientRect().top < 0) {
      back.scrollIntoView({ block: 'start', behavior: reduced.matches ? 'instant' : 'smooth' });
    }
    wake();
  }
  function openSection(level, keyboard) {
    clearPreview();
    if (level === 3) {
      choose(11);
      return;
    }
    if (section !== level) cut = 0;
    view = section = level;
    selected = -1;
    setCopy();
    draw();
    wake();
    const next = keyboard ? buttons.find((_, index) => tierOf(index) === level) : ui('.whole');
    next.focus({ preventScroll: true });
  }
  function reset() {
    const former = view || (selected >= 0 ? tierOf(selected) : 0);
    const hadCard = selected >= 0;
    clearPreview();
    selected = -1;
    view = 0;
    setCopy(hadCard);
    wake();
    const label = labels.find(button => Number(button.dataset.level) === former);
    label?.focus({ preventScroll: true });
  }
  function buttonPosition(button) {
    const a=button.getBoundingClientRect(),b=canvas.getBoundingClientRect();
    return {x:a.left-b.left+a.width/2,y:a.top-b.top+a.height/2};
  }
  function displayNote(name,description,point) {
    if(note.firstElementChild.textContent!==name || note.hidden) {
      note.firstElementChild.textContent=name;note.lastElementChild.textContent=description;
    }
    note.hidden=false;
    const nw=note.offsetWidth,nh=note.offsetHeight;
    const x=point.x+nw+18<width?point.x+14:point.x-nw-14;
    note.style.left=clamp(x,5,width-nw-5)+'px';
    note.style.top=clamp(point.y-nh-10,6,height-nh-6)+'px';
  }
  function previewPiece(index,point) {
    hovered=index;pointedLevel=0;
    if(index<0) {clearPreview();return;}
    const category=types[content[index].type];
    displayNote('L'+tierOf(index)+' · '+category.name,category.description,point);
    wake();
  }
  function previewLevel(level,button) {
    hovered=-1;pointedLevel=level;
    const action=level===3?'Explore this scientific goal.':'Explore this cross-section.';
    displayNote('L'+level+' · '+levels[level],action,buttonPosition(button));
    wake();
  }
  function clearPreview() {
    hovered=-1;pointedLevel=0;note.hidden=true;wake();
  }
  function positionButton(button,x,y) {
    button.style.left=x.toFixed(1)+'px';button.style.top=y.toFixed(1)+'px';
  }
  function draw() {
    if(!width||!height) return;
    const cam=camera(width,height,yaw,cut,lift), state={cut,section,lift,pops};
    const pieces=shapes.map((shape,index)=>mesh(index,cam,state)).filter(Boolean);
    pieces.sort((a,b)=>a.level-b.level||dot(a.center3,cam.eye)-dot(b.center3,cam.eye));
    hits=[];
    if(ctx) {
      ctx.clearRect(0,0,width,height);
      ground(ctx,cam,pieces,cut);
      const cutaway=clamp((cut-.82)/.18);
      // The exterior walls wrap the three central sectors. A nearer sector's
      // centroid can still sit behind a wall where their projections overlap.
      const facing=pieces.flatMap(piece=>piece.faces.filter(face=>face.facing>.003)
        .sort((a,b)=>a.depth-b.depth).map(face=>({piece,face})));
      facing.sort((a,b)=>a.piece.level-b.piece.level||Number(a.face.exterior)-Number(b.face.exterior));
      for(const {piece,face} of facing) {
        if(cutaway<1) frostFace(ctx,face,piece,cam,frost);
        if(piece.alpha>.6) hits.push({index:piece.index,points:face.screen});
      }
      if(cutaway>0) pieces.filter(piece=>piece.level===section).forEach(piece=>cutSurface(ctx,piece,cam,cutaway,frost));
    }
    if(view) {
      pieces.filter(piece=>piece.level===view).forEach(piece=>positionButton(buttons[piece.index],piece.anchor.x,piece.anchor.y));
    } else {
      let previousY=-100;
      labels.forEach(button=>{
        const level=Number(button.dataset.level),y=[0,.24,.81,1.43][level];
        const range=1-y/heights[3];
        const corners=[[-1,-1],[1,-1],[1,1],[-1,1]];
        const x=Math.max(...corners.map(([u,v])=>cam.project(cam.rotate(u*range,y,v*range)).x));
        const labelHeight=y+(level-1)*.033+(level>1?lift*.195:0);
        const labelY=Math.max(cam.project([0,labelHeight,0]).y,previousY+44);
        positionButton(button,Math.min(width-24,x+24),labelY);
        previousY=labelY;
      });
    }
  }
  function resize() {
    const box=canvas.getBoundingClientRect();
    width=box.width;height=box.height;
    const dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.max(1,Math.round(width*dpr));canvas.height=Math.max(1,Math.round(height*dpr));
    if(ctx) ctx.setTransform(canvas.width/(width||1),0,0,canvas.height/(height||1),0,0);
    draw();wake();
  }
  function step(time) {
    frame=0;
    if(!visible||document.hidden) {lastTime=0;return;}
    const dt=lastTime?Math.min((time-lastTime)/1000,.1):0;
    lastTime=time;
    const speed=reduced.matches?1:1-Math.exp(-dt*12);
    const active=hovered>=0?hovered:selected;
    const spin=!view && selected<0 && hovered<0 && !pointedLevel && !paused;
    if(spin) yaw=(yaw+dt*tau/46)%tau;
    let moving=false;
    function approach(value,target) {
      if(Math.abs(value-target)<.0015) return target;
      moving=true;return mix(value,target,speed);
    }
    cut=approach(cut,view?1:0);
    lift=approach(lift,!view&&(pointedLevel===1||(active>=0&&tierOf(active)===1))?1:0);
    pops.forEach((value,i)=>{pops[i]=approach(value,i===active?1:0);});
    draw();
    if(spin||moving) wake(); else lastTime=0;
  }
  function wake() {
    if(!frame && visible && !document.hidden) frame=requestAnimationFrame(step);
  }
  function eventPoint(event) {
    const box=canvas.getBoundingClientRect();
    return {x:event.clientX-box.left,y:event.clientY-box.top};
  }
  function pick(point) {
    for(let i=hits.length-1;i>=0;i--) {
      if(contains(hits[i].points,point.x,point.y)) return hits[i].index;
    }
    return -1;
  }

  canvas.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    const point = eventPoint(event), index = pick(point);
    canvas.style.cursor = index >= 0 ? 'pointer' : 'default';
    previewPiece(index, point);
  });
  canvas.addEventListener('pointerleave', clearPreview);
  canvas.addEventListener('click', event => {
    const index = event.pointerType !== 'touch' && hovered >= 0 ? hovered : pick(eventPoint(event));
    if (index >= 0) choose(index);
  });
  labels.forEach(button => {
    const level = Number(button.dataset.level);
    button.addEventListener('click', event => openSection(level, event.detail === 0));
    button.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch') previewLevel(level, button);
    });
    button.addEventListener('pointerleave', clearPreview);
    button.addEventListener('focus', () => {
      if (button.matches(':focus-visible')) previewLevel(level, button);
    });
    button.addEventListener('blur', clearPreview);
  });
  ui('.back').addEventListener('click', reset);
  ui('.whole').addEventListener('click', reset);
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && (selected >= 0 || view)) reset();
  });
  motion.addEventListener('click', () => {
    paused = !paused;
    setCopy();
    wake();
  });
  reduced.addEventListener('change', () => {
    paused = reduced.matches;
    setCopy();
    wake();
  });
  document.addEventListener('visibilitychange', () => { lastTime = 0; wake(); });
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) { lastTime = 0; wake(); }
  }).observe(root);
  setCopy();
  ui('.pyramid-alternative').hidden = true;
  ui('.plate').hidden = false;
  resize();
})();
