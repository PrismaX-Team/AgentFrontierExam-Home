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
  const dayMaterial = {
    light:[248,247,235], shade:[33,53,53], ambient:[241,240,228], milk:.74,
    shadow:[51,68,61],
    tints:[
      [119,162,150], [93,157,148], [77,141,130], [98,154,149], [69,136,133], [111,161,149], [91,151,142],
      [99,125,149], [83,111,140], [99,132,151], [119,143,159], [188,163,121],
    ],
  };
  const nightMaterial = {
    light:[218,226,222], shade:[28,38,50], ambient:[192,201,199], milk:.30,
    shadow:[10,15,23],
    tints:[
      [117,159,139], [103,151,130], [78,137,122], [108,150,138], [84,139,125], [128,165,142], [96,147,131],
      [105,140,166], [93,125,153], [111,144,170], [123,155,174], [198,171,119],
    ],
  };
  let paper, material;
  function readPalette() {
    material = document.documentElement.dataset.theme === 'dark' ? nightMaterial : dayMaterial;
    const background = getComputedStyle(root).backgroundColor.match(/[\d.]+/g);
    paper = background?.length >= 3 ? background.slice(0, 3).map(Number) : material.shade;
  }
  readPalette();
  const light = normalize([-.95,.98,.40]);
  const heights = [0,.52,1.05,1.80];
  const tierOf = index => index < 7 ? 1 : index < 11 ? 2 : 3;
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
  function camera(width,height,yaw,openness,focus,level,lift,legendBeside) {
    // The three focus weights sum to one as solids trade places in depth.
    const primary=focus[level];
    const left=level===1?1-focus[1]:level===2?focus[1]:0;
    const right=1-primary-left;
    const pitch=mix(.48,.82*focus[1]+.66*focus[2]+.48*focus[3],openness);
    const sinP=Math.sin(pitch), cosP=Math.cos(pitch), cosA=Math.cos(yaw), sinA=Math.sin(yaw);
    const baseRadius=1-heights[level-1]/heights[3];
    const unit=Math.min(width,1.20*height);
    const framedSize=mix([0,.11,.096,.083][level],[0,.244,.235,.208][level],primary);
    const assembled=Math.min(width/(legendBeside?3.53:3.30),height/2.62)*(1-.027*lift);
    const scale=mix(assembled,unit*framedSize/baseRadius,openness);
    const x=width*mix(legendBeside?.525:.49,primary*.50+left*(legendBeside?.555:.266)+right*(legendBeside?.84:.705),openness);
    const y=height*mix(.72,primary*.585+left*.211+right*.155,openness);
    const pivot=openness*((heights[level-1]+heights[level])*.5+.022);
    return {
      scale, x, y, eye:[0,sinP,cosP],
      rotate:(u,v,z)=>[u*cosA-z*sinA,v,u*sinA+z*cosA],
      project:p=>({x:x+scale*p[0],y:y+scale*(p[2]*sinP-(p[1]-pivot)*cosP)})
    };
  }
  function mesh(index, cam, state) {
    const level=tierOf(index), shape=shapes[index], primary=state.focus[level];
    const openness=state.openness, mist=(1-primary)*openness*(state.hoverLevel===level?.40:.64);
    const [cx,cz]=shape.center, radius=Math.hypot(cx,cz)||1;
    const bottom=heights[level-1], top=heights[level], cap=level===3;
    const baseRadius=1-bottom/heights[3], half=1-(bottom+top)/2/heights[3];
    const pop=state.pops[index];
    const spacing=index<3?.16:level===1?.265:level===2?.12:0;
    const radialGap=.009+primary*openness*baseRadius*spacing;
    const liftInner=index<3?.26*openness*primary:0;
    const offset=((level-1)*.033+(level>1?state.lift*.195:0))*(1-openness)+liftInner;
    const centerY=(bottom+top)*.5+offset+.022;
    const resting=cam.rotate(cx*half+cx/radius*radialGap,centerY,cz*half+cz/radius*radialGap);
    const travel=pop*mix(.25,.18*baseRadius,openness), growth=1+pop*.075;
    const riseOnHover=mix(cap?.235:.155,.13*baseRadius,openness);
    const shift=cam.rotate(cx/radius*travel,pop*riseOnHover,cz/radius*travel);
    const center3=addScaled(resting,shift,1);
    const restScreen=cam.project(resting), centerScreen=cam.project(center3);
    // The matching hit footprint follows the rotation while the glass lifts off it.
    const hitShift={x:centerScreen.x-restScreen.x*growth,y:centerScreen.y-restScreen.y*growth};
    function place(x,y,z) {
      const rotated=cam.rotate(x+cx/radius*radialGap,y+offset+.022,z+cz/radius*radialGap);
      return addScaled(center3,minus(rotated,resting),growth);
    }
    function ring(rise, bevel=0) {
      const y=mix(bottom,top,rise), half=1-y/heights[3];
      return shape.points.map(([u,v],i)=>{
        const shrink=cap?1:.987;
        const x=(cx+(u-cx)*shrink)*half+shape.inward[i][0]*bevel;
        const z=(cz+(v-cz)*shrink)*half+shape.inward[i][1]*bevel;
        return place(x,y,z);
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
    const lidRadius=1-top/heights[3];
    const anchor=cap?centerScreen:cam.project(place(cx*lidRadius,top,cz*lidRadius));
    return {index,level,mist,faces,foot,center3,anchor,growth,hitShift};
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
      const tone=daylight>0?material.light:material.shade,amount=daylight>0?.13:.108;
      const fade=ctx.createLinearGradient(a.x,a.y,a.x+x,a.y+y);
      fade.addColorStop(0,rgba(tone,amount));fade.addColorStop(.42,rgba(tone,amount*.49));fade.addColorStop(1,rgba(tone,0));
      ctx.fillStyle=fade;
      drawPath(ctx,[a,b,{x:b.x+x,y:b.y+y},{x:a.x+x,y:a.y+y}]);ctx.fill();
    }
  }
  function frostFace(ctx,face,piece,cam,pattern) {
    const n=face.normal,lightness=clamp(.32+.68*(dot(n,light)+.33)/1.33);
    const tint=material.tints[piece.index],s=cam.scale,rim=face.kind==='bevel';
    const shade=mixColor(tint,material.shade,.30),milk=mixColor(tint,material.ambient,material.milk);
    let body=mixColor(shade,milk,lightness);
    if(rim) body=mixColor(body,milk,.14);
    const colors=ctx.createLinearGradient(cam.x-s*.73,cam.y-s*1.59,cam.x+s*.64,cam.y+s*.55);
    const pigment=tone=>rgba(mixColor(tone,paper,piece.mist),1);
    colors.addColorStop(0,pigment(mixColor(body,material.light,.20)));
    colors.addColorStop(.48,pigment(body));
    colors.addColorStop(1,pigment(mixColor(body,material.shade,.155)));
    ctx.save();
    ctx.globalAlpha=rim?.95:.964;
    drawPath(ctx,face.screen);ctx.fillStyle=colors;ctx.fill();
    if(!face.large) { ctx.strokeStyle=colors;ctx.lineWidth=.55;ctx.stroke(); }
    if(!rim && face.large && face.facing>.035) {
      ctx.clip();
      ctx.globalAlpha=1-piece.mist;
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
  function ground(ctx,cam,pieces,opacity) {
    const s=cam.scale;
    if(opacity<.015) return;
    const origin=cam.project([0,0,0]);
    const cast=p=>cam.project([p[0]+p[1]*.76,0,p[2]+p[1]*.38]);
    const edge=pieces.flatMap(piece=>piece.foot.map(cast));
    const crown=pieces.find(piece=>piece.level===3);
    if(crown) edge.push(cast(crown.faces.find(face=>face.kind==='wall').points[2]));
    ctx.save();ctx.filter='blur('+Math.max(5,s*.093)+'px)';
    const shade=ctx.createLinearGradient(origin.x,origin.y,origin.x+s*1.72,origin.y+s*.38);
    shade.addColorStop(0,rgba(material.shadow,.20*opacity));
    shade.addColorStop(.54,rgba(material.shadow,.14*opacity));
    shade.addColorStop(1,rgba(material.shadow,.025*opacity));
    drawPath(ctx,convexHull(edge));ctx.fillStyle=shade;ctx.fill();ctx.restore();
    softEllipse(ctx,origin.x+s*.10,origin.y+s*.025,s*1.42,s*.52,-.07,[
      [0,rgba(material.shadow,.21*opacity)],[.64,rgba(material.shadow,.105*opacity)],[1,rgba(material.shadow,0)]
    ]);
    ctx.save();ctx.filter='blur('+Math.max(1,s*.035)+'px)';
    for(const piece of pieces.filter(p=>p.level===1)) {
      const contact=piece.foot.map(p=>cam.project([p[0]+.02,0,p[2]+.016]));
      drawPath(ctx,contact);ctx.fillStyle=rgba(material.shadow,.21*opacity);ctx.fill();
    }
    ctx.restore();
    // Feather the cast shadow into the paper even on a narrow mobile plate.
    ctx.save();ctx.globalCompositeOperation='destination-in';
    const w=ctx.canvas.clientWidth,h=ctx.canvas.clientHeight,fade=ctx.createLinearGradient(w*.88,0,w,0);
    fade.addColorStop(0,'#000');fade.addColorStop(1,'transparent');ctx.fillStyle=fade;ctx.fillRect(0,0,w,h);ctx.restore();
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

  const { types, pieces: content, labels: copy } = JSON.parse(ui('[data-pyramid-content]').textContent);
  const frost = ctx.createPattern(makeFrostGrain(), 'repeat');

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const labels = [...root.querySelectorAll('[data-level]')];
  const legend = ui('.layer-labels');
  const workflowName = ui('[data-level="1"] .level-title').textContent;
  const note = ui('.object-note'), keys = ui('.facet-keys');
  let yaw = -.59, view = 0, focusLevel = 1, openness = 0, lift = 0, hovered = -1, selected = -1, pointedLevel = 0;
  let visible = true, legendBeside = false, width = 0, height = 0, frame = 0, lastTime = 0, hits = [];
  const focus = [0,1,0,0];
  let mousePoint = null;
  const pops = shapes.map(() => 0);

  const buttons = content.map((piece, index) => {
    const button = document.createElement('button');
    const type = types[piece.type];
    button.type = 'button';
    button.dataset.piece = index;
    button.setAttribute('aria-controls','type-detail');
    const part = tierOf(index) === 2 ? ' · ' + copy.piecePosition.replace('{n}', index - 6).replace('{total}', 4) : '';
    button.setAttribute('aria-label', type.name + part + (piece.task ? ' · ' + piece.task.title : ''));
    button.addEventListener('click', event => {
      if(event.detail===0) choose(index,true);
      else activatePoint(event,index);
    });
    button.addEventListener('focus', () => {
      if (button.matches(':focus-visible')) {
        mousePoint=null;
        previewPiece(index,buttonPosition(button));
      }
    });
    button.addEventListener('blur', clearPreview);
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
      ui('.level-name').textContent = 'L' + level + ' / ' + (level === 1 ? workflowName : copy.research);
      ui('h2').textContent = category.name;
      ui('.definition').textContent = category.description;

      ui('.task').hidden = !task;
      if (task) {
        ui('.task small').textContent = (task.related ? copy.related : copy.example) + ' · ' + task.domain;
        ui('.task-card').href = task.href;
        ui('.task h3').textContent = task.title;
        ui('.task p').textContent = task.summary;
        for (const image of ui('.task-art').children) image.hidden = image.dataset.taskArt !== task.id;
      }
      const evidence = ui('.evidence');
      evidence.hidden = !category.evidence;
      evidence.textContent = category.evidence ?? '';
      ui('.browse').textContent = browse.label;
      ui('.browse').href = browse.href;
      ui('.contribute').hidden = level === 1 || task?.related === false;
      ui('.live').textContent = category.name + '. ' + (task ? task.title : category.description);
    } else if (animate) {
      ui('.live').textContent = copy.overview;
    }

    if (animate && !reduced.matches) {
      const target = active ? detail : intro;
      target.getAnimations().forEach(animation => animation.cancel());
      target.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }],
        { duration: 220, easing: 'ease-out' });
    }
    root.dataset.view = view;
    labels.forEach(button => button.setAttribute('aria-pressed',String(Number(button.dataset.level)===view)));
    keys.hidden = !view;
    buttons.forEach((button, index) => {
      button.hidden = tierOf(index) !== view;
      button.setAttribute('aria-pressed', String(index === selected));
    });
  }

  function choose(index, keyboard=false) {
    const level=tierOf(index);
    clearPreview();
    if(keyboard) mousePoint=null;
    if(!view && openness===0) focus.forEach((_,i)=>{focus[i]=Number(i===level);});
    view=focusLevel=level;
    selected = index;
    setCopy(true);
    if(keyboard) buttons[index].focus({preventScroll:true});
    wake();
  }
  function reset(keyboard=false) {
    const former=view;
    clearPreview();
    if(keyboard) mousePoint=null;
    selected = -1;
    view = 0;
    setCopy(true);
    wake();
    const label = labels.find(button => Number(button.dataset.level) === former);
    if(keyboard) label?.focus({ preventScroll: true });
  }
  function buttonPosition(button) {
    const a=button.getBoundingClientRect(),b=canvas.getBoundingClientRect();
    return {x:a.left-b.left+a.width/2,y:a.top-b.top+a.height/2};
  }
  function displayNote(name,description,point) {
    if(note.firstElementChild.textContent!==name || note.lastElementChild.textContent!==description) {
      note.firstElementChild.textContent=name;note.lastElementChild.textContent=description;
    }
    note.hidden=false;
    positionNote(point);
  }
  function positionNote(point) {
    const nw=note.offsetWidth,nh=note.offsetHeight;
    const x=point.x+nw+18<width?point.x+14:point.x-nw-14;
    note.style.left=clamp(x,5,width-nw-5)+'px';
    note.style.top=clamp(point.y-nh-10,6,height-nh-6)+'px';
  }
  function previewPiece(index,point) {
    hovered=index;pointedLevel=0;
    if(index<0) {clearPreview();return;}
    const category=types[content[index].type];
    const level=tierOf(index);
    displayNote('L'+level+' · '+category.name,category.description,point);
    wake();
  }
  function previewLevel(level) {
    hovered=-1;pointedLevel=level;note.hidden=true;
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
    const tiers=[1,2,3];
    const cameras=tiers.map(level=>camera(width,height,yaw,openness,focus,level,lift,legendBeside));
    const hoverLevel=pointedLevel || (hovered>=0?tierOf(hovered):0);
    const state={openness,focus,lift,pops,hoverLevel};
    const pieces=shapes.map((_,index)=>mesh(index,cameras[tierOf(index)-1],state));
    const order=openness>.28?[...tiers].sort((a,b)=>focus[a]-focus[b]):tiers;
    hits=[];
    ctx.clearRect(0,0,width,height);
    ground(ctx,cameras[0],pieces,clamp(1-openness*2.6));
    for(const level of tiers) {
      const opacity=focus[level]*openness;
      if(opacity<=0) continue;
      const cam=cameras[level-1], base=heights[level-1];
      const shadow=cam.project([0,base-.13,0]), size=cam.scale*(1-base/heights[3]);
      softEllipse(ctx,shadow.x+size*.13,shadow.y+size*.23,size*1.32,size*.48,-.08,[
        [0,rgba(material.shadow,opacity*.20)],[.60,rgba(material.shadow,opacity*.09)],[1,rgba(material.shadow,0)]
      ]);
    }
    for(const level of order) {
      const cam=cameras[level-1];
      const layer=pieces.filter(piece=>piece.level===level)
        .sort((a,b)=>dot(a.center3,cam.eye)-dot(b.center3,cam.eye));
      // The exterior walls wrap the three central sectors. A nearer sector's
      // centroid can still sit behind a wall where their projections overlap.
      const facing=layer.flatMap(piece=>piece.faces.filter(face=>face.facing>.003)
        .sort((a,b)=>a.depth-b.depth).map(face=>({piece,face})));
      facing.sort((a,b)=>Number(a.face.exterior)-Number(b.face.exterior));
      for(const {piece,face} of facing) {
        frostFace(ctx,face,piece,cam,frost);
        hits.push({piece,points:face.screen});
      }
    }
    if(view) {
      pieces.filter(piece=>piece.level===view).forEach(piece=>positionButton(buttons[piece.index],piece.anchor.x,piece.anchor.y));
    }
    if(mousePoint) updatePointerPreview();
    else if(!note.hidden && document.activeElement?.matches('[data-piece]:focus-visible')) {
      positionNote(buttonPosition(document.activeElement));
    }
  }
  function resize() {
    const box=canvas.getBoundingClientRect();
    width=box.width;height=box.height;
    legendBeside=getComputedStyle(legend).position==='absolute';
    const dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.max(1,Math.round(width*dpr));canvas.height=Math.max(1,Math.round(height*dpr));
    ctx.setTransform(canvas.width/(width||1),0,0,canvas.height/(height||1),0,0);
    draw();wake();
  }
  function step(time) {
    frame=0;
    if(!visible||document.hidden) {lastTime=0;return;}
    const dt=lastTime?Math.min((time-lastTime)/1000,.1):0;
    lastTime=time;
    const speed=reduced.matches?1:1-Math.exp(-dt*12);
    const spin=!reduced.matches;
    if(spin) yaw=(yaw+dt*tau/mix(46,80,openness))%tau;
    let moving=false;
    function approach(value,target) {
      if(Math.abs(value-target)<.0015) return target;
      moving=true;return mix(value,target,speed);
    }
    openness=approach(openness,view?1:0);
    for(let level=1;level<=3;level++) focus[level]=approach(focus[level],level===focusLevel?1:0);
    lift=approach(lift,!view&&(pointedLevel===1||(hovered>=0&&tierOf(hovered)===1))?1:0);
    pops.forEach((value,i)=>{
      const raised=i===hovered && (!view || tierOf(i)===view);
      pops[i]=approach(value,raised?1:i===selected?.18:0);
    });
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
  function pick(point, resting=false) {
    for(let i=hits.length-1;i>=0;i--) {
      const {piece,points}=hits[i];
      const x=resting?point.x*piece.growth+piece.hitShift.x:point.x;
      const y=resting?point.y*piece.growth+piece.hitShift.y:point.y;
      if(contains(points,x,y)) return piece.index;
    }
    return -1;
  }
  function hoveredAt(point) {
    const front=pick(point);
    if(front===hovered || hovered<0) return front;
    // Keep the raised solid reachable through the gap it just left behind.
    return pick(point,true)===hovered ? hovered : front;
  }
  function updatePointerPreview(moved=false) {
    const control=document.elementFromPoint(mousePoint.clientX,mousePoint.clientY);
    const label=control?.closest('[data-level]');
    if(label && root.contains(label)) {
      const level=Number(label.dataset.level);
      if(level!==pointedLevel || hovered>=0) previewLevel(level);
      return;
    }
    if(control===canvas || keys.contains(control)) {
      const point=eventPoint(mousePoint);
      const next=hoveredAt(point);
      canvas.style.cursor=next>=0 || view?'pointer':'default';
      if(next!==hovered || pointedLevel || next>=0 && (moved||note.hidden)) previewPiece(next,point);
    } else if(pointedLevel || !note.hidden) clearPreview();
  }

  function activatePoint(event,fallback=-1) {
    const point=eventPoint(event);
    const hit=event.pointerType==='touch' ? pick(point) : hoveredAt(point);
    const index=hit>=0 ? hit : fallback;
    if(index>=0) choose(index);
    else if(view) reset();
  }
  const plate=ui('.plate');
  function trackPointer(event) {
    if(event.pointerType==='touch') { mousePoint=null;return; }
    mousePoint={clientX:event.clientX,clientY:event.clientY};
    updatePointerPreview(true);
  }
  plate.addEventListener('pointerenter',trackPointer);
  plate.addEventListener('pointermove',trackPointer);
  plate.addEventListener('pointerleave', () => { mousePoint=null;clearPreview(); });
  canvas.addEventListener('click', event => activatePoint(event));
  const representative=[-1,2,7,11];
  labels.forEach(button => {
    const level = Number(button.dataset.level);
    button.addEventListener('click', event => {
      if(level===view) return;
      if(level===0) reset();
      else choose(representative[level],event.detail===0);
    });
    button.addEventListener('focus', () => {
      if (button.matches(':focus-visible')) {
        mousePoint=null;
        previewLevel(level);
      }
    });
    button.addEventListener('blur', clearPreview);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && view && (root.contains(event.target) || event.target===document.body)) {
      event.preventDefault();reset(true);
    }
  });
  reduced.addEventListener('change', () => {
    if(reduced.matches) ui('.copy').getAnimations({subtree:true}).forEach(animation=>animation.cancel());
    lastTime=0;
    wake();
  });
  window.addEventListener('afe:themechange', () => { readPalette(); wake(); });
  document.addEventListener('visibilitychange', () => { lastTime = 0; wake(); });
  window.addEventListener('scroll', () => { if(mousePoint) wake(); }, {passive:true});
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
