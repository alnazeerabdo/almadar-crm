import { useMemo, useState } from 'react'
import {
  ChevronRight, ChevronLeft, Plus, Pencil, Trash2, Phone, Users,
  Bell, ClipboardList, Sparkles, Clock, MapPin, CalendarDays, Lightbulb, CircleHelp,
} from 'lucide-react'
import {
  PageHeader, Card, Modal, Drawer, Field, Tabs, AIInsight, StatusBadge,
} from '../components/ui'
import { events as seedEvents } from '../data/tasks'
import { OWNERS } from '../data/contacts'
import { useStore } from '../lib/store'
import { cx, uid } from '../lib/utils'

interface CalEvent {
  id: string; title: string; date: string; time: string;
  customer: string; owner: string; type: string; color: string;
}

const AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
const WEEKDAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
const AR_WEEKDAY_BY_GETDAY = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const VIEWS = ['شهر', 'أسبوع', 'يوم', 'أجندة']
const TYPES = ['اجتماع', 'مكالمة', 'متابعة', 'اجتماع داخلي', 'مهمة عامة']

function colorFor(type: string) {
  if (type === 'اجتماع') return '#16A34A'
  if (type === 'مكالمة') return '#2563EB'
  if (type === 'متابعة') return '#D97706'
  if (type === 'اجتماع داخلي') return '#6B7280'
  return '#7C3AED'
}

function seedToDate(): CalEvent[] {
  return seedEvents.map((e) => {
    const num = parseInt(e.day.replace(/[^0-9]/g, ''), 10) || 11
    const dd = String(num).padStart(2, '0')
    return {
      id: e.id, title: e.title, date: `2026-10-${dd}`, time: e.time,
      customer: e.customer, owner: e.owner, type: e.type, color: e.color,
    }
  })
}

const pad = (n: number) => String(n).padStart(2, '0')
const ds = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`
const dayNum = (date: string) => parseInt(date.slice(8, 10), 10)
function weekdayName(date: string) {
  const [y, m, d] = date.split('-').map(Number)
  return AR_WEEKDAY_BY_GETDAY[new Date(y, m - 1, d).getDay()]
}
function fmtAr(date: string) {
  const [y, m, d] = date.split('-').map(Number)
  return `${weekdayName(date)}، ${d} ${AR_MONTHS[m - 1]} ${y}`
}

function TypeGlyph({ t }: { t: string }) {
  if (t === 'مكالمة') return <Phone size={13} />
  if (t === 'اجتماع' || t === 'اجتماع داخلي') return <Users size={13} />
  if (t === 'متابعة') return <Bell size={13} />
  return <ClipboardList size={13} />
}

interface Form { title: string; date: string; time: string; customer: string; owner: string; type: string }
const emptyForm: Form = { title: '', date: '2026-10-14', time: '10:00', customer: '', owner: OWNERS[0], type: 'اجتماع' }

export default function CalendarPage() {
  const { toast } = useStore()
  const [evts, setEvts] = useState<CalEvent[]>(seedToDate)
  const [view, setView] = useState('شهر')
  const [year, setYear] = useState(2026)
  const [month, setMonth] = useState(9) // October
  const [selDay, setSelDay] = useState(12)
  const [fEmp, setFEmp] = useState('الكل')
  const [fType, setFType] = useState('الكل')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CalEvent | null>(null)
  const [form, setForm] = useState<Form>(emptyForm)
  const [detail, setDetail] = useState<CalEvent | null>(null)

  const filtered = useMemo(() => evts.filter((e) => {
    if (fEmp !== 'الكل' && e.owner !== fEmp && e.owner !== 'الكل') return false
    if (fType !== 'الكل' && e.type !== fType) return false
    return true
  }), [evts, fEmp, fType])

  // Month grid cells: null = blank, number = day
  const cells = useMemo(() => {
    const firstGetDay = new Date(year, month, 1).getDay() // 0 Sun..6 Sat
    const offset = (firstGetDay + 1) % 7 // Saturday-start
    const dim = new Date(year, month + 1, 0).getDate()
    const arr: (number | null)[] = []
    for (let i = 0; i < offset; i++) arr.push(null)
    for (let d = 1; d <= dim; d++) arr.push(d)
    while (arr.length % 7 !== 0) arr.push(null)
    return arr
  }, [year, month])

  const byDate = useMemo(() => {
    const m = new Map<string, CalEvent[]>()
    filtered.forEach((e) => {
      if (!m.has(e.date)) m.set(e.date, [])
      m.get(e.date)!.push(e)
    })
    return m
  }, [filtered])

  // Week containing selected day (Saturday..Friday)
  const weekDays = useMemo(() => {
    const sel = new Date(year, month, selDay)
    const off = (sel.getDay() + 1) % 7
    const sat = new Date(year, month, selDay - off)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sat.getFullYear(), sat.getMonth(), sat.getDate() + i)
      return ds(d.getFullYear(), d.getMonth(), d.getDate())
    })
  }, [year, month, selDay])

  const selDateStr = ds(year, month, selDay)
  const selEvents = (byDate.get(selDateStr) ?? []).slice().sort((a, b) => a.time.localeCompare(b.time))
  const agendaList = useMemo(() => [...filtered].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)), [filtered])

  const stepMonth = (dir: 1 | -1) => {
    let m = month + dir
    let y = year
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setMonth(m); setYear(y)
  }
  const goToday = () => { setYear(2026); setMonth(9); setSelDay(9) }

  const setF = (k: keyof Form, v: string) => setForm((f) => ({ ...f, [k]: v }))
  const openCreate = (date?: string) => {
    setEditing(null)
    setForm({ ...emptyForm, date: date ?? selDateStr })
    setModalOpen(true)
  }
  const openEdit = (e: CalEvent) => {
    setEditing(e)
    setForm({ title: e.title, date: e.date, time: e.time.split(' ')[0].split('-')[0], customer: e.customer, owner: e.owner === 'الكل' ? OWNERS[0] : e.owner, type: TYPES.includes(e.type) ? e.type : 'اجتماع' })
    setDetail(null)
    setModalOpen(true)
  }
  const save = () => {
    if (!form.title.trim()) { toast({ title: 'عنوان الموعد مطلوب', kind: 'error' }); return }
    if (editing) {
      setEvts((p) => p.map((e) => (e.id === editing.id ? { ...e, title: form.title, date: form.date, time: form.time, customer: form.customer || '—', owner: form.owner, type: form.type, color: colorFor(form.type) } : e)))
      toast({ title: 'تم حفظ التعديلات', kind: 'success' })
    } else {
      setEvts((p) => [...p, { id: uid('ev'), title: form.title, date: form.date, time: form.time, customer: form.customer || '—', owner: form.owner, type: form.type, color: colorFor(form.type) }])
      toast({ title: 'تم إنشاء الموعد', desc: `${form.title} — ${form.date}`, kind: 'success' })
    }
    setModalOpen(false)
  }
  const removeEvt = (id: string) => {
    setEvts((p) => p.filter((e) => e.id !== id))
    setDetail(null)
    toast({ title: 'تم حذف الموعد', kind: 'success' })
  }

  const prep = selEvents[0] ?? agendaList[0]

  return (
    <div className="page-wrap">
      <PageHeader
        title="التقويم والمواعيد"
        sub={`${AR_MONTHS[month]} ${year} — التقويم يبدأ بيوم السبت`}
        actions={<button className="btn-primary" onClick={() => openCreate()}><Plus size={17} /> موعد جديد</button>}
      />

      <Card className="!p-0 overflow-hidden">
        <div className="p-4 border-b border-line flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <button className="btn-ghost !p-2" onClick={() => stepMonth(1)} title="الشهر التالي"><ChevronRight size={18} /></button>
            <p className="font-bold min-w-[130px] text-center">{AR_MONTHS[month]} {year}</p>
            <button className="btn-ghost !p-2" onClick={() => stepMonth(-1)} title="الشهر السابق"><ChevronLeft size={18} /></button>
          </div>
          <button className="btn-secondary !py-2" onClick={goToday}>اليوم</button>
          <Tabs tabs={VIEWS} value={view} onChange={setView} />
          <div className="flex-1" />
          <select className="input !w-auto" value={fEmp} onChange={(e) => setFEmp(e.target.value)}>
            <option value="الكل">كل الموظفين</option>
            {OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <select className="input !w-auto" value={fType} onChange={(e) => setFType(e.target.value)}>
            <option value="الكل">كل الأنواع</option>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {view === 'شهر' && (
          <div className="p-3 md:p-4">
            <div className="grid grid-cols-7 gap-1.5 mb-1.5">
              {WEEKDAYS.map((w) => (
                <p key={w} className="text-center text-[11.5px] font-bold text-mut py-1">{w}</p>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {cells.map((d, i) => {
                if (d === null) return <div key={i} className="min-h-[86px] rounded-xl bg-gray-50/70" />
                const dstr = ds(year, month, d)
                const list = (byDate.get(dstr) ?? []).slice(0, 3)
                const extra = (byDate.get(dstr) ?? []).length - list.length
                const isSel = d === selDay
                const isToday = year === 2026 && month === 9 && d === 9
                return (
                  <button
                    key={i}
                    onClick={() => { setSelDay(d); setView('يوم') }}
                    onDoubleClick={() => openCreate(dstr)}
                    className={cx(
                      'min-h-[86px] rounded-xl border p-1.5 text-start transition hover:border-brand align-top',
                      isSel ? 'border-brand bg-brand-pale/50' : 'border-line bg-white'
                    )}
                    title="اضغط للعرض اليومي — نقرة مزدوجة للإضافة"
                  >
                    <span className="flex items-center justify-between">
                      <span className={cx(
                        'w-6 h-6 rounded-full text-[12px] font-bold flex items-center justify-center',
                        isToday ? 'bg-brand text-white' : 'text-slate2'
                      )}>{d}</span>
                      {(byDate.get(dstr) ?? []).length > 0 && (
                        <span className="text-[10px] font-bold text-brand-dark">{(byDate.get(dstr) ?? []).length}</span>
                      )}
                    </span>
                    <span className="block space-y-1 mt-1">
                      {list.map((e) => (
                        <span
                          key={e.id}
                          onClick={(ev) => { ev.stopPropagation(); setDetail(e) }}
                          className="flex items-center gap-1 text-[10.5px] font-semibold text-white rounded-md px-1.5 py-0.5 truncate cursor-pointer"
                          style={{ background: e.color }}
                        >
                          <TypeGlyph t={e.type} />{e.title}
                        </span>
                      ))}
                      {extra > 0 && <span className="block text-[10px] text-mut font-bold">+{extra} المزيد</span>}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {view === 'أسبوع' && (
          <div className="p-3 md:p-4 grid grid-cols-1 sm:grid-cols-7 gap-2">
            {weekDays.map((dstr, i) => (
              <div key={dstr} className="border border-line rounded-xl p-2 min-h-[160px] bg-white">
                <p className="text-[11.5px] font-bold text-mut">{WEEKDAYS[i]}</p>
                <p className={cx('text-[15px] font-bold', dstr === selDateStr && 'text-brand-dark')}>{dayNum(dstr)}</p>
                <div className="space-y-1.5 mt-2">
                  {(byDate.get(dstr) ?? []).map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setDetail(e)}
                      className="w-full text-start text-[11px] font-semibold text-white rounded-lg px-2 py-1.5 leading-relaxed"
                      style={{ background: e.color }}
                    >
                      {e.title}<span className="block opacity-85 font-normal">{e.time}</span>
                    </button>
                  ))}
                  {(byDate.get(dstr) ?? []).length === 0 && <p className="text-[11px] text-gray-400">لا مواعيد</p>}
                </div>
                <button onClick={() => openCreate(dstr)} className="mt-2 text-[11px] font-bold text-brand-dark hover:underline">+ إضافة</button>
              </div>
            ))}
          </div>
        )}

        {view === 'يوم' && (
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <p className="font-bold">{fmtAr(selDateStr)}</p>
              <div className="flex-1" />
              <div className="flex gap-1.5 flex-wrap">
                {Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) => i + 1)
                  .filter((d) => d >= 9 && d <= 16)
                  .map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelDay(d)}
                      className={cx('w-9 h-9 rounded-xl text-[13px] font-bold border transition', d === selDay ? 'bg-ink text-white border-ink' : 'bg-white border-line hover:border-brand')}
                    >
                      {d}
                    </button>
                  ))}
              </div>
              <button className="btn-secondary !py-2" onClick={() => openCreate(selDateStr)}><Plus size={15} /> إضافة في هذا اليوم</button>
            </div>
            {selEvents.length === 0 && (
              <div className="text-center py-8">
                <CalendarDays size={26} className="mx-auto text-gray-300 mb-2" />
                <p className="font-bold text-[14px]">لا توجد مواعيد في {fmtAr(selDateStr)}</p>
                <button className="btn-primary mt-3" onClick={() => openCreate(selDateStr)}><Plus size={16} /> إضافة موعد</button>
              </div>
            )}
            <ul className="relative space-y-3 before:absolute before:start-[7px] before:top-2 before:bottom-2 before:w-px before:bg-line">
              {selEvents.map((e) => (
                <li key={e.id} className="relative ps-7">
                  <span className="absolute start-[2px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-soft" style={{ background: e.color }} />
                  <button onClick={() => setDetail(e)} className="w-full text-start card !rounded-xl p-3 hover:border-brand transition">
                    <span className="flex items-center justify-between gap-2">
                      <b className="text-[13.5px]">{e.title}</b>
                      <span className="text-[11.5px] text-mut flex items-center gap-1 whitespace-nowrap"><Clock size={13} />{e.time}</span>
                    </span>
                    <span className="block text-xs text-mut mt-1">{e.customer} • {e.owner}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {view === 'أجندة' && (
          <div className="divide-y divide-line">
            {agendaList.length === 0 && (
              <p className="text-center text-[13px] text-mut py-8">لا توجد مواعيد مطابقة للفلاتر</p>
            )}
            {agendaList.map((e) => (
              <button key={e.id} onClick={() => setDetail(e)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-bgmain text-start transition">
                <span className="w-12 shrink-0 text-center rounded-xl border border-line bg-white py-1.5">
                  <span className="block text-[16px] font-bold leading-none">{dayNum(e.date)}</span>
                  <span className="block text-[10px] text-mut mt-0.5">{AR_MONTHS[parseInt(e.date.slice(5, 7), 10) - 1]}</span>
                </span>
                <span className="w-1.5 self-stretch rounded-full shrink-0" style={{ background: e.color }} />
                <span className="flex-1 min-w-0">
                  <span className="block text-[13.5px] font-bold truncate">{e.title}</span>
                  <span className="block text-xs text-mut truncate">{weekdayName(e.date)} • {e.time} • {e.customer}</span>
                </span>
                <span className="badge bg-gray-100 text-gray-600 whitespace-nowrap"><TypeGlyph t={e.type} />{e.type}</span>
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* AI prep */}
      <Card
        title="التحضير الذكي للاجتماع القادم"
        sub="ملخص سريع قبل الدخول على العميل"
        action={<span className="badge bg-brand-pale text-brand-dark"><Sparkles size={13} /> بالذكاء الاصطناعي</span>}
      >
        {!prep ? (
          <p className="text-[13px] text-mut">لا توجد مواعيد قادمة — أنشئ موعداً لعرض التحضير الذكي.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-bgmain border border-line">
              <p className="text-[13px] font-bold mb-1.5 flex items-center gap-1.5"><MapPin size={15} className="text-brand-dark" /> ملخص العميل</p>
              <p className="text-[12.5px] text-slate2 leading-relaxed">
                {prep.customer} — {prep.title} ({prep.type}). الموعد {fmtAr(prep.date)} الساعة {prep.time} مع {prep.owner}.
              </p>
              <p className="mt-2"><StatusBadge value={prep.type} /></p>
            </div>
            <div className="p-3.5 rounded-xl bg-bgmain border border-line">
              <p className="text-[13px] font-bold mb-1.5 flex items-center gap-1.5"><Clock size={15} className="text-brand-dark" /> آخر التفاعلات</p>
              <ul className="text-[12.5px] text-slate2 space-y-1.5 leading-relaxed">
                <li>• تم إرسال عرض السعر الأولي قبل ٣ أيام</li>
                <li>• العميل طلب توضيحاً عن مدة الدعم</li>
                <li>• آخر تواصل عبر واتساب قبل يوم واحد</li>
              </ul>
            </div>
            <div className="p-3.5 rounded-xl bg-brand-pale/60 border border-brand-light">
              <p className="text-[13px] font-bold mb-1.5 flex items-center gap-1.5"><Lightbulb size={15} className="text-brand-dark" /> أسئلة مقترحة</p>
              <ul className="text-[12.5px] text-slate2 space-y-1.5 leading-relaxed">
                <li>١) ما معاييركم النهائية لاتخاذ القرار؟</li>
                <li>٢) من أصحاب القرار في هذه الصفقة؟</li>
                <li>٣) ما الجدول الزمني المتوقع للتوقيع؟</li>
              </ul>
              <button
                className="btn-secondary !py-1.5 !text-xs mt-2.5"
                onClick={() => toast({ title: 'تم نسخ أسئلة التحضير', desc: 'أصبحت جاهزة للمشاركة مع الفريق', kind: 'success' })}
              >
                <CircleHelp size={14} /> نسخ الأسئلة
              </button>
            </div>
          </div>
        )}
        <div className="mt-3">
          <AIInsight
            icon={<Sparkles size={16} />}
            title="توصية ذكية"
            desc="يُفضل تأكيد الموعد برسالة تذكير قبل ٢٤ ساعة، وتجهيز عرض سعر محدث يتضمن مدة الدعم المطلوبة."
          />
        </div>
      </Card>

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'تعديل الموعد' : 'موعد جديد'}>
        <div className="space-y-1">
          <Field label="عنوان الموعد">
            <input className="input" value={form.title} onChange={(e) => setF('title', e.target.value)} placeholder="مثال: اجتماع إغلاق — النخبة" />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="التاريخ">
              <input type="date" className="input" value={form.date} min="2026-10-01" max="2026-10-31" onChange={(e) => setF('date', e.target.value)} />
            </Field>
            <Field label="الوقت">
              <input className="input" value={form.time} onChange={(e) => setF('time', e.target.value)} placeholder="10:00" dir="ltr" />
            </Field>
            <Field label="العميل">
              <input className="input" value={form.customer} onChange={(e) => setF('customer', e.target.value)} placeholder="اسم العميل أو الشركة" />
            </Field>
            <Field label="الموظف">
              <select className="input" value={form.owner} onChange={(e) => setF('owner', e.target.value)}>
                {OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
          </div>
          <Field label="النوع (يحدد اللون تلقائياً)">
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setF('type', t)}
                  className={cx('px-3 py-2 rounded-xl text-[13px] font-bold border transition flex items-center gap-1.5',
                    form.type === t ? 'text-white border-transparent' : 'bg-white border-line text-slate2 hover:border-brand')}
                  style={form.type === t ? { background: colorFor(t) } : undefined}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: form.type === t ? '#fff' : colorFor(t) }} />
                  {t}
                </button>
              ))}
            </div>
          </Field>
          <div className="flex gap-2 pt-2">
            <button className="btn-primary flex-1" onClick={save}>{editing ? 'حفظ التعديلات' : 'إنشاء الموعد'}</button>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>إلغاء</button>
          </div>
        </div>
      </Modal>

      {/* Detail Drawer */}
      <Drawer open={!!detail} onClose={() => setDetail(null)} title="تفاصيل الموعد">
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl text-white flex items-center justify-center shrink-0" style={{ background: detail.color }}>
                <TypeGlyph t={detail.type} />
              </span>
              <div className="min-w-0">
                <p className="font-bold text-[15px]">{detail.title}</p>
                <p className="text-[13px] text-mut">{fmtAr(detail.date)} • {detail.time}</p>
              </div>
            </div>
            <div className="card !shadow-none !rounded-xl p-3.5 space-y-2.5 text-[13.5px]">
              <p className="flex justify-between"><span className="text-mut">العميل</span><b>{detail.customer}</b></p>
              <p className="flex justify-between"><span className="text-mut">الموظف</span><b>{detail.owner}</b></p>
              <p className="flex justify-between"><span className="text-mut">النوع</span><StatusBadge value={detail.type} /></p>
              <p className="flex justify-between"><span className="text-mut">التاريخ</span><b dir="ltr">{detail.date}</b></p>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary flex-1" onClick={() => openEdit(detail)}><Pencil size={16} /> تعديل</button>
              <button className="btn-secondary flex-1 hover:!text-red-600" onClick={() => removeEvt(detail.id)}><Trash2 size={16} /> حذف</button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
