// signing-forms.jsx — bilingual form views for Dispatch Report and Forklift
// Rental Agreement. Each field carries a data-field attribute so Lark / email
// integrations can target it. Layouts are responsive: phone < 900px uses the A
// (vertical paper-form) layout; ≥ 900px uses the D (split-view) layout.

const { useState, useEffect, useRef, useMemo } = React;

// ─────────────────────────── i18n ──────────────────────────────────────────
const T = {
  en: {
    backHome: '← Home',
    docDispatch: 'Dispatch Report',
    docRental: 'Forklift Rental Agreement',
    section: { meta: 'Report Info', vehicle: 'Vehicle / Equipment', times: 'Times', ratings: 'Ratings (1–5)', staff: 'Staff', issues: 'Issues / Notes', lessor: 'Lessor', lessee: 'Lessee', period: 'Rental Period', forklift: 'Forklift', charges: 'Charges', card: 'Credit Card', exec: 'Execution & Signature', sign: 'Signature' },
    fields: {
      report_no: 'Report #', date: 'Date', rego: 'Rego / Plate', invoice: 'Invoice #',
      driver: 'Driver', phone: 'Phone', serial: 'Serial #', model: 'Model',
      dispatch_time: 'Dispatch time', complete_time: 'Completion time',
      supervisor: '* Supervisor', operator: '* Operator',
      rating_log: 'Logistics company', rating_drv: 'Driver',
      issues: 'Issues / remarks',
      lessee_company: 'Company name', lessee_abn: 'ABN',
      contact_name: 'Contact name', contact_phone: 'Phone',
      contact_email: 'Email', delivery: 'Delivery address',
      start: 'Start date', end: 'End date',
      f_desc: 'Description', f_serial: 'Serial #', f_weekly: 'Weekly rate', f_delcol: 'Delivery & collection',
      initial: 'Initial charge', ongoing: 'Ongoing weekly',
      card_name: 'Name on card', card_no: 'Card number', card_exp: 'Expiry', card_ccv: 'CCV',
      full_name: 'Full name', position: 'Position',
    },
    saveDownload: 'Save & Download PDF',
    clear: 'Clear', langToggle: '中文',
    required: 'required',
    larkPrefilled: 'Lark prefilled',
    needSig: 'Please sign before downloading.',
    fullyMaintained: 'Fully Maintained',
    djjAddr: 'DJJ Equipment Pty Ltd · ABN 56 615 358 275 · 100 Derby Street, Silverwater NSW 2128',
  },
  zh: {
    backHome: '← 返回',
    docDispatch: '发货报告',
    docRental: '叉车租赁协议',
    section: { meta: '报告信息', vehicle: '车辆/设备', times: '时间', ratings: '评分 (1–5)', staff: '人员', issues: '问题/备注', lessor: '出租方', lessee: '承租方', period: '租期', forklift: '叉车', charges: '费用', card: '信用卡', exec: '签署', sign: '签字' },
    fields: {
      report_no: '报告编号', date: '日期', rego: '车牌', invoice: '订单编号',
      driver: '司机姓名', phone: '司机电话', serial: '车辆编号', model: '车辆型号',
      dispatch_time: '发货时间', complete_time: '完成时间',
      supervisor: '* 主管', operator: '* 操作人员',
      rating_log: '物流公司', rating_drv: '运输司机',
      issues: '问题备注',
      lessee_company: '承租公司', lessee_abn: 'ABN 税号',
      contact_name: '联系人', contact_phone: '电话',
      contact_email: '邮箱', delivery: '收货地址',
      start: '起租日期', end: '到期日期',
      f_desc: '描述', f_serial: '编号', f_weekly: '周租金', f_delcol: '送货/回收费',
      initial: '初始费用', ongoing: '后续周租',
      card_name: '持卡人', card_no: '卡号', card_exp: '有效期', card_ccv: 'CCV',
      full_name: '全名', position: '职位',
    },
    saveDownload: '保存并下载 PDF',
    clear: '清除', langToggle: 'EN',
    required: '必填',
    larkPrefilled: '飞书已预填',
    needSig: '请先签字再下载。',
    fullyMaintained: '全维护服务',
    djjAddr: 'DJJ Equipment Pty Ltd · ABN 56 615 358 275 · 100 Derby Street, Silverwater NSW 2128',
  },
};

// ─────────────────────────── Atoms ─────────────────────────────────────────
function Label({ en, zh, lang, required, prefilled }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 0.4,
      color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4,
    }}>
      <span>
        {lang === 'zh' ? (zh || en) : en}
        {required && <span style={{ color: 'var(--required)', marginLeft: 4 }}>*</span>}
      </span>
      {prefilled && (
        <span style={{
          color: '#7a661f', background: 'var(--pre)',
          padding: '0 5px', borderRadius: 2, fontSize: 9,
          border: '1px solid var(--pre-edge)',
        }}>{T[lang].larkPrefilled}</span>
      )}
    </div>
  );
}

function Field({ name, en, zh, lang, value, onChange, prefilled, required, placeholder, type = 'text', wide, suffix }) {
  return (
    <div style={{ gridColumn: wide ? '1 / -1' : 'auto' }}>
      <Label en={en} zh={zh} lang={lang} required={required} prefilled={prefilled} />
      <div style={{ position: 'relative' }}>
        <input
          name={name}
          data-field={name}
          data-lark-key={name}
          type={type}
          value={value || ''}
          onChange={e => onChange(name, e.target.value)}
          placeholder={placeholder || (lang === 'zh' ? '请输入…' : 'Enter…')}
          style={{
            width: '100%', minHeight: 44, padding: '10px 12px',
            background: prefilled ? 'var(--pre)' : '#fff',
            border: '1px solid ' + (prefilled ? 'var(--pre-edge)' : 'var(--rule)'),
            borderRadius: 6, fontSize: 15, outline: 'none',
            paddingRight: suffix ? 38 : 12,
          }}
        />
        {suffix && (
          <span style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            fontSize: 12, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace',
          }}>{suffix}</span>
        )}
      </div>
    </div>
  );
}

function TextArea({ name, en, zh, lang, value, onChange, rows = 3 }) {
  return (
    <div>
      <Label en={en} zh={zh} lang={lang} />
      <textarea
        name={name}
        data-field={name}
        data-lark-key={name}
        value={value || ''}
        onChange={e => onChange(name, e.target.value)}
        rows={rows}
        style={{
          width: '100%', padding: '10px 12px',
          background: '#fff', border: '1px solid var(--rule)',
          borderRadius: 6, fontSize: 15, outline: 'none', resize: 'vertical',
          fontFamily: 'inherit',
        }}
      />
    </div>
  );
}

function Rating({ name, en, zh, lang, value, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 0', borderBottom: '1px solid var(--rule-2)',
    }}>
      <span style={{ fontSize: 14 }}>{lang === 'zh' ? zh : en}</span>
      <div data-field={name} style={{ display: 'flex', gap: 6 }}>
        {[1,2,3,4,5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(name, n)}
            style={{
              width: 36, height: 36, borderRadius: 999,
              border: '1.5px solid ' + (n <= (value || 0) ? 'var(--ink)' : 'var(--rule)'),
              background: n <= (value || 0) ? 'var(--ink)' : '#fff',
              color: n <= (value || 0) ? '#fff' : 'var(--ink-2)',
              fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600,
            }}>{n}</button>
        ))}
      </div>
    </div>
  );
}

function SectionHead({ children }) {
  return (
    <div style={{
      fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 0.6,
      color: 'var(--muted)', textTransform: 'uppercase',
      borderTop: '1px solid var(--ink)', padding: '14px 0 8px', marginTop: 8,
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
    }}>
      <span>{children}</span>
    </div>
  );
}

function DocHeader({ title, subtitle, badge }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      gap: 12, paddingBottom: 12, borderBottom: '2px solid var(--ink)',
    }}>
      <div>
        <img src="djjlogo.png" alt="DJJ Equipment" style={{ height: 28, display: 'block' }} />
        <div style={{ fontSize: 20, fontWeight: 700, marginTop: 10, letterSpacing: -0.2 }}>{title}</div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{subtitle}</div>
      </div>
      {badge && (
        <span className="mono" style={{
          background: 'var(--ink)', color: '#fff', padding: '4px 8px',
          fontSize: 10, letterSpacing: 0.4, borderRadius: 3, whiteSpace: 'nowrap',
        }}>{badge}</span>
      )}
    </div>
  );
}

// ───────────────────── URL prefill helper ──────────────────────────────────
function readPrefill() {
  try {
    const q = new URLSearchParams(window.location.search);
    const o = {};
    q.forEach((v, k) => { o[k] = v; });
    return o;
  } catch { return {}; }
}

// Default mock data (replaced by URL params / Lark when present)
const DEFAULT_DISPATCH = {
  report_no: 'SW-2026-0511-018',
  date: '11 May 2026',
  rego: 'DJJ-241',
  invoice: 'INV-2613',
  driver: 'John Smith',
  phone: '+61 412 345 678',
  serial: 'TY-8FG25-2208',
  model: 'Toyota 8FG25 Forklift',
  dispatch_time: '09:15 · 11 May 2026',
  complete_time: '',
  supervisor: 'Daniel Wu',
  operator: 'Mike Chen',
  rating_log: 4,
  rating_drv: 5,
  issues: '',
};
const PREFILLED_DISPATCH_KEYS = ['report_no','date','rego','invoice','driver','phone','serial','model','dispatch_time','supervisor','operator'];

const DEFAULT_RENTAL = {
  agreement_no: 'DJJ-HIRE-04612S-01',
  lessee_company: 'ACME Logistics Pty Ltd',
  lessee_abn: '12 345 678 901',
  contact_name: 'Sarah Lee',
  contact_phone: '+61 488 222 333',
  contact_email: 'sarah@acme.com.au',
  delivery: '22 Industrial Dr, Wetherill Park NSW 2164',
  start: '12 May 2026',
  end: '11 Aug 2026',
  f_desc: 'Toyota 8FG25 Forklift',
  f_serial: 'TY-2208',
  f_weekly: '385.00',
  f_delcol: '220.00',
  initial: '605.00',
  ongoing: '385.00',
  card_name: '',
  card_no: '',
  card_exp: '',
  card_ccv: '',
  full_name: 'Sarah Lee',
  position: 'Operations Manager',
};
const PREFILLED_RENTAL_KEYS = ['agreement_no','lessee_company','lessee_abn','contact_name','contact_phone','contact_email','delivery','start','end','f_desc','f_serial','f_weekly','f_delcol','initial','ongoing','full_name','position'];

// ───────────────────── Doc shells (printable) ──────────────────────────────
function DispatchBody({ data, set, lang, sigSlot }) {
  const t = T[lang];
  const F = (key, opts = {}) => (
    <Field name={key} en={t.fields[key]} zh={T.zh.fields[key]} lang={lang}
      value={data[key]} onChange={set}
      prefilled={PREFILLED_DISPATCH_KEYS.includes(key) && !!data[key]}
      {...opts}
    />
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <DocHeader
        title={t.docDispatch}
        subtitle={data.report_no || 'DJJ-SW-…'}
        badge="DJJ"
      />
      <SectionHead>{t.section.meta}</SectionHead>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {F('report_no')}{F('date')}
        {F('rego')}{F('invoice')}
        {F('driver')}{F('phone')}
      </div>
      <SectionHead>{t.section.vehicle}</SectionHead>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {F('serial')}{F('model')}
      </div>
      <SectionHead>{t.section.times}</SectionHead>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {F('dispatch_time')}{F('complete_time')}
      </div>
      <SectionHead>{t.section.staff}</SectionHead>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {F('supervisor', { required: true })}{F('operator', { required: true })}
      </div>
      <SectionHead>{t.section.ratings}</SectionHead>
      <Rating name="rating_log" en={t.fields.rating_log} zh={T.zh.fields.rating_log} lang={lang}
        value={data.rating_log} onChange={set} />
      <Rating name="rating_drv" en={t.fields.rating_drv} zh={T.zh.fields.rating_drv} lang={lang}
        value={data.rating_drv} onChange={set} />
      <SectionHead>{t.section.issues}</SectionHead>
      <TextArea name="issues" en={t.fields.issues} zh={T.zh.fields.issues} lang={lang}
        value={data.issues} onChange={set} rows={3} />
      <SectionHead>{t.section.sign}</SectionHead>
      {sigSlot}
    </div>
  );
}

function RentalBody({ data, set, lang, sigSlot }) {
  const t = T[lang];
  const F = (key, opts = {}) => (
    <Field name={key} en={t.fields[key]} zh={T.zh.fields[key]} lang={lang}
      value={data[key]} onChange={set}
      prefilled={PREFILLED_RENTAL_KEYS.includes(key) && !!data[key]}
      {...opts}
    />
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <DocHeader
        title={t.docRental}
        subtitle={data.agreement_no}
        badge={t.fullyMaintained}
      />
      <SectionHead>{t.section.lessor}</SectionHead>
      <div style={{
        background: 'var(--pre)', border: '1px solid var(--pre-edge)',
        borderRadius: 6, padding: '10px 12px', fontSize: 13.5, lineHeight: 1.5,
      }}>{t.djjAddr}</div>

      <SectionHead>{t.section.lessee}</SectionHead>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {F('lessee_company')}{F('lessee_abn')}
        {F('contact_name')}{F('contact_phone')}
        {F('contact_email', { wide: true })}
        {F('delivery', { wide: true })}
      </div>

      <SectionHead>{t.section.period}</SectionHead>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {F('start')}{F('end')}
      </div>

      <SectionHead>{t.section.forklift}</SectionHead>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10 }}>
        {F('f_desc')}{F('f_serial')}{F('f_weekly', { suffix: 'AUD' })}{F('f_delcol', { suffix: 'AUD' })}
      </div>

      <SectionHead>{t.section.charges}</SectionHead>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {F('initial', { suffix: 'AUD' })}{F('ongoing', { suffix: 'AUD/wk' })}
      </div>

      <SectionHead>{t.section.card}</SectionHead>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {F('card_name')}{F('card_no', { placeholder: '•••• •••• •••• ••••' })}
        {F('card_exp', { placeholder: 'MM / YY' })}{F('card_ccv', { placeholder: '•••' })}
      </div>

      <SectionHead>{t.section.exec}</SectionHead>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {F('full_name')}{F('position')}
      </div>
      {sigSlot}
    </div>
  );
}

// ─── Public form views ────────────────────────────────────────────────────
function makeForm(kind) {
  return function FormView({ lang, setLang, goHome, onDone }) {
    const t = T[lang];
    const defaults = kind === 'dispatch' ? DEFAULT_DISPATCH : DEFAULT_RENTAL;
    const [data, setData] = useState(() => ({ ...defaults, ...readPrefill() }));
    const set = (k, v) => setData(d => ({ ...d, [k]: v }));
    const sigRef = useRef(null);
    const [sigEmpty, setSigEmpty] = useState(true);
    const [err, setErr] = useState('');
    const [busy, setBusy] = useState(false);
    const printRef = useRef(null);

    // Expose Lark hook on window for the embedding host to call
    useEffect(() => {
      window.LarkFill = (obj) => setData(d => ({ ...d, ...obj }));
      const onMsg = (e) => {
        if (e?.data?.type === 'lark:fill' && e.data.payload) {
          setData(d => ({ ...d, ...e.data.payload }));
        }
      };
      window.addEventListener('message', onMsg);
      return () => window.removeEventListener('message', onMsg);
    }, []);

    const submit = async () => {
      if (sigRef.current?.isEmpty?.()) { setErr(t.needSig); return; }
      setErr(''); setBusy(true);
      try {
        // 1. Stamp signature into the printable region
        const sigImg = sigRef.current.toDataURL();
        // 2. Build a clean printable doc using current values
        const filename = (kind === 'dispatch'
          ? (data.report_no || 'dispatch-report')
          : (data.agreement_no || 'rental-agreement')) + '.pdf';
        await window.SigningPDF.generate({ kind, data, sigImg, lang, filename });
        onDone({ kind, data, sigImg, filename });
      } catch (e) {
        console.error(e);
        setErr('PDF generation failed — see console.');
      } finally {
        setBusy(false);
      }
    };

    const sigSlot = (
      <div>
        <window.SigPad ref={sigRef} height={180} lang={lang}
          label={kind === 'dispatch' ? 'DRIVER SIGNATURE' : 'LESSEE SIGNATURE'}
          zhLabel={kind === 'dispatch' ? '司机签字' : '承租方签字'}
          onChange={empty => setSigEmpty(empty)}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
          <button type="button" onClick={() => sigRef.current?.clear?.()}
            style={{
              background: 'transparent', border: '1px solid var(--rule)',
              borderRadius: 4, padding: '6px 12px', fontSize: 12,
              color: 'var(--ink-2)',
            }}>{t.clear}</button>
        </div>
      </div>
    );

    const body = kind === 'dispatch'
      ? <DispatchBody data={data} set={set} lang={lang} sigSlot={sigSlot} />
      : <RentalBody  data={data} set={set} lang={lang} sigSlot={sigSlot} />;

    return (
      <window.AppShell
        title={kind === 'dispatch' ? t.docDispatch : t.docRental}
        lang={lang} setLang={setLang} goHome={goHome}
        footer={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {err && <span style={{ color: 'var(--required)', fontSize: 13 }}>{err}</span>}
            <button type="button" onClick={submit} disabled={busy}
              style={{
                marginLeft: 'auto', minHeight: 48, padding: '0 20px',
                background: sigEmpty ? '#888' : 'var(--ink)', color: '#fff',
                border: 'none', borderRadius: 6, fontSize: 16, fontWeight: 600,
                opacity: busy ? 0.6 : 1, cursor: sigEmpty ? 'not-allowed' : 'pointer',
                minWidth: 220,
              }}>
              {busy ? '…' : t.saveDownload}
            </button>
          </div>
        }
      >
        <div ref={printRef} data-doc-root={kind}>
          {body}
        </div>
      </window.AppShell>
    );
  };
}

window.DispatchForm = makeForm('dispatch');
window.RentalForm   = makeForm('rental');
