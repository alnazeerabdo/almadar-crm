import { useMemo, useState } from 'react'
import {
  Megaphone, Mail, MessageCircle, MessageSquare, Eye, Pencil, Copy, Trash2,
  Plus, Sparkles, Users, TrendingUp, Target, Check,
} from 'lucide-react'
import {
  PageHeader, MetricCard, Card, SearchInput, Empty, Modal, Drawer, Field, Tabs, AIInsight,
} from '../components/ui'
import { campaigns as seed, type Campaign } from '../data/misc'
import { useStore } from '../lib/store'
import { cx, fmtNum, uid } from '../lib/utils'

type ViewMode = 'بطاقات' | 'جدول'
type Chan = Campaign['channel']
const CHANNELS: Chan[] = ['بريد إلكتروني', 'واتساب', 'رسائل نصية']
const STEPS = ['تفاصيل', 'الجمهور', 'القناة', 'الرسالة', 'المعاينة', 'المراجعة']

function ChanBadge({ c }: { c: Chan }) {
  if (c === 'واتساب') return <span className="badge bg-green-50 text-green-700"><MessageCircle size={13} />واتساب</span>
  if (c === 'بريد إلكتروني') return <span className="badge bg-blue-50 text-blue-700"><Mail size={13} />بريد إلكتروني</span>
  return <span className="badge bg-violet-50 text-violet-700"><MessageSquare size={13} />رسائل نصية</span>
}

interface Wiz {
  name: string; channel: Chan; segment: string; city: string;
  minValue: string; audience: string; message: string;
}
const emptyWiz: Wiz = {
  name: '', channel: 'واتساب', segment: 'كل العملاء', city: 'كل المدن',
  minValue: '', audience: '2000', message: '',
}

const AI_TEXTS: Record<string, string> = {
  'اقتراح محتوى': 'أهلاً {{الاسم}} 👋\nلدينا عرض خاص لشركة {{الشركة}}: خصم ٢٠٪ على باقة النمو الشامل حتى نهاية أكتوبر. رد بكلمة "مهتم" وسنتواصل معك فوراً.',
  'تحسين': 'أهلاً {{الاسم}}،\nيسعدنا في المدار أن نقدم لشركة {{الشركة}} تجربة مجانية لمدة ١٤ يوماً مع دعم مخصص. احجز موعدك اليوم واكتشف الفرق.',
  'عنوان': 'عنوان مقترح: "عرض حصري لشركة {{الشركة}} — وفّر ٢٠٪ هذا الشهر"',
  'نبرة': 'نبرة ودية ورسمية: "عزيزي {{الاسم}}، نقدّر ثقتكم بشركة {{الشركة}} ويسعدنا مشاركتكم أحدث عروضنا المصممة خصيصاً لكم."',
  'جمهور': 'الجمهور المقترح: العملاء النشطون في الرياض وجدة بقيمة تعامل أعلى من ٥٠,٠٠٠ ر.س — التفاعل المتوقع أعلى بنسبة ٣٥٪.',
}

export default function Campaigns() {
  const { toast } = useStore()
  const [items, setItems] = useState<Campaign[]>(seed)
  const [view, setView] = useState<ViewMode>('بطاقات')
  const [q, setQ] = useState('')
  const [fStatus, setFStatus] = useState('الكل')
  const [wizOpen, setWizOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [wiz, setWiz] = useState<Wiz>(emptyWiz)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [detail, setDetail] = useState<Campaign | null>(null)

  const metrics = useMemo(() => {
    const total = items.length
    const active = items.filter((c) => c.status === 'نشطة').length
    const audience = items.reduce((s, c) => s + c.audience, 0)
    const avg = total ? Math.round(items.reduce((s, c) => s + c.openRate, 0) / total) : 0
    return { total, active, audience, avg }
  }, [items])

  const filtered = useMemo(() => items.filter((c) => {
    if (q.trim() && !c.name.includes(q)) return false
    if (fStatus !== 'الكل' && c.status !== fStatus) return false
    return true
  }), [items, q, fStatus])

  const setW = (k: keyof Wiz, v: string) => setWiz((w) => ({ ...w, [k]: v }))

  const openCreate = () => {
    setEditingId(null); setWiz(emptyWiz); setStep(0); setWizOpen(true)
  }
  const openEdit = (c: Campaign) => {
    setEditingId(c.id)
    setWiz({ name: c.name, channel: c.channel, segment: 'كل العملاء', city: 'كل المدن', minValue: '', audience: String(c.audience), message: '' })
    setStep(0); setWizOpen(true); setDetail(null)
  }
  const duplicate = (c: Campaign) => {
    setItems((p) => [...p, { ...c, id: uid('k'), name: `${c.name} — نسخة`, status: 'مسودة', openRate: 0, clickRate: 0 }])
    toast({ title: 'تم تكرار الحملة', desc: `${c.name} — نسخة`, kind: 'success' })
  }
  const removeItem = (id: string) => {
    setItems((p) => p.filter((c) => c.id !== id))
    setDetail(null)
    toast({ title: 'تم حذف الحملة', kind: 'success' })
  }

  const finish = () => {
    if (!wiz.name.trim()) { toast({ title: 'اسم الحملة مطلوب', kind: 'error' }); return }
    const audience = parseInt(wiz.audience.replace(/[^0-9]/g, ''), 10) || 1000
    if (editingId) {
      setItems((p) => p.map((c) => (c.id === editingId ? { ...c, name: wiz.name, channel: wiz.channel, audience } : c)))
      toast({ title: 'تم حفظ تعديلات الحملة', kind: 'success' })
    } else {
      setItems((p) => [...p, {
        id: uid('k'), name: wiz.name, channel: wiz.channel, audience,
        status: 'مسودة', created: '2026-10-09', openRate: 0, clickRate: 0,
      }])
      toast({ title: 'تم إنشاء الحملة', desc: wiz.name, kind: 'success' })
    }
    setWizOpen(false)
  }

  const aiFill = (kind: string) => {
    setWiz((w) => ({ ...w, message: w.message ? `${w.message}\n\n${AI_TEXTS[kind]}` : AI_TEXTS[kind] }))
    toast({ title: `تم: ${kind}`, desc: 'تمت إضافة النص إلى الرسالة', kind: 'success' })
  }

  const preview = (
    <div className="mx-auto w-[270px] rounded-[26px] border-8 border-ink bg-white overflow-hidden shadow-pop">
      <div className={cx('px-3 py-2.5 text-center text-[11px] font-bold text-white', wiz.channel === 'واتساب' ? 'bg-[#075E54]' : wiz.channel === 'بريد إلكتروني' ? 'bg-[#16A34A]' : 'bg-violet-600')}>
        {wiz.channel === 'بريد إلكتروني' ? 'معاينة البريد الإلكتروني' : 'معاينة الجوال'}
      </div>
      <div className="p-3 bg-[#ECE5DD] min-h-[220px]">
        {wiz.channel === 'بريد إلكتروني' ? (
          <div className="bg-white rounded-xl p-3 shadow-soft">
            <p className="text-[12px] font-bold">{wiz.name || 'عنوان الحملة'}</p>
            <p className="text-[10.5px] text-mut mt-0.5">من: التسويق — المدار CRM</p>
            <div className="border-t border-line my-2" />
            <p className="text-[12px] leading-relaxed whitespace-pre-wrap text-slate2">{wiz.message || 'نص الرسالة سيظهر هنا...'}</p>
          </div>
        ) : (
          <div className={cx(
            'rounded-xl rounded-tl-sm p-2.5 shadow-soft text-[12px] leading-relaxed whitespace-pre-wrap',
            wiz.channel === 'واتساب' ? 'bg-[#DCF8C6]' : 'bg-white'
          )}>
            {wiz.message || 'نص الرسالة سيظهر هنا...'}
            <span className="block text-[9.5px] text-gray-500 text-end mt-1">10:30 ✓✓</span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="page-wrap">
      <PageHeader
        title="الحملات التسويقية"
        sub="أنشئ حملات واتساب وبريد ورسائل نصية وتابع أداءها"
        actions={<button className="btn-primary" onClick={openCreate}><Plus size={17} /> حملة جديدة</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <MetricCard label="إجمالي الحملات" value={String(metrics.total)} icon={<Megaphone size={19} />} tone="green" />
        <MetricCard label="الحملات النشطة" value={String(metrics.active)} icon={<Target size={19} />} tone="blue" />
        <MetricCard label="إجمالي المستهدفين" value={fmtNum(metrics.audience)} icon={<Users size={19} />} tone="amber" />
        <MetricCard label="متوسط التفاعل" value={`${metrics.avg}%`} icon={<TrendingUp size={19} />} tone="green" />
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_300px] gap-4 items-start">
        <Card className="!p-0 overflow-hidden">
          <div className="p-4 border-b border-line flex flex-wrap items-center gap-2">
            <Tabs tabs={['بطاقات', 'جدول']} value={view} onChange={(v) => setView(v as ViewMode)} />
            <div className="flex-1" />
            <SearchInput value={q} onChange={setQ} ph="بحث عن حملة..." />
            <select className="input !w-auto" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
              <option value="الكل">كل الحالات</option>
              {['نشطة', 'مجدولة', 'مكتملة', 'مسودة'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {view === 'بطاقات' && (
            <div className="p-4 grid md:grid-cols-2 gap-3">
              {filtered.length === 0 && <div className="md:col-span-2"><Empty title="لا توجد حملات" sub="أنشئ حملتك الأولى الآن" action={<button className="btn-primary" onClick={openCreate}><Plus size={16} /> حملة جديدة</button>} /></div>}
              {filtered.map((c) => (
                <div key={c.id} className="border border-line rounded-2xl p-4 hover:border-brand transition bg-white">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-[14.5px] leading-relaxed flex-1">{c.name}</p>
                    <ChanBadge c={c.channel} />
                  </div>
                  <p className="text-xs text-mut mt-1.5">الجمهور: <b className="text-ink">{fmtNum(c.audience)}</b> • أُنشئت {c.created} • الحالة: <b>{c.status}</b></p>
                  <div className="mt-3 space-y-2">
                    <div>
                      <p className="flex justify-between text-[11.5px] font-bold"><span>معدل الفتح</span><span>{c.openRate}%</span></p>
                      <div className="h-2 rounded-full bg-gray-100 mt-1"><div className="h-2 rounded-full bg-[#16A34A] transition-all" style={{ width: `${c.openRate}%` }} /></div>
                    </div>
                    <div>
                      <p className="flex justify-between text-[11.5px] font-bold"><span>معدل النقر</span><span>{c.clickRate}%</span></p>
                      <div className="h-2 rounded-full bg-gray-100 mt-1"><div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${c.clickRate}%` }} /></div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-3 pt-3 border-t border-line">
                    <button className="btn-ghost !p-2" title="عرض" onClick={() => setDetail(c)}><Eye size={16} /></button>
                    <button className="btn-ghost !p-2" title="تعديل" onClick={() => openEdit(c)}><Pencil size={16} /></button>
                    <button className="btn-ghost !p-2" title="تكرار" onClick={() => duplicate(c)}><Copy size={16} /></button>
                    <button className="btn-ghost !p-2 hover:!text-red-600" title="حذف" onClick={() => removeItem(c.id)}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === 'جدول' && (
            <div className="overflow-auto">
              <table className="w-full min-w-[640px]">
                <thead><tr className="border-b border-line bg-bgmain/60"><th className="th">الحملة</th><th className="th">القناة</th><th className="th">الجمهور</th><th className="th">الحالة</th><th className="th">الفتح / النقر</th><th className="th">إجراءات</th></tr></thead>
                <tbody className="divide-y divide-line">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-bgmain/60">
                      <td className="td font-bold">{c.name}</td>
                      <td className="td"><ChanBadge c={c.channel} /></td>
                      <td className="td tabular-nums">{fmtNum(c.audience)}</td>
                      <td className="td">{c.status}</td>
                      <td className="td tabular-nums">{c.openRate}% / {c.clickRate}%</td>
                      <td className="td">
                        <span className="flex gap-1">
                          <button className="btn-ghost !p-1.5" onClick={() => setDetail(c)}><Eye size={15} /></button>
                          <button className="btn-ghost !p-1.5" onClick={() => openEdit(c)}><Pencil size={15} /></button>
                          <button className="btn-ghost !p-1.5" onClick={() => duplicate(c)}><Copy size={15} /></button>
                          <button className="btn-ghost !p-1.5 hover:!text-red-600" onClick={() => removeItem(c.id)}><Trash2 size={15} /></button>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <Empty title="لا توجد حملات مطابقة" sub="جرّب تغيير البحث" />}
            </div>
          )}
        </Card>

        {/* AI panel */}
        <Card title="مساعد المحتوى الذكي" sub="ولّد نصوصاً جاهزة بضغطة واحدة" action={<Sparkles size={18} className="text-brand-dark" />}>
          <div className="flex flex-wrap gap-2">
            {Object.keys(AI_TEXTS).map((k) => (
              <button key={k} onClick={() => { aiFill(k); }} className="btn-secondary !py-1.5 !px-3 !text-[12.5px]">
                <Sparkles size={14} className="text-brand-dark" /> {k}
              </button>
            ))}
          </div>
          <div className="mt-3 space-y-2.5">
            <AIInsight icon={<Target size={16} />} title="استهداف أدق" desc="الحملات الموجهة لشرائح محددة تحقق تفاعلاً أعلى بنسبة ٣٥٪ من الحملات العامة." />
            <AIInsight icon={<TrendingUp size={16} />} title="أفضل وقت للإرسال" desc="المساء بين ٧-٩ مساءً يحقق أعلى معدلات فتح لحملات واتساب في السعودية." />
          </div>
          <button className="btn-primary w-full mt-3" onClick={openCreate}><Plus size={16} /> بدء حملة بالنص المولّد</button>
        </Card>
      </div>

      {/* Wizard */}
      <Modal open={wizOpen} onClose={() => setWizOpen(false)} title={editingId ? 'تعديل الحملة' : 'إنشاء حملة جديدة'} wide>
        {/* stepper */}
        <div className="flex items-center gap-1 overflow-auto pb-1 mb-4">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setStep(i)}
                className={cx(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold whitespace-nowrap border transition',
                  i === step ? 'bg-ink text-white border-ink' : i < step ? 'bg-brand-pale text-brand-dark border-brand-light' : 'bg-white text-mut border-line'
                )}
              >
                <span className={cx('w-5 h-5 rounded-full text-[10.5px] flex items-center justify-center', i === step ? 'bg-white text-ink' : i < step ? 'bg-brand text-white' : 'bg-gray-100')}>
                  {i < step ? <Check size={12} /> : i + 1}
                </span>
                {s}
              </button>
              {i < STEPS.length - 1 && <span className="w-3 h-px bg-line" />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div>
            <Field label="اسم الحملة">
              <input className="input" value={wiz.name} onChange={(e) => setW('name', e.target.value)} placeholder="مثال: عرض نهاية العام للشركات" />
            </Field>
            <Field label="القناة (يمكن تغييرها لاحقاً)">
              <div className="grid grid-cols-3 gap-2">
                {CHANNELS.map((c) => (
                  <button key={c} onClick={() => setW('channel', c)} className={cx('border rounded-xl p-3 text-[12.5px] font-bold transition', wiz.channel === c ? 'border-brand bg-brand-pale text-brand-dark' : 'border-line hover:border-brand')}>
                    <ChanBadge c={c} />
                  </button>
                ))}
              </div>
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="الشريحة">
              <select className="input" value={wiz.segment} onChange={(e) => setW('segment', e.target.value)}>
                {['كل العملاء', 'عملاء نشطون', 'عملاء جدد', 'عملاء غير نشطين', 'كبار العملاء VIP'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="المدينة">
              <select className="input" value={wiz.city} onChange={(e) => setW('city', e.target.value)}>
                {['كل المدن', 'الرياض', 'جدة', 'الدمام', 'مكة', 'الخبر'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="أقل قيمة تعامل (ر.س) — تجريبي">
              <input className="input" value={wiz.minValue} onChange={(e) => setW('minValue', e.target.value)} placeholder="مثال: 50000" inputMode="numeric" />
            </Field>
            <Field label="حجم الجمهور التقديري">
              <input className="input" value={wiz.audience} onChange={(e) => setW('audience', e.target.value)} inputMode="numeric" dir="ltr" />
            </Field>
            <p className="sm:col-span-2 text-[12.5px] text-mut bg-bgmain border border-line rounded-xl p-3">
              تقدير تجريبي: الشريحة «{wiz.segment}» في «{wiz.city}» ≈ <b className="text-ink">{fmtNum(parseInt(wiz.audience.replace(/[^0-9]/g, ''), 10) || 0)}</b> مستهدف.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="grid sm:grid-cols-3 gap-2.5">
            {CHANNELS.map((c) => (
              <button key={c} onClick={() => setW('channel', c)} className={cx('border-2 rounded-2xl p-4 text-center transition', wiz.channel === c ? 'border-brand bg-brand-pale/60' : 'border-line hover:border-brand')}>
                <span className="flex justify-center mb-2"><ChanBadge c={c} /></span>
                <span className="block text-[12.5px] text-slate2 leading-relaxed">
                  {c === 'واتساب' ? 'الأعلى فتحاً — مثالي للعروض العاجلة' : c === 'بريد إلكتروني' ? 'الأفضل للمحتوى التفصيلي والنشر  ات' : 'مباشرة وسريعة للتذكير والتنبيهات'}
                </span>
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div>
            <Field label="نص الرسالة">
              <textarea className="input min-h-[150px] leading-relaxed" value={wiz.message} onChange={(e) => setW('message', e.target.value)} placeholder="اكتب رسالتك هنا... استخدم المتغيرات للتخصيص" />
            </Field>
            <div className="flex flex-wrap gap-2">
              {['{{الاسم}}', '{{الشركة}}'].map((ph) => (
                <button key={ph} onClick={() => setWiz((w) => ({ ...w, message: w.message ? `${w.message} ${ph}` : ph }))} className="btn-secondary !py-1.5 !text-xs" dir="ltr">{ph}</button>
              ))}
              <span className="flex-1" />
              {Object.keys(AI_TEXTS).map((k) => (
                <button key={k} onClick={() => aiFill(k)} className="btn-ghost !py-1.5 !text-xs font-bold text-brand-dark"><Sparkles size={13} /> {k}</button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="grid sm:grid-cols-2 gap-4 items-start">
            <div className="text-[13px] text-slate2 leading-relaxed space-y-1.5">
              <p><b>الحملة:</b> {wiz.name || '—'}</p>
              <p><b>القناة:</b> {wiz.channel}</p>
              <p><b>الجمهور:</b> {wiz.segment} — {wiz.city} ({fmtNum(parseInt(wiz.audience.replace(/[^0-9]/g, ''), 10) || 0)})</p>
              <p className="bg-bgmain border border-line rounded-xl p-3 whitespace-pre-wrap"><b>النص:</b>{'\n'}{wiz.message || '—'}</p>
            </div>
            {preview}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3">
            <div className="card !shadow-none p-4 space-y-2 text-[13.5px]">
              <p className="flex justify-between"><span className="text-mut">اسم الحملة</span><b>{wiz.name || '—'}</b></p>
              <p className="flex justify-between"><span className="text-mut">القناة</span><ChanBadge c={wiz.channel} /></p>
              <p className="flex justify-between"><span className="text-mut">الجمهور</span><b>{wiz.segment} • {wiz.city} • {fmtNum(parseInt(wiz.audience.replace(/[^0-9]/g, ''), 10) || 0)}</b></p>
              <p className="flex justify-between"><span className="text-mut">الحالة عند الإنشاء</span><b>مسودة</b></p>
            </div>
            {preview}
          </div>
        )}

        <div className="flex gap-2 mt-5 pt-4 border-t border-line">
          {step > 0 && <button className="btn-secondary" onClick={() => setStep(step - 1)}>السابق</button>}
          <span className="flex-1" />
          <span className="text-xs text-mut self-center">الخطوة {step + 1} من 6</span>
          {step < 5
            ? <button className="btn-primary" onClick={() => setStep(step + 1)}>التالي</button>
            : <button className="btn-primary" onClick={finish}><Check size={16} /> {editingId ? 'حفظ الحملة' : 'إنشاء الحملة'}</button>}
        </div>
      </Modal>

      {/* Detail Drawer */}
      <Drawer open={!!detail} onClose={() => setDetail(null)} title="تفاصيل الحملة">
        {detail && (
          <div className="space-y-4">
            <div>
              <p className="font-bold text-[16px]">{detail.name}</p>
              <p className="text-[13px] text-mut mt-1">أُنشئت {detail.created} • الجمهور {fmtNum(detail.audience)}</p>
            </div>
            <div className="flex gap-2"><ChanBadge c={detail.channel} /><span className="badge bg-gray-100 text-gray-600">{detail.status}</span></div>
            <div className="space-y-2">
              <p className="flex justify-between text-[12.5px] font-bold"><span>معدل الفتح {detail.openRate}%</span></p>
              <div className="h-2.5 rounded-full bg-gray-100"><div className="h-2.5 rounded-full bg-[#16A34A]" style={{ width: `${detail.openRate}%` }} /></div>
              <p className="flex justify-between text-[12.5px] font-bold"><span>معدل النقر {detail.clickRate}%</span></p>
              <div className="h-2.5 rounded-full bg-gray-100"><div className="h-2.5 rounded-full bg-blue-500" style={{ width: `${detail.clickRate}%` }} /></div>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary flex-1" onClick={() => openEdit(detail)}><Pencil size={15} /> تعديل</button>
              <button className="btn-secondary flex-1" onClick={() => duplicate(detail)}><Copy size={15} /> تكرار</button>
              <button className="btn-secondary flex-1 hover:!text-red-600" onClick={() => removeItem(detail.id)}><Trash2 size={15} /> حذف</button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
