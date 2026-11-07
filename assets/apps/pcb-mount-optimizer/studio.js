/* Browser controller. Pure geometry/validation lives in studio-core.js. */
(function(){'use strict';
const C=window.MountStudioCore,$=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
let project=C.fresh(),step=1,draft=null,editing=null,grid=[],prediction=null,fe=null,view=null,pan=null,suppressClick=false;
const ruleFields={'min-mounts':'minMounts','max-mounts':'maxMounts',spacing:'spacing',clearance:'clearance',pitch:'pitch'};
const analysisFields={'case-id':'caseId',force:'forceN',direction:'direction',support:'support'};
const kindLabels={mount:'Allowed mounting',keepout:'Keep-out',cutout:'Cut-out / hole',load:'Load area',strain:'Strain-check area'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const val=(id,v)=>{$(id).value=v??'';};
const fmt=v=>v==null?'—':Number(v).toLocaleString(undefined,{maximumFractionDigits:3});
function notify(text,error=false){$('notice').textContent=text;$('notice').classList.toggle('error',error);}
function attempt(fn){try{fn();}catch(e){notify(e.message,true);}}
function changed({geometry=false}={}){const had=prediction||fe;prediction=null;fe=null;grid=[];if(geometry)project.mounts=[];if(had)notify('Inputs changed. Previous prediction and FE results have been cleared.');render();}
function fit(){if(!project.board.outline.length){view={x:-10,y:-90,w:120,h:100};return;}const b=C.bounds(project.board.outline),w=b.maxX-b.minX,h=b.maxY-b.minY,pad=Math.max(w,h)*.08;view={x:b.minX-pad,y:-b.maxY-pad,w:w+2*pad,h:h+2*pad};}
function node(tag,attrs={},text){const n=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));if(text!=null)n.textContent=text;return n;}
function coords(points){return points.map(p=>`${p.x},${p.y}`).join(' ');}
function renderBoard(){
 if(!view)fit();$('board').setAttribute('viewBox',`${view.x} ${view.y} ${view.w} ${view.h}`);const scene=$('scene');scene.replaceChildren();const outline=project.board.outline;
 $('empty-board').hidden=!!outline.length;
 if(outline.length){const b=C.bounds(outline);$('board-summary').textContent=`${fmt(b.maxX-b.minX)} × ${fmt(b.maxY-b.minY)} mm · t ${fmt(project.board.thickness)} mm`;
  scene.append(node('polygon',{points:coords(outline),class:'outline'}));
  for(const r of project.regions){const n=node('polygon',{points:coords(r.polygon),class:`region ${r.kind}`});n.append(node('title',{},`${r.id}: ${kindLabels[r.kind]}`));scene.append(n);}
 }else $('board-summary').textContent='No board defined';
 const radius=Math.max(view.w,view.h)/110;
 if(step===3)for(const q of grid){const n=node('circle',{cx:q.x,cy:q.y,r:radius*.48,class:'candidate','data-candidate':`${q.x},${q.y}`});scene.append(n);}
 for(const m of project.mounts){const n=node('circle',{cx:m.x,cy:m.y,r:radius,class:'selected-mount','data-mount':m.id,tabindex:0,role:'button','aria-label':`Remove mount ${m.id} at ${fmt(m.x)}, ${fmt(m.y)} mm`});n.append(node('title',{},`${m.id}: (${fmt(m.x)}, ${fmt(m.y)})`));n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();removeMount(m.id);}});scene.append(n);}
 if(draft){scene.append(node('polyline',{points:coords(draft.points),class:'draft'}));for(const p of draft.points)scene.append(node('circle',{cx:p.x,cy:p.y,r:radius*.65,class:'vertex'}));}
 $('drawing-tools').hidden=!draft;
 if(draft)$('draw-help').textContent=draft.shape==='rectangle'?'Tap two opposite corners.':'Tap each vertex, then choose Finish. Escape cancels.';
 $('canvas-help').textContent=draft?'Drawing is active. Finish or cancel before changing steps.':step===3?'Tap a candidate or any allowed position. Red markers are your selected mounts.':outline.length?'Define regions on your actual outline. No component geometry is assumed.':'Create a rectangle or import an outline to start. The drawing uses equal scales on both axes.';
 $('show-candidates').textContent=grid.length?'Hide candidates':'Show candidates';
}
function setStep(n){if(draft){notify('Finish or cancel the current drawing first.',true);return;}step=n;for(let i=1;i<=3;i++)$('step-'+i).hidden=i!==n;document.querySelectorAll('[data-step]').forEach(b=>{if(Number(b.dataset.step)===n)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});render();}
function hydrate(){
 if(project.board.outline.length){const b=C.bounds(project.board.outline);val('width',b.maxX-b.minX);val('height',b.maxY-b.minY);}else{val('width','');val('height','');}
 val('thickness',project.board.thickness);for(const [id,key] of Object.entries(ruleFields))val(id,project.rules[key]);val('one-per-region',project.rules.onePerRegion===null?'':project.rules.onePerRegion?'yes':'no');
 for(const [id,key] of Object.entries(analysisFields))val(id,project.analysis[key]);
 for(const [key] of C.METRICS){const c=project.checks[key];$('enable-'+key).checked=c.enabled;val('limit-'+key,c.limit);val('tolerance-'+key,c.tolerance);$('settings-'+key).hidden=!c.enabled;}
}
function render(){
 renderBoard();$('region-list').innerHTML=project.regions.map(r=>`<div class="item"><span>${esc(r.id)}<small>${esc(kindLabels[r.kind])} · ${r.polygon.length} vertices</small></span><button type="button" data-edit-region="${esc(r.id)}">Edit</button><button type="button" data-delete-region="${esc(r.id)}" aria-label="Delete ${esc(r.id)}">×</button></div>`).join('');
 $('mount-list').innerHTML=project.mounts.map(m=>`<div class="item"><span>${esc(m.id)}<small>${fmt(m.x)}, ${fmt(m.y)} mm</small></span><button type="button" data-delete-mount="${esc(m.id)}" aria-label="Remove ${esc(m.id)}">×</button></div>`).join('');
 const errors=C.layoutErrors(project);$('layout-status').textContent=`${project.mounts.length} mounts selected${errors.length?'':' · layout rules satisfied'}`;
 $('layout-errors').innerHTML=errors.map(e=>`<p>${esc(e)}</p>`).join('');
 const requestErrors=[...errors,...C.checkErrors(project),...C.analysisErrors(project)];$('export-request').disabled=!!requestErrors.length;
 if(step===3&&requestErrors.length&&!errors.length)$('layout-errors').innerHTML=requestErrors.map(e=>`<p>${esc(e)} Return to Rules to complete setup.</p>`).join('');
 for(const id of ['prediction-template','fe-template'])$(id).disabled=!!requestErrors.length;
 $('new-region').hidden=editing===null;
 renderComparison();
}
function renderComparison(){
 const r=C.compare(project,prediction,fe),labels={'setup-incomplete':'Complete the geometry, layout and FE hand-off settings first.','no-checks':'Enable your engineering checks in Rules.','not-ready':'Import a prediction and an independent direct FE result.',stale:'Results do not match the current project. Re-export the templates.','invalid-result':'Invalid result data. Import matching v3 templates.',partial:'Incomplete numeric evidence. No full agreement established.','decision-mismatch':'Model and FE reach different engineering decisions.','outside-tolerance':'Prediction error exceeds your tolerance.',agreement:`Numerical agreement within your tolerances. FE design checks: ${r.design.toUpperCase()}.`};
 $('verdict').textContent=labels[r.status];$('result-sources').textContent=[prediction&&'Prediction: '+prediction.source,fe&&'FE: '+fe.source].filter(Boolean).join(' · ');
 $('comparison-rows').innerHTML=r.rows.map(x=>`<tr><th>${esc(x.label)}</th><td>${fmt(x.prediction)}</td><td>${fmt(x.fe)}</td><td>${x.errorUndefined?'Undefined (FE = 0)':fmt(x.error)+(x.key==='ratio'?' pp':'%')}</td></tr>`).join('');
}
function cancelDrawing(){draft=null;renderBoard();}
function startDrawing(target){if(!project.board.outline.length)throw Error('Create or import the board first.');if(target==='region'&&!$('region-name').value.trim())throw Error('Name the region first.');draft={target,shape:target==='outline'?'polygon':$('region-shape').value,points:[]};notify(draft.shape==='rectangle'?'Tap two opposite corners of your region.':'Tap vertices in order and choose Finish.');renderBoard();if(window.innerWidth<=760)$('board').scrollIntoView({block:'center'});}
function applyOutline(poly){const e=C.polygonErrors(poly);if(e.length)throw Error(e[0]);if((project.regions.length||project.mounts.length)&&!window.confirm('Changing the board clears regions, mounts and previous results. Continue?'))return false;project.board.outline=poly;project.regions=[];editing=null;project.mounts=[];draft=null;fit();hydrate();changed({geometry:true});notify('Board updated. Define your own regions next.');return true;}
function applyRegion(poly){const r={id:$('region-name').value.trim(),kind:$('region-kind').value,polygon:poly},errors=C.regionErrors(project,r,editing);if(errors.length)throw Error(errors[0]);if(editing!==null)project.regions=project.regions.filter(x=>x.id!==editing);project.regions.push(r);editing=null;draft=null;val('region-name','');val('region-coords','');$('precise-region').open=false;changed({geometry:true});notify('Region saved. Mount selection and previous results have been reset.');}
function finishDrawing(){if(!draft)return;const poly=draft.points;if(draft.target==='outline')applyOutline(poly);else applyRegion(poly);}
function addPoint(q){if(draft){draft.points.push(q);if(draft.shape==='rectangle'&&draft.points.length===2){const [a,b]=draft.points;draft.points=[];const w=Math.abs(a.x-b.x),h=Math.abs(a.y-b.y);const poly=C.rectangle(w,h,Math.min(a.x,b.x),Math.min(a.y,b.y));applyRegion(poly);}else renderBoard();return;}if(step===3)addMount(q);}
function addMount(q){const ready=[...C.geometryErrors(project),...C.rulesErrors(project)];if(ready.length)throw Error(ready[0]);if(project.mounts.length>=project.rules.maxMounts)throw Error('Maximum mount count reached. Remove a mount or change your rule.');const e=C.positionErrors(project,q);if(e.length)throw Error(e[0]);let n=1;while(project.mounts.some(m=>m.id==='M'+n))n++;project.mounts.push({id:'M'+n,...q});const oldGrid=grid;changed();grid=oldGrid;renderBoard();notify('Mount added.');}
function removeMount(id){project.mounts=project.mounts.filter(m=>m.id!==id);const oldGrid=grid;changed();grid=oldGrid;renderBoard();notify('Mount removed; previous comparison cleared.');}
function boardPoint(event){const svg=$('board'),matrix=svg.getScreenCTM();if(!matrix)throw Error('Canvas is not ready.');const v=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());return {x:Math.round(v.x*1000)/1000,y:Math.round(-v.y*1000)/1000};}
function download(obj,name,type='application/json'){const url=URL.createObjectURL(new Blob([typeof obj==='string'?obj:JSON.stringify(obj,null,2)+'\n'],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function readFile(input,fn){const file=input.files?.[0];input.value='';if(!file)return;if(file.size>2000000){notify('File exceeds the 2 MB import limit.',true);return;}try{fn(await file.text());}catch(e){notify(e.message,true);}}
function importMethod(text,method){const r=C.importResult(text,project,method);if(method==='prediction')prediction=r;else fe=r;renderComparison();notify(`${method==='prediction'?'Prediction':'Direct FE'} result imported for this exact project.`);}
function report(){return {schema:'pcb-mount-comparison/v3',generatedAt:new Date().toISOString(),project:C.clone(project),prediction:C.clone(prediction),directFe:C.clone(fe),comparison:C.compare(project,prediction,fe)};}
$('check-fields').innerHTML=C.METRICS.map(([k,label,unit,dir])=>`<div class="check"><label><input id="enable-${k}" type="checkbox">${label}</label><div id="settings-${k}" class="fields" hidden><label>${dir==='min'?'Minimum':'Maximum'} (${unit})<input id="limit-${k}" type="number" min="0" step="any"></label><label>Agreement tolerance (${k==='ratio'?'pp':'relative %'})<input id="tolerance-${k}" type="number" min="0" step="any"></label></div></div>`).join('');
document.querySelectorAll('[data-step],[data-next]').forEach(b=>b.addEventListener('click',()=>setStep(Number(b.dataset.step||b.dataset.next))));
$('make-board').onclick=()=>attempt(()=>{const w=C.number($('width').value),h=C.number($('height').value),t=C.number($('thickness').value);if(!t||t<=0)throw Error('Enter a positive thickness.');const poly=C.rectangle(w,h);if(applyOutline(poly)){project.board.thickness=t;changed();}});
$('thickness').oninput=()=>{project.board.thickness=C.number($('thickness').value);changed();};
$('draw-outline').onclick=()=>attempt(()=>startDrawing('outline'));
$('import-outline').onclick=()=>$('outline-file').click();$('outline-file').onchange=()=>readFile($('outline-file'),text=>applyOutline(C.outlineCSV(text)));
$('draw-region').onclick=()=>attempt(()=>startDrawing('region'));$('save-region').onclick=()=>attempt(()=>applyRegion(C.outlineCSV('x,y\n'+$('region-coords').value)));
$('new-region').onclick=()=>{editing=null;val('region-name','');val('region-coords','');cancelDrawing();render();};
$('region-list').onclick=e=>{const edit=e.target.closest('[data-edit-region]'),del=e.target.closest('[data-delete-region]');if(edit){const r=project.regions.find(x=>x.id===edit.dataset.editRegion);editing=r.id;val('region-name',r.id);val('region-kind',r.kind);val('region-coords',r.polygon.map(q=>q.x+','+q.y).join('\n'));$('precise-region').open=true;render();notify('Edit the coordinates or draw a replacement region.');}if(del){project.regions=project.regions.filter(x=>x.id!==del.dataset.deleteRegion);if(editing===del.dataset.deleteRegion)editing=null;cancelDrawing();changed({geometry:true});notify('Region deleted; mounts and results reset.');}};
for(const [id,key] of Object.entries(ruleFields))$(id).oninput=()=>{project.rules[key]=C.number($(id).value);changed();};
$('one-per-region').onchange=()=>{project.rules.onePerRegion=$('one-per-region').value===''?null:$('one-per-region').value==='yes';changed();};
for(const [id,key] of Object.entries(analysisFields))$(id).addEventListener('input',()=>{project.analysis[key]=key==='forceN'?C.number($(id).value):$(id).value;changed();});
for(const [k] of C.METRICS){$('enable-'+k).onchange=()=>{project.checks[k].enabled=$('enable-'+k).checked;$('settings-'+k).hidden=!project.checks[k].enabled;changed();};for(const key of ['limit','tolerance'])$(key+'-'+k).oninput=()=>{project.checks[k][key]=C.number($(key+'-'+k).value);changed();};}
$('show-candidates').onclick=()=>attempt(()=>{grid=grid.length?[]:C.candidates(project);renderBoard();notify(grid.length?`${grid.length} admissible candidates. This is a placement grid, not an optimized layout.`:'No candidates shown. Reduce grid spacing if no point falls inside a region.');});
$('clear-mounts').onclick=()=>{project.mounts=[];changed();notify('Mounts and comparisons cleared.');};
$('add-mount').onclick=()=>attempt(()=>addMount({x:C.number($('mount-x').value),y:C.number($('mount-y').value)}));
$('mount-list').onclick=e=>{const b=e.target.closest('[data-delete-mount]');if(b)removeMount(b.dataset.deleteMount);};
$('board').addEventListener('click',e=>attempt(()=>{if(suppressClick){suppressClick=false;return;}const selected=e.target.closest('[data-mount]');if(selected&&!draft){removeMount(selected.dataset.mount);return;}const c=e.target.closest('[data-candidate]');addPoint(c?{x:Number(c.dataset.candidate.split(',')[0]),y:Number(c.dataset.candidate.split(',')[1])}:boardPoint(e));}));
$('board').addEventListener('pointerdown',e=>{if(e.shiftKey&&!draft){pan={x:e.clientX,y:e.clientY,view:{...view}};$('board').setPointerCapture(e.pointerId);}});
$('board').addEventListener('pointermove',e=>{const q=boardPoint(e);$('cursor').textContent=`X ${fmt(q.x)} · Y ${fmt(q.y)} mm`;if(pan){const scale=$('board').getScreenCTM().a;view={...pan.view,x:pan.view.x-(e.clientX-pan.x)/scale,y:pan.view.y-(e.clientY-pan.y)/scale};suppressClick=true;renderBoard();}});
$('board').addEventListener('pointerup',()=>{pan=null;});$('board').addEventListener('pointercancel',()=>{pan=null;});
$('undo-vertex').onclick=()=>{draft?.points.pop();renderBoard();};$('finish-drawing').onclick=()=>attempt(finishDrawing);$('cancel-drawing').onclick=cancelDrawing;
document.addEventListener('keydown',e=>{if(e.key==='Escape')cancelDrawing();});
function zoom(f){const w=view.w*f,h=view.h*f;view={x:view.x+(view.w-w)/2,y:view.y+(view.h-h)/2,w,h};renderBoard();}
$('zoom-in').onclick=()=>zoom(.8);$('zoom-out').onclick=()=>zoom(1.25);$('fit').onclick=()=>{fit();renderBoard();};
$('save-project').onclick=()=>download(project,'pcb-mount-project.json');$('open-project').onclick=()=>$('project-file').click();$('project-file').onchange=()=>readFile($('project-file'),text=>{const next=C.parseProject(text);project=next;prediction=null;fe=null;draft=null;editing=null;grid=[];fit();hydrate();setStep(1);notify('Project loaded. Imported settings are yours; no paper defaults were added.');});
$('export-request').onclick=()=>attempt(()=>download(C.request(project),'pcb-fe-handoff.json'));
for(const [prefix,method] of [['prediction','prediction'],['fe','direct-fe']]){$(prefix+'-template').onclick=()=>attempt(()=>download(C.resultTemplate(project,method),prefix+'-result-template.json'));$(prefix+'-import').onclick=()=>$(prefix+'-file').click();$(prefix+'-file').onchange=()=>readFile($(prefix+'-file'),text=>importMethod(text,method));}
$('export-report').onclick=()=>download(report(),'pcb-comparison.json');
window.PCBMountApp=Object.freeze({version:'3.0.0',getState:()=>C.clone(project),getReport:report,getSolverRequest:()=>C.request(project),loadPrediction:r=>importMethod(r,'prediction'),loadFeResult:r=>importMethod(r,'direct-fe')});
hydrate();render();
})();
