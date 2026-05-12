// signing-forms.jsx — bilingual form views for Dispatch Report and Forklift
// Rental Agreement. Each field carries a data-field attribute so Lark / email
// integrations can target it. Layouts are responsive: phone < 900px uses the A
// (vertical paper-form) layout; ≥ 900px uses the D (split-view) layout.

const { useState, useEffect, useRef, useMemo } = React;

// ─────────────────────────── i18n ──────────────────────────────────────────
const T = {
  en: {
    backHome: '← Home',
    docDelivery: 'Delivery Order Sign-Off',
    docDispatch: 'Dispatch Report',
    docRental: 'Forklift Rental Agreement',
    section: { order: 'Order Reference', delivery: 'Delivery Details', transport: 'Transport Company', driver: 'Driver Details', items: 'Items', meta: 'Report Info', vehicle: 'Vehicle / Equipment', times: 'Times', ratings: 'Ratings (1–5)', staff: 'Staff', issues: 'Issues / Notes', lessor: 'Lessor', lessee: 'Lessee', period: 'Rental Period', forklift: 'Forklift', charges: 'Charges', card: 'Credit Card', exec: 'Execution & Signature', sign: 'Signature' },
    fields: {
      invoice_no: 'Tax invoice #', invoice_date: 'Invoice date', sales_rep: 'Sales rep',
      pickup_location: 'Pick up location', customer_name: 'Customer name', customer_abn: 'Customer ABN',
      delivery_address: 'Delivery address', delivery_contact: 'Contact name',
      delivery_phone: 'Contact phone', delivery_email: 'Contact email',
      transport_company: 'Transport company', transport_contact: 'Transport contact',
      transport_phone: 'Transport phone', transport_email: 'Transport email',
      driver_name: 'Driver name', driver_phone: 'Phone number', vehicle_rego: 'Vehicle rego',
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
    deliverySubmit: 'Generate PDF & Submit',
    copyLink: 'Copy driver signing link',
    copiedLink: 'Signing link copied.',
    emailedViaBridge: 'PDF generated and passed to the email automation bridge.',
    emailedViaHost: 'PDF generated and handed to the host automation.',
    missingMailer: 'PDF generated locally. Connect Gmail/Lark automation to send it automatically.',
    clear: 'Clear', langToggle: '中文',
    required: 'required',
    larkPrefilled: 'Lark prefilled',
    needSig: 'Please sign before downloading.',
    fullyMaintained: 'Fully Maintained',
    djjAddr: 'DJJ Equipment Pty Ltd · ABN 56 615 358 275 · 100 Derby Street, Silverwater NSW 2128',
  },
  zh: {
    backHome: '← 返回',
    docDelivery: '送货签收单',
    docDispatch: '发货报告',
    docRental: '叉车租赁协议',
    section: { order: '订单参考', delivery: '送货信息', transport: '运输公司', driver: '司机信息', items: '货物明细', meta: '报告信息', vehicle: '车辆/设备', times: '时间', ratings: '评分 (1–5)', staff: '人员', issues: '问题/备注', lessor: '出租方', lessee: '承租方', period: '租期', forklift: '叉车', charges: '费用', card: '信用卡', exec: '签署', sign: '签字' },
    fields: {
      invoice_no: '税务发票号', invoice_date: '发票日期', sales_rep: '销售代表',
      pickup_location: '取货地点', customer_name: '客户名称', customer_abn: '客户 ABN',
      delivery_address: '送货地址', delivery_contact: '联系人',
      delivery_phone: '联系电话', delivery_email: '联系邮箱',
      transport_company: '运输公司', transport_contact: '运输联系人',
      transport_phone: '运输电话', transport_email: '运输邮箱',
      driver_name: '司机姓名', driver_phone: '司机电话', vehicle_rego: '车辆牌照',
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
    deliverySubmit: '生成 PDF 并提交',
    copyLink: '复制司机签署链接',
    copiedLink: '签署链接已复制。',
    emailedViaBridge: 'PDF 已生成，并已交给邮件自动化桥接。',
    emailedViaHost: 'PDF 已生成，并已交给宿主自动化流程。',
    missingMailer: 'PDF 已在本地生成；自动发送仍需接入 Gmail / 飞书流程。',
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

function StaticField({ label, value, wide }) {
  return (
    <div style={{
      gridColumn: wide ? '1 / -1' : 'auto',
      minHeight: 68, padding: '10px 12px',
      border: '1px solid var(--rule)', borderRadius: 6,
      background: '#faf9f5',
    }}>
      <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 5 }}>
        {label}
      </div>
      <div style={{ fontSize: 15, lineHeight: 1.45, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {value || '—'}
      </div>
    </div>
  );
}

function DeliveryItems({ items, lang }) {
  const rows = Array.isArray(items) && items.length ? items : [{}];
  const labels = lang === 'zh'
    ? { desc: '描述', model: '型号', serial: 'VIN / 序列号', qty: '数量' }
    : { desc: 'Description', model: 'Model', serial: 'VIN / Serial', qty: 'Qty' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rows.map((item, idx) => (
        <div key={idx} style={{
          border: '1px solid var(--rule)', borderRadius: 6,
          padding: 12, background: '#fff',
        }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 8 }}>
            {lang === 'zh' ? `货物 ${idx + 1}` : `Item ${idx + 1}`}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 10,
          }}>
            <StaticField label={labels.desc} value={item.description} wide />
            <StaticField label={labels.model} value={item.model} />
            <StaticField label={labels.serial} value={item.serial || item.vin} />
            <StaticField label={labels.qty} value={item.quantity || item.qty} />
          </div>
        </div>
      ))}
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

function parseDeliveryItems(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function hydrateDeliveryPrefill(raw) {
  const items = parseDeliveryItems(raw.delivery_items || raw.items);
  return {
    ...raw,
    items: items.length ? items : undefined,
  };
}

function buildDeliveryShareUrl(data) {
  const url = new URL(window.location.href);
  url.hash = '/delivery';
  url.search = '';
  const fields = [
    'invoice_no', 'invoice_date', 'sales_rep', 'pickup_location',
    'customer_name', 'customer_abn', 'delivery_address', 'delivery_contact',
    'delivery_phone', 'delivery_email', 'transport_company', 'transport_contact',
    'transport_phone', 'transport_email',
  ];
  fields.forEach((key) => {
    if (data[key]) url.searchParams.set(key, data[key]);
  });
  if (Array.isArray(data.items) && data.items.length) {
    url.searchParams.set('delivery_items', JSON.stringify(data.items));
  }
  return url.toString();
}

const DEFAULT_DELIVERY = {
  invoice_no: '',
  invoice_date: '',
  sales_rep: '',
  pickup_location: 'DJJ Brisbane — 65-67 Beal St, Meadowbrook QLD 4131',
  customer_name: '',
  customer_abn: '',
  delivery_address: '',
  delivery_contact: '',
  delivery_phone: '',
  delivery_email: '',
  transport_company: '',
  transport_contact: '',
  transport_phone: '',
  transport_email: '',
  items: [],
  driver_name: '',
  driver_phone: '',
  vehicle_rego: '',
};
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
function DeliveryBody({ data, set, lang, sigSlot }) {
  const t = T[lang];
  const driver = (key, opts = {}) => (
    <Field name={key} en={t.fields[key]} zh={T.zh.fields[key]} lang={lang}
      value={data[key]} onChange={set} required
      {...opts}
    />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <DocHeader
        title={t.docDelivery}
        subtitle={data.invoice_no || (lang === 'zh' ? '等待发票号' : 'Awaiting invoice #')}
        badge="DJJ"
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 18,
      }}>
        <div>
          <SectionHead>{t.section.order}</SectionHead>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
            <StaticField label={t.fields.invoice_no} value={data.invoice_no} />
            <StaticField label={t.fields.invoice_date} value={data.invoice_date} />
            <StaticField label={t.fields.sales_rep} value={data.sales_rep} />
            <StaticField label={t.fields.pickup_location} value={data.pickup_location} wide />
          </div>
        </div>

        <div>
          <SectionHead>{t.section.delivery}</SectionHead>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
            <StaticField label={t.fields.customer_name} value={data.customer_name} />
            <StaticField label={t.fields.customer_abn} value={data.customer_abn} />
            <StaticField label={t.fields.delivery_address} value={data.delivery_address} wide />
            <StaticField label={t.fields.delivery_contact} value={data.delivery_contact} />
            <StaticField label={t.fields.delivery_phone} value={data.delivery_phone} />
            <StaticField label={t.fields.delivery_email} value={data.delivery_email} />
          </div>
        </div>
      </div>

      <SectionHead>{t.section.transport}</SectionHead>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 10,
      }}>
        <StaticField label={t.fields.transport_company} value={data.transport_company} />
        <StaticField label={t.fields.transport_contact} value={data.transport_contact} />
        <StaticField label={t.fields.transport_phone} value={data.transport_phone} />
        <StaticField label={t.fields.transport_email} value={data.transport_email} />
      </div>

      <SectionHead>{t.section.items}</SectionHead>
      <DeliveryItems items={data.items} lang={lang} />

      <SectionHead>{t.section.driver}</SectionHead>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 10,
      }}>
        {driver('driver_name')}
        {driver('driver_phone')}
        {driver('vehicle_rego')}
      </div>

      <SectionHead>{t.section.sign}</SectionHead>
      {sigSlot}
    </div>
  );
}

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
    const defaults = kind === 'delivery'
      ? DEFAULT_DELIVERY
      : kind === 'dispatch'
        ? DEFAULT_DISPATCH
        : DEFAULT_RENTAL;
    const [data, setData] = useState(() => {
      const raw = readPrefill();
      const prefill = kind === 'delivery' ? hydrateDeliveryPrefill(raw) : raw;
      return { ...defaults, ...prefill, items: prefill.items || defaults.items };
    });
    const set = (k, v) => setData(d => ({ ...d, [k]: v }));
    const sigRef = useRef(null);
    const [sigEmpty, setSigEmpty] = useState(true);
    const [err, setErr] = useState('');
    const [note, setNote] = useState('');
    const [busy, setBusy] = useState(false);
    const printRef = useRef(null);

    // Expose Lark hook on window for the embedding host to call
    useEffect(() => {
      window.LarkFill = (obj) => setData(d => {
        const next = kind === 'delivery' ? hydrateDeliveryPrefill(obj || {}) : (obj || {});
        return { ...d, ...next, items: next.items || d.items };
      });
      const onMsg = (e) => {
        if (e?.data?.type === 'lark:fill' && e.data.payload) {
          setData(d => {
            const next = kind === 'delivery' ? hydrateDeliveryPrefill(e.data.payload) : e.data.payload;
            return { ...d, ...next, items: next.items || d.items };
          });
        }
      };
      window.addEventListener('message', onMsg);
      return () => window.removeEventListener('message', onMsg);
    }, [kind]);

    const submit = async () => {
      if (kind === 'delivery' && (!data.driver_name || !data.driver_phone || !data.vehicle_rego)) {
        setErr(lang === 'zh' ? '请填写司机姓名、电话和车牌。' : 'Please fill driver name, phone, and vehicle rego.');
        return;
      }
      if (sigRef.current?.isEmpty?.()) { setErr(t.needSig); return; }
      setErr(''); setNote(''); setBusy(true);
      try {
        // 1. Stamp signature into the printable region
        const sigImg = sigRef.current.toDataURL();
        // 2. Build a clean printable doc using current values
        const filename = (kind === 'delivery'
          ? (data.invoice_no || 'delivery-order')
          : kind === 'dispatch'
            ? (data.report_no || 'dispatch-report')
            : (data.agreement_no || 'rental-agreement')) + '.pdf';
        const generated = await window.SigningPDF.generate({ kind, data, sigImg, lang, filename });
        if (kind === 'delivery') {
          const emailPayload = {
            to: 'anita@djjequipment.com.au',
            subject: `DJJ Delivery Order ${data.invoice_no || ''}`.trim(),
            filename,
            data,
            pdfDataUrl: generated?.pdfDataUrl || '',
          };
          if (window.DeliveryOrderMailer?.send) {
            await window.DeliveryOrderMailer.send(emailPayload);
            setNote(t.emailedViaBridge);
          } else if (window.parent !== window) {
            window.parent.postMessage({ type: 'delivery-order:ready-to-email', payload: emailPayload }, '*');
            setNote(t.emailedViaHost);
          } else {
            setNote(t.missingMailer);
          }
        }
        onDone({ kind, data, sigImg, filename, pdfDataUrl: generated?.pdfDataUrl || '' });
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
          label={kind === 'rental' ? 'LESSEE SIGNATURE' : 'DRIVER SIGNATURE'}
          zhLabel={kind === 'rental' ? '承租方签字' : '司机签字'}
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

    const body = kind === 'delivery'
      ? <DeliveryBody data={data} set={set} lang={lang} sigSlot={sigSlot} />
      : kind === 'dispatch'
        ? <DispatchBody data={data} set={set} lang={lang} sigSlot={sigSlot} />
        : <RentalBody  data={data} set={set} lang={lang} sigSlot={sigSlot} />;

    const copyLink = async () => {
      const link = buildDeliveryShareUrl(data);
      try {
        await navigator.clipboard.writeText(link);
        setErr('');
        setNote(t.copiedLink);
      } catch {
        setErr(lang === 'zh' ? '复制失败，请手动复制浏览器地址。' : 'Copy failed. Please copy the browser URL manually.');
      }
    };

    return (
      <window.AppShell
        title={kind === 'delivery' ? t.docDelivery : kind === 'dispatch' ? t.docDispatch : t.docRental}
        lang={lang} setLang={setLang} goHome={goHome}
        footer={
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 220px' }}>
              {err && <span style={{ color: 'var(--required)', fontSize: 13 }}>{err}</span>}
              {note && <span style={{ color: 'var(--ok)', fontSize: 13 }}>{note}</span>}
            </div>
            {kind === 'delivery' && (
              <button type="button" onClick={copyLink}
                style={{
                  minHeight: 44, padding: '0 16px',
                  background: '#fff', color: 'var(--ink)',
                  border: '1px solid var(--rule)', borderRadius: 6,
                  fontSize: 14, fontWeight: 600,
                }}>
                {t.copyLink}
              </button>
            )}
            <button type="button" onClick={submit} disabled={busy}
              style={{
                marginLeft: 'auto', minHeight: 48, padding: '0 20px',
                background: sigEmpty ? '#888' : 'var(--ink)', color: '#fff',
                border: 'none', borderRadius: 6, fontSize: 16, fontWeight: 600,
                opacity: busy ? 0.6 : 1, cursor: sigEmpty ? 'not-allowed' : 'pointer',
                minWidth: 220,
              }}>
              {busy ? '…' : kind === 'delivery' ? t.deliverySubmit : t.saveDownload}
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

window.DeliveryOrderForm = makeForm('delivery');
window.DispatchForm = makeForm('dispatch');
window.RentalForm   = makeForm('rental');
