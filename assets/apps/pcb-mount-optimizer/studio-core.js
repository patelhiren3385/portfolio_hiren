/* User-defined geometry and constraints. No paper-specific engineering defaults. */
(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;root.MountStudioCore=api;})(globalThis,function(){
'use strict';
const EPS=1e-8, KINDS=['mount','keepout','cutout','load','strain'];
const METRICS=[['strain','Worst-zone strain','με','max'],['mode','First PCB mode','Hz','min'],['ratio','PCB / component peak ratio','%','max']];
const clone=x=>JSON.parse(JSON.stringify(x));
const number=x=>{if(typeof x==='number')return Number.isFinite(x)?x:null;if(typeof x!=='string'||!x.trim())return null;const n=Number(x);return Number.isFinite(n)?n:null;};
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const point=p=>p&&finite(p.x)&&finite(p.y)&&Math.abs(p.x)<=1e6&&Math.abs(p.y)<=1e6;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
function fresh(){return {schema:'pcb-mount-project/v3',units:'mm',board:{outline:[],thickness:null},regions:[],rules:{minMounts:null,maxMounts:null,spacing:null,clearance:null,pitch:null,onePerRegion:null},analysis:{caseId:'',forceN:null,direction:'',support:''},checks:Object.fromEntries(METRICS.map(([k])=>[k,{enabled:false,limit:null,tolerance:null}])),mounts:[]};}
function rectangle(w,h,x=0,y=0){if(![w,h,x,y].every(finite)||w<=0||h<=0)throw Error('Width and height must be positive numbers.');return [{x,y},{x:x+w,y},{x:x+w,y:y+h},{x,y:y+h}];}
function area(poly){return Math.abs(poly.reduce((s,p,i)=>{const q=poly[(i+1)%poly.length];return s+p.x*q.y-q.x*p.y;},0))/2;}
function onSegment(p,a,b){return Math.abs(cross(a,b,p))<=EPS&&p.x>=Math.min(a.x,b.x)-EPS&&p.x<=Math.max(a.x,b.x)+EPS&&p.y>=Math.min(a.y,b.y)-EPS&&p.y<=Math.max(a.y,b.y)+EPS;}
function intersects(a,b,c,d){const x=cross(a,b,c),y=cross(a,b,d),z=cross(c,d,a),w=cross(c,d,b);return ((x>EPS&&y< -EPS||x< -EPS&&y>EPS)&&(z>EPS&&w< -EPS||z< -EPS&&w>EPS))||onSegment(c,a,b)||onSegment(d,a,b)||onSegment(a,c,d)||onSegment(b,c,d);}
function polygonErrors(poly){
 if(!Array.isArray(poly)||poly.length<3||poly.length>500)return ['A polygon needs 3–500 vertices.'];
 if(!poly.every(point))return ['Polygon coordinates must be finite millimetre values within ±1,000,000.'];
 if(area(poly)<=EPS)return ['A polygon must enclose a non-zero area.'];
 for(let i=0;i<poly.length;i++){
  if(distance(poly[i],poly[(i+1)%poly.length])<=EPS)return ['Consecutive vertices must be different.'];
  for(let j=i+1;j<poly.length;j++){
   if(j===i+1||(i===0&&j===poly.length-1))continue;
   if(intersects(poly[i],poly[(i+1)%poly.length],poly[j],poly[(j+1)%poly.length]))return ['Polygon edges must not cross or touch themselves.'];
  }
 }
 return [];
}
function inside(p,poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++) {const a=poly[j],b=poly[i];if(onSegment(p,a,b))return true;if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)yes=!yes;}return yes;}
function segmentDistance(p,a,b){const n=(b.x-a.x)**2+(b.y-a.y)**2;const t=n?Math.max(0,Math.min(1,((p.x-a.x)*(b.x-a.x)+(p.y-a.y)*(b.y-a.y))/n)):0;return distance(p,{x:a.x+t*(b.x-a.x),y:a.y+t*(b.y-a.y)});}
function edgeDistance(p,poly){return Math.min(...poly.map((a,i)=>segmentDistance(p,a,poly[(i+1)%poly.length])));}
function contained(poly,outer){
 if(!poly.every(p=>inside(p,outer)))return false;
 // Split every edge at boundary intersections, then test all intervals (concave outlines).
 return poly.every((a,i)=>{const b=poly[(i+1)%poly.length],dx=b.x-a.x,dy=b.y-a.y,ts=[0,1];
  outer.forEach((c,j)=>{const d=outer[(j+1)%outer.length],ex=d.x-c.x,ey=d.y-c.y,den=dx*ey-dy*ex;
   if(Math.abs(den)>EPS){const t=((c.x-a.x)*ey-(c.y-a.y)*ex)/den,u=((c.x-a.x)*dy-(c.y-a.y)*dx)/den;if(t>=0&&t<=1&&u>=0&&u<=1)ts.push(t);}
   else if(Math.abs(cross(a,b,c))<=EPS){for(const p of [c,d]){const t=Math.abs(dx)>Math.abs(dy)?(p.x-a.x)/dx:(p.y-a.y)/dy;if(t>0&&t<1)ts.push(t);}}
  });ts.sort((x,y)=>x-y);return ts.slice(1).every((t,k)=>inside({x:a.x+dx*(t+ts[k])/2,y:a.y+dy*(t+ts[k])/2},outer));
 });
}
function overlap(a,b){return a.some(p=>inside(p,b))||b.some(p=>inside(p,a))||a.some((p,i)=>b.some((q,j)=>intersects(p,a[(i+1)%a.length],q,b[(j+1)%b.length])));}
function bounds(poly){return {minX:Math.min(...poly.map(p=>p.x)),maxX:Math.max(...poly.map(p=>p.x)),minY:Math.min(...poly.map(p=>p.y)),maxY:Math.max(...poly.map(p=>p.y))};}
function regionErrors(project,region,ignoreId=null){
 const errors=polygonErrors(region.polygon);if(errors.length)return errors;
 if(!KINDS.includes(region.kind))errors.push('Choose a region type.');
 if(typeof region.id!=='string'||!region.id.trim()||region.id.length>60)errors.push('Give the region a name of 1–60 characters.');
 if(project.regions.some(r=>r.id===region.id&&r.id!==ignoreId))errors.push('Region names must be unique.');
 if(!contained(region.polygon,project.board.outline))errors.push('Keep every region entirely inside the board outline.');
 const others=project.regions.filter(r=>r.id!==ignoreId);
 if(region.kind==='cutout'){
  if(region.polygon.some(p=>edgeDistance(p,project.board.outline)<=EPS))errors.push('A cut-out must not touch the outer boundary. Edit the outline for edge notches.');
  if(others.some(r=>r.kind!=='keepout'&&overlap(region.polygon,r.polygon)))errors.push('A cut-out must not overlap another region.');
 }else if(region.kind!=='keepout'&&others.some(r=>r.kind==='cutout'&&overlap(region.polygon,r.polygon)))errors.push('This region intersects a cut-out.');
 if(region.kind==='mount'&&others.some(r=>r.kind==='mount'&&overlap(region.polygon,r.polygon)))errors.push('Mount regions must not overlap or touch.');
 return errors;
}
function geometryErrors(p){const e=polygonErrors(p.board.outline);if(!finite(p.board.thickness)||p.board.thickness<=0)e.push('Enter a positive board thickness in mm.');if(!e.length)for(const r of p.regions)e.push(...regionErrors(p,r,r.id));return [...new Set(e)];}
function rulesErrors(p){const r=p.rules,e=[];for(const k of ['minMounts','maxMounts'])if(!Number.isInteger(r[k])||r[k]<1||r[k]>500)e.push('Enter minimum and maximum mount counts (whole numbers from 1 to the 500-mount editor limit).');if(r.maxMounts<r.minMounts)e.push('Maximum mount count must be at least the minimum.');for(const k of ['spacing','clearance'])if(!finite(r[k])||r[k]<0)e.push(`Enter ${k} in mm; use 0 for none.`);if(!finite(r.pitch)||r.pitch<=0)e.push('Enter a positive candidate spacing in mm.');if(typeof r.onePerRegion!=='boolean')e.push('Choose whether one mount per region is required.');if(!p.regions.some(x=>x.kind==='mount'))e.push('Draw at least one allowed mount region.');if(r.onePerRegion&&p.regions.filter(x=>x.kind==='mount').length<r.minMounts)e.push('There are fewer allowed regions than the minimum mount count.');return [...new Set(e)];}
function checkErrors(p){const e=[];for(const [k,label] of METRICS){const c=p.checks[k];if(c.enabled&&(!finite(c.limit)||c.limit<0||!finite(c.tolerance)||c.tolerance<0))e.push(`Enter a non-negative limit and tolerance for ${label}.`);}return e;}
function positionErrors(p,pos,mounts=p.mounts){
 const e=[],r=p.rules,outer=p.board.outline;
 if(!point(pos))return ['Enter finite x and y coordinates.'];
 if(!inside(pos,outer))return ['The mount is outside the board.'];
 const allowed=p.regions.filter(x=>x.kind==='mount'&&inside(pos,x.polygon));
 if(allowed.length!==1)e.push('Place the mount inside one allowed mount region.');
 if(p.regions.some(x=>['keepout','cutout'].includes(x.kind)&&inside(pos,x.polygon)))e.push('The mount lies in a keep-out or cut-out.');
 const edges=[outer,...p.regions.filter(x=>['cutout','keepout'].includes(x.kind)).map(x=>x.polygon)];
 if(edges.some(poly=>edgeDistance(pos,poly)+EPS<r.clearance))e.push('The mount violates the edge / keep-out clearance.');
 if(mounts.some(q=>distance(q,pos)<=EPS||distance(q,pos)+EPS<r.spacing))e.push('The mount violates the minimum centre-to-centre spacing.');
 if(r.onePerRegion&&allowed.length===1&&mounts.some(q=>inside(q,allowed[0].polygon)))e.push('This region already contains a mount.');
 return e;
}
function layoutErrors(p){const e=[...geometryErrors(p),...rulesErrors(p)];if(e.length)return [...new Set(e)];if(p.mounts.length<p.rules.minMounts||p.mounts.length>p.rules.maxMounts)e.push(`Choose ${p.rules.minMounts}–${p.rules.maxMounts} mounts.`);p.mounts.forEach((m,i)=>e.push(...positionErrors(p,m,p.mounts.filter((_,j)=>i!==j))));return [...new Set(e)];}
function candidates(p){const e=[...geometryErrors(p),...rulesErrors(p)];if(e.length)throw Error(e[0]);const b=bounds(p.board.outline),d=p.rules.pitch,nx=Math.floor((b.maxX-b.minX)/d)+1,ny=Math.floor((b.maxY-b.minY)/d)+1;if(nx*ny>100000)throw Error('Candidate grid is too dense (100,000-point limit). Increase the spacing.');if(nx*ny*(p.board.outline.length+p.regions.reduce((n,r)=>n+r.polygon.length,0))>10000000)throw Error('Geometry/grid combination is too complex for interactive sampling. Increase the spacing.');const out=[];for(let iy=0;iy<ny;iy++)for(let ix=0;ix<nx;ix++){const q={x:b.minX+ix*d,y:b.minY+iy*d};if(!positionErrors(p,q,[]).length)out.push(q);}if(out.length>10000)throw Error('More than 10,000 admissible candidates. Increase the spacing.');return out;}
function canonical(v){if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';if(v&&typeof v==='object')return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';return JSON.stringify(v);}
function contextKey(p){return canonical(p);}
function analysisErrors(p){const a=p.analysis,e=[];if(!a.caseId.trim())e.push('Enter your FE model / load-case identifier.');if(!finite(a.forceN)||a.forceN<0)e.push('Enter the total force in N (0 is allowed).');if(!['+X','-X','+Y','-Y','+Z','-Z'].includes(a.direction))e.push('Choose the force direction.');if(!a.support.trim())e.push('Describe the mount boundary condition.');if(a.forceN>0&&!p.regions.some(r=>r.kind==='load'))e.push('Draw the load region for this non-zero force.');return e;}
function request(p){const errors=[...layoutErrors(p),...checkErrors(p),...analysisErrors(p)];if(errors.length)throw Error(errors[0]);return {schema:'pcb-mount-fe-handoff/v3',project:clone(p),contextKey:contextKey(p),forceConvention:'One TOTAL force uniformly distributed over the union of load regions; not force per region.',scope:'Geometry/constraint hand-off, not a solver deck. External FE model must define materials, mesh, connections, dynamic excitation and extraction conventions.',requiredOutputs:METRICS.filter(([k])=>p.checks[k].enabled).map(([k,label,unit])=>({key:k,label,unit}))};}
function resultTemplate(p,method){request(p);return {schema:'pcb-mount-result/v3',method,contextKey:contextKey(p),source:'',values:{strain:null,mode:null,ratio:null}};}
function importResult(text,p,method){const o=typeof text==='string'?JSON.parse(text):text;if(!o||o.schema!=='pcb-mount-result/v3'||o.method!==method)throw Error('Use the matching v3 result template for this method.');if(o.contextKey!==contextKey(p))throw Error('Result belongs to different geometry, rules, loading or mounts. Export a new template.');if(typeof o.source!=='string'||!o.source.trim())throw Error('Result needs a source / run identifier.');if(!o.values||typeof o.values!=='object')throw Error('Result values are missing.');for(const [k] of METRICS)if(o.values[k]!=null&&(!finite(o.values[k])||o.values[k]<0))throw Error('Result values must be non-negative numbers or null.');return clone(o);}
function compare(p,pred,fe){
 const checks=METRICS.filter(([k])=>p.checks[k].enabled),rows=[];
 if(layoutErrors(p).length||checkErrors(p).length||analysisErrors(p).length)return {status:'setup-incomplete',rows,design:'unknown'};
 if(!checks.length)return {status:'no-checks',rows,design:'unknown'};
 if(!pred||!fe)return {status:'not-ready',rows,design:'unknown'};
 if(pred.contextKey!==contextKey(p)||fe.contextKey!==contextKey(p))return {status:'stale',rows,design:'unknown'};
 try{importResult(pred,p,'prediction');importResult(fe,p,'direct-fe');}catch{return {status:'invalid-result',rows,design:'unknown'};}
 for(const [key,label,unit,dir] of checks){const a=pred.values[key],b=fe.values[key],c=p.checks[key],numeric=finite(a)&&finite(b);const pass=v=>finite(v)?(dir==='min'?v>=c.limit:v<=c.limit):null;const abs=numeric?Math.abs(a-b):null;const error=numeric?(key==='ratio'?abs:b===0?(a===0?0:Infinity):100*abs/Math.abs(b)):null;rows.push({key,label,unit,prediction:a??null,fe:b??null,error:finite(error)?error:null,errorUndefined:error===Infinity,within:numeric?error<=c.tolerance:null,modelPass:pass(a),fePass:pass(b)});}
 const mismatch=rows.some(r=>r.modelPass!==null&&r.fePass!==null&&r.modelPass!==r.fePass),failed=rows.some(r=>r.within===false),missing=rows.some(r=>r.within===null);
 return {status:mismatch?'decision-mismatch':failed?'outside-tolerance':missing?'partial':'agreement',rows,design:rows.some(r=>r.fePass===false)?'fail':rows.every(r=>r.fePass===true)?'pass':'unknown'};
}
function outlineCSV(text){const lines=String(text).replace(/^\uFEFF/,'').trim().split(/\r?\n/).filter(x=>x.trim());if(!/^x\s*,\s*y$/i.test(lines.shift()?.trim()||''))throw Error('Outline CSV must begin with x,y (mm).');const poly=lines.map(line=>{const a=line.split(',');if(a.length!==2)throw Error('Each outline row needs x,y.');return {x:number(a[0]),y:number(a[1])};});if(poly.length>1&&point(poly[0])&&point(poly.at(-1))&&distance(poly[0],poly.at(-1))<=EPS)poly.pop();const e=polygonErrors(poly);if(e.length)throw Error(e[0]);return poly;}
function parseProject(text){
 if(typeof text==='string'&&text.length>2000000)throw Error('Project exceeds the 2 MB import limit.');const p=typeof text==='string'?JSON.parse(text):clone(text);
 if(!p||p.schema!=='pcb-mount-project/v3'||p.units!=='mm')throw Error('Use a v3 project in millimetres.');
 if(!p.board||!Array.isArray(p.board.outline)||!Array.isArray(p.regions)||p.regions.length>200||!Array.isArray(p.mounts)||p.mounts.length>500||!p.rules||!p.analysis||!p.checks)throw Error('Invalid project structure.');
 if(p.board.outline.length&&polygonErrors(p.board.outline).length)throw Error(polygonErrors(p.board.outline)[0]);
 const optional=(x,min=0)=>x===null||finite(x)&&x>=min;
 if(!optional(p.board.thickness)||p.board.thickness===0)throw Error('Invalid thickness.');
 for(const k of ['minMounts','maxMounts'])if(p.rules[k]!==null&&(!Number.isInteger(p.rules[k])||p.rules[k]<1||p.rules[k]>500))throw Error('Invalid mount-count rule.');
 for(const k of ['spacing','clearance','pitch'])if(!optional(p.rules[k])||k==='pitch'&&p.rules[k]===0)throw Error('Invalid spacing rule.');
 if(p.rules.onePerRegion!==null&&typeof p.rules.onePerRegion!=='boolean')throw Error('Invalid region rule.');
 if(new Set(p.regions.map(r=>r.id)).size!==p.regions.length)throw Error('Duplicate region names.');
 for(const r of p.regions){if(!Array.isArray(r.polygon))throw Error('Invalid region polygon.');const e=regionErrors(p,r,r.id);if(e.length)throw Error(e[0]);}
 if(p.mounts.some(m=>!point(m)||typeof m.id!=='string')||new Set(p.mounts.map(m=>m.id)).size!==p.mounts.length)throw Error('Invalid or duplicate mounts.');
 for(const k of ['caseId','direction','support'])if(typeof p.analysis[k]!=='string'||p.analysis[k].length>2000)throw Error('Invalid analysis context.');
 if(!optional(p.analysis.forceN))throw Error('Invalid force.');
 for(const [k] of METRICS){const c=p.checks[k];if(!c||typeof c.enabled!=='boolean'||!optional(c.limit)||!optional(c.tolerance))throw Error('Invalid engineering check.');}
 return p;
}
return Object.freeze({fresh,clone,number,rectangle,area,inside,bounds,polygonErrors,regionErrors,geometryErrors,rulesErrors,checkErrors,layoutErrors,positionErrors,candidates,contextKey,analysisErrors,request,resultTemplate,importResult,compare,outlineCSV,parseProject,METRICS,KINDS});
});
