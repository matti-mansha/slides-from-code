'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   EDITOR SCRIPT — injected into the slide iframe when design mode is active.
   Enables: hover highlight, click-to-select, drag-to-move (translate),
   corner resize handles, reporting element properties via postMessage.
───────────────────────────────────────────────────────────────────────────── */
const EDITOR_SCRIPT = `
<style data-sfc="1">
  *[data-sfc-h]{outline:2px dashed rgba(99,102,241,.55)!important;outline-offset:2px!important;cursor:pointer!important;}
  *[data-sfc-s]{outline:2px solid #6366f1!important;outline-offset:2px!important;}
</style>
<script data-sfc="1">(function(){
  if(window.__sfc)return; window.__sfc=true;

  var sel=null, drag=null, ovl=null;

  /* ── overlay ── */
  ovl=document.createElement('div');
  ovl.setAttribute('data-sfc','1');
  ovl.style.cssText='position:fixed;inset:0;z-index:2147483647;pointer-events:none;';
  document.body.appendChild(ovl);

  function R(el){return el.getBoundingClientRect();}

  /* ── handles ── */
  function mkH(l,t,cur,id){
    return '<div data-h="'+id+'" style="position:absolute;left:'+l+'px;top:'+t+'px;'+
           'width:10px;height:10px;background:#6366f1;border:1.5px solid #fff;border-radius:2px;'+
           'cursor:'+cur+';pointer-events:all;transform:translate(-50%,-50%);box-sizing:border-box;"></div>';
  }

  function drawOverlay(){
    if(!sel){ovl.innerHTML='';return;}
    var r=R(sel);
    var l=r.left,t=r.top,w=r.width,h=r.height;
    var html='<div style="position:absolute;left:'+l+'px;top:'+t+'px;width:'+w+'px;height:'+h+'px;'+
             'border:2px solid #6366f1;box-sizing:border-box;pointer-events:none;">';
    html+=mkH(0,0,'nwse-resize','tl');
    html+=mkH(w/2,0,'n-resize','tm');
    html+=mkH(w,0,'nesw-resize','tr');
    html+=mkH(w,h/2,'e-resize','mr');
    html+=mkH(w,h,'nwse-resize','br');
    html+=mkH(w/2,h,'s-resize','bm');
    html+=mkH(0,h,'nesw-resize','bl');
    html+=mkH(0,h/2,'w-resize','ml');
    // Move badge
    html+='<div data-h="mv" style="position:absolute;left:50%;top:-22px;transform:translateX(-50%);'+
          'background:#6366f1;color:#fff;font:600 10px/1 system-ui;padding:4px 10px;border-radius:4px;'+
          'cursor:move;pointer-events:all;white-space:nowrap;">&uarr;&darr;&larr;&rarr; '+sel.tagName.toLowerCase()+'</div>';
    html+='</div>';
    ovl.innerHTML=html;
    ovl.querySelectorAll('[data-h]').forEach(function(h){h.addEventListener('mousedown',startDrag);});
  }

  /* ── rgb→hex ── */
  function toHex(c){
    if(!c||c==='transparent'||c==='rgba(0,0,0,0)'||c==='rgba(0, 0, 0, 0)')return '';
    var m=c.match(/\\d+/g);
    if(!m||m.length<3)return '';
    return '#'+[m[0],m[1],m[2]].map(function(v){return('0'+parseInt(v).toString(16)).slice(-2);}).join('');
  }

  /* ── report to parent ── */
  function report(){
    if(!sel){window.parent.postMessage({t:'none'},'*');return;}
    var cs=window.getComputedStyle(sel);
    var isText=sel.childNodes.length<=3 && Array.from(sel.childNodes).every(function(n){return n.nodeType===3||n.tagName==='BR';});
    window.parent.postMessage({
      t:'sel',
      tag:sel.tagName.toLowerCase(),
      text: isText ? sel.innerText.trim() : '',
      hasText: isText,
      s:{
        color:    toHex(cs.color)||'#000000',
        bg:       toHex(cs.backgroundColor)||'',
        fs:       parseFloat(cs.fontSize)||16,
        fw:       cs.fontWeight,
        ta:       cs.textAlign,
        ls:       parseFloat(cs.letterSpacing)||0,
        lh:       parseFloat(cs.lineHeight)||1.5,
        br:       parseFloat(cs.borderRadius)||0,
        op:       parseFloat(cs.opacity)||1,
        tr:       sel.style.transform||'',
        w:        sel.style.width||'',
        h:        sel.style.height||'',
      }
    },'*');
  }

  /* ── emit clean HTML back ── */
  function emit(){
    var clone=document.cloneNode(true);
    clone.querySelectorAll('[data-sfc]').forEach(function(el){el.remove();});
    clone.querySelectorAll('[data-sfc-h]').forEach(function(el){el.removeAttribute('data-sfc-h');});
    clone.querySelectorAll('[data-sfc-s]').forEach(function(el){el.removeAttribute('data-sfc-s');});
    window.parent.postMessage({t:'html',html:'<!doctype html>'+clone.documentElement.outerHTML},'*');
    report();
  }

  /* ── hover ── */
  var hov=null;
  document.addEventListener('mouseover',function(e){
    if(drag)return;
    var el=e.target;
    if(el===document.body||el===document.documentElement||el.closest('[data-sfc]'))return;
    if(hov)hov.removeAttribute('data-sfc-h');
    hov=el; hov.setAttribute('data-sfc-h','');
  },true);
  document.addEventListener('mouseout',function(e){
    var el=e.target;
    if(el===hov){el.removeAttribute('data-sfc-h');hov=null;}
  },true);

  /* ── click to select ── */
  document.addEventListener('click',function(e){
    if(e.target.closest('[data-sfc]'))return;
    e.preventDefault();e.stopPropagation();
    if(sel)sel.removeAttribute('data-sfc-s');
    if(sel===e.target){sel=null;drawOverlay();report();return;}
    sel=e.target;sel.setAttribute('data-sfc-s','');
    drawOverlay();report();
  },true);

  /* ── drag ── */
  function startDrag(e){
    e.preventDefault();e.stopPropagation();
    if(!sel)return;
    var hid=e.currentTarget.getAttribute('data-h');
    var r=R(sel);
    /* parse current translate */
    var tx=0,ty=0;
    var tm=sel.style.transform.match(/translate\(([^,]+)px,([^)]+)px\)/);
    if(tm){tx=parseFloat(tm[1]);ty=parseFloat(tm[2]);}
    drag={hid:hid,sx:e.clientX,sy:e.clientY,tx:tx,ty:ty,ow:r.width,oh:r.height};
    ovl.style.pointerEvents='all';
    window.addEventListener('mousemove',onDrag);
    window.addEventListener('mouseup',endDrag);
  }

  function onDrag(e){
    if(!drag||!sel)return;
    var dx=e.clientX-drag.sx, dy=e.clientY-drag.sy;
    var h=drag.hid;
    if(h==='mv'){
      sel.style.transform='translate('+(drag.tx+dx)+'px,'+(drag.ty+dy)+'px)';
    } else {
      /* resize: adjust width/height and offset */
      var nw=drag.ow, nh=drag.oh, ntx=drag.tx, nty=drag.ty;
      if(h.includes('r')){nw=Math.max(20,drag.ow+dx);}
      if(h.includes('l')){nw=Math.max(20,drag.ow-dx);ntx=drag.tx+dx;}
      if(h.includes('b')){nh=Math.max(10,drag.oh+dy);}
      if(h==='tm'){nh=Math.max(10,drag.oh-dy);nty=drag.ty+dy;}
      if(nw!==drag.ow)sel.style.width=nw+'px';
      if(nh!==drag.oh)sel.style.height=nh+'px';
      sel.style.transform='translate('+ntx+'px,'+nty+'px)';
    }
    drawOverlay();
  }

  function endDrag(){
    ovl.style.pointerEvents='none';
    window.removeEventListener('mousemove',onDrag);
    window.removeEventListener('mouseup',endDrag);
    drag=null;emit();
  }

  /* ── receive commands from parent ── */
  window.addEventListener('message',function(e){
    var d=e.data;if(!d)return;
    if(d.t==='style'&&sel){sel.style[d.p]=d.v;drawOverlay();emit();}
    if(d.t==='text'&&sel){sel.innerText=d.v;drawOverlay();emit();}
    if(d.t==='desel'){if(sel)sel.removeAttribute('data-sfc-s');sel=null;drawOverlay();report();}
    if(d.t==='ping'){report();}
  });

  window.addEventListener('resize',drawOverlay);
  window.addEventListener('scroll',drawOverlay,true);
})()\u003c/script>`;

// Inject editor script into slide HTML
function injectEditor(html) {
  const script = EDITOR_SCRIPT;
  if (html.includes('</body>')) return html.replace('</body>', script + '</body>');
  if (html.includes('</html>')) return html.replace('</html>', script + '</html>');
  return html + script;
}

// ─── Helper: rgb string → hex ────────────────────────────────────────────────
function rgbToHex(rgb) {
  if (!rgb || rgb === 'transparent') return '';
  const m = rgb.match(/\d+/g);
  if (!m || m.length < 3) return '';
  return '#' + [m[0], m[1], m[2]].map(v => ('0' + parseInt(v).toString(16)).slice(-2)).join('');
}

// ─── Zoom helpers ─────────────────────────────────────────────────────────────
const ZOOM_STEPS = [25, 50, 75, 100, 125, 150, 200];
const SLIDE_NATURAL_W = 1280;

// ─── Property Row ─────────────────────────────────────────────────────────────
function PropRow({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 5 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CanvasEditor({ code, onChange, slideIndex, totalSlides, onPrev, onNext, onDesignModeToggle }) {
  const iframeRef = useRef(null);
  const stageRef = useRef(null);
  const [stageW, setStageW] = useState(0);
  const [stageH, setStageH] = useState(0);
  const [zoom, setZoom] = useState('fit');
  const [selected, setSelected] = useState(null); // { tag, text, hasText, s:{...} }

  // Observe container for fit zoom
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      setStageW(entry.contentRect.width);
      setStageH(entry.contentRect.height);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Derived frame size
  const fitPct = stageW > 0
    ? Math.min((stageW - 32) / SLIDE_NATURAL_W, (stageH - 32) / (SLIDE_NATURAL_W * 9 / 16)) * 100
    : 100;
  const zoomPct = zoom === 'fit' ? fitPct : zoom;
  const frameW = SLIDE_NATURAL_W * zoomPct / 100;
  const frameH = frameW * 9 / 16;

  // Listen for messages from the injected iframe script
  useEffect(() => {
    function onMsg(e) {
      const d = e.data;
      if (!d?.t) return;
      if (d.t === 'sel') setSelected(d);
      if (d.t === 'none') setSelected(null);
      if (d.t === 'html') onChange(d.html);
    }
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [onChange]);

  // Send command to iframe
  const send = useCallback((msg) => {
    iframeRef.current?.contentWindow?.postMessage(msg, '*');
  }, []);

  function setStyle(prop, val) { send({ t: 'style', p: prop, v: val }); }
  function setText(val)        { send({ t: 'text',  v: val }); }
  function deselect()          { send({ t: 'desel' }); setSelected(null); }

  function zoomIn() {
    const cur = zoom === 'fit' ? fitPct : zoom;
    const next = ZOOM_STEPS.find(z => z > cur);
    if (next) setZoom(next);
  }
  function zoomOut() {
    const cur = zoom === 'fit' ? fitPct : zoom;
    const next = [...ZOOM_STEPS].reverse().find(z => z < cur);
    if (next) setZoom(next);
  }

  const instrumentedCode = injectEditor(code);

  const s = selected?.s;

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0, minHeight: 0, flexDirection: 'column' }}>

      {/* ── Toolbar ── */}
      <div className="preview-toolbar">
        <button
          className="btn btn-accent btn-sm"
          onClick={onDesignModeToggle}
          title="Exit design mode"
          style={{ gap: 5, fontWeight: 700 }}
        >
          ✦ Design
        </button>

        {/* Zoom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={zoomOut} style={{ fontSize: 15, fontWeight: 700 }}>−</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setZoom('fit')} style={{ minWidth: 46, fontSize: 11 }}>
            {zoom === 'fit' ? 'Fit' : `${zoom}%`}
          </button>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={zoomIn} style={{ fontSize: 15, fontWeight: 700 }}>+</button>
        </div>

        {/* Slide nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onPrev}>‹</button>
          <span style={{ fontSize: 11, color: 'var(--muted)', minWidth: 46, textAlign: 'center' }}>
            {slideIndex + 1} / {totalSlides}
          </span>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onNext}>›</button>
        </div>

        <span style={{ fontSize: 10, color: 'var(--muted)', flex: 1, textAlign: 'right' }}>
          Click to select · Drag ⠿ to move · Drag handles to resize
        </span>
      </div>

      {/* ── Canvas + Properties ── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* Canvas stage */}
        <div
          ref={stageRef}
          style={{
            flex: 1,
            minWidth: 0,
            overflow: zoom !== 'fit' ? 'auto' : 'hidden',
            display: 'flex',
            alignItems: zoom !== 'fit' ? 'flex-start' : 'center',
            justifyContent: zoom !== 'fit' ? 'flex-start' : 'center',
            padding: 16,
            background: 'repeating-linear-gradient(45deg, var(--surface) 0, var(--surface) 10px, var(--bg) 10px, var(--bg) 20px)',
          }}
          onClick={e => { if (e.target === e.currentTarget) deselect(); }}
        >
          <div style={{ flexShrink: 0, position: 'relative' }}>
            <iframe
              ref={iframeRef}
              title="design-canvas"
              sandbox="allow-scripts allow-same-origin"
              srcDoc={instrumentedCode}
              style={{ width: frameW, height: frameH, border: 'none', display: 'block', background: '#fff' }}
            />
          </div>
        </div>

        {/* ── Properties Panel ── */}
        <div style={{
          width: selected ? 240 : 0,
          minWidth: 0,
          overflow: 'hidden',
          transition: 'width 0.2s ease',
          borderLeft: selected ? '1px solid var(--border)' : 'none',
          background: 'var(--surface)',
          flexShrink: 0,
        }}>
          {selected && (
            <div style={{ width: 240, height: '100%', overflow: 'auto', padding: '14px 14px' }}>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, background: 'var(--accent-bg)',
                    color: 'var(--accent-light)', padding: '3px 8px', borderRadius: 4,
                    border: '1px solid var(--accent-dark)', fontFamily: 'var(--mono)',
                  }}>
                    &lt;{selected.tag}&gt;
                  </span>
                </div>
                <button
                  className="btn btn-ghost btn-icon"
                  style={{ width: 22, height: 22, fontSize: 12, padding: 0 }}
                  onClick={deselect}
                  title="Deselect (click canvas bg)"
                >✕</button>
              </div>

              {/* Text content */}
              {selected.hasText && (
                <PropRow label="Text">
                  <textarea
                    style={{
                      width: '100%', minHeight: 56, borderRadius: 6,
                      background: 'var(--surface-2)', border: '1px solid var(--border)',
                      color: 'var(--text)', padding: '6px 8px', fontSize: 12,
                      fontFamily: 'var(--font)', resize: 'vertical', outline: 'none',
                    }}
                    value={selected.text}
                    onChange={e => {
                      setSelected(prev => ({ ...prev, text: e.target.value }));
                      setText(e.target.value);
                    }}
                  />
                </PropRow>
              )}

              {/* Colors */}
              <PropRow label="Colors">
                <div style={{ display: 'flex', gap: 8 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', flex: 1 }}>
                    <div style={{
                      width: '100%', height: 30, borderRadius: 5, border: '1px solid var(--border)',
                      background: s?.color || '#000', cursor: 'pointer', position: 'relative', overflow: 'hidden',
                    }}>
                      <input
                        type="color" value={s?.color || '#000000'}
                        onChange={e => {
                          setSelected(prev => ({ ...prev, s: { ...prev.s, color: e.target.value } }));
                          setStyle('color', e.target.value);
                        }}
                        style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                      />
                    </div>
                    <span style={{ fontSize: 9, color: 'var(--muted)' }}>Text</span>
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', flex: 1 }}>
                    <div style={{
                      width: '100%', height: 30, borderRadius: 5, border: '1px solid var(--border)',
                      background: s?.bg || 'transparent',
                      backgroundImage: !s?.bg ? 'repeating-linear-gradient(45deg, #ccc 0,#ccc 2px,transparent 2px,transparent 8px)' : 'none',
                      cursor: 'pointer', position: 'relative', overflow: 'hidden',
                    }}>
                      <input
                        type="color" value={s?.bg || '#ffffff'}
                        onChange={e => {
                          setSelected(prev => ({ ...prev, s: { ...prev.s, bg: e.target.value } }));
                          setStyle('backgroundColor', e.target.value);
                        }}
                        style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                      />
                    </div>
                    <span style={{ fontSize: 9, color: 'var(--muted)' }}>Fill</span>
                  </label>
                </div>
              </PropRow>

              {/* Font size */}
              <PropRow label="Font Size">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="range" min={8} max={120} value={s?.fs || 16}
                    onChange={e => {
                      const v = +e.target.value;
                      setSelected(prev => ({ ...prev, s: { ...prev.s, fs: v } }));
                      setStyle('fontSize', v + 'px');
                    }}
                    style={{ flex: 1, accentColor: 'var(--accent)' }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-2)', minWidth: 28, textAlign: 'right' }}>
                    {Math.round(s?.fs || 16)}
                  </span>
                </div>
              </PropRow>

              {/* Font weight */}
              <PropRow label="Weight & Align">
                <div style={{ display: 'flex', gap: 4 }}>
                  {[['400', 'Normal'], ['600', 'Semi'], ['700', 'Bold'], ['900', 'Black']].map(([w, label]) => (
                    <button
                      key={w}
                      className={`btn btn-sm ${(s?.fw || '400') === w || (w === '700' && s?.fw === 'bold') ? 'btn-accent' : 'btn-ghost'}`}
                      style={{ flex: 1, padding: '4px 2px', fontSize: 10 }}
                      onClick={() => {
                        setSelected(prev => ({ ...prev, s: { ...prev.s, fw: w } }));
                        setStyle('fontWeight', w);
                      }}
                    >{label}</button>
                  ))}
                </div>

                {/* Text align */}
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  {[['left', '⬅'], ['center', '↔'], ['right', '➡'], ['justify', '⇔']].map(([ta, icon]) => (
                    <button
                      key={ta}
                      className={`btn btn-sm btn-icon ${s?.ta === ta ? 'btn-accent' : 'btn-ghost'}`}
                      style={{ flex: 1, fontSize: 11 }}
                      onClick={() => {
                        setSelected(prev => ({ ...prev, s: { ...prev.s, ta } }));
                        setStyle('textAlign', ta);
                      }}
                    >{icon}</button>
                  ))}
                </div>
              </PropRow>

              {/* Letter spacing */}
              <PropRow label="Letter Spacing">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="range" min={-5} max={20} step={0.5} value={s?.ls || 0}
                    onChange={e => {
                      const v = +e.target.value;
                      setSelected(prev => ({ ...prev, s: { ...prev.s, ls: v } }));
                      setStyle('letterSpacing', v + 'px');
                    }}
                    style={{ flex: 1, accentColor: 'var(--accent)' }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-2)', minWidth: 28, textAlign: 'right' }}>
                    {(s?.ls || 0).toFixed(1)}
                  </span>
                </div>
              </PropRow>

              {/* Opacity */}
              <PropRow label="Opacity">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="range" min={0} max={1} step={0.01} value={s?.op ?? 1}
                    onChange={e => {
                      const v = +e.target.value;
                      setSelected(prev => ({ ...prev, s: { ...prev.s, op: v } }));
                      setStyle('opacity', v);
                    }}
                    style={{ flex: 1, accentColor: 'var(--accent)' }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-2)', minWidth: 28, textAlign: 'right' }}>
                    {Math.round((s?.op ?? 1) * 100)}%
                  </span>
                </div>
              </PropRow>

              {/* Border radius */}
              <PropRow label="Border Radius">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="range" min={0} max={100} value={s?.br || 0}
                    onChange={e => {
                      const v = +e.target.value;
                      setSelected(prev => ({ ...prev, s: { ...prev.s, br: v } }));
                      setStyle('borderRadius', v + 'px');
                    }}
                    style={{ flex: 1, accentColor: 'var(--accent)' }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-2)', minWidth: 28, textAlign: 'right' }}>
                    {s?.br || 0}px
                  </span>
                </div>
              </PropRow>

              {/* Computed size (read-only) */}
              {(s?.w || s?.h) && (
                <PropRow label="Size">
                  <div style={{ display: 'flex', gap: 8 }}>
                    {s.w && (
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 3 }}>W</div>
                        <div style={{ fontSize: 12, color: 'var(--text-2)', fontFamily: 'var(--mono)' }}>{s.w}</div>
                      </div>
                    )}
                    {s.h && (
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 3 }}>H</div>
                        <div style={{ fontSize: 12, color: 'var(--text-2)', fontFamily: 'var(--mono)' }}>{s.h}</div>
                      </div>
                    )}
                  </div>
                </PropRow>
              )}

              {/* Reset transform */}
              {s?.tr && (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', fontSize: 11, marginTop: 4 }}
                  onClick={() => {
                    setSelected(prev => ({ ...prev, s: { ...prev.s, tr: '' } }));
                    setStyle('transform', '');
                  }}
                >
                  Reset Position
                </button>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
