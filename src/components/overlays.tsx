import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, UserPlus, HandCoins, ListChecks, CalendarDays, Megaphone, Users, CircleHelp, Sparkles, CheckCircle2, Info } from 'lucide-react'
import { Modal, Avatar, StatusBadge } from './ui'
import { useStore } from '../lib/store'
import { contacts } from '../data/contacts'
import { leads } from '../data/leads'
import { deals, STAGES } from '../data/deals'
import { tasks } from '../data/tasks'
import { fmtMoney } from '../lib/utils'

export function Toasts() {
  const { toasts, dismiss } = useStore()
  return (
    <div className="fixed bottom-4 start-4 z-[90] space-y-2 w-[320px] max-w-[calc(100vw-2rem)]">
      {toasts.map(t => (
        <div key={t.id} className="bg-ink text-white rounded-2xl p-3.5 shadow-pop flex gap-2.5 items-start">
          {t.kind === 'error' ? <Info size={18} className="text-red-300 shrink-0 mt-0.5" /> : <CheckCircle2 size={18} className="text-green-300 shrink-0 mt-0.5" />}
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold">{t.title}</p>
            {t.desc && <p className="text-xs text-gray-300 mt-0.5">{t.desc}</p>}
          </div>
          <button onClick={() => dismiss(t.id)} className="text-gray-400 hover:text-white"><X size={15} /></button>
        </div>
      ))}
    </div>
  )
}

export function GlobalSearch() {
  const { searchOpen, setSearchOpen } = useStore()
  const [q, setQ] = React.useState('')
  const [cat, setCat] = React.useState('الكل')
  const nav = useNavigate()
  React.useEffect(() => { if (searchOpen) setQ('') }, [searchOpen])
  if (!searchOpen) return null
  const ql = q.trim()
  const match = (s: string) => !ql || s.includes(ql)
  const cRes = contacts.filter(c => match(c.name) || match(c.company) || match(c.email)).slice(0, 4)
  const lRes = leads.filter(l => match(l.name) || match(l.company)).slice(0, 3)
  const dRes = deals.filter(d => match(d.title) || match(d.company)).slice(0, 3)
  const tRes = tasks.filter(t => match(t.title)).slice(0, 3)
  const cats = ['الكل', 'العملاء', 'العملاء المحتملون', 'الصفقات', 'المهام']
  const show = (c: string) => cat === 'الكل' || cat === c
  const empty = !cRes.length && !lRes.length && !dRes.length && !tRes.length
  const go = (p: string) => { setSearchOpen(false); nav(p) }
  const hl = (s: string) => {
    if (!ql) return s
    const i = s.indexOf(ql)
    if (i < 0) return s
    return <>{s.slice(0, i)}<mark className="bg-yellow-200 rounded px-0.5">{s.slice(i, i + ql.length)}</mark>{s.slice(i + ql.length)}</>
  }
  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-black/40" onClick={() => setSearchOpen(false)} />
      <div className="relative mx-auto mt-[8vh] w-[min(620px,calc(100vw-2rem))] bg-white rounded-2xl shadow-pop overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-line">
          <Search size={18} className="text-mut" />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="ابحث عن عميل، صفقة، مهمة..." className="flex-1 outline-none text-[15px]" />
          <kbd className="text-[10.5px] bg-gray-100 border border-line rounded-md px-1.5 py-0.5">ESC</kbd>
        </div>
        <div className="flex gap-1.5 px-4 pt-3 overflow-auto">
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${cat === c ? 'bg-ink text-white' : 'bg-gray-100 text-mut hover:text-ink'}`}>{c}</button>
          ))}
        </div>
        <div className="max-h-[50vh] overflow-auto p-3 space-y-1">
          {show('العملاء') && cRes.map(c => (
            <button key={c.id} onClick={() => go('/contacts')} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-bgmain text-start">
              <Avatar name={c.name} size={36} />
              <span className="flex-1 min-w-0"><span className="block text-[13.5px] font-bold truncate">{hl(c.name)} <span className="font-normal text-mut">— {hl(c.company)}</span></span>
              <span className="block text-xs text-mut">{c.email}</span></span>
              <span className="text-[11px] font-bold text-brand-dark bg-brand-pale rounded-full px-2 py-0.5">عميل</span>
            </button>
          ))}
          {show('العملاء المحتملون') && lRes.map(l => (
            <button key={l.id} onClick={() => go('/leads')} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-bgmain text-start">
              <Avatar name={l.name} size={36} />
              <span className="flex-1 min-w-0"><span className="block text-[13.5px] font-bold truncate">{hl(l.name)} <span className="font-normal text-mut">— {hl(l.company)}</span></span>
              <span className="block text-xs text-mut">التأهيل: {l.score}%</span></span>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 rounded-full px-2 py-0.5">محتمل</span>
            </button>
          ))}
          {show('الصفقات') && dRes.map(d => (
            <button key={d.id} onClick={() => go('/deals')} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-bgmain text-start">
              <span className="w-9 h-9 rounded-xl bg-brand-pale text-brand-dark flex items-center justify-center font-bold">ص</span>
              <span className="flex-1 min-w-0"><span className="block text-[13.5px] font-bold truncate">{hl(d.title)}</span>
              <span className="block text-xs text-mut">{d.company} • {fmtMoney(d.value)}</span></span>
              <StatusBadge value={d.stage} />
            </button>
          ))}
          {show('المهام') && tRes.map(t => (
            <button key={t.id} onClick={() => go('/tasks')} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-bgmain text-start">
              <span className="w-9 h-9 rounded-xl bg-gray-100 text-slate2 flex items-center justify-center"><ListChecks size={17} /></span>
              <span className="flex-1 min-w-0"><span className="block text-[13.5px] font-bold truncate">{hl(t.title)}</span>
              <span className="block text-xs text-mut">{t.due}</span></span>
              <StatusBadge value={t.status} />
            </button>
          ))}
          {empty && (
            <div className="text-center py-10">
              <p className="font-bold">لا توجد نتائج مطابقة</p>
              <p className="text-[13px] text-mut mt-1">جرّب كلمة مختلفة أو تصفح السجلات مباشرة</p>
            </div>
          )}
          {!ql && (
            <div className="px-2 py-2">
              <p className="text-xs font-bold text-mut mb-2">عمليات بحث سابقة</p>
              <div className="flex flex-wrap gap-2">
                {['النخبة', 'عرض سعر', 'متابعة'].map(s => (
                  <button key={s} onClick={() => setQ(s)} className="text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1.5">{s}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const QUICK = [
  { label: 'إضافة عميل', icon: <Users size={18} />, to: '/contacts' },
  { label: 'إضافة عميل محتمل', icon: <UserPlus size={18} />, to: '/leads' },
  { label: 'إنشاء صفقة', icon: <HandCoins size={18} />, to: '/deals' },
  { label: 'إنشاء مهمة', icon: <ListChecks size={18} />, to: '/tasks' },
  { label: 'جدولة اجتماع', icon: <CalendarDays size={18} />, to: '/calendar' },
  { label: 'إنشاء حملة', icon: <Megaphone size={18} />, to: '/campaigns' },
]

export function QuickCreate() {
  const { quickOpen, setQuickOpen, toast } = useStore()
  const nav = useNavigate()
  return (
    <Modal open={quickOpen} onClose={() => setQuickOpen(false)} title="إنشاء سريع">
      <div className="grid grid-cols-2 gap-2.5">
        {QUICK.map(q => (
          <button key={q.label} onClick={() => { setQuickOpen(false); nav(q.to); toast({ title: `تم فتح نموذج: ${q.label}`, desc: 'نموذج تجريبي — املأ الحقول ثم احفظ', kind: 'info' }) }}
            className="flex items-center gap-3 p-3.5 rounded-2xl border border-line hover:border-brand hover:bg-brand-pale/40 transition text-start">
            <span className="w-10 h-10 rounded-xl bg-brand-pale text-brand-dark flex items-center justify-center shrink-0">{q.icon}</span>
            <span className="text-[13.5px] font-bold">{q.label}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-mut mt-3 text-center">عرض تجريبي — تُحفظ السجلات الجديدة في حالة الواجهة فقط</p>
    </Modal>
  )
}

export function HelpPanel() {
  const { helpOpen, setHelpOpen } = useStore()
  const nav = useNavigate()
  if (!helpOpen) return null
  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-black/40" onClick={() => setHelpOpen(false)} />
      <aside className="absolute inset-y-0 start-0 w-full sm:w-[380px] bg-white shadow-pop p-5 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2"><CircleHelp size={19} className="text-brand-dark" /> المساعدة السريعة</h3>
          <button onClick={() => setHelpOpen(false)} className="btn-ghost !p-2"><X size={18} /></button>
        </div>
        <div className="space-y-2.5">
          {[
            ['كيف أضيف عميلاً جديداً؟', 'من صفحة العملاء اضغط «إضافة عميل» واملأ الحقول الأساسية.'],
            ['كيف أنقل صفقة في المسار؟', 'اسحب بطاقة الصفقة بين المراحل أو استخدم قائمة الإجراءات.'],
            ['ما هي رؤى المدار الذكية؟', 'اقتراحات تجريبية مولّدة محلياً لمساعدتك على المتابعة.'],
          ].map(([q, a]) => (
            <div key={q} className="p-3.5 rounded-2xl border border-line">
              <p className="text-[13.5px] font-bold">{q}</p>
              <p className="text-[12.5px] text-mut mt-1 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
        <button onClick={() => { setHelpOpen(false); nav('/help') }} className="btn-secondary w-full mt-4">فتح مركز المساعدة الكامل</button>
        <button onClick={() => { setHelpOpen(false); nav('/ai-assistant') }} className="btn-primary w-full mt-2"><Sparkles size={17} /> اسأل مساعد المدار</button>
      </aside>
    </div>
  )
}

export { STAGES }
