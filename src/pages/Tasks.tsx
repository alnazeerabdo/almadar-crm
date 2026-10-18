import { useMemo, useState } from 'react'
import {
  CalendarDays, AlertTriangle, CalendarPlus, CheckCircle2, Plus, Pencil, Trash2,
  Phone, Users, Mail, Bell, ClipboardList, Sparkles, Eye, ListOrdered,
} from 'lucide-react'
import {
  Avatar, StatusBadge, PageHeader, MetricCard, Card, SearchInput, Empty,
  Modal, Drawer, Field, Tabs, AIInsight,
} from '../components/ui'
import { tasks as seed, type Task, type TaskStatus, type TaskPriority } from '../data/tasks'
import { contacts, OWNERS } from '../data/contacts'
import { deals } from '../data/deals'
import { useStore } from '../lib/store'
import { cx, uid } from '../lib/utils'

const STATUSES: TaskStatus[] = ['جديدة', 'قيد التنفيذ', 'مكتملة', 'متأخرة']
const PRIORITIES: TaskPriority[] = ['عالية', 'متوسطة', 'منخفضة']
const TYPES: Task['type'][] = ['مكالمة', 'اجتماع', 'متابعة', 'بريد إلكتروني', 'مهمة عامة']
const VIEWS = ['قائمة', 'كانبان', 'أجندة']

function TypeIcon({ t }: { t: Task['type'] }) {
  const cls = 'text-mut'
  if (t === 'مكالمة') return <Phone size={16} className={cls} />
  if (t === 'اجتماع') return <Users size={16} className={cls} />
  if (t === 'بريد إلكتروني') return <Mail size={16} className={cls} />
  if (t === 'متابعة') return <Bell size={16} className={cls} />
  return <ClipboardList size={16} className={cls} />
}

interface Form {
  title: string; contact: string; deal: string; owner: string;
  priority: TaskPriority; status: TaskStatus; due: string; type: Task['type'];
}
const emptyForm: Form = {
  title: '', contact: contacts[0]?.name ?? '', deal: '', owner: OWNERS[0],
  priority: 'متوسطة', status: 'جديدة', due: 'اليوم 15:00', type: 'متابعة',
}

export default function Tasks() {
  const { toast } = useStore()
  const [items, setItems] = useState<Task[]>(seed)
  const [view, setView] = useState('قائمة')
  const [q, setQ] = useState('')
  const [fStatus, setFStatus] = useState('الكل')
  const [fPriority, setFPriority] = useState('الكل')
  const [fType, setFType] = useState('الكل')
  const [fOwner, setFOwner] = useState('الكل')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [form, setForm] = useState<Form>(emptyForm)
  const [detail, setDetail] = useState<Task | null>(null)

  const metrics = useMemo(() => ({
    today: items.filter((t) => t.due.includes('اليوم')).length,
    overdue: items.filter((t) => t.status === 'متأخرة').length,
    upcoming: items.filter((t) => t.status !== 'مكتملة' && t.status !== 'متأخرة' && !t.due.includes('اليوم')).length,
    done: items.filter((t) => t.status === 'مكتملة').length,
  }), [items])

  const filtered = useMemo(() => items.filter((t) => {
    if (q.trim() && !(t.title.includes(q) || t.contact.includes(q))) return false
    if (fStatus !== 'الكل' && t.status !== fStatus) return false
    if (fPriority !== 'الكل' && t.priority !== fPriority) return false
    if (fType !== 'الكل' && t.type !== fType) return false
    if (fOwner !== 'الكل' && t.owner !== fOwner) return false
    return true
  }), [items, q, fStatus, fPriority, fType, fOwner])

  const agenda = useMemo(() => {
    const g = new Map<string, Task[]>()
    filtered.forEach((t) => {
      const k = t.due
      if (!g.has(k)) g.set(k, [])
      g.get(k)!.push(t)
    })
    return [...g.entries()]
  }, [filtered])

  const suggested = useMemo(() => {
    const rank = (p: TaskPriority) => (p === 'عالية' ? 0 : p === 'متوسطة' ? 1 : 2)
    return [...items]
      .filter((t) => t.status !== 'مكتملة')
      .sort((a, b) => rank(a.priority) - rank(b.priority) || (a.due.includes('اليوم') ? -1 : 0))
      .slice(0, 4)
  }, [items])

  const toggleDone = (t: Task) => {
    const next: TaskStatus = t.status === 'مكتملة' ? 'قيد التنفيذ' : 'مكتملة'
    setItems((p) => p.map((x) => (x.id === t.id ? { ...x, status: next } : x)))
    setDetail((d) => (d?.id === t.id ? { ...d, status: next } : d))
    toast({ title: next === 'مكتملة' ? 'تم إنجاز المهمة' : 'تمت إعادة فتح المهمة', desc: t.title, kind: 'success' })
  }

  const removeTask = (id: string) => {
    setItems((p) => p.filter((t) => t.id !== id))
    setDetail(null)
    toast({ title: 'تم حذف المهمة', kind: 'success' })
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }
  const openEdit = (t: Task) => {
    setEditing(t)
    setForm({
      title: t.title, contact: t.contact, deal: t.deal ?? '', owner: t.owner,
      priority: t.priority, status: t.status, due: t.due, type: t.type,
    })
    setModalOpen(true)
    setDetail(null)
  }

  const save = () => {
    if (!form.title.trim()) {
      toast({ title: 'عنوان المهمة مطلوب', kind: 'error' })
      return
    }
    if (editing) {
      setItems((p) => p.map((t) => (t.id === editing.id ? { ...t, ...form, deal: form.deal || undefined } : t)))
      toast({ title: 'تم حفظ التعديلات', kind: 'success' })
    } else {
      setItems((p) => [...p, { id: uid('t'), ...form, deal: form.deal || undefined }])
      toast({ title: 'تم إنشاء المهمة', desc: form.title, kind: 'success' })
    }
    setModalOpen(false)
  }

  const set = (k: keyof Form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="page-wrap">
      <PageHeader
        title="المهام والأنشطة"
        sub="نظّم يومك وتابع كل المتابعات والمكالمات والاجتماعات"
        actions={<button className="btn-primary" onClick={openCreate}><Plus size={17} /> مهمة جديدة</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <MetricCard label="مهام اليوم" value={String(metrics.today)} icon={<CalendarDays size={19} />} tone="green" />
        <MetricCard label="المتأخرة" value={String(metrics.overdue)} delta={metrics.overdue ? 'تحتاج متابعة عاجلة' : 'لا يوجد تأخير'} icon={<AlertTriangle size={19} />} tone="red" />
        <MetricCard label="القادمة" value={String(metrics.upcoming)} icon={<CalendarPlus size={19} />} tone="blue" />
        <MetricCard label="المكتملة" value={String(metrics.done)} icon={<CheckCircle2 size={19} />} tone="green" />
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_300px] gap-4 items-start">
        <Card className="!p-0 overflow-hidden">
          <div className="p-4 border-b border-line space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Tabs tabs={VIEWS} value={view} onChange={setView} />
              <div className="flex-1" />
              <SearchInput value={q} onChange={setQ} ph="بحث في المهام..." />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <select className="input" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
                <option value="الكل">كل الحالات</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="input" value={fPriority} onChange={(e) => setFPriority(e.target.value)}>
                <option value="الكل">كل الأولويات</option>
                {PRIORITIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="input" value={fType} onChange={(e) => setFType(e.target.value)}>
                <option value="الكل">كل الأنواع</option>
                {TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="input" value={fOwner} onChange={(e) => setFOwner(e.target.value)}>
                <option value="الكل">كل الموظفين</option>
                {OWNERS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {view === 'قائمة' && (
            <div className="divide-y divide-line">
              {filtered.length === 0 && <Empty title="لا توجد مهام مطابقة" sub="جرّب تغيير الفلاتر أو أنشئ مهمة جديدة" />}
              {filtered.map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3 hover:bg-bgmain transition">
                  <input
                    type="checkbox"
                    checked={t.status === 'مكتملة'}
                    onChange={() => toggleDone(t)}
                    className="w-[18px] h-[18px] rounded accent-[#16A34A] shrink-0"
                    title="تحديد كمكتملة"
                  />
                  <span className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0"><TypeIcon t={t.type} /></span>
                  <button className="flex-1 min-w-0 text-start" onClick={() => setDetail(t)}>
                    <span className={cx('block text-[13.5px] font-bold truncate', t.status === 'مكتملة' && 'line-through text-mut')}>{t.title}</span>
                    <span className="block text-xs text-mut truncate mt-0.5">{t.contact} • {t.due} • {t.owner}</span>
                  </button>
                  <StatusBadge value={t.priority} />
                  <StatusBadge value={t.status} />
                  <span className="hidden md:flex items-center gap-1.5">
                    <button className="btn-ghost !p-2" onClick={() => setDetail(t)} title="عرض"><Eye size={16} /></button>
                    <button className="btn-ghost !p-2" onClick={() => openEdit(t)} title="تعديل"><Pencil size={16} /></button>
                    <button className="btn-ghost !p-2 hover:!text-red-600" onClick={() => removeTask(t.id)} title="حذف"><Trash2 size={16} /></button>
                  </span>
                </div>
              ))}
            </div>
          )}

          {view === 'كانبان' && (
            <div className="p-4 grid md:grid-cols-2 xl:grid-cols-4 gap-3 bg-bgmain/50">
              {STATUSES.map((s) => (
                <div key={s} className="bg-bgmain border border-line rounded-2xl p-2.5 space-y-2">
                  <p className="flex items-center justify-between px-1.5 py-1">
                    <b className="text-[13px]">{s}</b>
                    <span className="text-[11px] font-bold bg-white border border-line rounded-full px-2 py-0.5">{filtered.filter((t) => t.status === s).length}</span>
                  </p>
                  {filtered.filter((t) => t.status === s).map((t) => (
                    <button key={t.id} onClick={() => setDetail(t)} className="w-full text-start bg-white border border-line rounded-xl p-3 shadow-soft hover:border-brand transition">
                      <span className="flex items-center gap-1.5 text-[11.5px] text-mut mb-1"><TypeIcon t={t.type} />{t.type}</span>
                      <span className="block text-[13px] font-bold leading-relaxed">{t.title}</span>
                      <span className="flex items-center gap-1.5 mt-2">
                        <Avatar name={t.contact} size={22} />
                        <span className="text-[11.5px] text-mut truncate flex-1">{t.contact}</span>
                        <StatusBadge value={t.priority} />
                      </span>
                      <span className="block text-[11px] text-gray-400 mt-1.5">{t.due}</span>
                    </button>
                  ))}
                  {filtered.filter((t) => t.status === s).length === 0 && (
                    <p className="text-center text-xs text-gray-400 py-4">لا توجد مهام</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {view === 'أجندة' && (
            <div className="p-4 space-y-4">
              {agenda.length === 0 && <Empty title="لا توجد مهام" sub="الأجندة فارغة حسب الفلاتر الحالية" />}
              {agenda.map(([due, list]) => (
                <div key={due}>
                  <p className="text-[13px] font-bold mb-2 flex items-center gap-2"><CalendarDays size={15} className="text-brand-dark" />{due}</p>
                  <div className="space-y-2">
                    {list.map((t) => (
                      <div key={t.id} className="flex items-center gap-3 bg-bgmain border border-line rounded-xl px-3 py-2.5">
                        <input type="checkbox" checked={t.status === 'مكتملة'} onChange={() => toggleDone(t)} className="w-[17px] h-[17px] rounded accent-[#16A34A]" />
                        <button className="flex-1 min-w-0 text-start" onClick={() => setDetail(t)}>
                          <span className="block text-[13px] font-bold truncate">{t.title}</span>
                          <span className="block text-xs text-mut">{t.contact} • {t.type}</span>
                        </button>
                        <StatusBadge value={t.priority} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* AI panel */}
        <div className="space-y-4">
          <Card title="خطة يومي الذكية" sub="مرتبة حسب الأولوية والموعد" action={<Sparkles size={18} className="text-brand-dark" />}>
            <div className="space-y-2.5">
              <AIInsight icon={<ListOrdered size={17} />} title="ركّز على الإغلاق أولاً" desc="لديك مهام عالية الأولوية مستحقة اليوم، ابدأ بها قبل الاجتماعات." />
              <AIInsight icon={<AlertTriangle size={17} />} title="مهام متأخرة" desc={metrics.overdue ? `لديك ${metrics.overdue} مهام متأخرة — يُنصح بإنجازها اليوم.` : 'ممتاز! لا توجد مهام متأخرة حالياً.'} />
              <AIInsight icon={<CheckCircle2 size={17} />} title="فرصة للإنجاز" desc="إتمام مهام اليوم سيرفع نسبة إنجازك الأسبوعية بشكل ملحوظ." />
            </div>
          </Card>
          <Card title="الترتيب المقترح" sub="اسحب نفسك خطوة بخطوة">
            <ol className="space-y-2">
              {suggested.map((t, i) => (
                <li key={t.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-bgmain border border-line">
                  <span className="w-6 h-6 rounded-full bg-ink text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[12.5px] font-bold truncate">{t.title}</span>
                    <span className="block text-[11px] text-mut">{t.due}</span>
                  </span>
                  <StatusBadge value={t.priority} />
                </li>
              ))}
              {suggested.length === 0 && <p className="text-[13px] text-mut text-center py-3">كل المهام منجزة 🎉</p>}
            </ol>
          </Card>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'تعديل المهمة' : 'مهمة جديدة'}>
        <div className="space-y-1">
          <Field label="عنوان المهمة">
            <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="مثال: متابعة عرض سعر..." />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="جهة الاتصال">
              <select className="input" value={form.contact} onChange={(e) => set('contact', e.target.value)}>
                {contacts.map((c) => <option key={c.id} value={c.name}>{c.name} — {c.company}</option>)}
              </select>
            </Field>
            <Field label="الصفقة المرتبطة (اختياري)">
              <select className="input" value={form.deal} onChange={(e) => set('deal', e.target.value)}>
                <option value="">بدون صفقة</option>
                {deals.map((d) => <option key={d.id} value={d.title}>{d.title}</option>)}
              </select>
            </Field>
            <Field label="المسؤول">
              <select className="input" value={form.owner} onChange={(e) => set('owner', e.target.value)}>
                {OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="النوع">
              <select className="input" value={form.type} onChange={(e) => set('type', e.target.value)}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="الأولوية">
              <select className="input" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="الحالة">
              <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="موعد الاستحقاق">
            <input className="input" value={form.due} onChange={(e) => set('due', e.target.value)} placeholder="مثال: اليوم 15:00 أو غداً 10:00" />
          </Field>
          <div className="flex gap-2 pt-2">
            <button className="btn-primary flex-1" onClick={save}>{editing ? 'حفظ التعديلات' : 'إنشاء المهمة'}</button>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>إلغاء</button>
          </div>
        </div>
      </Modal>

      {/* Detail Drawer */}
      <Drawer open={!!detail} onClose={() => setDetail(null)} title="تفاصيل المهمة">
        {detail && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center shrink-0"><TypeIcon t={detail.type} /></span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[15px] leading-relaxed">{detail.title}</p>
                <p className="text-[13px] text-mut mt-0.5">{detail.type} • {detail.due}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={detail.status} />
              <StatusBadge value={detail.priority} />
            </div>
            <div className="card !shadow-none !rounded-xl p-3.5 space-y-2.5 text-[13.5px]">
              <p className="flex justify-between"><span className="text-mut">جهة الاتصال</span><b>{detail.contact}</b></p>
              <p className="flex justify-between"><span className="text-mut">الصفقة</span><b>{detail.deal ?? '—'}</b></p>
              <p className="flex justify-between"><span className="text-mut">المسؤول</span><b>{detail.owner}</b></p>
              <p className="flex justify-between"><span className="text-mut">الاستحقاق</span><b>{detail.due}</b></p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary flex-1" onClick={() => toggleDone(detail)}>
                <CheckCircle2 size={16} /> {detail.status === 'مكتملة' ? 'إعادة فتح' : 'إنجاز المهمة'}
              </button>
              <button className="btn-secondary" onClick={() => openEdit(detail)}><Pencil size={16} /> تعديل</button>
              <button className="btn-secondary hover:!text-red-600" onClick={() => removeTask(detail.id)}><Trash2 size={16} /> حذف</button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
