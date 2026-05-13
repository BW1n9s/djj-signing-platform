// sig-pad.jsx — touch + Apple Pencil signature pad backed by a single canvas.
// Returns clear() / isEmpty() / toDataURL() via a ref. Exposes both Chinese
// and English bilingual labels for the controls.

const { useEffect, useRef, useImperativeHandle, forwardRef, useState, useCallback } = React;

const SigPad = forwardRef(function SigPad({ height = 200, label = '', zhLabel = '', lang = 'en', onChange }, fwdRef) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0, t: 0 });
  const [empty, setEmpty] = useState(true);

  // Fit canvas to its container at device pixel ratio for crisp strokes.
  const fit = useCallback(() => {
    const c = canvasRef.current; const w = wrapRef.current;
    if (!c || !w) return;
    const r = w.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    // Preserve existing strokes when resizing
    const old = document.createElement('canvas');
    old.width = c.width; old.height = c.height;
    old.getContext('2d').drawImage(c, 0, 0);
    c.width  = Math.round(r.width * dpr);
    c.height = Math.round(r.height * dpr);
    c.style.width  = r.width + 'px';
    c.style.height = r.height + 'px';
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0d1b2a';
    if (old.width && old.height) {
      ctx.drawImage(old, 0, 0, old.width / dpr, old.height / dpr);
    }
  }, []);

  useEffect(() => {
    fit();
    const ro = new ResizeObserver(fit);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [fit]);

  const point = (e) => {
    const c = canvasRef.current;
    const r = c.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, p: e.pressure || 0.5 };
  };

  const begin = (e) => {
    e.preventDefault();
    canvasRef.current.setPointerCapture?.(e.pointerId);
    drawing.current = true;
    const p = point(e);
    last.current = { ...p, t: performance.now() };
    // dot for a single tap
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#0d1b2a';
    ctx.fill();
    if (empty) { setEmpty(false); onChange && onChange(false); }
  };
  const move = (e) => {
    if (!drawing.current) return;
    const p = point(e);
    const ctx = canvasRef.current.getContext('2d');
    // Variable width: 1.4–3.0 px based on pressure (or speed fallback)
    const pressure = e.pointerType === 'pen' ? (e.pressure || 0.5) : 0.55;
    const w = 1.2 + pressure * 1.8;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    // Quadratic smoothing
    const mx = (last.current.x + p.x) / 2;
    const my = (last.current.y + p.y) / 2;
    ctx.quadraticCurveTo(last.current.x, last.current.y, mx, my);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = { ...p, t: performance.now() };
  };
  const end = () => { drawing.current = false; };

  useImperativeHandle(fwdRef, () => ({
    clear() {
      const c = canvasRef.current;
      const ctx = c.getContext('2d');
      ctx.save(); ctx.setTransform(1,0,0,1,0,0);
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.restore();
      setEmpty(true);
      onChange && onChange(true);
    },
    isEmpty() { return empty; },
    drawDataURL(dataUrl) {
      const img = new window.Image();
      img.onload = () => {
        const c = canvasRef.current;
        if (!c) return;
        const ctx = c.getContext('2d');
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.restore();
        ctx.drawImage(img, 0, 0, c.width / dpr, c.height / dpr);
        setEmpty(false);
        onChange && onChange(false);
      };
      img.src = dataUrl;
    },
    toDataURL() {
      // Composite onto a white background for safer PDF embedding
      const c = canvasRef.current;
      const out = document.createElement('canvas');
      out.width = c.width; out.height = c.height;
      const ox = out.getContext('2d');
      ox.fillStyle = '#ffffff';
      ox.fillRect(0, 0, out.width, out.height);
      ox.drawImage(c, 0, 0);
      return out.toDataURL('image/png');
    },
  }), [empty, onChange]);

  return (
    <div style={{ width: '100%' }}>
      {(label || zhLabel) && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          fontSize: 11, color: 'var(--muted)', marginBottom: 6,
          fontFamily: 'JetBrains Mono, monospace', letterSpacing: 0.4,
        }}>
          <span>{lang === 'zh' ? (zhLabel || label) : label}</span>
          <span style={{ color: empty ? 'var(--required)' : 'var(--ok)' }}>
            {empty ? (lang === 'zh' ? '待签字' : 'AWAITING') : (lang === 'zh' ? '已签字' : 'SIGNED')}
          </span>
        </div>
      )}
      <div
        ref={wrapRef}
        style={{
          position: 'relative',
          width: '100%', height,
          border: empty ? '1.5px dashed var(--required)' : '1.5px solid var(--ink)',
          background: '#fff',
          borderRadius: 6,
          touchAction: 'none',
          overflow: 'hidden',
        }}>
        <canvas
          ref={canvasRef}
          onPointerDown={begin}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          style={{ display: 'block', position: 'absolute', inset: 0, touchAction: 'none' }}
        />
        {empty && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#c8c5bd', fontStyle: 'italic', fontSize: 13,
            pointerEvents: 'none',
          }}>
            {lang === 'zh' ? '请在此处签字 · finger or Apple Pencil' : 'Sign here · finger or Apple Pencil'}
          </div>
        )}
        {/* Baseline guide */}
        <div style={{
          position: 'absolute', left: 16, right: 16, bottom: 22,
          borderTop: '1px dashed #d8d6cd', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', left: 16, bottom: 6,
          fontSize: 9, color: '#bcb9b0',
          fontFamily: 'JetBrains Mono, monospace',
        }}>×</div>
      </div>
    </div>
  );
});

window.SigPad = SigPad;
