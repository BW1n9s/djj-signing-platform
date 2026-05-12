// wf-components.jsx — Low-fi wireframe primitives (sketchy/paper vibe)
// Bilingual labels (中/EN). One red accent for signature/CTA hotspots.

const WF = {
  paper: '#fbfaf6',
  ink: '#1f1d18',
  ink2: '#3a3631',
  muted: '#8a857c',
  rule: '#cfc9bd',
  rule2: '#e3ddcf',
  red: '#c44a36',
  redSoft: '#fbe6e0',
  yellow: '#f6e090',
  blueTint: '#dde6ef',
  mono: '"JetBrains Mono","IBM Plex Mono",ui-monospace,monospace',
  hand: '"Kalam","Patrick Hand",cursive',
  body: '"Kalam","Patrick Hand",cursive',
};

// Sketchy striped placeholder for any "real content goes here" block.
function WFPlaceholder({ children, h = 80, label, mono = true, style = {} }) {
  return (
    <div style={{
      height: h,
      border: '1.5px dashed ' + WF.rule,
      borderRadius: 4,
      background: 'repeating-linear-gradient(135deg, transparent 0 6px, rgba(0,0,0,0.035) 6px 7px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: WF.muted,
      fontFamily: mono ? WF.mono : WF.body,
      fontSize: 11, lineHeight: 1.3, textAlign: 'center', padding: 8,
      ...style,
    }}>{children || label}</div>
  );
}

// One labeled field — "label · 标签 ______________"
function WFField({ label, zh, value, placeholder, w, prefilled = false, inline = false, style = {} }) {
  return (
    <div style={{
      display: inline ? 'inline-flex' : 'flex',
      flexDirection: inline ? 'row' : 'column',
      gap: inline ? 8 : 3,
      width: w, minWidth: 0,
      fontFamily: WF.body, fontSize: 13, color: WF.ink,
      alignItems: inline ? 'baseline' : 'stretch',
      ...style,
    }}>
      <div style={{ fontSize: 10.5, color: WF.muted, letterSpacing: 0.2, fontFamily: WF.mono, flexShrink: 0 }}>
        {label}{zh && <span style={{ marginLeft: 4 }}>· {zh}</span>}
      </div>
      <div style={{
        borderBottom: '1.2px ' + (prefilled ? 'solid' : 'dashed') + ' ' + (prefilled ? WF.ink2 : WF.rule),
        minHeight: 22, padding: '2px 4px 4px',
        color: value ? WF.ink : WF.muted,
        fontFamily: prefilled ? WF.mono : WF.body,
        fontSize: prefilled ? 12 : 14,
        background: prefilled ? 'rgba(246,224,144,0.18)' : 'transparent',
        flex: 1,
      }}>{value || placeholder || '\u00a0'}</div>
    </div>
  );
}

// Small handwritten annotation tag w/ arrow (callout from a design element)
function WFNote({ children, color = WF.red, top, left, right, bottom, rotate = -1.5, w = 130 }) {
  return (
    <div style={{
      position: 'absolute', top, left, right, bottom, width: w, zIndex: 4,
      transform: `rotate(${rotate}deg)`, pointerEvents: 'none',
      fontFamily: WF.hand, fontSize: 12, lineHeight: 1.2, color,
      background: 'rgba(255,255,255,0.85)', padding: '4px 6px',
      borderRadius: 3,
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    }}>{children}</div>
  );
}

// Small chip / tag (e.g. lang switch, status)
function WFChip({ children, on, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 7px', borderRadius: 999,
      border: '1px solid ' + (on ? (color || WF.ink) : WF.rule),
      background: on ? (color || WF.ink) : 'transparent',
      color: on ? '#fff' : WF.ink2,
      fontFamily: WF.mono, fontSize: 10, letterSpacing: 0.3,
    }}>{children}</span>
  );
}

// Section divider — handlettered title
function WFRule({ children, color = WF.rule }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      fontFamily: WF.mono, fontSize: 10, color: WF.muted, letterSpacing: 0.4,
      margin: '14px 0 6px',
    }}>
      <span style={{ flexShrink: 0 }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: color }} />
    </div>
  );
}

// A "page" container that floats inside an iOS frame — mimics paper.
function WFPage({ children, style = {} }) {
  return (
    <div style={{
      flex: 1, overflow: 'auto',
      background: WF.paper,
      padding: '16px 18px 24px',
      fontFamily: WF.body, color: WF.ink,
      ...style,
    }}>{children}</div>
  );
}

// Sketchy signature box — empty or with a hand-drawn squiggle "signed" path
function WFSigBox({ signed = false, h = 96, label = 'Sign here · 此处签字', tint }) {
  return (
    <div style={{
      position: 'relative',
      height: h,
      border: '1.5px ' + (signed ? 'solid' : 'dashed') + ' ' + (signed ? WF.ink : WF.red),
      borderRadius: 4,
      background: tint || (signed ? '#fff' : WF.redSoft),
      display: 'flex', alignItems: signed ? 'center' : 'flex-end',
      justifyContent: signed ? 'flex-start' : 'space-between',
      padding: signed ? '0 12px' : '0 8px 6px',
    }}>
      {signed ? (
        <svg width="160" height="60" viewBox="0 0 160 60" style={{ overflow: 'visible' }}>
          <path d="M5 38 Q 18 8, 28 32 T 50 28 Q 62 12, 78 36 Q 88 50, 102 30 Q 116 12, 130 34 Q 140 48, 155 30"
            stroke={WF.ink} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M50 50 L120 50" stroke={WF.ink} strokeWidth="1.2" fill="none" opacity="0.4" />
        </svg>
      ) : (
        <>
          <span style={{ fontFamily: WF.hand, fontSize: 14, color: WF.red, opacity: 0.75 }}>{label}</span>
          <span style={{ fontFamily: WF.mono, fontSize: 9, color: WF.red, opacity: 0.6 }}>x ✎</span>
        </>
      )}
    </div>
  );
}

// "Branded" header you'd see at the top of every doc
function WFDocHeader({ doc, zh, subtitle, docRef, lang = 'EN' }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <img src="djjlogo.png" alt="DJJ Equipment" style={{ height: 22, width: 'auto', display: 'block' }} />
        <div style={{ display: 'flex', gap: 4 }}>
          <WFChip on={lang === 'EN'}>EN</WFChip>
          <WFChip on={lang === '中'}>中</WFChip>
        </div>
      </div>
      <div style={{ fontFamily: WF.hand, fontSize: 22, lineHeight: 1.05, fontWeight: 700, color: WF.ink }}>
        {doc}
      </div>
      {zh && <div style={{ fontFamily: WF.body, fontSize: 14, color: WF.ink2, marginTop: 1 }}>{zh}</div>}
      {subtitle && (
        <div style={{ fontFamily: WF.mono, fontSize: 10, color: WF.muted, marginTop: 4, letterSpacing: 0.2 }}>
          {subtitle}{docRef && <span style={{ marginLeft: 8 }}>· {docRef}</span>}
        </div>
      )}
    </div>
  );
}

// Sketchy button
function WFBtn({ children, primary, w, style = {} }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      height: 42, padding: '0 18px', width: w,
      borderRadius: 999,
      border: '1.5px solid ' + (primary ? WF.ink : WF.rule),
      background: primary ? WF.ink : 'transparent',
      color: primary ? WF.paper : WF.ink,
      fontFamily: WF.body, fontSize: 15, fontWeight: 700,
      letterSpacing: 0.1,
      ...style,
    }}>{children}</div>
  );
}

// Simulated table row (for dispatch form)
function WFTableRow({ cols, header, last }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: cols.map(c => c.w || '1fr').join(' '),
      gap: 6,
      padding: '7px 4px',
      borderBottom: last ? 'none' : '1px ' + (header ? 'solid' : 'dashed') + ' ' + WF.rule2,
      fontFamily: header ? WF.mono : WF.body,
      fontSize: header ? 9.5 : 13,
      letterSpacing: header ? 0.3 : 0,
      color: header ? WF.muted : WF.ink,
      textTransform: header ? 'uppercase' : 'none',
      alignItems: 'center',
    }}>
      {cols.map((c, i) => (
        <div key={i} style={{
          color: c.prefilled ? WF.ink : (c.value ? WF.ink : WF.muted),
          background: c.prefilled ? 'rgba(246,224,144,0.22)' : 'transparent',
          padding: c.prefilled ? '2px 4px' : 0,
          borderRadius: c.prefilled ? 2 : 0,
          fontFamily: c.prefilled ? WF.mono : (header ? WF.mono : WF.body),
          fontSize: c.prefilled ? 11 : undefined,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{c.value || c.label || c.placeholder || '\u00a0'}</div>
      ))}
    </div>
  );
}

Object.assign(window, {
  WF, WFPlaceholder, WFField, WFNote, WFChip, WFRule,
  WFPage, WFSigBox, WFDocHeader, WFBtn, WFTableRow,
});
