import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye, Pencil, Trash2, ArrowRightLeft, UserCheck, Sparkles, PenLine, Star, TrendingUp, Phone } from 'lucide-react'
import { PageHeader, SearchInput, StatusBadge, Avatar, Card, Empty, Modal, Drawer, Field, MetricCard, AIInsight, Timeline } from '../components/ui'
import { leads as seedLeads, LEAD_SOURCES, type Lead, type LeadStage } from '../data/leads'
import { OWNERS } from '../data/contacts'
import { tasks } from '../data/tasks'
import { useStore } from '../lib/store'
import { fmtNum, uid, cx } from '../lib/utils'

const STAGE_LIST: LeadStage[] = ['جديد', 'تم التواصل', 'مؤهل', 'تفاوض', 'محول', 'مفقود']

function scoreBar(score: number) {
  if (score >= 80) return 'bg-brand'
  if (score >= 60) return 'bg-amber-500'
  return 'bg-gray-300'
}
function scoreText(score: number) {
  if (score >= 80) return 'text-brand-dark'
  if (score >= 60) return 'text-amber-600'
  return 'text-gray-500'
}

type FormState = { name: string; company: string; source: string; score: number; stage: LeadStage; owner: string; phone: string; email: string; notes: string }
const emptyForm: FormState = { name: '', company: '', source: LEAD_SOURCES[0], score: 50, stage: 'جديد', owner: OWNERS[0], phone: '', email: '', notes: '' }

export default function Leads() {
  const { toast } = useStore()
  const navigate = useNavigate()
  const [list, setList] = useState<Lead[]>(seedLeads)
  const [query, setQuery] = useState('')
  const [sourceF, setSourceF] = useState('الكل')
  const [stageF, setStageF] = useState('الكل')
  const [ownerF, setOwnerF] = useState('الكل')
  const [minScore, setMinScore] = useState(0)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Lead | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  const [assignOpen, setAssignOpen] = useState(false)
  const [assignTarget, setAssignTarget] = useState<Lead | null>(null)
  const [assignOwner, setAssignOwner] = useState(OWNERS[0])

  const [convertOpen, setConvertOpen] = useState(false)
  const [convertTarget, setConvertTarget] = useState<Lead | null>(null)

  const [drawer, setDrawer] = useState<Lead | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim()
    return list.filter(l => {
      if (sourceF !== 'الكل' && l.source !== sourceF) return false
      if (stageF !== 'الكل' && l.stage !== stageF) return false
      if (ownerF !== 'الكل' && l.owner !== ownerF) return false
      if (l.score < minScore) return false
      if (q && !(l.name.includes(q) || l.company.includes(q) || l.email.includes(q))) return false
      return true
    })
  }, [list, query, sourceF, stageF, ownerF, minScore])

  const total = list.length
  const fresh = list.filter(l => l.stage === 'جديد').length
  const qualified = list.filter(l => l.stage === 'مؤهل' || l.stage === 'تفاوض').length
  const converted = list.filter(l => l.stage === 'محول').length
  const rate = total ? Math.round((converted / total) * 100) : 0

  function openAdd() { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(l: Lead) {
    setEditing(l)
    setForm({ name: l.name, company: l.company, source: l.source, score: l.score, stage: l.stage, owner: l.owner, phone: l.phone, email: l.email, notes: l.notes })
    setModalOpen(true)
  }
  function saveForm() {
    if (!form.name.trim() || !form.company.trim()) {
      toast({ title: 'أكمل الحقول المطلوبة', desc: 'الاسم والشركة حقلان إلزاميان', kind: 'error' })
      return
    }
    if (editing) {
      setList(p => p.map(l => (l.id === editing.id ? { ...l, ...form } : l)))
      if (drawer?.id === editing.id) setDrawer({ ...drawer, ...form })
      toast({ title: 'تم حفظ العميل المحتمل', kind: 'success' })
    } else {
      const l: Lead = { id: uid('l'), ...form, lastFollow: 'الآن', createdAt: '2026-10-09' }
      setList(p => [l, ...p])
      toast({ title: 'تمت إضافة عميل محتمل', desc: `أُضيف ${l.name}`, kind: 'success' })
    }
    setModalOpen(false)
  }
  function remove(id: string) {
    if (!window.confirm('حذف هذا العميل المحتمل؟')) return
    setList(p => p.filter(l => l.id !== id))
    if (drawer?.id === id) setDrawer(null)
    toast({ title: 'تم الحذف', kind: 'info' })
  }
  function openAssign(l: Lead) { setAssignTarget(l); setAssignOwner(l.owner); setAssignOpen(true) }
  function applyAssign() {
    if (!assignTarget) return
    setList(p => p.map(l => (l.id === assignTarget.id ? { ...l, owner: assignOwner } : l)))
    if (drawer?.id === assignTarget.id) setDrawer({ ...drawer, owner: assignOwner })
    toast({ title: 'تم تعيين المسؤول', desc: `أُسند ${assignTarget.name} إلى ${assignOwner}`, kind: 'success' })
    setAssignOpen(false)
  }
  function openConvert(l: Lead) { setConvertTarget(l); setConvertOpen(true) }
  function applyConvert(goContacts: boolean) {
    if (!convertTarget) return
    setList(p => p.map(l => (l.id === convertTarget.id ? { ...l, stage: 'محول' } : l)))
    if (drawer?.id === convertTarget.id) setDrawer({ ...drawer, stage: 'محول' })
    toast({ title: 'تم تحويل العميل المحتمل', desc: `تحوّل ${convertTarget.name} إلى عميل`, kind: 'success' })
    setConvertOpen(false)
    if (goContacts) navigate('/contacts')
  }

  const drawerTasks = drawer ? tasks.filter(t => t.contact === drawer.name || drawer.company.includes(t.contact) || t.contact.includes(drawer.name)) : []

  return (
    <div className="page-wrap">
      <PageHeader
        title="العملاء المحتملون"
        sub={`إدارة خط التأهيل — ${fmtNum(total)} عميل محتمل`}
        actions={<button className="btn-primary" onClick={openAdd}><Plus size={16} /> إضافة محتمل</button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="إجمالي المحتملين" value={fmtNum(total)} icon={<Star size={20} />} />
        <MetricCard label="جدد" value={fmtNum(fresh)} icon={<Plus size={20} />} tone="blue" />
        <MetricCard label="مؤهلون" value={fmtNum(qualified)} icon={<UserCheck size={20} />} />
        <MetricCard label="معدل التحويل" value={`${fmtNum(rate)}٪`} delta={`${fmtNum(converted)} محوّل`} icon={<TrendingUp size={20} />} tone="amber" />
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={query} onChange={setQuery} ph="ابحث بالاسم أو الشركة..." />
          <select className="input !w-auto" value={sourceF} onChange={e => setSourceF(e.target.value)}>
            <option value="الكل">كل المصادر</option>
            {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input !w-auto" value={stageF} onChange={e => setStageF(e.target.value)}>
            <option value="الكل">كل المراحل</option>
            {STAGE_LIST.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input !w-auto" value={ownerF} onChange={e => setOwnerF(e.target.value)}>
            <option value="الكل">كل المسؤولين</option>
            {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <label className="flex items-center gap-2 text-[13px] font-semibold text-slate2">
            الحد الأدنى: {fmtNum(minScore)}
            <input type="range" min={0} max={100} step={5} value={minScore} onChange={e => setMinScore(Number(e.target.value))} className="accent-[#16A34A]" />
          </label>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px]">
            <thead className="bg-gray-50 border-b border-line">
              <tr>
                <th className="th">الاسم</th>
                <th className="th">الشركة</th>
                <th className="th">المصدر</th>
                <th className="th">درجة التأهيل</th>
                <th className="th">المرحلة</th>
                <th className="th">المسؤول</th>
                <th className="th">آخر متابعة</th>
                <th className="th">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map(l => (
                <tr key={l.id} className="hover:bg-gray-50/60 cursor-pointer" onClick={() => setDrawer(l)}>
                  <td className="td">
                    <div className="flex items-center gap-2">
                      <Avatar name={l.name} size={34} />
                      <span className="font-bold">{l.name}</span>
                    </div>
                  </td>
                  <td className="td">{l.company}</td>
                  <td className="td text-mut">{l.source}</td>
                  <td className="td">
                    <div className="flex items-center gap-2 min-w-[140px]">
                      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className={cx('h-full rounded-full', scoreBar(l.score))} style={{ width: `${l.score}%` }} />
                      </div>
                      <span className={cx('text-[12.5px] font-bold tabular-nums', scoreText(l.score))}>{fmtNum(l.score)}٪</span>
                    </div>
                  </td>
                  <td className="td"><StatusBadge value={l.stage} /></td>
                  <td className="td">{l.owner}</td>
                  <td className="td text-mut">{l.lastFollow}</td>
                  <td className="td" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button className="btn-ghost !p-2" title="عرض" onClick={() => setDrawer(l)}><Eye size={16} /></button>
                      <button className="btn-ghost !p-2" title="تعديل" onClick={() => openEdit(l)}><Pencil size={16} /></button>
                      <button className="btn-ghost !p-2" title="تعيين" onClick={() => openAssign(l)}><UserCheck size={16} /></button>
                      <button className="btn-ghost !p-2" title="تحويل لعميل" onClick={() => openConvert(l)}><ArrowRightLeft size={16} /></button>
                      <button className="btn-ghost !p-2 !text-red-600" title="حذف" onClick={() => remove(l.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <Empty title="لا يوجد عملاء محتملون" sub="أضف عميلاً محتملاً جديداً أو عدّل الفلاتر" action={<button className="btn-primary" onClick={openAdd}><Plus size={16} /> إضافة محتمل</button>} />}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'تعديل العميل المحتمل' : 'إضافة عميل محتمل'}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="الاسم *"><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="اسم العميل المحتمل" /></Field>
          <Field label="الشركة *"><input className="input" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="اسم الشركة" /></Field>
          <Field label="المصدر">
            <select className="input" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>
              {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="المسؤول">
            <select className="input" value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })}>
              {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="المرحلة">
            <select className="input" value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value as LeadStage })}>
              {STAGE_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label={`درجة التأهيل: ${form.score}`}>
            <input type="range" min={0} max={100} value={form.score} onChange={e => setForm({ ...form, score: Number(e.target.value) })} className="w-full accent-[#16A34A]" />
          </Field>
          <Field label="الهاتف"><input className="input" dir="ltr" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="البريد"><input className="input" dir="ltr" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></Field>
        </div>
        <Field label="ملاحظات"><textarea className="input min-h-[80px]" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="تفاصيل الاهتمام والاحتياج..." /></Field>
        <div className="flex gap-2 mt-2">
          <button className="btn-primary flex-1" onClick={saveForm}>{editing ? 'حفظ' : 'إضافة'}</button>
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>إلغاء</button>
        </div>
      </Modal>

      <Modal open={assignOpen} onClose={() => setAssignOpen(false)} title="تعيين مسؤول">
        <p className="text-[13.5px] text-mut mb-3">تعيين {assignTarget?.name} إلى مسؤول جديد</p>
        <Field label="المسؤول">
          <select className="input" value={assignOwner} onChange={e => setAssignOwner(e.target.value)}>
            {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
        <div className="flex gap-2 mt-2">
          <button className="btn-primary flex-1" onClick={applyAssign}>تأكيد التعيين</button>
          <button className="btn-secondary" onClick={() => setAssignOpen(false)}>إلغاء</button>
        </div>
      </Modal>

      <Modal open={convertOpen} onClose={() => setConvertOpen(false)} title="تحويل إلى عميل">
        <p className="text-[13.5px] text-mut mb-4">سيتم تحويل {convertTarget?.name} ({convertTarget?.company}) إلى عميل في قائمة العملاء.</p>
        <div className="flex gap-2">
          <button className="btn-primary flex-1" onClick={() => applyConvert(false)}>تحويل فقط</button>
          <button className="btn-secondary flex-1" onClick={() => applyConvert(true)}>تحويل والانتقال للعملاء</button>
        </div>
      </Modal>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer ? drawer.name : ''}>
        {drawer && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={drawer.name} size={52} />
              <div>
                <p className="font-bold text-[16px]">{drawer.name}</p>
                <p className="text-[13px] text-mut">{drawer.company}</p>
                <div className="mt-1 flex gap-1"><StatusBadge value={drawer.stage} /></div>
              </div>
            </div>

            <Card title="بيانات التواصل">
              <div className="text-[13.5px] space-y-1.5">
                <p>المصدر: {drawer.source}</p>
                <p dir="ltr" className="tabular-nums">الهاتف: {drawer.phone}</p>
                <p dir="ltr">البريد: {drawer.email}</p>
                <p>المسؤول: {drawer.owner} — آخر متابعة: {drawer.lastFollow}</p>
              </div>
            </Card>

            <Card title="التأهيل">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className={cx('h-full rounded-full', scoreBar(drawer.score))} style={{ width: `${drawer.score}%` }} />
                </div>
                <span className={cx('font-bold tabular-nums', scoreText(drawer.score))}>{fmtNum(drawer.score)}٪</span>
              </div>
              <p className="text-[12.5px] text-mut mt-2">{drawer.score >= 80 ? 'تأهيل مرتفع — جاهز للتحويل أو إنشاء صفقة.' : drawer.score >= 60 ? 'تأهيل متوسط — يحتاج متابعة وتغذية بالمحتوى.' : 'تأهيل منخفض — يحتاج رعاية أولية قبل البيع.'}</p>
            </Card>

            <Card title="ملاحظات">
              <p className="text-[13.5px] leading-relaxed">{drawer.notes || 'لا توجد ملاحظات.'}</p>
            </Card>

            <Card title="التفاعلات">
              <Timeline items={[
                { title: 'آخر متابعة', sub: drawer.lastFollow, time: drawer.lastFollow },
                { title: 'أُنشئ من المصدر', sub: drawer.source, time: drawer.createdAt },
                ...drawerTasks.slice(0, 3).map(t => ({ title: t.title, sub: `${t.owner} — ${t.due}`, time: t.due })),
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

            <Card title="ملخص ذكي">
              <AIInsight
                icon={<Sparkles size={18} />}
                title="تقييم الذكاء الاصطناعي"
                desc={`${drawer.name} بدرجة ${drawer.score}٪ من مصدر ${drawer.source} في مرحلة ${drawer.stage}. ${drawer.score >= 70 ? 'فرصة واعدة يُنصح بتسريع التواصل وإرسال عرض.' : 'يُنصح بخطة رعاية وتواصل تدريجي لرفع الاهتمام.'}`}
              />
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button className="btn-secondary !py-2" onClick={() => toast({ title: 'تقييم التأهيل', desc: `درجة ${drawer.name}: ${drawer.score}٪ (عرض تجريبي)`, kind: 'info' })}><Star size={15} /> تقييم</button>
                <button className="btn-secondary !py-2" onClick={() => toast({ title: 'الخطوة المقترحة', desc: 'يُنصح بمكالمة متابعة خلال ٢٤ ساعة (عرض تجريبي)', kind: 'info' })}><TrendingUp size={15} /> اقتراح الخطوة</button>
                <button className="btn-secondary !py-2" onClick={() => toast({ title: 'مسودة رسالة', desc: 'تم إنشاء مسودة رسالة متابعة (عرض تجريبي)', kind: 'success' })}><PenLine size={15} /> كتابة رسالة</button>
                <button className="btn-secondary !py-2" onClick={() => { setDrawer(null); openConvert(drawer) }}><ArrowRightLeft size={15} /> تحويل</button>
                <button className="btn-secondary !py-2 col-span-2" onClick={() => toast({ title: 'إنشاء صفقة', desc: `تم تجهيز صفقة جديدة لـ ${drawer.company} (عرض تجريبي)`, kind: 'success' })}><Phone size={15} /> إنشاء صفقة</button>
              </div>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  )
}
