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

          <div style={{ marginTop: 36, padding: 16, background: '#fff', borderRadius: 10, border: '1px dashed var(--rule)' }}>
            <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6, letterSpacing: 0.5 }}>
              INTEGRATIONS · 接口
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>
              {lang === 'zh' ? (<>
                · URL 预填：<span className="mono" style={{ background: '#f4f3ee', padding: '0 4px' }}>?driver=...&rego=...</span><br/>
                · 飞书 / 邮箱：<span className="mono" style={{ background: '#f4f3ee', padding: '0 4px' }}>window.LarkFill(&#123;...&#125;)</span><br/>
                · postMessage：<span className="mono" style={{ background: '#f4f3ee', padding: '0 4px' }}>&#123; type:'lark:fill', payload:&#123;…&#125; &#125;</span><br/>
                · 签字后：本地生成并下载 PDF · 暴露 <span className="mono" style={{ background: '#f4f3ee', padding: '0 4px' }}>signed</span> postMessage 给宿主
              </>) : (<>
                · URL prefill: <span className="mono" style={{ background: '#f4f3ee', padding: '0 4px' }}>?driver=...&rego=...</span><br/>
                · Lark / email: <span className="mono" style={{ background: '#f4f3ee', padding: '0 4px' }}>window.LarkFill(&#123;...&#125;)</span><br/>
                · postMessage: <span className="mono" style={{ background: '#f4f3ee', padding: '0 4px' }}>&#123; type:'lark:fill', payload:&#123;…&#125; &#125;</span><br/>
                · After sign: PDF saved locally · also posts <span className="mono" style={{ background: '#f4f3ee', padding: '0 4px' }}>signed</span> to host
              </>)}
            </div>
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

// ───────────────────────── PDF builder (native jsPDF) ─────────────────────
// Draw the report directly with jsPDF — no html2canvas. Reliable on iOS
// Safari/Chrome, fast, selectable text, ~30 KB file size.
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

    const sec = (label) => `<div class="sec">${esc(label)}</div>`;
    const row = (l, v) => `<div class="row"><div class="lbl">${esc(l)}</div><div class="val">${esc(v == null || v === '' ? '—' : v)}</div></div>`;
    const block = (txt) => `<div class="block">${esc(txt || '—')}</div>`;

    let body = '';
    if (kind === 'dispatch') {
      body += sec(tt('Report Info', '报告信息'));
      body += row(tt('Report #', '报告编号'),   data.report_no);
      body += row(tt('Date', '日期'),            data.date);
      body += row(tt('Rego', '车牌'),            data.rego);
      body += row(tt('Invoice #', '订单编号'),   data.invoice);
      body += row(tt('Driver', '司机姓名'),      data.driver);
      body += row(tt('Phone', '司机电话'),       data.phone);
      body += sec(tt('Vehicle / Equipment', '车辆/设备'));
      body += row(tt('Serial #', '车辆编号'),    data.serial);
      body += row(tt('Model', '车辆型号'),       data.model);
      body += sec(tt('Times', '时间'));
      body += row(tt('Dispatch time', '发货时间'),  data.dispatch_time);
      body += row(tt('Completion time', '完成时间'), data.complete_time);
      body += sec(tt('Staff', '人员'));
      body += row(tt('Supervisor', '主管'),       data.supervisor);
      body += row(tt('Operator', '操作人员'),     data.operator);
      body += sec(tt('Ratings (1–5)', '评分 (1–5)'));
      body += row(tt('Logistics company', '物流公司'), data.rating_log ? `${data.rating_log} / 5` : '');
      body += row(tt('Driver', '运输司机'),            data.rating_drv ? `${data.rating_drv} / 5` : '');
      body += sec(tt('Issues / Notes', '问题/备注'));
      body += block(data.issues);
    } else {
      body += sec(tt('Lessor', '出租方'));
      body += block('DJJ Equipment Pty Ltd\nABN 56 615 358 275\n100 Derby Street, Silverwater NSW 2128');
      body += sec(tt('Lessee', '承租方'));
      body += row(tt('Company', '公司'),         data.lessee_company);
      body += row(tt('ABN', 'ABN'),              data.lessee_abn);
      body += row(tt('Contact', '联系人'),       data.contact_name);
      body += row(tt('Phone', '电话'),           data.contact_phone);
      body += row(tt('Email', '邮箱'),           data.contact_email);
      body += row(tt('Delivery address', '收货地址'), data.delivery);
      body += sec(tt('Rental Period', '租期'));
      body += row(tt('Start', '起租'),           data.start);
      body += row(tt('End', '到期'),             data.end);
      body += sec(tt('Forklift', '叉车'));
      body += row(tt('Description', '描述'),     data.f_desc);
      body += row(tt('Serial #', '编号'),        data.f_serial);
      body += row(tt('Weekly rate', '周租金'),   data.f_weekly ? `AUD $${data.f_weekly}` : '');
      body += row(tt('Delivery & collection', '送货/回收费'), data.f_delcol ? `AUD $${data.f_delcol}` : '');
      body += sec(tt('Charges', '费用'));
      body += row(tt('Initial charge', '初始费用'), data.initial ? `AUD $${data.initial}` : '');
      body += row(tt('Ongoing weekly', '后续周租'), data.ongoing ? `AUD $${data.ongoing}` : '');
      body += sec(tt('Credit Card', '信用卡'));
      body += row(tt('Name on card', '持卡人'),  data.card_name);
      body += row(tt('Card number', '卡号'),     data.card_no ? '**** **** **** ' + String(data.card_no).slice(-4) : '');
      body += row(tt('Expiry', '有效期'),        data.card_exp);
      body += sec(tt('Execution', '签署'));
      body += row(tt('Full name', '全名'),       data.full_name);
      body += row(tt('Position', '职位'),        data.position);
    }

    const title = t(kind === 'dispatch' ? 'Dispatch Report' : 'Forklift Rental Agreement',
                    kind === 'dispatch' ? '发货报告' : '叉车租赁协议');
    const sigLabel = kind === 'dispatch' ? tt('Driver signature', '司机签字') : tt('Lessee signature', '承租方签字');
    const stamp = `${t('Signed on', '签字时间')}: ` + new Date().toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-AU');

    const html = `
<div id="djj-pdf-page" style="
  width: 800px; padding: 56px 56px 64px; background: #fff; color: #111;
  font-family: ${fontStack}; font-size: 13px; line-height: 1.5;
  box-sizing: border-box;">
  <style>
    #djj-pdf-page .hdr { display:flex; justify-content:space-between; align-items:flex-start;
      border-bottom: 2px solid #111; padding-bottom: 12px; }
    #djj-pdf-page .hdr img { height: 34px; display: block; }
    #djj-pdf-page .hdr .corp { text-align:right; font-size:10px; color:#777; line-height:1.5; }
    #djj-pdf-page h1 { font-size: 22px; font-weight: 700; margin: 14px 0 0; letter-spacing: -0.2px; }
    #djj-pdf-page .docno { font-family: 'JetBrains Mono', monospace; font-size: 10px; color:#888; margin-top: 4px; }
    #djj-pdf-page .sec {
      font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .8px;
      color:#666; text-transform: uppercase; padding: 16px 0 6px;
      border-top: 1px solid #ddd; margin-top: 12px;
    }
    #djj-pdf-page .row {
      display: grid; grid-template-columns: 200px 1fr; gap: 14px;
      padding: 7px 0; border-bottom: 1px solid #eee; align-items: baseline;
    }
    #djj-pdf-page .lbl { font-family: 'JetBrains Mono', monospace; font-size: 10px; color:#888; }
    #djj-pdf-page .val { font-size: 13px; color:#111; word-break: break-word; }
    #djj-pdf-page .block { font-size: 13px; padding: 4px 0 8px; white-space: pre-wrap; min-height: 32px; }
    #djj-pdf-page .sigbox {
      border: 1px solid #111; height: 140px; background: #fff;
      display:flex; align-items:center; justify-content:center; padding: 8px;
    }
    #djj-pdf-page .sigbox img { max-height: 124px; max-width: 100%; display: block; }
    #djj-pdf-page .sigfoot {
      display: flex; justify-content: space-between;
      font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #777; margin-top: 6px;
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
  <div class="sec" style="margin-top:20px;">${esc(sigLabel)}</div>
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

    // Build A4 PDF — slice canvas into A4 pages if taller than one page
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
    const PAGE_W = doc.internal.pageSize.getWidth();   // 595.28
    const PAGE_H = doc.internal.pageSize.getHeight();  // 841.89
    const imgW = PAGE_W;
    const ratio = canvas.width / imgW;                  // px per pt
    const pagePxH = Math.floor(PAGE_H * ratio);
    let drawnPx = 0;
    const fullH = canvas.height;
    while (drawnPx < fullH) {
      const sliceH = Math.min(pagePxH, fullH - drawnPx);
      const slice = document.createElement('canvas');
      slice.width = canvas.width; slice.height = sliceH;
      slice.getContext('2d').drawImage(canvas, 0, drawnPx, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      const imgData = slice.toDataURL('image/jpeg', 0.92);
      if (drawnPx > 0) doc.addPage();
      doc.addImage(imgData, 'JPEG', 0, 0, imgW, sliceH / ratio);
      drawnPx += sliceH;
    }
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
