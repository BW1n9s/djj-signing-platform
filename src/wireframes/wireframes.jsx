// wireframes.jsx — five direction explorations for the DJJ signing platform.
// Each direction has 2–3 key screens. iPad split-view direction has its own
// frame size. Bilingual labels throughout.

// ─────────────────────────────────────────────────────────────
// Local helpers — keep file flat & readable
// ─────────────────────────────────────────────────────────────
const w = window;
const Pad = ({ h = 8 }) => <div style={{ height: h }} />;

// Plain "phone screen content" wrapper — gives us paper bg + scroll padding
// without the IOS NavBar (so the wireframe owns its own chrome).
function WFShell({ children, title, tabBar, dark = false, hideStatus }) {
  return (
    <w.IOSDevice dark={dark}>
      {title && (
        <div style={{
          padding: '60px 18px 8px',
          fontFamily: w.WF.hand, fontSize: 26, fontWeight: 700, color: w.WF.ink,
          background: w.WF.paper,
          borderBottom: '1px dashed ' + w.WF.rule,
        }}>{title}</div>
      )}
      {!title && <div style={{ height: 54 }} />}
      <div style={{ flex: 1, overflow: 'hidden', background: w.WF.paper, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
      {tabBar && tabBar}
    </w.IOSDevice>
  );
}

// ─────────────────────────────────────────────────────────────
// A — PAPER FORM (long-scroll, mimics a paper receipt)
// ─────────────────────────────────────────────────────────────
function A_DispatchPaper() {
  return (
    <WFShell>
      <w.WFPage>
        <w.WFDocHeader doc="Dispatch Report" zh="发货报告"
          subtitle="DJJ-SW-2026-0511-018" docRef="auto-filled · Lark" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <w.WFField label="REPORT #" zh="报告编号" value="SW-2026-0511-018" prefilled />
          <w.WFField label="DATE" zh="日期" value="11 May 2026" prefilled />
          <w.WFField label="REGO" zh="车牌" value="DJJ-241" prefilled />
          <w.WFField label="INVOICE #" zh="订单编号" value="INV-2613" prefilled />
          <w.WFField label="DRIVER" zh="司机名字" value="John Smith" prefilled />
          <w.WFField label="PHONE" zh="司机电话" value="+61 412 345 678" prefilled />
        </div>

        <w.WFRule>EQUIPMENT · 车辆/设备</w.WFRule>
        <w.WFTableRow header cols={[
          { label: 'Serial# · 车辆编号', w: '110px' }, { label: 'Model · 型号' },
        ]} />
        <w.WFTableRow last cols={[
          { value: 'TY-8FG25-2208', w: '110px', prefilled: true },
          { value: 'Toyota 8FG25 Forklift', prefilled: true },
        ]} />

        <w.WFRule>TIMES · 时间</w.WFRule>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <w.WFField label="DISPATCH" zh="发货时间" value="09:15 · 11 May" prefilled />
          <w.WFField label="COMPLETED" zh="完成时间" placeholder="—" />
        </div>

        <w.WFRule>RATINGS · 评分 (1–5)</w.WFRule>
        {['Logistics · 物流公司', 'Driver · 运输司机'].map((t, ri) => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed ' + w.WF.rule2 }}>
            <span style={{ fontFamily: w.WF.body, fontSize: 13 }}>{t}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1,2,3,4,5].map(n => (
                <span key={n} style={{
                  width: 22, height: 22, borderRadius: 999,
                  border: '1.5px solid ' + w.WF.ink2,
                  background: n <= (ri === 0 ? 4 : 5) ? w.WF.ink : 'transparent',
                  color: n <= (ri === 0 ? 4 : 5) ? '#fff' : w.WF.ink2,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: w.WF.mono, fontSize: 11,
                }}>{n}</span>
              ))}
            </div>
          </div>
        ))}

        <w.WFRule>STAFF · 人员</w.WFRule>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <w.WFField label="* SUPERVISOR" zh="主管" value="Daniel Wu" prefilled />
          <w.WFField label="* OPERATOR" zh="操作人员" value="Mike Chen" prefilled />
        </div>

        <w.WFField label="ISSUES · 问题备注" zh="" placeholder="Any issues or remarks…" style={{ marginTop: 10 }} />

        <w.WFRule>SIGNATURE · 签字</w.WFRule>
        <div style={{ fontFamily: w.WF.mono, fontSize: 10, color: w.WF.muted, marginBottom: 4 }}>DRIVER · 司机</div>
        <w.WFSigBox h={86} />
        <Pad h={14} />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <w.WFBtn primary>Generate PDF · 生成 PDF</w.WFBtn>
        </div>
        <Pad h={20} />
      </w.WFPage>
    </WFShell>
  );
}

function A_RentalPaper() {
  return (
    <WFShell>
      <w.WFPage>
        <w.WFDocHeader doc="Forklift Rental Agreement" zh="叉车租赁协议"
          subtitle="DJJ-HIRE-04612S-01" docRef="Fully Maintained" />
        <div style={{ fontFamily: w.WF.mono, fontSize: 9.5, color: w.WF.muted, marginBottom: 4 }}>LESSOR · 出租方</div>
        <div style={{ background: 'rgba(246,224,144,0.18)', padding: '6px 8px', borderRadius: 3, fontFamily: w.WF.body, fontSize: 12, lineHeight: 1.4, marginBottom: 8 }}>
          <b>DJJ Equipment Pty Ltd</b> · ABN 56 615 358 275<br/>
          100 Derby Street, Silverwater, NSW 2128
        </div>
        <div style={{ fontFamily: w.WF.mono, fontSize: 9.5, color: w.WF.muted, marginBottom: 4 }}>LESSEE · 承租方</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <w.WFField label="COMPANY" zh="公司名称" value="ACME Logistics Pty Ltd" prefilled />
          <w.WFField label="ABN" zh="" value="12 345 678 901" prefilled />
          <w.WFField label="CONTACT" zh="联系人" value="Sarah Lee" prefilled />
          <w.WFField label="PHONE" zh="电话" value="+61 488 222 333" prefilled />
          <w.WFField label="EMAIL" zh="邮箱" value="sarah@acme.com.au" prefilled style={{ gridColumn: '1 / span 2' }} />
          <w.WFField label="DELIVERY ADDRESS" zh="收货地址" value="22 Industrial Dr, Wetherill Park" prefilled style={{ gridColumn: '1 / span 2' }} />
        </div>
        <w.WFRule>RENTAL · 租期</w.WFRule>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <w.WFField label="START" zh="起租" value="12 May 2026" prefilled />
          <w.WFField label="END" zh="到期" value="11 Aug 2026" prefilled />
        </div>
        <w.WFRule>FORKLIFT · 设备</w.WFRule>
        <w.WFTableRow header cols={[
          { label: 'Description', }, { label: 'Serial', w: '70px' },
          { label: 'Weekly', w: '54px' }, { label: 'Del/Col', w: '54px' },
        ]} />
        <w.WFTableRow last cols={[
          { value: 'Toyota 8FG25', prefilled: true },
          { value: 'TY-2208', w: '70px', prefilled: true },
          { value: '$ 385', w: '54px', prefilled: true },
          { value: '$ 220', w: '54px', prefilled: true },
        ]} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 4px', borderTop: '1px solid ' + w.WF.rule, marginTop: 4, fontFamily: w.WF.mono, fontSize: 11 }}>
          <span>INITIAL CHARGE (1w + del + col)</span>
          <b style={{ background: 'rgba(246,224,144,0.3)', padding: '0 4px' }}>$ 605</b>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 4px 8px', fontFamily: w.WF.mono, fontSize: 11 }}>
          <span>ONGOING WEEKLY</span>
          <b style={{ background: 'rgba(246,224,144,0.3)', padding: '0 4px' }}>$ 385</b>
        </div>
        <w.WFRule>CREDIT CARD · 信用卡</w.WFRule>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <w.WFField label="NAME ON CARD" zh="" placeholder="—" />
          <w.WFField label="CARD NO." zh="" placeholder="•••• •••• •••• ••••" />
          <w.WFField label="EXPIRY" zh="" placeholder="MM / YY" />
          <w.WFField label="CCV" zh="" placeholder="•••" />
        </div>
        <w.WFRule>EXECUTION · 签署</w.WFRule>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
          <w.WFField label="FULL NAME" zh="全名" value="Sarah Lee" prefilled />
          <w.WFField label="POSITION" zh="职位" value="Operations Mgr" prefilled />
        </div>
        <div style={{ fontFamily: w.WF.mono, fontSize: 10, color: w.WF.muted, marginBottom: 4 }}>LESSEE SIGNATURE · 承租方签字</div>
        <w.WFSigBox h={80} />
        <Pad h={14} />
        <w.WFBtn primary style={{ width: '100%' }}>Save & Send PDF · 保存并发送 PDF</w.WFBtn>
      </w.WFPage>
    </WFShell>
  );
}

// ─────────────────────────────────────────────────────────────
// B — STEP WIZARD (Info → Review → Sign → Done)
// ─────────────────────────────────────────────────────────────
function WizSteps({ step }) {
  const items = ['INFO · 信息', 'REVIEW · 复核', 'SIGN · 签字', 'DONE · 完成'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 18px 10px', background: w.WF.paper }}>
      {items.map((t, i) => (
        <React.Fragment key={t}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            color: i <= step ? w.WF.ink : w.WF.muted,
            fontFamily: w.WF.mono, fontSize: 9, letterSpacing: 0.3,
          }}>
            <span style={{
              width: 16, height: 16, borderRadius: 999,
              border: '1.5px solid ' + (i <= step ? w.WF.ink : w.WF.rule),
              background: i < step ? w.WF.ink : (i === step ? w.WF.yellow : 'transparent'),
              color: i < step ? '#fff' : w.WF.ink,
              fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
            }}>{i + 1}</span>
            {t}
          </div>
          {i < items.length - 1 && <div style={{ flex: 1, height: 1, background: w.WF.rule }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function B_Info() {
  return (
    <WFShell title="Dispatch · 发车">
      <WizSteps step={0} />
      <w.WFPage>
        <div style={{ fontFamily: w.WF.body, fontSize: 14, color: w.WF.ink2, marginBottom: 12 }}>
          Confirm the details below.<br/>
          请确认以下信息。
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <w.WFField label="DRIVER" zh="司机" value="John Smith · 史密斯" prefilled />
          <w.WFField label="PLATE" zh="车牌" value="DJJ-241" prefilled />
          <w.WFField label="JOBSITE" zh="工地" value="Wetherill Park" prefilled />
          <w.WFField label="RECEIVER" zh="收货人" placeholder="Tap to enter… · 点击输入" />
          <w.WFField label="PHONE" zh="电话" placeholder="+86 ___ ____ ____" />
        </div>
        <w.WFRule>SOURCE · 数据来源</w.WFRule>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <w.WFChip on color={w.WF.ink}>Lark Dispatch #018</w.WFChip>
          <w.WFChip>Manual override</w.WFChip>
        </div>
        <Pad h={20} />
        <div style={{ display: 'flex', gap: 10 }}>
          <w.WFBtn style={{ flex: 1 }}>Cancel · 取消</w.WFBtn>
          <w.WFBtn primary style={{ flex: 2 }}>Next · 下一步</w.WFBtn>
        </div>
      </w.WFPage>
    </WFShell>
  );
}

function B_Review() {
  return (
    <WFShell title="Review · 复核">
      <WizSteps step={1} />
      <w.WFPage>
        <div style={{
          border: '1.5px solid ' + w.WF.rule, borderRadius: 6, padding: 12,
          background: '#fff', marginBottom: 12,
        }}>
          <div style={{ fontFamily: w.WF.hand, fontSize: 18, marginBottom: 6 }}>Dispatch Slip · 发车单</div>
          <div style={{ fontFamily: w.WF.mono, fontSize: 10, color: w.WF.muted, marginBottom: 8 }}>DJJ-2026-0511-018</div>
          <w.WFTableRow cols={[{ label: 'Driver', w: '70px' }, { value: 'John Smith', prefilled: true }]} />
          <w.WFTableRow cols={[{ label: 'Plate', w: '70px' }, { value: 'DJJ-241', prefilled: true }]} />
          <w.WFTableRow cols={[{ label: 'Items', w: '70px' }, { value: '1× Toyota 8FG25', prefilled: true }]} />
          <w.WFTableRow last cols={[{ label: 'Receiver', w: '70px' }, { value: 'Sarah Lee', prefilled: true }]} />
        </div>
        <w.WFPlaceholder h={120} label={'[ Full PDF preview · 完整 PDF 预览 ]\nrendered via html2pdf'} />
        <Pad h={14} />
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontFamily: w.WF.body, fontSize: 12.5, color: w.WF.ink2 }}>
          <span style={{ width: 16, height: 16, borderRadius: 3, border: '1.5px solid ' + w.WF.ink2,
            background: w.WF.ink, flexShrink: 0, marginTop: 1 }} />
          I confirm the above is accurate. 本人确认以上信息无误。
        </label>
        <Pad h={14} />
        <div style={{ display: 'flex', gap: 10 }}>
          <w.WFBtn style={{ flex: 1 }}>Back · 上一步</w.WFBtn>
          <w.WFBtn primary style={{ flex: 2 }}>Sign · 去签字</w.WFBtn>
        </div>
      </w.WFPage>
    </WFShell>
  );
}

function B_Sign() {
  return (
    <WFShell title="Sign · 签字">
      <WizSteps step={2} />
      <w.WFPage style={{ padding: '12px 18px' }}>
        <div style={{ fontFamily: w.WF.body, fontSize: 13, color: w.WF.ink2, marginBottom: 10 }}>
          Sign with finger or Apple Pencil.<br/>
          请使用手指或 Apple Pencil 签字。
        </div>
        <div style={{
          height: 260, border: '2px dashed ' + w.WF.red,
          borderRadius: 6, background: w.WF.redSoft,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <svg width="180" height="70" viewBox="0 0 180 70">
            <path d="M10 45 Q 28 10, 42 38 T 70 32 Q 84 14, 102 40 Q 116 56, 132 32 Q 148 12, 168 36"
              stroke={w.WF.ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          </svg>
          <div style={{ position: 'absolute', bottom: 6, right: 8, fontFamily: w.WF.mono, fontSize: 9, color: w.WF.red }}>
            ✎ drawing…
          </div>
        </div>
        <Pad h={10} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: w.WF.mono, fontSize: 10, color: w.WF.muted }}>
          <span>Pressure: ON · iPad Pencil</span>
          <span>Stroke ▮▮▮</span>
        </div>
        <Pad h={14} />
        <div style={{ display: 'flex', gap: 10 }}>
          <w.WFBtn style={{ flex: 1 }}>Clear · 清除</w.WFBtn>
          <w.WFBtn primary style={{ flex: 2 }}>Confirm · 确认签字</w.WFBtn>
        </div>
        <Pad h={10} />
        <div style={{ fontFamily: w.WF.mono, fontSize: 9.5, color: w.WF.muted, textAlign: 'center' }}>
          Captured at 14:32 · GPS 22.5431, 113.9234 (optional)
        </div>
      </w.WFPage>
    </WFShell>
  );
}

function B_Done() {
  return (
    <WFShell title="Done · 完成">
      <WizSteps step={3} />
      <w.WFPage style={{ padding: '24px 18px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 999,
            border: '2.5px solid ' + w.WF.ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: w.WF.yellow,
          }}>
            <svg width="32" height="32" viewBox="0 0 32 32"><path d="M8 17 l5 5 l11 -13" stroke={w.WF.ink} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div style={{ fontFamily: w.WF.hand, fontSize: 28, fontWeight: 700, lineHeight: 1.1 }}>All signed!</div>
          <div style={{ fontFamily: w.WF.body, fontSize: 15, color: w.WF.ink2 }}>已完成签署</div>
        </div>
        <Pad h={16} />
        <div style={{
          border: '1.2px dashed ' + w.WF.rule, borderRadius: 6, padding: 12,
          background: '#fff', fontFamily: w.WF.mono, fontSize: 11, color: w.WF.ink2,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span>DJJ-2026-0511-018.pdf</span><span>184 KB</span>
          </div>
          <div style={{ color: w.WF.muted, fontSize: 10 }}>Sent to · 发送至</div>
          <div>· dispatch@djj.com.au</div>
          <div>· lark://message/group/dispatch-ops</div>
          <div>· sarah@acme.com.au</div>
        </div>
        <Pad h={16} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <w.WFBtn primary style={{ width: '100%' }}>Download PDF · 下载 PDF</w.WFBtn>
          <w.WFBtn style={{ width: '100%' }}>Start another · 再来一单</w.WFBtn>
        </div>
      </w.WFPage>
    </WFShell>
  );
}

// ─────────────────────────────────────────────────────────────
// C — TAP-TO-SIGN (PDF preview first, hotspots for fields/sigs)
// ─────────────────────────────────────────────────────────────
function C_Preview() {
  return (
    <WFShell title="Rental · 租赁合同">
      <w.WFPage style={{ padding: '8px 14px 0', background: '#e6e2d6' }}>
        <div style={{
          background: '#fff', borderRadius: 4, padding: '16px 18px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px ' + w.WF.rule,
          position: 'relative', fontFamily: '"Times New Roman",serif',
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, textAlign: 'center', letterSpacing: 1 }}>
            EQUIPMENT RENTAL CONTRACT
          </div>
          <div style={{ fontSize: 11, textAlign: 'center', color: '#555', marginBottom: 10 }}>设备租赁合同</div>
          <div style={{ fontSize: 10.5, lineHeight: 1.5, color: '#222' }}>
            <p>Between <b>DJJ Equipment Pty Ltd</b> (Lessor) and <span style={{ background: w.WF.yellow, padding: '0 4px', borderRadius: 2, border: '1px dashed ' + w.WF.red }}>[ Lessee · 承租方 ]</span> for the rental of:</p>
            <p>· 1× Toyota 8FG25 Forklift (S/N TY-2208)</p>
            <p>Weekly $385 · Del/Col $220 · Initial $605</p>
            <p>Term: <span style={{ background: w.WF.yellow, padding: '0 4px', borderRadius: 2, border: '1px dashed ' + w.WF.red }}>[ start ]</span> → <span style={{ background: w.WF.yellow, padding: '0 4px', borderRadius: 2, border: '1px dashed ' + w.WF.red }}>[ end ]</span></p>
            <p style={{ color: '#666', fontStyle: 'italic' }}>…</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 8.5, color: '#666' }}>LESSOR · DJJ Rep.</div>
              <div style={{ height: 36, borderBottom: '1px solid #333',
                display: 'flex', alignItems: 'center' }}>
                <svg width="60" height="22" viewBox="0 0 80 28"><path d="M2 18 Q 12 4, 22 16 T 40 12 Q 50 24, 62 14 Q 70 8, 78 16" stroke="#111" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
              </div>
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{ fontSize: 8.5, color: '#666' }}>LESSEE · 承租方</div>
              <div style={{ height: 36, borderBottom: '1px dashed ' + w.WF.red, background: w.WF.redSoft,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: w.WF.hand, color: w.WF.red, fontSize: 12 }}>
                Tap to sign · 点此签字
              </div>
            </div>
          </div>
        </div>
        <w.WFNote left={138} top={84} rotate={2}>
          highlighted = needs your input · 黄色为待填字段
        </w.WFNote>
      </w.WFPage>
      <div style={{
        padding: '10px 14px 14px', background: '#e6e2d6',
        display: 'flex', gap: 8, alignItems: 'center', borderTop: '1px solid ' + w.WF.rule,
      }}>
        <div style={{
          padding: '8px 10px', border: '1.5px dashed ' + w.WF.red, borderRadius: 999,
          fontFamily: w.WF.mono, fontSize: 10, color: w.WF.red,
        }}>3 fields left · 剩 3 项</div>
        <div style={{ flex: 1 }} />
        <w.WFBtn primary>Sign next ↓</w.WFBtn>
      </div>
    </WFShell>
  );
}

function C_SignSheet() {
  return (
    <WFShell title="Rental · 租赁合同">
      <div style={{ flex: 1, position: 'relative', background: '#bdb8ab' }}>
        {/* faded doc behind */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.45, padding: 14 }}>
          <div style={{ background: '#fff', borderRadius: 4, height: '100%', padding: 16,
            fontFamily: '"Times New Roman",serif', fontSize: 10, color: '#222' }}>
            <div style={{ fontWeight: 700, fontSize: 13, textAlign: 'center' }}>EQUIPMENT RENTAL CONTRACT</div>
            <p style={{ fontSize: 9, marginTop: 8 }}>Between DJJ Equipment Pty Ltd and …</p>
          </div>
        </div>
        {/* bottomsheet */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          background: w.WF.paper,
          borderTopLeftRadius: 22, borderTopRightRadius: 22,
          padding: '12px 18px 22px',
          boxShadow: '0 -8px 24px rgba(0,0,0,0.18)',
        }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: w.WF.rule,
            margin: '0 auto 10px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <div style={{ fontFamily: w.WF.hand, fontSize: 20, fontWeight: 700 }}>Lessee Signature</div>
            <div style={{ fontFamily: w.WF.mono, fontSize: 10, color: w.WF.muted }}>field 4 of 7</div>
          </div>
          <div style={{ fontFamily: w.WF.body, fontSize: 12, color: w.WF.ink2, marginBottom: 10 }}>承租方签字</div>
          <div style={{
            height: 200, border: '2px dashed ' + w.WF.red, borderRadius: 6,
            background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="200" height="70" viewBox="0 0 200 70">
              <path d="M10 38 Q 24 10, 40 36 T 70 30 Q 82 12, 100 38 Q 116 56, 132 32 Q 148 12, 168 36 Q 178 50, 192 34"
                stroke={w.WF.ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <Pad h={10} />
          <div style={{ display: 'flex', gap: 10 }}>
            <w.WFBtn style={{ flex: 1 }}>Clear</w.WFBtn>
            <w.WFBtn style={{ flex: 1 }}>Skip</w.WFBtn>
            <w.WFBtn primary style={{ flex: 2 }}>Save & Next →</w.WFBtn>
          </div>
        </div>
      </div>
    </WFShell>
  );
}

function C_Done() {
  return (
    <WFShell>
      <w.WFPage style={{ padding: '40px 24px', justifyContent: 'flex-start', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: w.WF.hand, fontSize: 32, fontWeight: 700, lineHeight: 1.05 }}>
          Contract signed ✓
        </div>
        <div style={{ fontFamily: w.WF.body, fontSize: 16, color: w.WF.ink2, marginBottom: 16 }}>合同已签署完成</div>
        <w.WFPlaceholder h={220} label={'[ thumbnail of final PDF\n 最终 PDF 缩略图 ]'} />
        <Pad h={14} />
        <div style={{ fontFamily: w.WF.mono, fontSize: 10, color: w.WF.muted, marginBottom: 6 }}>NEXT · 接下来</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <w.WFBtn primary>↓ Download PDF · 下载</w.WFBtn>
          <w.WFBtn>✉ Email to me & lessee</w.WFBtn>
          <w.WFBtn>↗ Post to Lark group</w.WFBtn>
        </div>
      </w.WFPage>
    </WFShell>
  );
}

// ─────────────────────────────────────────────────────────────
// D — iPad SPLIT VIEW (landscape, persistent sig pad)
// ─────────────────────────────────────────────────────────────
function IPadFrame({ children }) {
  // simple landscape iPad bezel — keep this local since ios_frame is iPhone-only
  return (
    <div style={{
      width: 1180, height: 820, borderRadius: 28,
      background: '#1a1a1a', padding: 14,
      boxShadow: '0 30px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      fontFamily: '-apple-system,system-ui',
    }}>
      <div style={{ width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden',
        background: w.WF.paper, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}

function IPadTopBar({ title, breadcrumbs }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '14px 22px',
      borderBottom: '1px solid ' + w.WF.rule, gap: 14, background: '#fff',
    }}>
      <img src="djjlogo.png" alt="DJJ" style={{ height: 22, width: 'auto', display: 'block' }} />
      <div style={{ fontFamily: w.WF.hand, fontSize: 22, fontWeight: 700 }}>{title}</div>
      <div style={{ fontFamily: w.WF.mono, fontSize: 11, color: w.WF.muted }}>{breadcrumbs}</div>
      <div style={{ flex: 1 }} />
      <w.WFChip on color={w.WF.ink}>EN</w.WFChip>
      <w.WFChip>中</w.WFChip>
      <div style={{ width: 30, height: 30, borderRadius: 999, background: w.WF.rule2, marginLeft: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: w.WF.mono, fontSize: 10 }}>ZW</div>
    </div>
  );
}

function D_Dispatch() {
  return (
    <IPadFrame>
      <IPadTopBar title="Dispatch · 发车" breadcrumbs="DJJ-2026-0511-018 · auto from Lark" />
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.4fr 1fr', minHeight: 0 }}>
        {/* LEFT — paper preview */}
        <div style={{ overflow: 'auto', padding: 28, background: '#e8e4d8' }}>
          <div style={{
            background: '#fff', borderRadius: 4, padding: '28px 36px',
            boxShadow: '0 4px 18px rgba(0,0,0,0.1)',
            fontFamily: '"Times New Roman",serif',
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', letterSpacing: 2 }}>
              DISPATCH & DELIVERY SLIP
            </div>
            <div style={{ fontSize: 13, textAlign: 'center', color: '#555', marginBottom: 18 }}>发车交付单</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13, marginBottom: 14 }}>
              <div><b>Driver:</b> John Smith · 史密斯</div>
              <div><b>Vehicle:</b> DJJ-241</div>
              <div><b>Depart:</b> DJJ Silverwater Yard</div>
              <div><b>ETA:</b> 14:30 · 11 May 2026</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead><tr style={{ background: '#f3efe2' }}>
                <th style={{ textAlign: 'left', padding: 6, border: '1px solid ' + w.WF.rule }}>#</th>
                <th style={{ textAlign: 'left', padding: 6, border: '1px solid ' + w.WF.rule }}>Item · 名称</th>
                <th style={{ textAlign: 'left', padding: 6, border: '1px solid ' + w.WF.rule }}>S/N</th>
                <th style={{ textAlign: 'left', padding: 6, border: '1px solid ' + w.WF.rule }}>Qty</th>
              </tr></thead>
              <tbody>
                {[['1','Toyota 8FG25 Forklift','TY-2208','1'],['2','Hyd. breaker 1500kg','BK-104','1'],['3','Transport trailer','TR-09','1'],['4','Operator helmet','HM-007','2']].map(r => (
                  <tr key={r[1]}>{r.map((c,i) => <td key={i} style={{ padding: 6, border: '1px solid ' + w.WF.rule }}>{c}</td>)}</tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 26 }}>
              <div style={{ gridColumn: '1 / span 2' }}>
                <div style={{ fontSize: 11, color: '#666' }}>DRIVER · 司机</div>
                <div style={{ height: 56, borderBottom: '1.5px dashed ' + w.WF.red, background: w.WF.redSoft,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: w.WF.hand, color: w.WF.red, fontSize: 14 }}>
                  ▶ tap to sign · 司机签字
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* RIGHT — persistent panel */}
        <div style={{ borderLeft: '1px solid ' + w.WF.rule, display: 'flex', flexDirection: 'column', background: w.WF.paper }}>
          <div style={{ padding: '16px 22px 8px', borderBottom: '1px dashed ' + w.WF.rule }}>
            <div style={{ fontFamily: w.WF.mono, fontSize: 10, color: w.WF.muted, letterSpacing: 0.4 }}>FIELDS · 字段</div>
            {[
              { l: 'Driver · 司机', v: 'John Smith', done: true },
              { l: 'Vehicle · 车牌', v: 'DJJ-241', done: true },
              { l: 'Equipment · 设备', v: 'Toyota 8FG25', done: true },
              { l: 'Receiver name · 收货人', v: 'Sarah Lee', done: true, active: false },
              { l: 'Driver signature · 司机签字', v: '— pending', done: false, active: true },
            ].map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0',
                borderBottom: '1px dashed ' + w.WF.rule2,
              }}>
                <span style={{ width: 14, height: 14, borderRadius: 999,
                  background: f.done ? w.WF.ink : (f.active ? w.WF.red : 'transparent'),
                  border: '1.5px solid ' + (f.done ? w.WF.ink : (f.active ? w.WF.red : w.WF.rule)) }} />
                <div style={{ flex: 1, fontFamily: w.WF.body, fontSize: 13, color: f.active ? w.WF.red : w.WF.ink }}>
                  {f.l}
                </div>
                <div style={{ fontFamily: w.WF.mono, fontSize: 11, color: w.WF.muted }}>{f.v}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '14px 22px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontFamily: w.WF.hand, fontSize: 20, fontWeight: 700 }}>Driver signature</div>
            <div style={{ fontFamily: w.WF.mono, fontSize: 10, color: w.WF.muted }}>司机签字</div>
          </div>
          <div style={{ padding: '4px 22px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{
              flex: 1, border: '2px dashed ' + w.WF.red, borderRadius: 8, background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 160,
            }}>
              <svg width="260" height="80" viewBox="0 0 260 80">
                <path d="M10 50 Q 30 8, 50 44 T 90 38 Q 110 14, 134 48 Q 152 64, 174 34 Q 196 10, 220 40 Q 234 56, 252 36"
                  stroke={w.WF.ink} strokeWidth="2.6" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ display: 'flex', gap: 10, padding: '14px 0 18px' }}>
              <w.WFBtn style={{ flex: 1 }}>Clear · 清除</w.WFBtn>
              <w.WFBtn primary style={{ flex: 2 }}>Save signature · 保存签字</w.WFBtn>
            </div>
          </div>
        </div>
      </div>
    </IPadFrame>
  );
}

function D_Rental() {
  return (
    <IPadFrame>
      <IPadTopBar title="Rental Contract · 租赁合同" breadcrumbs="RC-2026-0511-04 · draft from Lark" />
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.4fr 1fr', minHeight: 0 }}>
        <div style={{ overflow: 'auto', padding: 28, background: '#e8e4d8' }}>
          <div style={{
            background: '#fff', borderRadius: 4, padding: '32px 44px',
            boxShadow: '0 4px 18px rgba(0,0,0,0.1)',
            fontFamily: '"Times New Roman",serif', fontSize: 12.5, lineHeight: 1.55,
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', letterSpacing: 2 }}>
              EQUIPMENT RENTAL CONTRACT
            </div>
            <div style={{ fontSize: 13, textAlign: 'center', color: '#555', marginBottom: 22 }}>设备租赁合同</div>
            <p>This contract is entered into between <b>DJJ Equipment Pty Ltd</b> (the "Lessor") and <b>ACME Logistics Pty Ltd</b> (the "Lessee") on <b>2026/05/11</b>.</p>
            <p><b>1. Equipment.</b> Lessor agrees to lease one (1) Toyota 8FG25 Excavator, S/N TY-2208.</p>
            <p><b>2. Term.</b> From 12 May 2026 to 11 Aug 2026 (13 weeks).</p>
            <p><b>3. Rate & Deposit.</b> AUD $385 per week · Initial AUD $605 (incl. delivery & collection).</p>
            <p><b>4. Care & Damage.</b> Damage beyond ordinary wear is borne by Lessee.</p>
            <p><b>5. Insurance.</b> Fully Maintained: scheduled servicing included.</p>
            <p style={{ color: '#777', fontStyle: 'italic' }}>… clauses 6–7 omitted in wireframe …</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, marginTop: 30 }}>
              <div>
                <div style={{ fontSize: 11, color: '#666' }}>LESSOR · 出租方</div>
                <div style={{ height: 60, borderBottom: '1px solid #333', display: 'flex', alignItems: 'center' }}>
                  <svg width="120" height="40" viewBox="0 0 120 40"><path d="M4 26 Q 14 6, 26 22 T 50 18 Q 64 32, 80 20 Q 92 8, 116 24" stroke="#111" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
                </div>
                <div style={{ fontSize: 11, marginTop: 4 }}>James Liu · 2026/05/11</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#666' }}>LESSEE · 承租方</div>
                <div style={{ height: 60, borderBottom: '1.5px dashed ' + w.WF.red, background: w.WF.redSoft,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: w.WF.hand, color: w.WF.red, fontSize: 16 }}>
                  ▶ Tap to sign · 点击签字
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderLeft: '1px solid ' + w.WF.rule, display: 'flex', flexDirection: 'column', background: w.WF.paper }}>
          <div style={{ padding: '14px 22px', borderBottom: '1px dashed ' + w.WF.rule }}>
            <div style={{ fontFamily: w.WF.mono, fontSize: 10, color: w.WF.muted, marginBottom: 6 }}>FROM LARK · 来自飞书</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <w.WFChip on color={w.WF.ink}>RC-018</w.WFChip>
              <w.WFChip>+ link Lark record</w.WFChip>
              <w.WFChip>Reload</w.WFChip>
            </div>
          </div>
          <div style={{ padding: '14px 22px', borderBottom: '1px dashed ' + w.WF.rule, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <w.WFField inline label="LESSEE" zh="承租方" value="ACME Logistics" prefilled />
            <w.WFField inline label="START" zh="起租" value="2026/05/12" prefilled />
            <w.WFField inline label="END" zh="到期" value="2026/06/30" prefilled />
            <w.WFField inline label="RATE" zh="单价" value="$385/wk" prefilled />
            <w.WFField inline label="DEPOSIT" zh="押金" value="$605" prefilled />
          </div>
          <div style={{ padding: '14px 22px 4px' }}>
            <div style={{ fontFamily: w.WF.hand, fontSize: 20, fontWeight: 700 }}>Lessee signature</div>
            <div style={{ fontFamily: w.WF.mono, fontSize: 10, color: w.WF.muted }}>承租方签字 · 2 of 2</div>
          </div>
          <div style={{ padding: '6px 22px 20px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{
              flex: 1, border: '2px dashed ' + w.WF.rule, borderRadius: 8, background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 140,
              color: w.WF.muted, fontFamily: w.WF.hand, fontSize: 18,
            }}>
              Sign with finger or Apple Pencil
            </div>
            <div style={{ display: 'flex', gap: 10, paddingTop: 12 }}>
              <w.WFBtn style={{ flex: 1 }}>Clear</w.WFBtn>
              <w.WFBtn primary style={{ flex: 2 }}>Sign & Generate PDF →</w.WFBtn>
            </div>
          </div>
        </div>
      </div>
    </IPadFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// E — CONVERSATIONAL (chat-bubble field list)
// ─────────────────────────────────────────────────────────────
function ChatBubble({ side = 'left', tone = 'plain', children, label }) {
  const isLeft = side === 'left';
  const toneStyle = {
    plain: { bg: '#fff', border: '1px solid ' + w.WF.rule, color: w.WF.ink },
    lark: { bg: w.WF.blueTint, border: '1px solid #b2c3d6', color: '#26384a' },
    user: { bg: w.WF.ink, border: '1px solid ' + w.WF.ink, color: w.WF.paper },
    sign: { bg: w.WF.redSoft, border: '1.5px dashed ' + w.WF.red, color: w.WF.ink },
  }[tone];
  return (
    <div style={{ display: 'flex', justifyContent: isLeft ? 'flex-start' : 'flex-end', marginBottom: 10 }}>
      <div style={{ maxWidth: '78%' }}>
        {label && <div style={{ fontFamily: w.WF.mono, fontSize: 9, color: w.WF.muted, marginBottom: 3,
          textAlign: isLeft ? 'left' : 'right', letterSpacing: 0.3 }}>{label}</div>}
        <div style={{
          ...toneStyle,
          padding: '8px 12px',
          borderRadius: 14,
          borderBottomLeftRadius: isLeft ? 4 : 14,
          borderBottomRightRadius: isLeft ? 14 : 4,
          fontFamily: w.WF.body, fontSize: 13.5, lineHeight: 1.35,
        }}>{children}</div>
      </div>
    </div>
  );
}

function E_Dispatch() {
  return (
    <WFShell title="发车 · Dispatch">
      <w.WFPage style={{ background: '#f3f0e7' }}>
        <ChatBubble label="DJJ · Lark" tone="lark">
          New dispatch · 新发车<br/>
          DJJ-2026-0511-018
        </ChatBubble>
        <ChatBubble tone="plain">
          Driver · 司机<br/>
          <b>John Smith · 史密斯 · DJJ-241</b>
        </ChatBubble>
        <ChatBubble tone="plain">
          4 items: Toyota 8FG25 Forklift (TY-2208)
        </ChatBubble>
        <ChatBubble tone="plain">
          Receiver?<br/>
          收货人是谁？
        </ChatBubble>
        <ChatBubble side="right" tone="user" label="14:31 · you">
          Sarah Lee · 林华<br/>
          +86 138 8888 1234
        </ChatBubble>
        <ChatBubble tone="sign" label="Action · 操作">
          ✎ Please sign as <b>driver</b><br/>
          请<b>司机</b>签字
          <div style={{ marginTop: 6, height: 70, border: '1.5px dashed ' + w.WF.red,
            borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: w.WF.hand, fontSize: 14, color: w.WF.red, background: '#fff' }}>
            tap to sign · 点此签字
          </div>
        </ChatBubble>
        <ChatBubble tone="plain" label="Next · 即将">
          Generate PDF → Lark group + lessee email
        </ChatBubble>
      </w.WFPage>
    </WFShell>
  );
}

function E_Rental() {
  return (
    <WFShell title="租赁 · Rental">
      <w.WFPage style={{ background: '#f3f0e7' }}>
        <ChatBubble label="Lark · 飞书">
          Draft rental contract<br/>RC-2026-0511-04
        </ChatBubble>
        <ChatBubble tone="plain">
          Lessee · 承租方<br/><b>ACME Logistics</b>
        </ChatBubble>
        <ChatBubble tone="plain">
          Equipment: <b>Toyota 8FG25 (TY-2208)</b><br/>
          $385/wkay · $605 deposit
        </ChatBubble>
        <ChatBubble tone="plain">
          Term · 租期<br/>
          2026/05/12 → 2026/06/30
        </ChatBubble>
        <ChatBubble tone="plain">
          7 clauses included.<br/>
          <span style={{ color: w.WF.red, textDecoration: 'underline' }}>Read all · 查看条款</span>
        </ChatBubble>
        <ChatBubble side="right" tone="user" label="you · 你">
          Looks good. ✓<br/>没问题。
        </ChatBubble>
        <ChatBubble tone="sign">
          Sign as <b>lessee</b><br/>承租方签字
          <div style={{ marginTop: 6, height: 90, border: '1.5px dashed ' + w.WF.red,
            borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#fff' }}>
            <svg width="180" height="60" viewBox="0 0 180 60"><path d="M10 38 Q 24 10, 40 36 T 70 30 Q 82 12, 102 38 Q 116 56, 132 32 Q 148 12, 168 36" stroke={w.WF.ink} strokeWidth="2.4" fill="none" strokeLinecap="round" /></svg>
          </div>
          <div style={{ fontFamily: w.WF.mono, fontSize: 9.5, color: w.WF.muted, marginTop: 2 }}>tap → confirm</div>
        </ChatBubble>
        <ChatBubble tone="plain" label="Next · 即将">
          Generate PDF → send to lessee + Lark
        </ChatBubble>
      </w.WFPage>
    </WFShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Intro card — system + interface notes (sits at top of canvas)
// ─────────────────────────────────────────────────────────────
function IntroCard() {
  return (
    <div style={{
      width: 820, padding: '24px 28px', background: w.WF.paper,
      border: '1.5px solid ' + w.WF.rule, borderRadius: 4,
      fontFamily: w.WF.body, color: w.WF.ink, position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <div style={{ fontFamily: w.WF.hand, fontSize: 32, fontWeight: 700 }}>DJJ Signing Platform · 签字平台</div>
        <div style={{ fontFamily: w.WF.mono, fontSize: 10, color: w.WF.muted }}>v0.1 · 低保真线框图</div>
      </div>
      <div style={{ fontFamily: w.WF.body, fontSize: 14, color: w.WF.ink2, marginBottom: 14 }}>
        Two documents — <b>Dispatch slip</b> (发车交付单) & <b>Rental contract</b> (设备租赁合同).<br/>
        iPhone + iPad · bilingual · auto-fill from Lark · finger / Apple Pencil signature · jsPDF output.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, fontSize: 12.5, color: w.WF.ink2 }}>
        <div>
          <div style={{ fontFamily: w.WF.mono, fontSize: 10, color: w.WF.muted, marginBottom: 4, letterSpacing: 0.5 }}>DATA INTERFACES · 数据接口</div>
          <div>· <code style={{ fontFamily: w.WF.mono, background: w.WF.yellow, padding: '0 4px' }}>data-field="driver"</code> on each input — Lark webhook fills via <code style={{ fontFamily: w.WF.mono }}>POST /forms/&lt;id&gt;/prefill</code></div>
          <div>· OAuth handshake with Lark Open Platform · Bot pushes draft, app pulls fields by record_id</div>
          <div>· Outbound email via Mailgun (or Lark Mail) after sign → PDF as attachment</div>
        </div>
        <div>
          <div style={{ fontFamily: w.WF.mono, fontSize: 10, color: w.WF.muted, marginBottom: 4, letterSpacing: 0.5 }}>UI VOCABULARY · 视觉约定</div>
          <div>· <span style={{ background: 'rgba(246,224,144,0.4)', padding: '0 4px' }}>Yellow tint</span> = pre-filled from Lark</div>
          <div>· <span style={{ color: w.WF.red, border: '1px dashed ' + w.WF.red, padding: '0 4px' }}>Red dashed</span> = signature / required action</div>
          <div>· Dashed line = empty input · Solid line = filled / locked</div>
        </div>
      </div>
      <div style={{ marginTop: 16, fontFamily: w.WF.mono, fontSize: 10, color: w.WF.muted, letterSpacing: 0.4 }}>
        5 DIRECTIONS BELOW · 五个方向 ↓ pan & zoom · drag to reorder · click any frame to focus
      </div>
    </div>
  );
}

// Export to global
Object.assign(w, {
  IntroCard,
  A_DispatchPaper, A_RentalPaper,
  B_Info, B_Review, B_Sign, B_Done,
  C_Preview, C_SignSheet, C_Done,
  D_Dispatch, D_Rental,
  E_Dispatch, E_Rental,
});
