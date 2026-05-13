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
    delivery: '送货签收单', deliveryH: '司机签字 · 自动预填',
    dispatch: '发货报告', dispatchH: '司机签字 · 单页', rental: '叉车租赁协议', rentalH: '承租方签字 · 多页',
    device: isTablet ? 'iPad · 双栏视图' : 'iPhone · 单列视图',
  } : {
    title: 'DJJ Signing',
    sub: 'Choose the document you need to sign',
    delivery: 'Delivery Order Sign-Off', deliveryH: 'Driver signature · prefilled',
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
        {k === 'delivery' ? '01 · DELIVERY' : k === 'dispatch' ? '02 · DISPATCH' : '03 · RENTAL'}
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
        <img src="../djjlogo.png" alt="DJJ" style={{ height: 24 }} />
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
            display: 'grid', gridTemplateColumns: isTablet ? 'repeat(3, 1fr)' : '1fr',
            gap: 14, marginTop: 22,
          }}>
            <Card k="delivery" title={text.delivery} hint={text.deliveryH} />
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
    const res = await fetch('../djjlogo.png');
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
  async generate({ kind, data, sigImg, lessorSigImg, lang, filename }) {
    const t  = (en, zh) => lang === 'zh' ? zh : en;
    const tt = (en, zh) => lang === 'zh' ? `${zh} · ${en}` : `${en} · ${zh}`;
    const docNo = kind === 'delivery'
      ? (data.invoice_no || '')
      : kind === 'dispatch'
        ? (data.report_no || '')
        : (data.agreement_no || '');
    const fname = filename || ((kind === 'delivery' ? 'delivery-order' : kind === 'dispatch' ? 'dispatch-report' : 'rental-agreement') +
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
    if (kind === 'delivery') {
      const items = Array.isArray(data.items) ? data.items : [];
      const itemsHtml = items.length ? items.map((item, idx) => section(tt(`Item ${idx + 1}`, `货物 ${idx + 1}`), [
        row(tt('Description', '描述'), item.description),
        row(tt('Model', '型号'), item.model),
        row(tt('VIN / Serial', 'VIN / 序列号'), item.serial || item.vin),
        row(tt('Quantity', '数量'), item.quantity || item.qty),
      ].join(''))).join('') : section(tt('Items', '货物明细'), [
        row(tt('Description', '描述'), ''),
        row(tt('Model', '型号'), ''),
        row(tt('VIN / Serial', 'VIN / 序列号'), ''),
        row(tt('Quantity', '数量'), ''),
      ].join(''));

      body += section(tt('Order Reference', '订单参考'), [
        row(tt('Tax invoice #', '税务发票号'), data.invoice_no),
        row(tt('Invoice date', '发票日期'), data.invoice_date),
        row(tt('Sales rep', '销售代表'), data.sales_rep),
        block(tt('Pick up location', '取货地点'), data.pickup_location),
      ].join(''));
      body += section(tt('Delivery Details', '送货信息'), [
        row(tt('Customer name', '客户名称'), data.customer_name),
        row(tt('Customer ABN', '客户 ABN'), data.customer_abn),
        block(tt('Delivery address', '送货地址'), data.delivery_address),
        row(tt('Contact name', '联系人'), data.delivery_contact),
        row(tt('Contact phone', '联系电话'), data.delivery_phone),
        row(tt('Contact email', '联系邮箱'), data.delivery_email),
      ].join(''));
      body += section(tt('Transport Company', '运输公司'), [
        row(tt('Transport company', '运输公司'), data.transport_company),
        row(tt('Transport contact', '运输联系人'), data.transport_contact),
        row(tt('Transport phone', '运输电话'), data.transport_phone),
        row(tt('Transport email', '运输邮箱'), data.transport_email),
      ].join(''));
      body += itemsHtml;
      body += section(tt('Driver Details', '司机信息'), [
        row(tt('Driver name', '司机姓名'), data.driver_name),
        row(tt('Phone number', '司机电话'), data.driver_phone),
        row(tt('Vehicle rego', '车辆牌照'), data.vehicle_rego),
      ].join(''));
    } else if (kind === 'dispatch') {
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

      const periodLabel = {
        weekly: tt('Weekly', '按周'),
        monthly: tt('Monthly', '按月'),
        '4weekly': tt('Every 4 weeks', '每4周'),
        custom: data.ongoing_custom_label || tt('Custom', '自定义'),
      }[data.period_type] || data.period_type;

      body += section(tt('Rental Period', '租期'), [
        row(tt('Start', '起租'), data.start),
        row(tt('End', '到期'), data.end),
        row(tt('Billing cycle', '计费周期'), periodLabel),
      ].join(''));

      const equipments = Array.isArray(data.equipments) ? data.equipments : [{}];
      equipments.forEach((eq, idx) => {
        body += section(tt(`Equipment ${idx + 1}`, `设备 ${idx + 1}`), [
          eq.f_desc     ? row(tt('Description', '描述'), eq.f_desc) : '',
          eq.f_category ? row(tt('Category', '类别'), eq.f_category) : '',
          eq.f_vin      ? row(tt('VIN / Serial', 'VIN / 序列号'), eq.f_vin) : '',
          eq.f_weekly   ? row(tt('Rate', '费率'), `AUD $${eq.f_weekly}`) : '',
          eq.f_delcol   ? row(tt('Delivery & collection', '送货/回收'), `AUD $${eq.f_delcol}`) : '',
          eq.f_config   ? block(tt('Configuration / Notes', '配置/备注'), eq.f_config) : '',
        ].join(''));
      });

      const intervalLabel = {
        weekly: tt('Weekly', '每周'),
        monthly: tt('Monthly', '每月'),
        '4weekly': tt('Every 4 weeks', '每4周'),
        custom: data.ongoing_custom_label || tt('Custom', '自定义'),
      }[data.ongoing_interval] || data.ongoing_interval;

      body += section(tt('Charges', '费用'), [
        row(tt('Initial charge', '初始费用'), data.initial ? `AUD $${data.initial}` : ''),
        row(tt('Bond per machine', '每台保证金'), data.bond_per ? `AUD $${data.bond_per}` : ''),
        row(tt('Total bond', '保证金合计'), data.bond_total ? `AUD $${data.bond_total}` : ''),
        row(tt('Ongoing rate', '续租费率'), data.ongoing_rate ? `AUD $${data.ongoing_rate} ${intervalLabel}` : ''),
      ].join(''));

      body += section(tt('Execution', '签署'), [
        row(tt('Full name (Lessee)', '承租方签署人'), data.full_name),
        row(tt('Position', '职位'), data.position),
        row(tt('Full name (Lessor)', '出租方签署人'), data.lessor_name),
        row(tt('Lessor position', '出租方职位'), data.lessor_position),
      ].join(''));
    }

    const title = t(kind === 'delivery' ? 'Delivery Order Sign-Off' : kind === 'dispatch' ? 'Dispatch Report' : 'Forklift Rental Agreement',
                    kind === 'delivery' ? '送货签收单' : kind === 'dispatch' ? '发货报告' : '叉车租赁协议');
    const stamp = `${t('Signed on', '签字时间')}: ` + new Date().toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-AU');

    // For rental: two-column signature block; otherwise single
    const sigBlockHtml = kind === 'rental' ? `
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:10px;">
    <div>
      <div class="sec" style="border-top:none;padding-top:0;">${esc(tt('Lessee Signature', '承租方签字'))}</div>
      <div class="sigbox">${sigImg ? `<img src="${sigImg}" alt="lessee signature"/>` : ''}</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:#777;margin-top:4px;">
        ${esc(data.full_name || '')}${data.position ? ' · ' + esc(data.position) : ''}
      </div>
    </div>
    <div>
      <div class="sec" style="border-top:none;padding-top:0;">${esc(tt('Lessor Signature', '出租方签字'))}</div>
      <div class="sigbox">${lessorSigImg ? `<img src="${lessorSigImg}" alt="lessor signature"/>` : ''}</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:#777;margin-top:4px;">
        ${esc(data.lessor_name || '')}${data.lessor_position ? ' · ' + esc(data.lessor_position) : ''}
      </div>
    </div>
  </div>` : `
  <div class="sec" style="margin-top:10px;">${esc(kind === 'rental' ? tt('Lessee signature', '承租方签字') : tt('Driver signature', '司机签字'))}</div>
  <div class="sigbox">${sigImg ? `<img src="${sigImg}" alt="signature"/>` : ''}</div>`;

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
      <img src="../djjlogo.png" alt="DJJ"/>
      <h1>${esc(title)}</h1>
      ${docNo ? `<div class="docno">${esc(docNo)}</div>` : ''}
    </div>
    <div class="corp">
      DJJ Equipment Pty Ltd<br/>ABN 56 615 358 275<br/>100 Derby Street,<br/>Silverwater NSW 2128
    </div>
  </div>
  ${body}
  ${sigBlockHtml}
  <div class="sigfoot">
    <span>${esc(stamp)}</span>
    <span>${esc(t('Document', '文件'))}: ${esc(docNo)}</span>
  </div>
</div>`;

    // Mount off-canvas, render, and build PDF
    const host = document.createElement('div');
    Object.assign(host.style, {
      position: 'absolute', left: '-10000px', top: '0',
      width: '800px', pointerEvents: 'none', opacity: '1',
    });
    host.innerHTML = html;
    document.body.appendChild(host);

    await Promise.all([...host.querySelectorAll('img')].map(img =>
      img.complete && img.naturalWidth ? Promise.resolve() :
      new Promise(r => { img.onload = img.onerror = () => r(); })
    ));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch {} }

    const pageEl = host.querySelector('#djj-pdf-page');
    const canvas = await window.html2canvas(pageEl, {
      scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false,
      windowWidth: 800, width: 800,
    });
    host.remove();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
    const PAGE_W = doc.internal.pageSize.getWidth();
    const PAGE_H = doc.internal.pageSize.getHeight();
    const fit = Math.min(PAGE_W / canvas.width, PAGE_H / canvas.height);
    const imgW = canvas.width * fit;
    const imgH = canvas.height * fit;
    doc.addImage(canvas.toDataURL('image/png'), 'PNG',
      (PAGE_W - imgW) / 2, (PAGE_H - imgH) / 2, imgW, imgH);

    // Append T&C and Fair Wear & Tear PDFs for rental
    if (kind === 'rental') {
      const appendPdf = async (url) => {
        try {
          const resp = await fetch(url);
          if (!resp.ok) return;
          const buf = await resp.arrayBuffer();
          const pdfDoc = await pdfjsLib.getDocument({ data: buf }).promise;
          for (let p = 1; p <= pdfDoc.numPages; p++) {
            const page = await pdfDoc.getPage(p);
            const vp = page.getViewport({ scale: 1.5 });
            const c = document.createElement('canvas');
            c.width = vp.width; c.height = vp.height;
            await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
            const imgD = c.toDataURL('image/jpeg', 0.85);
            doc.addPage('a4', 'portrait');
            const pw = doc.internal.pageSize.getWidth();
            const ph = doc.internal.pageSize.getHeight();
            const s = Math.min(pw / vp.width, ph / vp.height);
            doc.addImage(imgD, 'JPEG', (pw - vp.width * s) / 2, (ph - vp.height * s) / 2,
              vp.width * s, vp.height * s);
          }
        } catch (e) { console.warn('appendPdf failed:', url, e); }
      };
      await appendPdf('../hire-agreement.pdf');
      await appendPdf('../fair-wear-tear.pdf');
    }

    const pdfDataUrl = doc.output('datauristring');
    doc.save(fname);

    try {
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'signed', kind, filename: fname, fields: data }, '*');
      }
    } catch {}
    return { filename: fname, pdfDataUrl };
  }
};

// ───────────────────────── Root ───────────────────────────────────────────
function App() {
  // Routes: 'home' | 'delivery' | 'dispatch' | 'rental' | 'done'
  const initialRoute = () => {
    const h = (window.location.hash || '').replace(/^#\/?/, '');
    return ['home','delivery','dispatch','rental','done'].includes(h) ? h : 'home';
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
  if (route === 'delivery') return <window.DeliveryOrderForm lang={lang} setLang={setLang} goHome={goHome} onDone={onDone} />;
  if (route === 'dispatch') return <window.DispatchForm lang={lang} setLang={setLang} goHome={goHome} onDone={onDone} />;
  if (route === 'rental')   return <window.RentalForm   lang={lang} setLang={setLang} goHome={goHome} onDone={onDone} />;
  if (route === 'done')     return <Done lang={lang} payload={donePayload} restart={() => setRoute(donePayload?.kind || 'home')} goHome={goHome} />;
  return <Home lang={lang} setLang={setLang} go={go} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
