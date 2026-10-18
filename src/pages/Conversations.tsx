import { useEffect, useMemo, useRef, useState } from 'react'
import {
  MessageCircle, Mail, Globe, Send, Paperclip, Smile, Search, FileText,
  Sparkles, ChevronRight, Phone, User, Building2, Clock, CheckCheck, StickyNote,
} from 'lucide-react'
import { Avatar, StatusBadge, PageHeader, Empty } from '../components/ui'
import { conversations as seed, type Conversation, type Message } from '../data/conversations'
import { OWNERS } from '../data/contacts'
import { useStore } from '../lib/store'
import { cx, uid } from '../lib/utils'

type Cat = 'الكل' | 'غير المقروءة' | 'مسندة إليّ' | 'بانتظار الرد' | 'المغلقة'
type ViewMode = 'list' | 'chat' | 'info'
type Channel = 'واتساب' | 'بريد' | 'موقع'

const ME = 'خالد العتيبي'
const CATS: Cat[] = ['الكل', 'غير المقروءة', 'مسندة إليّ', 'بانتظار الرد', 'المغلقة']
const CHANNELS: ('الكل' | Channel)[] = ['الكل', 'واتساب', 'بريد', 'موقع']

function ChannelBadge({ c }: { c: Channel }) {
  if (c === 'واتساب')
    return <span className="badge bg-green-50 text-green-700"><MessageCircle size={13} />واتساب</span>
  if (c === 'بريد')
    return <span className="badge bg-blue-50 text-blue-700"><Mail size={13} />بريد</span>
  return <span className="badge bg-gray-100 text-gray-600"><Globe size={13} />موقع</span>
}

const DRAFTS: Record<string, (name: string, composer: string) => string> = {
  'تلخيص': () => 'ملخص المحادثة: العميل مهتم بالعرض وينتظر التفاصيل النهائية. يلزم المتابعة خلال ٢٤ ساعة وتأكيد الخطوة القادمة.',
  'اقتراح رد': (name) => `أهلاً أستاذ ${name}، شكراً لتواصلك معنا. راجعت طلبك وسأرسل لك التفاصيل الكاملة اليوم، وأنا متاح لأي استفسار.`,
  'تحسين': (_n, composer) => composer.trim() ? `نسخة محسّنة: ${composer.trim()}` : 'اكتب رسالتك أولاً ثم اضغط تحسين للحصول على صياغة احترافية مهذبة ومختصرة.',
  'استخراج مهام': () => 'المهام المستخرجة من المحادثة:\n١) إرسال العقد النهائي\n٢) تأكيد موعد المتابعة\n٣) تحديث بيانات العميل',
  'خطوة تالية': () => 'الخطوة التالية المقترحة: جدولة مكالمة متابعة غداً الساعة ١٠ صباحاً لتأكيد الإغلاق.',
}

export default function Conversations() {
  const { toast } = useStore()
  const [convs, setConvs] = useState<Conversation[]>(() =>
    seed.map((c) => ({ ...c, messages: c.messages.map((m) => ({ ...m })) }))
  )
  const [activeId, setActiveId] = useState(convs[0]?.id ?? '')
  const [cat, setCat] = useState<Cat>('الكل')
  const [q, setQ] = useState('')
  const [chan, setChan] = useState<(typeof CHANNELS)[number]>('الكل')
  const [composer, setComposer] = useState('')
  const [noteMode, setNoteMode] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const bottomRef = useRef<HTMLDivElement>(null)

  const active = convs.find((c) => c.id === activeId) ?? convs[0]

  const filtered = useMemo(() => {
    return convs.filter((c) => {
      if (cat === 'غير المقروءة' && c.unread === 0) return false
      if (cat === 'مسندة إليّ' && c.owner !== ME) return false
      if (cat === 'بانتظار الرد' && c.status !== 'بانتظار الرد') return false
      if (cat === 'المغلقة' && c.status !== 'مغلقة') return false
      if (chan !== 'الكل' && c.channel !== chan) return false
      if (q.trim() && !(c.customer.includes(q) || c.company.includes(q) || c.lastMessage.includes(q))) return false
      return true
    })
  }, [convs, cat, chan, q])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [active?.id, active?.messages.length])

  const selectConv = (id: string) => {
    setActiveId(id)
    setConvs((p) => p.map((c) => (c.id === id ? { ...c, unread: 0 } : c)))
    setViewMode('chat')
  }

  const patchActive = (patch: Partial<Conversation>) => {
    setConvs((p) => p.map((c) => (c.id === activeId ? { ...c, ...patch } : c)))
  }

  const send = () => {
    const text = composer.trim()
    if (!text || !active) return
    const msg: Message = {
      id: uid('msg'),
      from: noteMode ? 'نظام' : 'موظف',
      text: noteMode ? `ملاحظة داخلية: ${text}` : text,
      time: 'الآن',
    }
    setConvs((p) =>
      p.map((c) => (c.id === active.id ? { ...c, messages: [...c.messages, msg], lastMessage: text, time: 'الآن', unread: 0 } : c))
    )
    setComposer('')
    toast({ title: noteMode ? 'تم حفظ الملاحظة الداخلية' : 'تم إرسال الرسالة', kind: 'success' })
    if (!noteMode) {
      const target = active.id
      setTimeout(() => {
        const reply: Message = { id: uid('msg'), from: 'عميل', text: 'شكراً لك، تم الاستلام وسنرد عليك قريباً.', time: 'الآن' }
        setConvs((p) =>
          p.map((c) => (c.id === target ? { ...c, messages: [...c.messages, reply], lastMessage: reply.text, time: 'الآن' } : c))
        )
      }, 1200)
    }
  }

  const aiFill = (kind: string) => {
    if (!active) return
    const draft = DRAFTS[kind]?.(active.customer, composer) ?? ''
    setComposer(draft)
    toast({ title: `تم إدراج ${kind} في المسودة`, desc: 'راجع النص ثم اضغط إرسال', kind: 'success' })
  }

  return (
    <div className="page-wrap">
      <PageHeader title="المحادثات" sub="جميع قنوات التواصل مع العملاء في مكان واحد" />

      {/* Mobile back bar */}
      <div className="flex md:hidden items-center gap-2">
        {viewMode === 'chat' && (
          <button className="btn-secondary !py-2" onClick={() => setViewMode('list')}>
            <ChevronRight size={16} /> قائمة المحادثات
          </button>
        )}
        {viewMode === 'info' && (
          <button className="btn-secondary !py-2" onClick={() => setViewMode('chat')}>
            <ChevronRight size={16} /> رجوع للمحادثة
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-[300px_minmax(0,1fr)_290px] gap-4 items-start">
        {/* Right panel: inbox (first in RTL = right) */}
        <section className={cx('card p-0 overflow-hidden flex-col', viewMode === 'list' ? 'flex' : 'hidden md:flex')}>
          <div className="p-3 border-b border-line space-y-2.5">
            <div className="relative">
              <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input ps-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث عن عميل أو رسالة..." />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={cx(
                    'px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition',
                    cat === c ? 'bg-ink text-white' : 'bg-gray-100 text-mut hover:text-ink'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            <select className="input" value={chan} onChange={(e) => setChan(e.target.value as typeof chan)}>
              {CHANNELS.map((c) => (
                <option key={c} value={c}>{c === 'الكل' ? 'كل القنوات' : c}</option>
              ))}
            </select>
          </div>
          <div className="divide-y divide-line max-h-[62vh] overflow-auto">
            {filtered.length === 0 && (
              <Empty title="لا توجد محادثات" sub="جرّب تغيير البحث أو الفلاتر" />
            )}
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => selectConv(c.id)}
                className={cx(
                  'w-full text-start p-3 flex gap-2.5 transition hover:bg-bgmain',
                  c.id === activeId && 'bg-brand-pale/60'
                )}
              >
                <Avatar name={c.customer} size={40} />
                <span className="flex-1 min-w-0">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[13.5px] font-bold truncate">{c.customer}</span>
                    <span className="text-[11px] text-gray-400 whitespace-nowrap">{c.time}</span>
                  </span>
                  <span className="block text-xs text-mut truncate mt-0.5">{c.lastMessage}</span>
                  <span className="flex items-center gap-1.5 mt-1.5">
                    <ChannelBadge c={c.channel} />
                    {c.unread > 0 && (
                      <span className="min-w-[20px] h-5 px-1 rounded-full bg-brand text-white text-[11px] font-bold flex items-center justify-center">{c.unread}</span>
                    )}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Center: active conversation */}
        {!active ? (
          <div className={cx('card', viewMode === 'chat' ? 'block' : 'hidden md:block')}><Empty title="اختر محادثة" sub="اختر محادثة من القائمة لعرضها" /></div>
        ) : (
          <section className={cx('card p-0 overflow-hidden flex-col min-h-[60vh]', viewMode === 'chat' ? 'flex' : 'hidden md:flex')}>
            {/* header */}
            <div className="p-3 md:p-4 border-b border-line flex flex-wrap items-center gap-2.5">
              <button className="btn-ghost !p-2 md:hidden" onClick={() => setViewMode('list')}><ChevronRight size={18} /></button>
              <Avatar name={active.customer} size={42} />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[15px] truncate">{active.customer}</p>
                <p className="text-xs text-mut truncate">{active.company}</p>
              </div>
              <ChannelBadge c={active.channel} />
              <select
                className="input !w-auto text-[13px]"
                value={active.status}
                onChange={(e) => { patchActive({ status: e.target.value as Conversation['status'] }); toast({ title: 'تم تحديث حالة المحادثة', kind: 'success' }) }}
              >
                <option value="مفتوحة">مفتوحة</option>
                <option value="بانتظار الرد">بانتظار الرد</option>
                <option value="مغلقة">مغلقة</option>
              </select>
              <select
                className="input !w-auto text-[13px]"
                value={active.owner}
                onChange={(e) => { patchActive({ owner: e.target.value }); toast({ title: `تم إسناد المحادثة إلى ${e.target.value}`, kind: 'success' }) }}
              >
                {OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <button className="btn-secondary !py-2 md:hidden" onClick={() => setViewMode('info')}>معلومات</button>
            </div>

            {/* messages */}
            <div className="flex-1 overflow-auto p-4 space-y-2.5 bg-bgmain/60 max-h-[52vh] min-h-[300px] flex flex-col">
              {active.messages.map((m) => {
                if (m.from === 'نظام')
                  return (
                    <div key={m.id} className="self-center flex items-center gap-1.5 text-[11.5px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 max-w-full">
                      <StickyNote size={13} /><span>{m.text}</span>
                    </div>
                  )
                const isClient = m.from === 'عميل'
                return (
                  <div
                    key={m.id}
                    className={cx(
                      'max-w-[80%] rounded-2xl px-3.5 py-2.5 shadow-soft',
                      isClient
                        ? 'self-start bg-gray-100 text-ink rounded-tr-md'
                        : 'self-end bg-green-50 border border-green-200 text-ink rounded-tl-md'
                    )}
                  >
                    <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap">{m.text}</p>
                    <p className={cx('text-[10.5px] mt-1 flex items-center gap-1', isClient ? 'text-gray-400' : 'text-green-700 justify-end')}>
                      {m.time}{!isClient && <CheckCheck size={13} />}
                    </p>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* composer */}
            <div className={cx('p-3 border-t border-line', noteMode ? 'bg-amber-50/60' : 'bg-white')}>
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setNoteMode(!noteMode)}
                  className={cx(
                    'inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-3 py-1.5 border transition',
                    noteMode ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-gray-100 text-mut border-line hover:text-ink'
                  )}
                >
                  <FileText size={13} /> {noteMode ? 'وضع الملاحظة الداخلية مفعّل' : 'رد عادي — تفعيل ملاحظة داخلية'}
                </button>
                <span className="text-[11px] text-gray-400">الرد عبر {active.channel}</span>
              </div>
              <div className={cx('rounded-2xl border transition', noteMode ? 'border-amber-300 bg-amber-50' : 'border-line bg-white')}>
                <textarea
                  className="w-full bg-transparent outline-none text-sm p-3 min-h-[70px] resize-y"
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  placeholder={noteMode ? 'اكتب ملاحظة داخلية للفريق (لا يراها العميل)...' : 'اكتب ردك هنا...'}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                />
                <div className="flex items-center gap-1 px-2 pb-2">
                  <button className="btn-ghost !p-2" title="إرفاق" onClick={() => toast({ title: 'إرفاق الملفات تجريبي', desc: 'سيتم دعم رفع الملفات قريباً' })}><Paperclip size={18} /></button>
                  <button className="btn-ghost !p-2" title="إيموجي" onClick={() => setComposer((p) => p + ' 😊')}><Smile size={18} /></button>
                  <div className="flex-1" />
                  <button className="btn-primary !py-2" onClick={send} disabled={!composer.trim()}>
                    <Send size={16} /> إرسال
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Left panel: customer info + AI */}
        <aside className={cx('flex-col gap-4', viewMode === 'info' ? 'flex' : 'hidden md:flex')}>
          {active && (
            <>
              <div className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="section-title">بيانات العميل</h3>
                  <button className="btn-ghost !p-2 md:hidden" onClick={() => setViewMode('chat')}><ChevronRight size={18} /></button>
                </div>
                <div className="flex items-center gap-2.5 mb-3">
                  <Avatar name={active.customer} size={46} />
                  <div className="min-w-0">
                    <p className="font-bold truncate">{active.customer}</p>
                    <p className="text-xs text-mut truncate">{active.company}</p>
                  </div>
                </div>
                <ul className="space-y-2 text-[13px]">
                  <li className="flex items-center gap-2 text-slate2"><User size={15} className="text-mut" /> المسؤول: <b>{active.owner}</b></li>
                  <li className="flex items-center gap-2 text-slate2"><Building2 size={15} className="text-mut" /> الشركة: <b className="truncate">{active.company}</b></li>
                  <li className="flex items-center gap-2 text-slate2"><Clock size={15} className="text-mut" /> آخر تواصل: <b>{active.time}</b></li>
                  <li className="flex items-center gap-2 text-slate2"><Phone size={15} className="text-mut" /> القناة: <ChannelBadge c={active.channel} /></li>
                  <li className="flex items-center gap-2 text-slate2">الحالة: <StatusBadge value={active.status} /></li>
                </ul>
              </div>
              <div className="card p-4">
                <h3 className="section-title flex items-center gap-2 mb-1"><Sparkles size={17} className="text-brand-dark" /> المساعدة الذكية</h3>
                <p className="section-sub mb-3">أدوات ذكية تدرج مسودة جاهزة في مربع الكتابة</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(DRAFTS).map((k) => (
                    <button key={k} onClick={() => aiFill(k)} className="btn-secondary !py-1.5 !px-3 !text-[12.5px]">
                      <Sparkles size={14} className="text-brand-dark" /> {k}
                    </button>
                  ))}
                </div>
                <div className="mt-3 p-3 rounded-xl bg-brand-pale/60 border border-brand-light text-[12.5px] text-slate2 leading-relaxed">
                  اقتراح ذكي: العميل {active.customer} ينتظر رداً سريعاً. الأفضل الرد خلال ساعة وإرفاق ملخص واضح للخطوات القادمة.
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
