// signing-app.jsx — top-level shell, home + done routes, and PDF builder.

const { useState, useEffect, useRef } = React;

// ──────────────────── Responsive layout: A on phone, D on tablet ──────────
function useIsTablet() {
  const [t, setT] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 900);
  useEffect(() => {
    const on = () => setT(window.innerWidth >= 900);
    window.addEventListener('resize', on);
    window.addEventListener('orientationchange', on);
    return () => {
      window.removeEventListener('resize', on);
      window.removeEventListener('orientationchange', on);
    };
  }, []);
  return t;
}

// ───────────────────────── App shell ──────────────────────────────────────
function AppShell({ title, lang, setLang, goHome, footer, children }) {
  const isTablet = useIsTablet();
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: '#ece9e0',
    }}>
      {/* Top bar */}
      <header style={{
        flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 18px', background: '#fff',
        borderBottom: '1px solid var(--rule)',
      }}>
        <button type="button" onClick={goHome}
          style={{
            background: 'transparent', border: 'none',
            color: 'var(--ink)', fontSize: 14, padding: 8, marginLeft: -8,
          }}>{lang === 'zh' ? '← 返回' : '← Home'}</button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: 15 }}>{title}</div>
        <button type="button" onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
          className="mono"
          style={{
            border: '1px solid var(--rule)', background: '#fff',
            padding: '6px 10px', borderRadius: 4, fontSize: 12,
          }}>{lang === 'en' ? '中文' : 'EN'}</button>
      </header>

      {/* Scroll region */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{
          maxWidth: isTablet ? 1100 : 560, margin: '0 auto',
          padding: isTablet ? '24px 32px 120px' : '18px 16px 120px',
        }}>
          {/* Paper sheet */}
          <div style={{
            background: '#fff', borderRadius: 10,
            boxShadow: 'var(--shadow)',
            padding: isTablet ? '28px 36px' : '20px 18px',
          }}>
            {children}
          </div>
        </div>
      </div>

      {/* Sticky footer with primary action */}
      {footer && (
        <footer style={{
          flex: '0 0 auto',
          padding: '12px 18px calc(12px + var(--safe-bottom))',
          background: 'rgba(255,255,255,0.96)',
          borderTop: '1px solid var(--rule)',
          backdropFilter: 'saturate(140%) blur(10px)',
          WebkitBackdropFilter: 'saturate(140%) blur(10px)',
        }}>{footer}</footer>
      )}
    </div>
  );
}
window.AppShell = AppShell;

// ───────────────────────── Home (route picker) ────────────────────────────
function Home({ lang, setLang, go }) {
  const isTablet = useIsTablet();
  const text = lang === 'zh' ? {
    title: 'DJJ 签字平台',
    sub: '请选择需要签署的文件类型',
    dispatch: '发货报告', dispatchH: '司机签字 · 单页', rental: '叉车租赁协议', rentalH: '承租方签字 · 多页',
    device: isTablet ? 'iPad · 双栏视图' : 'iPhone · 单列视图',
  } : {
    title: 'DJJ Signing',
    sub: 'Choose the document you need to sign',
    dispatch: 'Dispatch Report', dispatchH: 'Driver signature · 1 page', rental: 'Forklift Rental Agreement', rentalH: 'Lessee signature · multi-page',
    device: isTablet ? 'iPad · split layout' : 'iPhone · single-column',
  };
  const Card = ({ k, title, hint }) => (
    <button type="button" onClick={() => go(k)} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
      gap: 8, padding: '20px 22px', textAlign: 'left',
      background: '#fff', border: '1px solid var(--rule)',
      borderRadius: 10, boxShadow: 'var(--shadow)',
      minHeight: 130, width: '100%',
    }}>
      <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 0.5 }}>
        {k === 'dispatch' ? '01 · DISPATCH' : '02 · RENTAL'}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.2 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--muted)' }}>{hint}</div>
      <div style={{ marginTop: 'auto', fontSize: 13, color: 'var(--ink)' }}>→</div>
    </button>
  );
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#ece9e0' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px', background: '#fff', borderBottom: '1px solid var(--rule)',
      }}>
        <img src="djjlogo.png" alt="DJJ" style={{ height: 24 }} />
        <button type="button" onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
          className="mono"
          style={{
            border: '1px solid var(--rule)', background: '#fff',
            padding: '6px 10px', borderRadius: 4, fontSize: 12,
          }}>{lang === 'en' ? '中文' : 'EN'}</button>
      </header>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ maxWidth: isTablet ? 720 : 480, margin: '0 auto', padding: '28px 18px 60px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.4 }}>{text.title}</div>
          <div style={{ color: 'var(--muted)', marginTop: 4 }}>{text.sub}</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6, letterSpacing: 0.4 }}>
            · {text.device}
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: isTablet ? '1fr 1fr' : '1fr',
            gap: 14, marginTop: 22,
          }}>
            <Card k="dispatch" title={text.dispatch} hint={text.dispatchH} />
            <Card k="rental"   title={text.rental}   hint={text.rentalH} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── Done route ─────────────────────────────────────
function Done({ lang, payload, restart, goHome }) {
  const t = lang === 'zh' ? {
    h: '签字完成 ✓', s: 'PDF 已生成并下载到本设备。',
    file: '文件名',
    again: '签署下一份', home: '返回首页',
    redownload: '重新下载 PDF',
  } : {
    h: 'Signed ✓', s: 'Your PDF was generated and downloaded.',
    file: 'File',
    again: 'Sign another', home: 'Back to home',
    redownload: 'Re-download PDF',
  };
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, background: '#ece9e0' }}>
      <div style={{
        background: '#fff', borderRadius: 14, padding: 36, maxWidth: 460, width: '100%',
        boxShadow: 'var(--shadow)', textAlign: 'center',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 999, background: 'var(--ink)',
          color: '#fff', margin: '0 auto 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, fontWeight: 700,
        }}>✓</div>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.3 }}>{t.h}</div>
        <div style={{ color: 'var(--muted)', marginTop: 6 }}>{t.s}</div>
        <div className="mono" style={{
          marginTop: 18, padding: '8px 12px', background: '#f4f3ee',
          fontSize: 12, borderRadius: 4, wordBreak: 'break-all',
        }}>{t.file}: {payload?.filename || '—'}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 22 }}>
          <button type="button" onClick={() => payload && window.SigningPDF.generate({ ...payload, lang })}
            style={{ minHeight: 46, background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 600 }}>
            ↓ {t.redownload}
          </button>
          <button type="button" onClick={restart}
            style={{ minHeight: 46, background: '#fff', color: 'var(--ink)', border: '1px solid var(--rule)', borderRadius: 6, fontSize: 15 }}>
            {t.again}
          </button>
          <button type="button" onClick={goHome}
            style={{ minHeight: 40, background: 'transparent', color: 'var(--muted)', border: 'none', fontSize: 13 }}>
            {t.home}
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── PDF builder ────────────────────────────────────
// Render a compact A4 HTML sheet, then place it into a single-page PDF.
async function loadLogoDataURL() {
  if (window.__djjLogoData) return window.__djjLogoData;
  try {
    const res = await fetch('djjlogo.png');
    const blob = await res.blob();
    const dataUrl = await new Promise((ok, ko) => {
      const r = new FileReader();
      r.onload = () => ok(r.result); r.onerror = ko;
      r.readAsDataURL(blob);
    });
    window.__djjLogoData = dataUrl;
    return dataUrl;
  } catch (e) { return null; }
}

window.SigningPDF = {
  async generate({ kind, data, sigImg, lang, filename }) {
    const t  = (en, zh) => lang === 'zh' ? zh : en;
    const tt = (en, zh) => lang === 'zh' ? `${zh} · ${en}` : `${en} · ${zh}`;
    const docNo = kind === 'dispatch' ? (data.report_no || '') : (data.agreement_no || '');
    const fname = filename || ((kind === 'dispatch' ? 'dispatch-report' : 'rental-agreement') +
      (docNo ? '-' + docNo.replace(/[^a-z0-9\-]/gi, '_') : '') + '.pdf');

    // Build print HTML — A4 width at 96dpi = 794px; we render at 800 for round numbers.
    const esc = (s) => String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\n/g, '<br/>');
    const cjkFont = '"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Source Han Sans SC","Noto Sans CJK SC",sans-serif';
    const fontStack = `"Source Sans 3","Helvetica Neue",Helvetica,Arial,${cjkFont}`;

    const val = (v) => esc(v == null || v === '' ? '—' : v);
    const row = (l, v, wide = false) => `
      <div class="field${wide ? ' wide' : ''}">
        <div class="lbl">${esc(l)}</div>
        <div class="val">${val(v)}</div>
      </div>`;
    const block = (l, txt) => row(l, txt, true);
    const section = (label, rows) => `
      <section class="pdf-section">
        <div class="sec">${esc(label)}</div>
        <div class="pdf-grid">${rows}</div>
      </section>`;

    let body = '';
    if (kind === 'dispatch') {
      body += section(tt('Report Info', '报告信息'), [
        row(tt('Report #', '报告编号'), data.report_no),
        row(tt('Date', '日期'), data.date),
        row(tt('Rego', '车牌'), data.rego),
        row(tt('Invoice #', '订单编号'), data.invoice),
        row(tt('Driver', '司机姓名'), data.driver),
        row(tt('Phone', '司机电话'), data.phone),
      ].join(''));
      body += section(tt('Vehicle / Equipment', '车辆/设备'), [
        row(tt('Serial #', '车辆编号'), data.serial),
        row(tt('Model', '车辆型号'), data.model),
      ].join(''));
      body += section(tt('Times / Staff', '时间 / 人员'), [
        row(tt('Dispatch time', '发货时间'), data.dispatch_time),
        row(tt('Completion time', '完成时间'), data.complete_time),
        row(tt('Supervisor', '主管'), data.supervisor),
        row(tt('Operator', '操作人员'), data.operator),
      ].join(''));
      body += section(tt('Ratings / Notes', '评分 / 备注'), [
        row(tt('Logistics company', '物流公司'), data.rating_log ? `${data.rating_log} / 5` : ''),
        row(tt('Driver', '运输司机'), data.rating_drv ? `${data.rating_drv} / 5` : ''),
        block(tt('Issues / Notes', '问题/备注'), data.issues),
      ].join(''));
    } else {
      body += section(tt('Parties', '合同方'), [
        block(tt('Lessor', '出租方'), 'DJJ Equipment Pty Ltd\nABN 56 615 358 275\n100 Derby Street, Silverwater NSW 2128'),
        row(tt('Company', '公司'), data.lessee_company),
        row(tt('ABN', 'ABN'), data.lessee_abn),
        row(tt('Contact', '联系人'), data.contact_name),
        row(tt('Phone', '电话'), data.contact_phone),
        row(tt('Email', '邮箱'), data.contact_email),
        row(tt('Delivery address', '收货地址'), data.delivery),
      ].join(''));
      body += section(tt('Rental Period / Forklift', '租期 / 叉车'), [
        row(tt('Start', '起租'), data.start),
        row(tt('End', '到期'), data.end),
        row(tt('Description', '描述'), data.f_desc),
        row(tt('Serial #', '编号'), data.f_serial),
        row(tt('Weekly rate', '周租金'), data.f_weekly ? `AUD $${data.f_weekly}` : ''),
        row(tt('Delivery & collection', '送货/回收费'), data.f_delcol ? `AUD $${data.f_delcol}` : ''),
      ].join(''));
      body += section(tt('Charges / Card', '费用 / 信用卡'), [
        row(tt('Initial charge', '初始费用'), data.initial ? `AUD $${data.initial}` : ''),
        row(tt('Ongoing weekly', '后续周租'), data.ongoing ? `AUD $${data.ongoing}` : ''),
        row(tt('Name on card', '持卡人'), data.card_name),
        row(tt('Card number', '卡号'), data.card_no ? '**** **** **** ' + String(data.card_no).slice(-4) : ''),
        row(tt('Expiry', '有效期'), data.card_exp),
      ].join(''));
      body += section(tt('Execution', '签署'), [
        row(tt('Full name', '全名'), data.full_name),
        row(tt('Position', '职位'), data.position),
      ].join(''));
    }

    const title = t(kind === 'dispatch' ? 'Dispatch Report' : 'Forklift Rental Agreement',
                    kind === 'dispatch' ? '发货报告' : '叉车租赁协议');
    const sigLabel = kind === 'dispatch' ? tt('Driver signature', '司机签字') : tt('Lessee signature', '承租方签字');
    const stamp = `${t('Signed on', '签字时间')}: ` + new Date().toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-AU');

    const html = `
<div id="djj-pdf-page" style="
  width: 800px; padding: 38px 42px 40px; background: #fff; color: #111;
  font-family: ${fontStack}; font-size: 12.5px; line-height: 1.32;
  box-sizing: border-box;">
  <style>
    #djj-pdf-page .hdr { display:flex; justify-content:space-between; align-items:flex-start;
      border-bottom: 2px solid #111; padding-bottom: 10px; margin-bottom: 10px; }
    #djj-pdf-page .hdr img { height: 30px; display: block; }
    #djj-pdf-page .hdr .corp { text-align:right; font-size:9.5px; color:#777; line-height:1.35; }
    #djj-pdf-page h1 { font-size: 20px; font-weight: 700; margin: 10px 0 0; letter-spacing: -0.2px; }
    #djj-pdf-page .docno { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; color:#888; margin-top: 3px; }
    #djj-pdf-page .pdf-section { break-inside: avoid; page-break-inside: avoid; margin-top: 8px; }
    #djj-pdf-page .sec {
      font-family: 'JetBrains Mono', monospace; font-size: 9.5px; letter-spacing: .55px;
      color:#666; text-transform: uppercase; padding: 6px 0 5px;
      border-top: 1px solid #ddd;
    }
    #djj-pdf-page .pdf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 14px; }
    #djj-pdf-page .field {
      min-height: 30px; padding-bottom: 5px; border-bottom: 1px solid #eee;
      display: grid; grid-template-columns: 106px 1fr; gap: 8px; align-items: baseline;
      break-inside: avoid; page-break-inside: avoid;
    }
    #djj-pdf-page .field.wide { grid-column: 1 / -1; }
    #djj-pdf-page .lbl { font-family: 'JetBrains Mono', monospace; font-size: 8.8px; color:#888; line-height: 1.25; }
    #djj-pdf-page .val { font-size: 12.2px; color:#111; word-break: break-word; white-space: pre-wrap; }
    #djj-pdf-page .sigbox {
      border: 1px solid #111; height: 104px; background: #fff;
      display:flex; align-items:center; justify-content:center; padding: 8px;
      break-inside: avoid; page-break-inside: avoid;
    }
    #djj-pdf-page .sigbox img { max-height: 88px; max-width: 100%; display: block; }
    #djj-pdf-page .sigfoot {
      display: flex; justify-content: space-between;
      font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #777; margin-top: 5px;
    }
  </style>
  <div class="hdr">
    <div>
      <img src="djjlogo.png" alt="DJJ"/>
      <h1>${esc(title)}</h1>
      ${docNo ? `<div class="docno">${esc(docNo)}</div>` : ''}
    </div>
    <div class="corp">
      DJJ Equipment Pty Ltd<br/>ABN 56 615 358 275<br/>100 Derby Street,<br/>Silverwater NSW 2128
    </div>
  </div>
  ${body}
  <div class="sec" style="margin-top:10px;">${esc(sigLabel)}</div>
  <div class="sigbox">${sigImg ? `<img src="${sigImg}" alt="signature"/>` : ''}</div>
  <div class="sigfoot">
    <span>${esc(stamp)}</span>
    <span>${esc(t('Document', '文件'))}: ${esc(docNo)}</span>
  </div>
</div>`;

    // Mount visible (off-canvas via overflow), so html2canvas paints real glyphs
    const host = document.createElement('div');
    Object.assign(host.style, {
      position: 'absolute', left: '-10000px', top: '0',
      width: '800px', pointerEvents: 'none', opacity: '1',
    });
    host.innerHTML = html;
    document.body.appendChild(host);

    // Wait for embedded images (logo + signature) to load
    await Promise.all([...host.querySelectorAll('img')].map(img =>
      img.complete && img.naturalWidth ? Promise.resolve() :
      new Promise(r => { img.onload = img.onerror = () => r(); })
    ));
    // One frame so fonts settle
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch {} }

    const pageEl = host.querySelector('#djj-pdf-page');
    const canvas = await window.html2canvas(pageEl, {
      scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false,
      windowWidth: 800, width: 800,
    });
    host.remove();

    // Build a single-page A4 PDF. Scale the composed page down only if needed.
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
    const PAGE_W = doc.internal.pageSize.getWidth();   // 595.28
    const PAGE_H = doc.internal.pageSize.getHeight();  // 841.89
    const fit = Math.min(PAGE_W / canvas.width, PAGE_H / canvas.height);
    const imgW = canvas.width * fit;
    const imgH = canvas.height * fit;
    const x = (PAGE_W - imgW) / 2;
    const y = (PAGE_H - imgH) / 2;
    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', x, y, imgW, imgH);
    doc.save(fname);

    try {
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'signed', kind, filename: fname, fields: data }, '*');
      }
    } catch {}
    return { filename: fname };
  }
};

// ───────────────────────── Root ───────────────────────────────────────────
function App() {
  // Routes: 'home' | 'dispatch' | 'rental' | 'done'
  const initialRoute = () => {
    const h = (window.location.hash || '').replace(/^#\/?/, '');
    return ['home','dispatch','rental','done'].includes(h) ? h : 'home';
  };
  const [route, setRoute] = useState(initialRoute);
  const [lang, setLang] = useState(() => {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'zh' || q === 'en') return q;
    return (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
  });
  const [donePayload, setDonePayload] = useState(null);

  // Keep hash in sync
  useEffect(() => {
    window.history.replaceState(null, '', '#/' + route);
  }, [route]);
  useEffect(() => {
    const on = () => setRoute(initialRoute());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const go = (r) => setRoute(r);
  const goHome = () => setRoute('home');
  const onDone = (payload) => { setDonePayload(payload); setRoute('done'); };

  if (route === 'home') return <Home lang={lang} setLang={setLang} go={go} />;
  if (route === 'dispatch') return <window.DispatchForm lang={lang} setLang={setLang} goHome={goHome} onDone={onDone} />;
  if (route === 'rental')   return <window.RentalForm   lang={lang} setLang={setLang} goHome={goHome} onDone={onDone} />;
  if (route === 'done')     return <Done lang={lang} payload={donePayload} restart={() => setRoute(donePayload?.kind || 'home')} goHome={goHome} />;
  return <Home lang={lang} setLang={setLang} go={go} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
