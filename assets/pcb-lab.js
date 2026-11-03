/* Hiren Patel — conceptual engineering demonstrator. Geometry and motion are illustrative. */
(function () {
  'use strict';

  const TAU = Math.PI * 2;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const MODES = new Set(['vibration', 'thermal', 'mesh']);
  const PARTS = {
    vdr: { name: 'VDR3', x: -18, y: -15, z: 13, resonance: 230, color: '#ee9d5a' },
    capacitor: { name: 'C14', x: 19, y: -8, z: 10, resonance: 533.6, color: '#a4c9cd' },
    board: { name: 'PCB', x: 5, y: 17, z: 1, resonance: 937.5, color: '#d5dcc3' }
  };
  const BOARD = [[-41,-41],[34,-41],[41,-34],[41,41],[-41,41]];
  const MOUNTS = [[-33,-33],[31,-30],[32,32],[-32,32]];
  const TRACES = [
    [[-34,-9],[-24,-9],[-24,-14],[-14,-14],[-14,3],[-6,3]],
    [[-34,-5],[-27,-5],[-27,3],[-17,3],[-17,15],[-6,15]],
    [[-34,0],[-30,0],[-30,21],[-15,21],[-15,25],[3,25]],
    [[-34,5],[-33,5],[-33,25],[-20,25],[-20,29],[7,29]],
    [[-18,-34],[-18,-25],[-8,-25],[-8,-11],[-4,-11]],
    [[-13,-34],[-13,-29],[-3,-29],[-3,-15],[4,-15]],
    [[-8,-34],[-8,-32],[10,-32],[10,-16],[17,-16]],
    [[-3,-34],[-3,-35],[24,-35],[24,-20],[30,-20],[30,-2]],
    [[9,-8],[15,-8],[15,-3],[25,-3],[25,8],[33,8]],
    [[6,3],[14,3],[14,8],[23,8],[23,13],[34,13]],
    [[6,8],[11,8],[11,16],[27,16],[27,18],[34,18]],
    [[6,13],[8,13],[8,23],[20,23],[20,28],[25,28]],
    [[-1,20],[-1,32],[17,32],[17,35],[24,35]],
    [[-12,8],[-23,8],[-23,15],[-30,15]],
    [[-11,-7],[-16,-7],[-16,-4],[-22,-4]],
    [[25,-13],[31,-13],[31,-9],[35,-9]],
    [[12,-26],[19,-26],[19,-22],[27,-22]],
    [[-24,-29],[-27,-29],[-27,-19],[-32,-19]]
  ];

  class PCBLab {
    constructor(canvas, options = {}) {
      if (!(canvas instanceof HTMLCanvasElement)) throw new TypeError('PCBLab requires a canvas.');
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: true });
      this.options = options;
      this.mode = 'vibration';
      this.frequency = 230;
      this.damping = 3.89;
      this.selection = 'vdr';
      this.running = true;
      this.visible = true;
      this.time = 0;
      this.yaw = -0.46;
      this.pitch = 0.94;
      this.hover = null;
      this.width = 0;
      this.height = 0;
      this.frame = 0;
      this.lastFrame = 0;
      this.destroyed = false;
      this.pointer = null;
      this.listeners = [];
      this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion = this.motionQuery.matches;
      this._motionChange = e => { this.reducedMotion = e.matches; this._wake(); };
      this.motionQuery.addEventListener?.('change', this._motionChange);
      this._visibilityChange = () => this._wake();
      document.addEventListener('visibilitychange', this._visibilityChange);
      this.resizeObserver = new ResizeObserver(() => this._resize());
      this.resizeObserver.observe(canvas);
      if ('IntersectionObserver' in window) {
        this.intersectionObserver = new IntersectionObserver(entries => {
          this.visible = entries[0].isIntersecting;
          this._wake();
        }, { rootMargin: '80px' });
        this.intersectionObserver.observe(canvas);
      }
      if (options.interactive !== false) this._bindInteraction();
      this._resize();
      this._notify();
    }

    setMode(mode) {
      if (MODES.has(mode)) this.mode = mode;
      this._wake();
      return this;
    }

    setFrequency(frequency) {
      const n = Number(frequency);
      if (Number.isFinite(n)) this.frequency = clamp(n, 100, 1700);
      this._notify();
      this._wake();
      return this;
    }

    setDamping(percent) {
      const n = Number(percent);
      if (Number.isFinite(n)) this.damping = clamp(n, 0.1, 20);
      this._notify();
      this._wake();
      return this;
    }

    setRunning(running) {
      this.running = Boolean(running);
      this._wake();
      return this;
    }

    setSelection(selection) {
      if (PARTS[selection]) this.selection = selection;
      this._notify();
      this._wake();
      return this;
    }

    resetView() {
      this.yaw = -0.46;
      this.pitch = 0.94;
      this._wake();
      return this;
    }

    destroy() {
      this.destroyed = true;
      cancelAnimationFrame(this.frame);
      this.resizeObserver.disconnect();
      this.intersectionObserver?.disconnect();
      this.motionQuery.removeEventListener?.('change', this._motionChange);
      document.removeEventListener('visibilitychange', this._visibilityChange);
      this.listeners.forEach(([type, listener]) => this.canvas.removeEventListener(type, listener));
    }

    _amplification() {
      const ratio = this.frequency / PARTS[this.selection].resonance;
      return 1 / Math.sqrt((1 - ratio * ratio) ** 2 + (2 * this.damping / 100 * ratio) ** 2);
    }

    _notify() {
      this.options.onUpdate?.({
        frequency: this.frequency,
        damping: this.damping,
        amplification: this._amplification(),
        selection: this.selection,
        resonance: PARTS[this.selection].resonance
      });
    }

    _resize() {
      const r = this.canvas.getBoundingClientRect();
      this.width = r.width;
      this.height = r.height;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.max(1, Math.round(r.width * this.dpr));
      this.canvas.height = Math.max(1, Math.round(r.height * this.dpr));
      this.scale = Math.min(this.width / 128, this.height / 105);
      this.cx = this.width * 0.50;
      this.cy = this.height * 0.56;
      this._wake();
    }

    _wake() {
      if (this.destroyed || this.frame) return;
      this.lastFrame = 0;
      this.frame = requestAnimationFrame(t => this._tick(t));
    }

    _tick(timestamp) {
      this.frame = 0;
      if (this.destroyed) return;
      const animate = this.visible && !document.hidden && this.running && !this.reducedMotion;
      if (animate) this.time += this.lastFrame ? Math.min(40, timestamp - this.lastFrame) / 1000 : 0;
      this.lastFrame = timestamp;
      if (this.visible && !document.hidden) this._draw();
      if (animate && this.mode === 'vibration') this.frame = requestAnimationFrame(t => this._tick(t));
    }

    _bindInteraction() {
      const canvas = this.canvas;
      canvas.style.touchAction = 'pan-y';
      canvas.style.cursor = 'grab';
      if (!canvas.hasAttribute('tabindex')) canvas.tabIndex = 0;
      if (!canvas.hasAttribute('aria-label')) {
        canvas.setAttribute('aria-label', 'Interactive conceptual PCB. Drag to rotate. Select the orange VDR3, blue capacitor, or board. Arrow keys rotate; keys 1, 2 and 3 select components.');
      }
      const on = (type, listener) => {
        canvas.addEventListener(type, listener);
        this.listeners.push([type, listener]);
      };
      on('pointerdown', e => {
        if (e.button !== 0) return;
        this.pointer = { id: e.pointerId, x: e.clientX, y: e.clientY, yaw: this.yaw, pitch: this.pitch, dragged: false, touch: e.pointerType === 'touch' };
      });
      on('pointermove', e => {
        if (this.pointer && this.pointer.id === e.pointerId) {
          const dx = e.clientX - this.pointer.x;
          const dy = e.clientY - this.pointer.y;
          if (!this.pointer.dragged && Math.hypot(dx, dy) > 7) {
            if (this.pointer.touch && Math.abs(dy) > Math.abs(dx)) { this.pointer = null; return; }
            this.pointer.dragged = true;
            canvas.setPointerCapture?.(e.pointerId);
          }
          if (this.pointer.dragged) {
            this.yaw = this.pointer.yaw + dx * 0.008;
            this.pitch = clamp(this.pointer.pitch - (this.pointer.touch ? 0 : dy * 0.006), 0.42, 1.28);
            canvas.style.cursor = 'grabbing';
            this._wake();
          }
        } else {
          const hit = this._hit(e.clientX, e.clientY);
          if (hit !== this.hover) { this.hover = hit; this._wake(); }
          canvas.style.cursor = hit ? 'pointer' : 'grab';
        }
      });
      on('pointerup', e => {
        const pointer = this.pointer;
        this.pointer = null;
        if (!pointer || pointer.id !== e.pointerId) return;
        if (canvas.hasPointerCapture?.(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
        canvas.style.cursor = 'grab';
        if (!pointer.dragged) {
          const hit = this._hit(e.clientX, e.clientY);
          if (hit) { this.setSelection(hit); this.options.onSelect?.(hit); }
        }
      });
      on('pointercancel', () => { this.pointer = null; canvas.style.cursor = 'grab'; });
      on('pointerleave', () => { this.hover = null; this._wake(); });
      on('keydown', e => {
        let handled = true;
        if (e.key === 'ArrowLeft') this.yaw -= 0.12;
        else if (e.key === 'ArrowRight') this.yaw += 0.12;
        else if (e.key === 'ArrowUp') this.pitch = clamp(this.pitch + 0.08, 0.42, 1.28);
        else if (e.key === 'ArrowDown') this.pitch = clamp(this.pitch - 0.08, 0.42, 1.28);
        else if (['1','2','3'].includes(e.key)) {
          const id = ['vdr','capacitor','board'][Number(e.key) - 1];
          this.setSelection(id); this.options.onSelect?.(id);
        } else handled = false;
        if (handled) { e.preventDefault(); this._wake(); }
      });
    }

    _hit(clientX, clientY) {
      const rect = this.canvas.getBoundingClientRect();
      const x = clientX - rect.left, y = clientY - rect.top;
      let hit = null, nearest = Infinity;
      Object.entries(PARTS).forEach(([id, part]) => {
        const p = this._project(part.x, part.y, part.z + this._deflect(part.x, part.y));
        const d = Math.hypot(x - p[0], y - p[1]);
        const radius = id === 'board' ? Math.max(28, this.scale * 13) : Math.max(22, this.scale * 10);
        if (d < radius && d < nearest) { nearest = d; hit = id; }
      });
      return hit;
    }

    _project(x, y, z = 0) {
      const c = Math.cos(this.yaw), s = Math.sin(this.yaw);
      const u = x * c - y * s;
      const v = x * s + y * c;
      return [this.cx + u * this.scale, this.cy + (v * Math.cos(this.pitch) - z * Math.sin(this.pitch)) * this.scale];
    }

    _depth(x, y) { return x * Math.sin(this.yaw) + y * Math.cos(this.yaw); }

    _deflect(x, y) {
      if (this.mode !== 'vibration') return 0;
      const magnitude = clamp(Math.log1p(this._amplification()) / 2.8, 0.10, 1.8);
      const wave = Math.sin(this.time * 3.1);
      const envelope = Math.cos(x / 82 * Math.PI) * Math.cos(y / 82 * Math.PI);
      return envelope * wave * magnitude * (this.selection === 'board' ? 2.0 : 0.45);
    }

    _path(points, close = true) {
      const ctx = this.ctx;
      ctx.beginPath();
      points.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
      if (close) ctx.closePath();
    }

    _poly(points, fill, stroke, width = 1) {
      this._path(points);
      if (fill) { this.ctx.fillStyle = fill; this.ctx.fill(); }
      if (stroke) { this.ctx.strokeStyle = stroke; this.ctx.lineWidth = width; this.ctx.stroke(); }
    }

    _line(points, color, width = 1, dash = []) {
      this._path(points, false);
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = width;
      this.ctx.setLineDash(dash);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }

    _planeCircle(x, y, z, r, fill, stroke, width = 1) {
      const pts = [];
      for (let i = 0; i < 48; i++) {
        const a = i / 48 * TAU;
        pts.push(this._project(x + Math.cos(a) * r, y + Math.sin(a) * r, z));
      }
      this._poly(pts, fill, stroke, width);
    }

    _boardPoint(x, y, offset = 0) { return this._project(x, y, this._deflect(x, y) + offset); }

    _draw() {
      if (!this.width || !this.height || !this.ctx) return;
      const ctx = this.ctx;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, this.width, this.height);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      this._drawGround();
      this._drawBoard();
      this._drawTraces();
      this._drawMounts();
      this._drawSilkscreen();
      this._drawParts();
      this._drawSelection();
      this._drawAxes();
    }

    _drawGround() {
      const ctx = this.ctx;
      const glow = ctx.createRadialGradient(this.cx, this.cy, 8, this.cx, this.cy, this.width * 0.55);
      glow.addColorStop(0, 'rgba(119,151,117,.09)');
      glow.addColorStop(1, 'rgba(119,151,117,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, this.width, this.height);
      for (let i = -60; i <= 60; i += 10) {
        this._line([this._project(-65, i, -8),this._project(65,i,-8)], 'rgba(203,215,189,.055)', 0.6);
        this._line([this._project(i,-65,-8),this._project(i,65,-8)], 'rgba(203,215,189,.055)', 0.6);
      }
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 35; ctx.shadowOffsetY = 17;
      this._poly(BOARD.map(([x,y])=>this._project(x,y,-4)), 'rgba(5,17,14,.65)');
      ctx.restore();
      if (this.mode === 'vibration') {
        const ghost = BOARD.map(([x,y]) => this._project(x,y,4 + this._deflect(x,y)));
        this._line([...ghost,ghost[0]], 'rgba(212,223,192,.15)', 0.8, [3,5]);
      }
    }

    _drawBoard() {
      const pts = BOARD.map(([x,y]) => this._boardPoint(x,y));
      for (let i=0;i<BOARD.length;i++) {
        const a=BOARD[i], b=BOARD[(i+1)%BOARD.length];
        this._poly([this._boardPoint(...a),this._boardPoint(...b),this._boardPoint(...b,-1.57),this._boardPoint(...a,-1.57)], '#1c352c', '#7e8b65', 0.45);
      }
      this._poly(pts, this.mode==='mesh' ? '#273b33' : '#355349', '#9ba580', 1.1);
      const ctx=this.ctx;
      ctx.save(); this._path(pts); ctx.clip();
      if (this.mode==='thermal') {
        for (let x=-41;x<41;x+=4.1) for (let y=-41;y<41;y+=4.1) {
          const q=0.85*Math.exp(-((x+15)**2+(y+12)**2)/450)+0.62*Math.exp(-((x-12)**2+(y-10)**2)/300);
          const hue=lerp(165,18,clamp(q,0,1));
          this._poly([[x,y],[x+4.2,y],[x+4.2,y+4.2],[x,y+4.2]].map(p=>this._boardPoint(...p)),`hsl(${hue} 48% ${26+q*25}%)`);
        }
      }
      const mesh=this.mode==='mesh';
      const color=mesh ? 'rgba(225,235,203,.34)' : 'rgba(188,205,168,.10)';
      const step=mesh ? 5.125 : 8.2;
      for(let p=-41;p<=41.1;p+=step) {
        const row=[],col=[];
        for(let q=-41;q<=41.1;q+=4.1) {row.push(this._boardPoint(q,p,0.03));col.push(this._boardPoint(p,q,0.03));}
        this._line(row,color,mesh?0.6:0.45);this._line(col,color,mesh?0.6:0.45);
      }
      if(mesh) for(let x=-41;x<41;x+=step) for(let y=-41;y<41;y+=step) {
        this._line([this._boardPoint(x,y,0.05),this._boardPoint(x+step,y+step,0.05)],'rgba(225,235,203,.19)',0.5);
      }
      ctx.restore();
    }

    _drawTraces() {
      const color=this.mode==='mesh'?'rgba(181,196,162,.22)':'rgba(191,170,100,.62)';
      TRACES.forEach((trace,i)=>{
        this._line(trace.map(([x,y])=>this._boardPoint(x,y,0.09)),color,this.scale*(i%3===0?0.32:0.19));
        [trace[0],trace[trace.length-1]].forEach(([x,y])=>{
          this._planeCircle(x,y,this._deflect(x,y)+0.1,0.6,'#a49361','#d1c895',0.4);
        });
      });
      for(let i=0;i<8;i++) {
        const y=-12+i*3;
        this._poly([[-40,y],[-36,y],[-36,y+1.5],[-40,y+1.5]].map(p=>this._boardPoint(...p,0.12)),'#bba66b');
      }
    }

    _drawMounts() {
      MOUNTS.forEach(([x,y])=>{
        const z=this._deflect(x,y)+0.2;
        this._planeCircle(x,y,z,4.1,'rgba(6,17,12,.5)','#91a07a',0.8);
        this._planeCircle(x,y,z+0.03,3.2,'#aa9c65','#d2c58a',0.8);
        this._planeCircle(x,y,z+0.05,1.9,'#12271e','#5e7051',0.6);
        this._line([this._project(x-4.8,y,z),this._project(x-6.2,y,z)],'#a8b091',0.6);
        this._line([this._project(x+4.8,y,z),this._project(x+6.2,y,z)],'#a8b091',0.6);
        this._line([this._project(x,y-4.8,z),this._project(x,y-6.2,z)],'#a8b091',0.6);
        this._line([this._project(x,y+4.8,z),this._project(x,y+6.2,z)],'#a8b091',0.6);
      });
    }

    _drawSilkscreen() {
      const ctx=this.ctx;
      const p=this._project(-26,36,this._deflect(-26,36)+0.15);
      const q=this._project(5,36,this._deflect(5,36)+0.15);
      ctx.save();ctx.translate(...p);ctx.rotate(Math.atan2(q[1]-p[1],q[0]-p[0]));
      ctx.font=`500 ${Math.max(7,this.scale*1.7)}px ui-monospace,monospace`;
      ctx.letterSpacing='1px';ctx.fillStyle='rgba(224,232,204,.64)';
      ctx.fillText('HP / RESEARCH 01',0,0);ctx.restore();
      [[-18,-15,10,9],[19,-8,8,8],[-4,8,10,13]].forEach(([x,y,w,h])=>{
        this._line([[x-w,y-h],[x+w,y-h],[x+w,y+h],[x-w,y+h],[x-w,y-h]].map(p=>this._boardPoint(...p,0.15)),'rgba(213,225,196,.27)',0.7);
      });
    }

    _box(x,y,w,d,h,top,side,edge,base=0) {
      const z=this._deflect(x,y)+base;
      const corners=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([a,b])=>[x+a,y+b]);
      const bot=corners.map(p=>this._project(...p,z));
      const upper=corners.map(p=>this._project(...p,z+h));
      const sides=[0,1,2,3].sort((a,b)=>this._depth(...corners[a])-this._depth(...corners[b]));
      sides.forEach(i=>{const j=(i+1)%4;this._poly([bot[i],bot[j],upper[j],upper[i]],side,edge,0.55);});
      this._poly(upper,top,edge,0.7);
      if(this.mode==='mesh') {
        this._line([upper[0],upper[2]],'rgba(221,232,204,.35)',0.6);
        this._line([upper[1],upper[3]],'rgba(221,232,204,.25)',0.6);
      }
      return {corners,upper,z};
    }

    _drawParts() {
      const pieces=[
        {x:-18,y:-15,draw:()=>this._disc('vdr',9.2,2.7,17)},
        {x:19,y:-8,draw:()=>this._disc('capacitor',6.7,2.4,12)},
        {x:-4,y:8,draw:()=>this._chip(-4,8,13,15,3.8)},
        {x:19,y:16,draw:()=>this._chip(19,16,8,10,2.6)},
        {x:-25,y:17,draw:()=>this._box(-25,17,7,10,8,'#c6c7a8','#818b73','#d0d4b8')},
        {x:7,y:-27,draw:()=>this._box(7,-27,13,8,8.5,'#858d75','#465649','#a1ab8b')},
        {x:-34,y:5,draw:()=>this._box(-34,5,5,20,5.2,'#242d26','#18261e','#76856b')},
        {x:29,y:4,draw:()=>this._box(29,4,6,10,3,'#aaa180','#616e57','#b6b28f')}
      ];
      [[-17,11],[-17,16],[-12,-6],[4,-9],[10,21],[14,25],[23,-26],[-25,-3]].forEach(([x,y],i)=>{
        pieces.push({x,y,draw:()=>{
          this._box(x,y,4.6,2.1,1.5,i%2?'#9a9d80':'#ddd4a6','#7d836b','#b0b496');
          this._box(x-1.8,y,0.8,2.1,1.6,'#bac4b4','#939d90','#d2d7c0');
          this._box(x+1.8,y,0.8,2.1,1.6,'#bac4b4','#939d90','#d2d7c0');
        }});
      });
      pieces.sort((a,b)=>this._depth(a.x,a.y)-this._depth(b.x,b.y));
      pieces.forEach(part=>part.draw());
    }

    _chip(x,y,w,d,h) {
      for(let i=0;i<6;i++) {
        const py=y-d*0.39+i*d*0.155;
        this._box(x-w/2-1,py,2.8,0.85,0.7,'#abb5a1','#667968','#bdc7b1');
        this._box(x+w/2+1,py,2.8,0.85,0.7,'#abb5a1','#667968','#bdc7b1');
      }
      const box=this._box(x,y,w,d,h,this.mode==='mesh'?'#2c3a31':'#26342b','#18271f','#788773');
      const p=this._project(x-w*0.3,y-d*0.25,box.z+h+0.03);
      this.ctx.beginPath();this.ctx.arc(p[0],p[1],Math.max(1,this.scale*0.45),0,TAU);this.ctx.fillStyle='#b3c19f';this.ctx.fill();
      this._line([this._project(x-w*0.27,y+1,box.z+h+0.03),this._project(x+w*0.27,y+1,box.z+h+0.03)],'#778570',0.7);
      this._line([this._project(x-w*0.27,y+2.4,box.z+h+0.03),this._project(x+w*0.12,y+2.4,box.z+h+0.03)],'#586e58',0.7);
    }

    _disc(id,radius,thickness,centerHeight) {
      const part=PARTS[id],ctx=this.ctx;
      const base=this._deflect(part.x,part.y);
      const selected=this.selection===id;
      const wobble=this.mode==='vibration'&&selected?Math.sin(this.time*3.1)*clamp(Math.log1p(this._amplification())/2.8,0.1,1.8)*1.5:0;
      [-radius*0.45,radius*0.45].forEach(dx=>{
        const bottom=this._project(part.x+dx,part.y,base+0.2);
        const middle=this._project(part.x+dx,part.y,base+centerHeight-radius+1);
        const top=this._project(part.x+dx+wobble,part.y,base+centerHeight-radius*0.55);
        this._line([bottom,middle,top],'#a6b6a2',Math.max(1,this.scale*0.38));
        this._planeCircle(part.x+dx,part.y,base+0.18,1.5,'#acaa77','#d0c88d',0.5);
      });
      const ring=(dy,r=radius)=>Array.from({length:49},(_,i)=>{
        const a=i/48*TAU;
        return this._project(part.x+Math.cos(a)*r+wobble,part.y+dy,base+centerHeight+Math.sin(a)*r);
      });
      const front=ring(thickness/2),back=ring(-thickness/2);
      const backColor=id==='vdr'?'#845b36':'#4c8287';
      const edgeColor=id==='vdr'?'#edb27c':'#bed9d7';
      this._poly(back,backColor,edgeColor,0.6);
      for(let i=0;i<48;i++) this._poly([back[i],back[i+1],front[i+1],front[i]],backColor);
      const center=this._project(part.x+wobble,part.y+thickness/2,base+centerHeight);
      const grad=ctx.createLinearGradient(center[0]-radius*this.scale,center[1]-radius*this.scale,center[0]+radius*this.scale,center[1]+radius*this.scale);
      if(id==='vdr'){grad.addColorStop(0,'#f4b779');grad.addColorStop(0.5,'#d98549');grad.addColorStop(1,'#ae6339');}
      else{grad.addColorStop(0,'#c1dddd');grad.addColorStop(0.55,'#90b9c0');grad.addColorStop(1,'#5d929a');}
      this._poly(front,this.mode==='mesh'?backColor:grad,edgeColor,1);
      if(this.mode==='mesh') {
        for(let i=0;i<48;i+=6) this._line([center,front[i]],'rgba(230,239,209,.5)',0.6);
        this._poly(ring(thickness/2+0.01,radius*0.6),null,'rgba(230,239,209,.4)',0.6);
      }
      const label=this._project(part.x+wobble,part.y+thickness/2+0.03,base+centerHeight+0.7);
      ctx.save();ctx.fillStyle=id==='vdr'?'rgba(74,40,22,.72)':'rgba(24,68,70,.72)';
      ctx.font=`600 ${Math.max(7,this.scale*2.0)}px ui-monospace,monospace`;ctx.textAlign='center';
      ctx.fillText(part.name,label[0],label[1]);
      ctx.font=`400 ${Math.max(5,this.scale*1.2)}px ui-monospace,monospace`;
      ctx.fillText(id==='vdr'?'MOV':'CERAMIC',label[0],label[1]+this.scale*2.3);ctx.restore();
    }

    _drawSelection() {
      const part=PARTS[this.hover||this.selection],ctx=this.ctx;
      const z=this._deflect(part.x,part.y)+0.35;
      const radius=(this.hover||this.selection)==='board'?17:12.3;
      this._planeCircle(part.x,part.y,z,radius,null,'rgba(230,184,128,.66)',0.9);
      this._planeCircle(part.x,part.y,z,radius+1.6,null,'rgba(230,184,128,.16)',0.65);
      const p=this._project(part.x,part.y,z+((this.hover||this.selection)==='vdr'?29:(this.hover||this.selection)==='capacitor'?22:5));
      const tail=[p[0]+this.scale*7,p[1]-this.scale*5];
      this._line([p,tail,[tail[0]+this.scale*9,tail[1]]],'rgba(221,227,207,.55)',0.7);
      ctx.beginPath();ctx.arc(p[0],p[1],2,0,TAU);ctx.fillStyle='#ead7ac';ctx.fill();
      ctx.font=`500 ${Math.max(8,this.scale*1.75)}px ui-monospace,monospace`;
      ctx.fillStyle='rgba(226,232,211,.85)';ctx.fillText(part.name,tail[0]+this.scale*1,tail[1]-5);
      if(this.mode==='vibration') {
        const px=this.width-24,py=this.height*0.43;
        this._line([[px,py-32],[px,py+32]],'rgba(204,218,186,.20)',0.65);
        const points=[];
        const a=clamp(this._amplification()/20,0.12,1);
        for(let i=0;i<=55;i++) points.push([px+Math.sin(i/55*TAU*2.2-this.time*3.1)*7*a,py-32+i/55*64]);
        this._line(points,'rgba(218,179,123,.75)',1);
      }
    }

    _drawAxes() {
      const ctx=this.ctx;
      const x=25,y=this.height-27,l=16;
      const c=Math.cos(this.yaw),s=Math.sin(this.yaw),p=Math.cos(this.pitch);
      const axes=[{dx:c*l,dy:s*p*l,label:'x'},{dx:-s*l,dy:c*p*l,label:'y'},{dx:0,dy:-l,label:'z'}];
      axes.forEach((a,i)=>{
        this._line([[x,y],[x+a.dx,y+a.dy]],i===2?'rgba(220,168,111,.7)':'rgba(190,207,175,.55)',0.9);
        ctx.font='9px ui-monospace,monospace';ctx.fillStyle='rgba(203,216,188,.62)';
        ctx.fillText(a.label,x+a.dx+3,y+a.dy+3);
      });
      ctx.fillStyle='rgba(187,204,172,.35)';ctx.font='8px ui-monospace,monospace';ctx.textAlign='right';
      ctx.fillText('81.83 × 82.00 mm',this.width-21,this.height-22);ctx.textAlign='start';
    }
  }

  window.PCBLab=PCBLab;
})();
