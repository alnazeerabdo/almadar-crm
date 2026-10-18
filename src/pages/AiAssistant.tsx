import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import {
  BarChart3, Bot, CheckSquare, Eraser, FileText, Lightbulb, Loader2, MessageSquarePlus,
  PanelLeft, Plus, Send, Sparkles, TrendingUp, User, Users, Wand2,
} from 'lucide-react'
import { Avatar, Card, PageHeader, StatusBadge } from '../components/ui'
import { useStore } from '../lib/store'
import { cx, fmtMoney } from '../lib/utils'
import { contacts } from '../data/contacts'
import { deals } from '../data/deals'
import { tasks } from '../data/tasks'
import { salesSeries } from '../data/misc'

type Role = 'user' | 'ai'
type Kind = 'sales' | 'deals' | 'tasks' | 'generic'

interface ChatMsg {
  id: string
  role: Role
  text: string
  kind: Kind
  chips: string[]
}

interface HistoryItem {
  id: string
  title: string
  time: string
}

const SUGGESTIONS = [
  { icon: <TrendingUp size={18} />, title: 'لخص أداء المبيعات', desc: 'ملخص مبيعات الشهر مع أبرز الأرقام (تجريبي)' },
  { icon: <BarChart3 size={18} />, title: 'اعرض الصفقات المتعثرة', desc: 'الصفقات التي تحتاج تدخلاً عاجلاً (تجريبي)' },
  { icon: <CheckSquare size={18} />, title: 'خطط مهامي لليوم', desc: 'خطة مهام مرتبة بالأولوية (تجريبي)' },
  { icon: <Wand2 size={18} />, title: 'صغ رسالة متابعة لعميل', desc: 'مسودة رسالة احترافية جاهزة للإرسال (تجريبي)' },
  { icon: <Users size={18} />, title: 'من هم أفضل المندوبين؟', desc: 'ترتيب المندوبين حسب الإيراد (تجريبي)' },
  { icon: <Lightbulb size={18} />, title: 'حلل مصادر العملاء', desc: 'أي القنوات تجلب عملاء أكثر؟ (تجريبي)' },
]

const CHIP_QUERIES: Record<string, string> = {
  'اعرض الصفقات المفتوحة': 'اعرض لي الصفقات المفتوحة حالياً',
  'حلل مصادر العملاء': 'حلل مصادر العملاء لدي',
  'صغ رسالة متابعة': 'صغ رسالة متابعة لعميل متأخر',
  'لخص المبيعات': 'لخص لي أداء المبيعات هذا الشهر',
  'خطط مهامي': 'خطط مهامي لليوم',
  'أفضل المندوبين': 'من هم أفضل المندوبين؟',
}

let seq = 0
const nid = (p: string) => `${p}-${Date.now()}-${seq++}`

function buildReply(q: string): { text: string; kind: Kind; chips: string[] } {
  const has = (...ws: string[]) => ws.some(w => q.includes(w))
  if (has('مبيعات', 'إيراد', 'الإيراد', 'أداء', 'ملخص', 'لخص')) {
    return {
      kind: 'sales',
      text: 'إليك ملخص أداء المبيعات لهذا الشهر (بيانات تجريبية): إجمالي المبيعات المحققة 328,500 ر.س بنمو إيجابي عن الشهر الماضي، مع 12 صفقة نشطة بقيمة مفتوحة 845,000 ر.س ومعدل فوز 64%. أنصح بالتركيز على صفقتي النخبة والريادة فهما الأقرب للإغلاق.',
      chips: ['اعرض الصفقات المفتوحة', 'أفضل المندوبين', 'صغ رسالة متابعة'],
    }
  }
  if (has('صفق', 'صفقة', 'متعثرة', 'مفتوحة', 'تفاوض', 'إغلاق')) {
    return {
      kind: 'deals',
      text: 'وجدت 5 صفقات نشطة تحتاج متابعة (بيانات تجريبية). صفقتا «النخبة للتجارة» و«مجموعة الريادة» في مرحلة التفاوض باحتمالية فوز عالية — ابدأ بهما. صفقة «أفق الأعمال» تأخر عرضها المحدث وتحتاج إرسالاً اليوم.',
      chips: ['لخص المبيعات', 'خطط مهامي', 'صغ رسالة متابعة'],
    }
  }
  if (has('مهم', 'مهام', 'مهامي', 'خطة', 'اليوم', 'أولوية')) {
    return {
      kind: 'tasks',
      text: 'خططت لك مهام اليوم مرتبة بالأولوية (بيانات تجريبية): ابدأ بمتابعة عرض النخبة (عالية — اليوم 15:00)، ثم اجتماع إغلاق الريادة (غداً 10:00)، ثم إرسال العرض المحدث لأفق الأعمال (متأخرة — عالجها اليوم). أنجز 3 مهام صباحاً واترك التعريفية للمساء.',
      chips: ['اعرض الصفقات المفتوحة', 'لخص المبيعات', 'صغ رسالة متابعة'],
    }
  }
  if (has('مندوب', 'موظف', 'الأفضل', 'أفضل', 'فريق')) {
    return {
      kind: 'sales',
      text: 'ترتيب المندوبين حسب الإيراد المحقق (بيانات تجريبية): خالد العتيبي في الصدارة بـ 148,000 ر.س، يليه نورة القحطاني بـ 96,000 ر.س ثم فهد الشمري بـ 72,000 ر.س. أقترح مشاركة أسلوب خالد في الإغلاق مع بقية الفريق.',
      chips: ['لخص المبيعات', 'اعرض الصفقات المفتوحة', 'حلل مصادر العملاء'],
    }
  }
  if (has('مصدر', 'مصادر', 'قناة', 'تسويق', 'حملة')) {
    return {
      kind: 'sales',
      text: 'تحليل مصادر العملاء (بيانات تجريبية): الموقع الإلكتروني يتصدر بـ 42 عميلاً، ثم الإحالات بـ 35، فالحملات بـ 28. الإحالات تحقق أعلى معدل تحويل — أنصح ببرنامج إحالة محفّز ومضاعفة الاستثمار في الموقع.',
      chips: ['لخص المبيعات', 'أفضل المندوبين', 'خطط مهامي'],
    }
  }
  if (has('رسالة', 'صياغة', 'صغ', 'متابعة عميل', 'بريد', 'واتساب')) {
    return {
      kind: 'tasks',
      text: 'جهزت لك مسودة رسالة متابعة احترافية (محتوى تجريبي): «السلام عليكم أستاذ أحمد، أتمنى أن تكون بخير. أود متابعة عرض السعر المرسل بخصوص عقد إدارة العملاء السنوي، هل لديكم أي استفسار؟ يسعدنا تحديد موعد قصير للإغلاق هذا الأسبوع.» يمكنك نسخها وتخصيصها قبل الإرسال.',
      chips: ['اعرض الصفقات المفتوحة', 'خطط مهامي', 'لخص المبيعات'],
    }
  }
  return {
    kind: 'generic',
    text: 'فهمت استفسارك وسأبني الإجابة من بيانات مساحة العمل (رد تجريبي). يمكنني تلخيص المبيعات، عرض الصفقات، تخطيط المهام، صياغة الرسائل، وتحليل المندوبين والمصادر. جرّب أحد الاقتراحات الجاهزة أو اسأل بصيغة مباشرة.',
    chips: ['لخص المبيعات', 'اعرض الصفقات المفتوحة', 'خطط مهامي'],
  }
}

export default function AiAssistant() {
  const { toast } = useStore()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [showContext, setShowContext] = useState(true)
  const [draft, setDraft] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([
    { id: 'h1', title: 'تحليل مبيعات سبتمبر', time: 'أمس' },
    { id: 'h2', title: 'خطة متابعة الصفقات', time: 'قبل يومين' },
    { id: 'h3', title: 'صياغة عروض واتساب', time: 'قبل أسبوع' },
  ])
  const scrollRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, typing])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const topDeals = useMemo(() => deals.slice(0, 3), [])
  const topContacts = useMemo(() => contacts.slice(0, 3), [])
  const todayTasks = useMemo(() => tasks.slice(0, 4), [])
  const miniSales = useMemo(() => salesSeries.slice(-5), [])

  const send = (raw?: string) => {
    const text = (raw ?? input).trim()
    if (!text || typing) return
    const userMsg: ChatMsg = { id: nid('m'), role: 'user', text, kind: 'generic', chips: [] }
    setMessages(p => [...p, userMsg])
    setInput('')
    setTyping(true)
    const reply = buildReply(text)
    timerRef.current = setTimeout(() => {
      const aiMsg: ChatMsg = { id: nid('m'), role: 'ai', text: reply.text, kind: reply.kind, chips: reply.chips }
      setMessages(p => [...p, aiMsg])
      setTyping(false)
      setHistory(p => {
        if (p.length === 0 || messages.length === 0) {
          return [{ id: nid('h'), title: text.slice(0, 28), time: 'الآن' }, ...p].slice(0, 8)
        }
        return p
      })
    }, 1200)
  }

  const newChat = () => {
    setMessages([])
    setDraft('')
    toast({ title: 'محادثة جديدة', desc: 'تم بدء محادثة جديدة مع المساعد الذكي' })
  }

  const clearChat = () => {
    setMessages([])
    setHistory([])
    setDraft('')
    toast({ title: 'تم مسح السجل', desc: 'تم مسح سجل المحادثات (تجريبي)' })
  }

  const createTask = () => toast({ title: 'تم إنشاء المهمة', desc: 'أُضيفت مهمة متابعة إلى قائمة مهامك (تجريبي)' })

  const makeDraft = () => {
    setDraft('السلام عليكم، أتابع معكم بخصوص العرض المرسل — هل يناسبكم موعد قصير هذا الأسبوع للإغلاق؟ (مسودة تجريبية)')
    toast({ title: 'تمت صياغة الرسالة', desc: 'راجع المسودة أدناه وانسخها عند الجاهزية' })
  }

  const renderAiExtras = (m: ChatMsg) => (
    <div className="mt-3 space-y-3">
      {(m.kind === 'sales') && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {[
              { l: 'مبيعات الشهر', v: '328,500 ر.س' },
              { l: 'صفقات مفتوحة', v: fmtMoney(845000) },
              { l: 'معدل الفوز', v: '64%' },
            ].map(x => (
              <div key={x.l} className="rounded-xl bg-brand-pale/70 border border-brand-light p-2.5 text-center">
                <p className="text-[11px] text-mut font-medium">{x.l}</p>
                <p className="text-[14px] font-bold text-brand-dark tabular-nums mt-0.5">{x.v}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-line p-3">
            <p className="text-xs font-bold text-mut mb-2">منحنى المبيعات (تجريبي)</p>
            <div className="h-[140px]" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={miniSales}>
                  <XAxis dataKey="m" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v) => [`${Number(v).toLocaleString('en-US')} ر.س`, 'المبيعات']} />
                  <Bar dataKey="v" fill="#16A34A" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
      {(m.kind === 'sales' || m.kind === 'deals') && (
        <div className="space-y-2">
          {topDeals.map(d => (
            <div key={d.id} className="flex items-center justify-between gap-2 rounded-xl border border-line p-2.5">
              <div className="min-w-0">
                <p className="text-[13px] font-bold truncate">{d.title}</p>
                <p className="text-xs text-mut truncate">{d.company} • {fmtMoney(d.value)}</p>
              </div>
              <StatusBadge value={d.stage} />
            </div>
          ))}
        </div>
      )}
      {m.kind === 'tasks' && (
        <div className="space-y-2">
          {todayTasks.map(t => (
            <div key={t.id} className="flex items-center justify-between gap-2 rounded-xl border border-line p-2.5">
              <div className="min-w-0">
                <p className="text-[13px] font-bold truncate">{t.title}</p>
                <p className="text-xs text-mut">{t.due} • {t.owner}</p>
              </div>
              <StatusBadge value={t.priority} />
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <button className="btn-secondary !py-1.5 !px-3 !text-xs" onClick={() => navigate('/deals')}>عرض الصفقات</button>
        <button className="btn-secondary !py-1.5 !px-3 !text-xs" onClick={createTask}>إنشاء مهمة</button>
        <button className="btn-secondary !py-1.5 !px-3 !text-xs" onClick={makeDraft}>صياغة رسالة</button>
        <button className="btn-secondary !py-1.5 !px-3 !text-xs" onClick={() => navigate('/reports')}>تحليل في التقارير</button>
      </div>
      {m.chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {m.chips.map(c => (
            <button key={c} onClick={() => send(CHIP_QUERIES[c] ?? c)}
              className="text-xs font-semibold rounded-full border border-brand-light bg-brand-pale/60 text-brand-dark px-3 py-1.5 hover:bg-brand-pale">
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="page-wrap">
      <PageHeader
        title="مساعد المدار الذكي"
        sub="محتوى تجريبي — إجابات مولدة من بيانات العرض فقط"
        actions={
          <button className="btn-secondary" onClick={() => setShowContext(s => !s)}>
            <PanelLeft size={16} /> {showContext ? 'إخفاء السياق' : 'عرض السياق'}
          </button>
        }
      />
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        {/* history sidebar (right in RTL) */}
        <aside className="card p-4 w-full lg:w-64 shrink-0 flex flex-col gap-3 order-1">
          <button className="btn-primary w-full" onClick={newChat}><Plus size={16} /> محادثة جديدة</button>
          <button className="btn-secondary w-full" onClick={clearChat}><Eraser size={16} /> مسح السجل</button>
          <p className="text-xs font-bold text-mut mt-1">سجل المحادثات</p>
          <div className="space-y-2 overflow-auto max-h-56 lg:max-h-none">
            {history.length === 0 && <p className="text-xs text-mut">لا يوجد سجل بعد — ابدأ محادثة جديدة.</p>}
            {history.map(h => (
              <button key={h.id} onClick={() => toast({ title: h.title, desc: 'تم تحميل المحادثة (تجريبي)' })}
                className="w-full text-start rounded-xl border border-line p-2.5 hover:border-brand-light hover:bg-brand-pale/40 transition">
                <p className="text-[13px] font-bold truncate">{h.title}</p>
                <p className="text-[11px] text-mut mt-0.5">{h.time}</p>
              </button>
            ))}
          </div>
          <div className="rounded-xl bg-brand-pale/60 border border-brand-light p-3 text-xs leading-relaxed text-slate2">
            <span className="font-bold text-brand-dark flex items-center gap-1"><Sparkles size={13} /> تلميح تجريبي</span>
            اسأل عن المبيعات أو الصفقات أو المهام للحصول على رد غني بالبطاقات والرسوم.
          </div>
        </aside>

        {/* center chat */}
        <section className="card flex-1 flex flex-col min-h-[560px] overflow-hidden order-2">
          {messages.length === 0 && !typing ? (
            <div className="flex-1 p-6 md:p-8 overflow-auto">
              <div className="max-w-2xl mx-auto text-center pt-4">
                <span className="w-14 h-14 rounded-2xl bg-brand-pale text-brand-dark inline-flex items-center justify-center"><Bot size={26} /></span>
                <h2 className="text-xl md:text-2xl font-bold mt-4">مرحباً بك في المدار — مساعدك الذكي للمبيعات</h2>
                <p className="text-[13.5px] text-mut mt-2">اسأل بلغة طبيعية عن المبيعات والصفقات والمهام والعملاء، وسألخص لك البيانات وأقترح الخطوة التالية. (محتوى تجريبي)</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6 text-start">
                  {SUGGESTIONS.map(s => (
                    <button key={s.title} onClick={() => send(s.title)}
                      className="rounded-2xl border border-line p-3.5 hover:border-brand hover:shadow-soft transition text-start group">
                      <span className="w-9 h-9 rounded-xl bg-brand-pale text-brand-dark inline-flex items-center justify-center group-hover:bg-brand group-hover:text-white transition">{s.icon}</span>
                      <p className="text-[13.5px] font-bold mt-2">{s.title}</p>
                      <p className="text-xs text-mut mt-0.5">{s.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div ref={scrollRef} className="flex-1 overflow-auto p-4 md:p-5 space-y-4">
              {messages.map(m => (
                <div key={m.id} className={cx('flex gap-2.5', m.role === 'user' ? 'flex-row-reverse' : '')}>
                  <span className={cx('w-8 h-8 rounded-full inline-flex items-center justify-center shrink-0',
                    m.role === 'user' ? 'bg-gray-200 text-gray-600' : 'bg-brand text-white')}>
                    {m.role === 'user' ? <User size={15} /> : <Sparkles size={15} />}
                  </span>
                  <div className={cx('max-w-[85%] md:max-w-[75%] rounded-2xl p-3.5 text-[13.5px] leading-relaxed',
                    m.role === 'user' ? 'bg-brand text-white rounded-tl-md' : 'bg-gray-50 border border-line rounded-tr-md')}>
                    {m.role === 'ai' && (
                      <p className="text-[11px] font-bold text-brand-dark mb-1 flex items-center gap-1">
                        <Sparkles size={12} /> المدار الذكي • تجريبي
                      </p>
                    )}
                    <p className={cx(m.role === 'user' ? 'text-white' : 'text-ink')}>{m.text}</p>
                    {m.role === 'ai' && renderAiExtras(m)}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-brand text-white inline-flex items-center justify-center shrink-0"><Loader2 size={15} className="animate-spin" /></span>
                  <div className="bg-gray-50 border border-line rounded-2xl rounded-tr-md px-4 py-3 flex gap-1.5 items-center">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-2 h-2 rounded-full bg-brand animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {draft && (
            <div className="mx-4 mb-2 rounded-xl border border-brand-light bg-brand-pale/50 p-3 flex items-start gap-2">
              <FileText size={16} className="text-brand-dark shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed flex-1">{draft}</p>
              <button className="text-xs font-bold text-brand-dark hover:underline shrink-0"
                onClick={() => { setDraft(''); toast({ title: 'تم نسخ المسودة', desc: 'المسودة جاهزة للصق في المحادثة (تجريبي)' }) }}>نسخ</button>
            </div>
          )}
          <div className="border-t border-line p-3 md:p-4">
            <div className="flex gap-2">
              <input
                className="input flex-1"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') send() }}
                placeholder="اكتب سؤالك هنا… مثال: لخص أداء المبيعات"
              />
              <button className="btn-primary !px-4" onClick={() => send()} disabled={typing || !input.trim()}>
                <Send size={16} /> إرسال
              </button>
            </div>
            <p className="text-[11px] text-mut mt-2">الردود تجريبية ومبنية على قواعد كلمات مفتاحية من بيانات العرض.</p>
          </div>
        </section>

        {/* context panel (left) */}
        {showContext && (
          <aside className="w-full lg:w-72 shrink-0 space-y-4 order-3">
            <Card title="العملاء المرجعيون" sub="من بيانات العرض (تجريبي)">
              <div className="space-y-2.5">
                {topContacts.map(c => (
                  <div key={c.id} className="flex items-center gap-2.5">
                    <Avatar name={c.name} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold truncate">{c.name}</p>
                      <p className="text-xs text-mut truncate">{c.company}</p>
                    </div>
                    <StatusBadge value={c.status} />
                  </div>
                ))}
              </div>
            </Card>
            <Card title="صفقات مرتبطة" sub="الأعلى قيمة (تجريبي)">
              <div className="space-y-2">
                {topDeals.map(d => (
                  <div key={d.id} className="rounded-xl bg-gray-50 border border-line p-2.5">
                    <p className="text-[13px] font-bold truncate">{d.title}</p>
                    <p className="text-xs text-mut mt-0.5">{d.customer} • {fmtMoney(d.value)} • احتمال {d.probability}%</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="إجراءات مقترحة" sub="اختصارات سريعة">
              <div className="grid gap-2">
                <button className="btn-secondary !justify-start" onClick={() => navigate('/deals')}><BarChart3 size={15} /> عرض الصفقات</button>
                <button className="btn-secondary !justify-start" onClick={createTask}><CheckSquare size={15} /> إنشاء مهمة</button>
                <button className="btn-secondary !justify-start" onClick={() => navigate('/reports')}><TrendingUp size={15} /> تحليل في التقارير</button>
                <button className="btn-secondary !justify-start" onClick={() => toast({ title: 'مسودة جاهزة', desc: 'استخدم زر صياغة رسالة داخل الرد (تجريبي)' })}><MessageSquarePlus size={15} /> صياغة رسالة</button>
              </div>
            </Card>
            <div className="card p-4">
              <p className="section-title !text-sm">ملخص السياق</p>
              <p className="text-xs text-mut leading-relaxed mt-1.5">لديك {deals.length} صفقة نشطة و{contacts.length} عميلاً و{tasks.length} مهام في مساحة العرض. يركز المساعد على الأعلى قيمة والأقرب للإغلاق. (تجريبي)</p>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
