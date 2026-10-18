import { useMemo, useState } from 'react'
import { Plus, Eye, Pencil, Trash2, LayoutGrid, Table2, Sparkles, AlertTriangle } from 'lucide-react'
import { PageHeader, SearchInput, StatusBadge, Avatar, Card, Empty, Modal, Drawer, Field, MetricCard, AIInsight, Timeline } from '../components/ui'
import { deals as seedDeals, STAGES, type Deal, type Stage } from '../data/deals'
import { OWNERS } from '../data/contacts'
import { tasks } from '../data/tasks'
import { useStore } from '../lib/store'
import { fmtNum, fmtMoney, uid, cx } from '../lib/utils'

type FormState = { title: string; customer: string; company: string; value: number; closeDate: string; owner: string; stage: Stage; priority: Deal['priority']; probability: number; nextActivity: string }
const emptyForm: FormState = { title: '', customer: '', company: '', value: 50000, closeDate: '2026-10-30', owner: OWNERS[0], stage: STAGES[0], priority: 'متوسطة', probability: 20, nextActivity: '' }
const PRIORITIES: Deal['priority'][] = ['عالية', 'متوسطة', 'منخفضة']

export default function Deals() {
  const { toast } = useStore()
  const [list, setList] = useState<Deal[]>(seedDeals)
  const [query, setQuery] = useState('')
  const [stageF, setStageF] = useState('الكل')
  const [ownerF, setOwnerF] = useState('الكل')
  const [view, setView] = useState<'table' | 'cards'>('table')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Deal | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [drawer, setDrawer] = useState<Deal | null>(null)
  const [note, setNote] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim()
    return list.filter(d => {
      if (stageF !== 'الكل' && d.stage !== stageF) return false
      if (ownerF !== 'الكل' && d.owner !== ownerF) return false
      if (q && !(d.title.includes(q) || d.customer.includes(q) || d.company.includes(q))) return false
      return true
    })
  }, [list, query, stageF, ownerF])

  const totalValue = list.reduce((s, d) => s + d.value, 0)
  const openDeals = list.filter(d => d.stage !== 'تم الفوز' && d.stage !== 'تم الخسارة')
  const wonDeals = list.filter(d => d.stage === 'تم الفوز')
  const wonValue = wonDeals.reduce((s, d) => s + d.value, 0)
  const avg = list.length ? Math.round(totalValue / list.length) : 0

  function openAdd() { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(d: Deal) {
    setEditing(d)
    setForm({ title: d.title, customer: d.customer, company: d.company, value: d.value, closeDate: d.closeDate, owner: d.owner, stage: d.stage, priority: d.priority, probability: d.probability, nextActivity: d.nextActivity })
    setModalOpen(true)
  }
  function saveForm() {
    if (!form.title.trim() || !form.customer.trim()) {
      toast({ title: 'أكمل الحقول المطلوبة', desc: 'اسم الصفقة واسم العميل إلزاميان', kind: 'error' })
      return
    }
    if (editing) {
      setList(p => p.map(d => (d.id === editing.id ? { ...d, ...form } : d)))
      if (drawer?.id === editing.id) setDrawer({ ...drawer, ...form })
      toast({ title: 'تم حفظ الصفقة', kind: 'success' })
    } else {
      const d: Deal = { id: uid('d'), ...form }
      setList(p => [d, ...p])
      toast({ title: 'تمت إضافة الصفقة', desc: d.title, kind: 'success' })
    }
    setModalOpen(false)
  }
  function remove(id: string) {
    if (!window.confirm('حذف هذه الصفقة؟')) return
    setList(p => p.filter(d => d.id !== id))
    if (drawer?.id === id) setDrawer(null)
    toast({ title: 'تم حذف الصفقة', kind: 'info' })
  }
  function changeStage(d: Deal, stage: Stage) {
    setList(p => p.map(x => (x.id === d.id ? { ...x, stage } : x)))
    setDrawer(prev => (prev?.id === d.id ? { ...prev, stage } : prev))
    toast({ title: 'تم تحديث المرحلة', desc: `انتقلت ${d.title} إلى ${stage}`, kind: 'success' })
  }

  const drawerTasks = drawer ? tasks.filter(t => t.deal === drawer.title || t.contact === drawer.customer) : []

  return (
    <div className="page-wrap">
      <PageHeader
        title="الصفقات"
        sub={`إدارة الصفقات — ${fmtNum(list.length)} صفقة بقيمة ${fmtMoney(totalValue)}`}
        actions={
          <>
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              <button onClick={() => setView('table')} className={cx('p-2 rounded-lg', view === 'table' ? 'bg-white shadow-soft text-ink' : 'text-mut')} title="جدول"><Table2 size={16} /></button>
              <button onClick={() => setView('cards')} className={cx('p-2 rounded-lg', view === 'cards' ? 'bg-white shadow-soft text-ink' : 'text-mut')} title="بطاقات"><LayoutGrid size={16} /></button>
            </div>
            <button className="btn-primary" onClick={openAdd}><Plus size={16} /> إضافة صفقة</button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="إجمالي القيمة" value={fmtMoney(totalValue)} icon={<Plus size={20} />} />
        <MetricCard label="صفقات مفتوحة" value={fmtNum(openDeals.length)} icon={<Table2 size={20} />} tone="blue" />
        <MetricCard label="صفقات فائزة" value={fmtNum(wonDeals.length)} delta={fmtMoney(wonValue)} icon={<LayoutGrid size={20} />} />
        <MetricCard label="متوسط قيمة الصفقة" value={fmtMoney(avg)} icon={<Sparkles size={20} />} tone="amber" />
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={query} onChange={setQuery} ph="ابحث عن صفقة أو عميل أو شركة..." />
          <select className="input !w-auto" value={stageF} onChange={e => setStageF(e.target.value)}>
            <option value="الكل">كل المراحل</option>
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input !w-auto" value={ownerF} onChange={e => setOwnerF(e.target.value)}>
            <option value="الكل">كل المسؤولين</option>
            {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {view === 'table' ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1020px]">
              <thead className="bg-gray-50 border-b border-line">
                <tr>
                  <th className="th">الصفقة</th>
                  <th className="th">العميل / الشركة</th>
                  <th className="th">القيمة</th>
                  <th className="th">الإغلاق المتوقع</th>
                  <th className="th">المسؤول</th>
                  <th className="th">المرحلة</th>
                  <th className="th">الأولوية</th>
                  <th className="th">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50/60 cursor-pointer" onClick={() => { setDrawer(d); setNote('') }}>
                    <td className="td font-bold">{d.title}</td>
                    <td className="td"><p className="font-semibold">{d.customer}</p><p className="text-xs text-mut">{d.company}</p></td>
                    <td className="td font-bold tabular-nums">{fmtMoney(d.value)}</td>
                    <td className="td tabular-nums" dir="ltr">{d.closeDate}</td>
                    <td className="td">
                      <span className="inline-flex items-center gap-1.5"><Avatar name={d.owner} size={26} /> {d.owner}</span>
                    </td>
                    <td className="td"><StatusBadge value={d.stage} /></td>
                    <td className="td"><StatusBadge value={d.priority} /></td>
                    <td className="td" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button className="btn-ghost !p-2" onClick={() => { setDrawer(d); setNote('') }}><Eye size={16} /></button>
                        <button className="btn-ghost !p-2" onClick={() => openEdit(d)}><Pencil size={16} /></button>
                        <button className="btn-ghost !p-2 !text-red-600" onClick={() => remove(d.id)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <Empty title="لا توجد صفقات" sub="أضف صفقة جديدة أو عدّل البحث" action={<button className="btn-primary" onClick={openAdd}><Plus size={16} /> إضافة صفقة</button>} />}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(d => (
            <div key={d.id} className="card p-4 cursor-pointer hover:shadow-pop transition" onClick={() => { setDrawer(d); setNote('') }}>
              <div className="flex items-start justify-between gap-2">
                <div><p className="font-bold">{d.title}</p><p className="text-[12.5px] text-mut mt-0.5">{d.customer} — {d.company}</p></div>
                <StatusBadge value={d.priority} />
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[18px] font-bold tabular-nums">{fmtMoney(d.value)}</span>
                <StatusBadge value={d.stage} />
              </div>
              <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-brand rounded-full" style={{ width: `${d.probability}%` }} />
              </div>
              <div className="flex items-center justify-between mt-3 text-[12.5px] text-mut">
                <span className="inline-flex items-center gap-1.5"><Avatar name={d.owner} size={24} /> {d.owner}</span>
                <span dir="ltr" className="tabular-nums">{d.closeDate}</span>
              </div>
              <p className="text-[12.5px] mt-2 text-slate2">النشاط التالي: {d.nextActivity}</p>
            </div>
          ))}
          {filtered.length === 0 && <div className="col-span-full card"><Empty title="لا توجد صفقات" sub="أضف صفقة جديدة" /></div>}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'تعديل الصفقة' : 'إضافة صفقة'} wide>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="اسم الصفقة *"><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="مثال: عقد إدارة العملاء" /></Field>
          <Field label="العميل *"><input className="input" value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} placeholder="اسم العميل" /></Field>
          <Field label="الشركة"><input className="input" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} /></Field>
          <Field label="القيمة (ر.س)"><input type="number" className="input" value={form.value} onChange={e => setForm({ ...form, value: Number(e.target.value) })} /></Field>
          <Field label="الإغلاق المتوقع"><input type="date" className="input" value={form.closeDate} onChange={e => setForm({ ...form, closeDate: e.target.value })} /></Field>
          <Field label="المسؤول">
            <select className="input" value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })}>
              {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="المرحلة">
            <select className="input" value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value as Stage })}>
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="الأولوية">
            <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Deal['priority'] })}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label={`الاحتمالية: ${form.probability}٪`}>
            <input type="range" min={0} max={100} value={form.probability} onChange={e => setForm({ ...form, probability: Number(e.target.value) })} className="w-full accent-[#16A34A]" />
          </Field>
          <Field label="النشاط التالي"><input className="input" value={form.nextActivity} onChange={e => setForm({ ...form, nextActivity: e.target.value })} placeholder="مثال: اجتماع إغلاق" /></Field>
        </div>
        <div className="flex gap-2 mt-4">
          <button className="btn-primary flex-1" onClick={saveForm}>{editing ? 'حفظ' : 'إضافة الصفقة'}</button>
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>إلغاء</button>
        </div>
      </Modal>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer ? drawer.title : ''}>
        {drawer && (
          <div className="space-y-4">
            <div>
              <p className="font-bold text-[16px]">{drawer.title}</p>
              <p className="text-[13px] text-mut">{drawer.customer} — {drawer.company}</p>
              <div className="mt-2 flex flex-wrap gap-1.5"><StatusBadge value={drawer.stage} /><StatusBadge value={drawer.priority} /></div>
            </div>

            <Card title="القيمة والاحتمالية">
              <div className="flex items-center justify-between">
                <span className="text-[20px] font-bold tabular-nums">{fmtMoney(drawer.value)}</span>
                <span className="text-[13px] font-bold text-brand-dark tabular-nums">{fmtNum(drawer.probability)}٪</span>
              </div>
              <div className="mt-2 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-brand rounded-full" style={{ width: `${drawer.probability}%` }} />
              </div>
              <p className="text-[12.5px] text-mut mt-2">الإغلاق المتوقع: <span dir="ltr" className="tabular-nums">{drawer.closeDate}</span> — المسؤول: {drawer.owner}</p>
            </Card>

            <Card title="تغيير المرحلة">
              <select className="input" value={drawer.stage} onChange={e => changeStage(drawer, e.target.value as Stage)}>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Card>

            <Card title="سجل الصفقة">
              <Timeline items={[
                { title: `المرحلة الحالية: ${drawer.stage}`, sub: drawer.nextActivity, time: drawer.closeDate },
                { title: 'تم إنشاء الصفقة', sub: `بواسطة ${drawer.owner}`, time: 'قبل أسبوعين' },
                ...drawerTasks.slice(0, 2).map(t => ({ title: t.title, sub: `${t.owner} — ${t.due}`, time: t.due })),
              ]} />
            </Card>

            {drawerTasks.length > 0 && (
              <Card title="مهام مرتبطة">
                <div className="space-y-2">
                  {drawerTasks.map(t => (
                    <div key={t.id} className="flex items-center justify-between text-[13px]">
                      <span className="font-semibold">{t.title}</span>
                      <StatusBadge value={t.status} />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card title="ملاحظات">
              <textarea className="input min-h-[80px]" placeholder="أضف ملاحظة حول الصفقة..." value={note} onChange={e => setNote(e.target.value)} />
              <button className="btn-secondary mt-2" onClick={() => { setNote(''); toast({ title: 'تم حفظ الملاحظة', kind: 'success' }) }}>حفظ الملاحظة</button>
            </Card>

            <Card title="تقييم المخاطر">
              <AIInsight
                icon={<AlertTriangle size={18} />}
                title={drawer.probability >= 60 ? 'مخاطر منخفضة' : drawer.probability >= 30 ? 'مخاطر متوسطة' : 'مخاطر مرتفعة'}
                desc={drawer.probability >= 60
                  ? `صفقة ${drawer.title} تسير بثبات باحتمالية ${drawer.probability}٪. حافظ على وتيرة المتابعة حتى الإغلاق في ${drawer.closeDate}.`
                  : `احتمالية الفوز ${drawer.probability}٪ فقط. قد يكون هناك تأخر في التجاوب أو منافسة. يُنصح بتكثيف التواصل وتوضيح القيمة.`}
              />
              <div className="mt-3 rounded-xl bg-gray-50 border border-line p-3">
                <p className="text-[13px] font-bold flex items-center gap-1.5"><Sparkles size={15} className="text-brand-dark" /> الإجراء التالي الموصى به</p>
                <p className="text-[13px] text-slate2 mt-1">{drawer.nextActivity && drawer.nextActivity !== '—' ? drawer.nextActivity : 'جدولة اجتماع متابعة مع العميل خلال ٤٨ ساعة.'}</p>
                <button className="btn-primary mt-2 !py-2" onClick={() => toast({ title: 'تم جدولة الإجراء', desc: 'أُضيف تذكير بالنشاط التالي (عرض تجريبي)', kind: 'success' })}>جدولة المتابعة</button>
              </div>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  )
}
