import { useMemo, useState } from 'react'
import { Plus, Table2, KanbanSquare, Eye, Sparkles } from 'lucide-react'
import { PageHeader, SearchInput, StatusBadge, Avatar, Card, Empty, Modal, Drawer, Field, AIInsight, Timeline } from '../components/ui'
import { deals as seedDeals, STAGES, type Deal, type Stage } from '../data/deals'
import { OWNERS } from '../data/contacts'
import { useStore } from '../lib/store'
import { fmtNum, fmtMoney, uid, cx } from '../lib/utils'

type FormState = { title: string; customer: string; company: string; value: number; closeDate: string; owner: string; stage: Stage; priority: Deal['priority']; probability: number; nextActivity: string }
const emptyForm: FormState = { title: '', customer: '', company: '', value: 40000, closeDate: '2026-10-30', owner: OWNERS[0], stage: STAGES[0], priority: 'متوسطة', probability: 15, nextActivity: 'مكالمة تأهيل' }

export default function Pipeline() {
  const { toast } = useStore()
  const [list, setList] = useState<Deal[]>(seedDeals)
  const [query, setQuery] = useState('')
  const [ownerF, setOwnerF] = useState('الكل')
  const [view, setView] = useState<'kanban' | 'table'>('kanban')
  const [dragId, setDragId] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [drawer, setDrawer] = useState<Deal | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim()
    return list.filter(d => {
      if (ownerF !== 'الكل' && d.owner !== ownerF) return false
      if (q && !(d.title.includes(q) || d.customer.includes(q) || d.company.includes(q))) return false
      return true
    })
  }, [list, query, ownerF])

  const byStage = useMemo(() => {
    const m = new Map<Stage, Deal[]>()
    for (const s of STAGES) m.set(s, [])
    for (const d of filtered) m.get(d.stage)?.push(d)
    return m
  }, [filtered])

  const stageValue = (s: Stage) => (byStage.get(s) ?? []).reduce((sum, d) => sum + d.value, 0)

  function onDragStart(id: string) { setDragId(id) }
  function onDropStage(stage: Stage) {
    if (!dragId) return
    setList(p => p.map(d => (d.id === dragId ? { ...d, stage } : d)))
    const moved = list.find(d => d.id === dragId)
    toast({ title: 'تم نقل الصفقة', desc: moved ? `انتقلت ${moved.title} إلى ${stage}` : stage, kind: 'success' })
    setDragId(null)
  }

  function addDeal() {
    if (!form.title.trim() || !form.customer.trim()) {
      toast({ title: 'أكمل الحقول المطلوبة', desc: 'اسم الصفقة واسم العميل إلزاميان', kind: 'error' })
      return
    }
    const d: Deal = { id: uid('d'), ...form }
    setList(p => [d, ...p])
    toast({ title: 'تمت إضافة الصفقة للمسار', desc: d.title, kind: 'success' })
    setModalOpen(false)
    setForm(emptyForm)
  }

  function changeStage(stage: Stage) {
    if (!drawer) return
    setList(p => p.map(d => (d.id === drawer.id ? { ...d, stage } : d)))
    setDrawer({ ...drawer, stage })
    toast({ title: 'تم تحديث المرحلة', desc: `أصبحت ${drawer.title} في ${stage}`, kind: 'success' })
  }

  return (
    <div className="page-wrap">
      <PageHeader
        title="مسار المبيعات"
        sub={`لوحة كانبان — ${fmtNum(filtered.length)} صفقة بقيمة ${fmtMoney(filtered.reduce((s, d) => s + d.value, 0))}`}
        actions={
          <>
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              <button onClick={() => setView('kanban')} className={cx('p-2 rounded-lg', view === 'kanban' ? 'bg-white shadow-soft text-ink' : 'text-mut')} title="كانبان"><KanbanSquare size={16} /></button>
              <button onClick={() => setView('table')} className={cx('p-2 rounded-lg', view === 'table' ? 'bg-white shadow-soft text-ink' : 'text-mut')} title="جدول"><Table2 size={16} /></button>
            </div>
            <button className="btn-primary" onClick={() => setModalOpen(true)}><Plus size={16} /> إضافة صفقة</button>
          </>
        }
      />

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={query} onChange={setQuery} ph="ابحث في المسار..." />
          <select className="input !w-auto" value={ownerF} onChange={e => setOwnerF(e.target.value)}>
            <option value="الكل">كل المسؤولين</option>
            {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {view === 'kanban' ? (
        <div className="flex gap-3 overflow-x-auto pb-3 snap-x">
          {STAGES.map(s => {
            const cards = byStage.get(s) ?? []
            return (
              <div
                key={s}
                className="shrink-0 w-[290px] snap-start rounded-2xl bg-gray-50 border border-line p-3 min-h-[320px]"
                onDragOver={e => e.preventDefault()}
                onDrop={() => onDropStage(s)}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-[13.5px]">{s}</p>
                  <span className="badge bg-white border border-line text-slate2">{fmtNum(cards.length)}</span>
                </div>
                <p className="text-[12px] text-mut tabular-nums mb-3">{fmtMoney(stageValue(s))}</p>
                <div className="space-y-2">
                  {cards.map(d => (
                    <div
                      key={d.id}
                      draggable
                      onDragStart={() => onDragStart(d.id)}
                      onClick={() => setDrawer(d)}
                      className={cx('card !rounded-xl p-3 cursor-grab active:cursor-grabbing hover:shadow-pop transition', dragId === d.id && 'opacity-60')}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-[13px] leading-snug">{d.title}</p>
                        <StatusBadge value={d.priority} />
                      </div>
                      <p className="text-[12px] text-mut mt-1">{d.customer} — {d.company}</p>
                      <p className="text-[14px] font-bold tabular-nums mt-1.5">{fmtMoney(d.value)}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="inline-flex items-center gap-1 text-[12px] text-mut"><Avatar name={d.owner} size={22} /> {d.owner}</span>
                        <span className="text-[11.5px] text-mut tabular-nums" dir="ltr">{d.closeDate}</span>
                      </div>
                      <p className="text-[11.5px] mt-1.5 rounded-lg bg-brand-pale text-brand-dark font-semibold px-2 py-1">النشاط: {d.nextActivity}</p>
                    </div>
                  ))}
                  {cards.length === 0 && <p className="text-center text-[12px] text-gray-400 py-6">اسحب صفقات إلى هنا</p>}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead className="bg-gray-50 border-b border-line">
                <tr>
                  <th className="th">الصفقة</th>
                  <th className="th">العميل</th>
                  <th className="th">القيمة</th>
                  <th className="th">المرحلة</th>
                  <th className="th">المسؤول</th>
                  <th className="th">الإغلاق</th>
                  <th className="th">عرض</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50/60 cursor-pointer" onClick={() => setDrawer(d)}>
                    <td className="td font-bold">{d.title}</td>
                    <td className="td">{d.customer}</td>
                    <td className="td font-bold tabular-nums">{fmtMoney(d.value)}</td>
                    <td className="td"><StatusBadge value={d.stage} /></td>
                    <td className="td">{d.owner}</td>
                    <td className="td tabular-nums" dir="ltr">{d.closeDate}</td>
                    <td className="td"><button className="btn-ghost !p-2"><Eye size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <Empty title="لا توجد صفقات مطابقة" sub="عدّل البحث أو أضف صفقة جديدة" />}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="إضافة صفقة للمسار">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="اسم الصفقة *"><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="اسم الصفقة" /></Field>
          <Field label="العميل *"><input className="input" value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} /></Field>
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
              <option value="عالية">عالية</option>
              <option value="متوسطة">متوسطة</option>
              <option value="منخفضة">منخفضة</option>
            </select>
          </Field>
        </div>
        <Field label="النشاط التالي"><input className="input" value={form.nextActivity} onChange={e => setForm({ ...form, nextActivity: e.target.value })} /></Field>
        <div className="flex gap-2 mt-2">
          <button className="btn-primary flex-1" onClick={addDeal}>إضافة</button>
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>إلغاء</button>
        </div>
      </Modal>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer ? drawer.title : ''}>
        {drawer && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={drawer.customer} size={46} />
              <div>
                <p className="font-bold">{drawer.customer}</p>
                <p className="text-[12.5px] text-mut">{drawer.company}</p>
                <div className="mt-1 flex gap-1"><StatusBadge value={drawer.stage} /><StatusBadge value={drawer.priority} /></div>
              </div>
            </div>
            <Card title="القيمة والإغلاق">
              <p className="text-[20px] font-bold tabular-nums">{fmtMoney(drawer.value)}</p>
              <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-brand rounded-full" style={{ width: `${drawer.probability}%` }} />
              </div>
              <p className="text-[12.5px] text-mut mt-2">الاحتمالية {fmtNum(drawer.probability)}٪ — الإغلاق <span dir="ltr" className="tabular-nums">{drawer.closeDate}</span></p>
            </Card>
            <Card title="نقل المرحلة">
              <select className="input" value={drawer.stage} onChange={e => changeStage(e.target.value as Stage)}>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <p className="text-[12.5px] text-mut mt-2">النشاط التالي: {drawer.nextActivity}</p>
            </Card>
            <Card title="النشاط">
              <Timeline items={[
                { title: `في مرحلة ${drawer.stage}`, sub: drawer.nextActivity, time: drawer.closeDate },
                { title: 'أُنشئت الصفقة', sub: `بواسطة ${drawer.owner}`, time: 'قبل أسبوع' },
              ]} />
            </Card>
            <Card title="توصية ذكية">
              <AIInsight
                icon={<Sparkles size={18} />}
                title="الخطوة التالية"
                desc={drawer.stage === 'تم الفوز' ? 'صفقة مغلقة بنجاح — وثّق الدروس واطلب إحالة.' : drawer.stage === 'تم الخسارة' ? 'راجع أسباب الخسارة وجدول متابعة مستقبلية.' : `لدفع ${drawer.title} للأمام من مرحلة ${drawer.stage}، نفّذ: ${drawer.nextActivity}.`}
              />
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  )
}
