import { useMemo, useState, type ReactNode } from 'react'
import { BookOpen, ChevronDown, Headset, MessageSquare, Rocket, Send, Sparkles, Users, Workflow, Plug } from 'lucide-react'
import { Card, Empty, Modal, PageHeader, SearchInput } from '../components/ui'
import { useStore } from '../lib/store'
import { cx } from '../lib/utils'

interface Guide { id: string; section: string; title: string; snippet: string; body: string[] }

const GUIDES: Guide[] = [
  { id: 'g1', section: 'البداية', title: 'جولة سريعة في المدار', snippet: 'لوحة التحكم والقوائم الأساسية في 5 دقائق.', body: ['من لوحة التحكم ترى أهم مؤشرات اليوم: المهام العاجلة والصفقات القريبة وآخر المحادثات.', 'استخدم البحث العلوي للوصول لأي عميل أو صفقة بسرعة، وزر الإضافة السريعة لإنشاء العناصر.', 'كل البيانات في بيئة العرض تجريبية وآمنة للتجربة دون قلق.'] },
  { id: 'g2', section: 'البداية', title: 'إعداد مساحة العمل', snippet: 'الشركة والعملة والمنطقة الزمنية واللغة.', body: ['من الإعدادات ← مساحة العمل حدد اسم الشركة والنشاط والعملة والمنطقة الزمنية.', 'من اللغة والمنطقة فعّل التقويم الهجري واختر بداية الأسبوع المناسبة لفريقك.', 'احفظ التغييرات وستنعكس فوراً على الواجهة (حفظ محلي تجريبي).'] },
  { id: 'g3', section: 'العملاء', title: 'إدارة العملاء باحتراف', snippet: 'إضافة العملاء وتقسيمهم ومتابعتهم.', body: ['أضف العميل مع بيانات التواصل والمالك المسؤول والوسوم للتصنيف السريع.', 'استخدم الحقول المخصصة من الإعدادات لجمع بيانات خاصة بنشاطك.', 'تابع آخر تواصل وقيمة العميل لتحديد أولويات المتابعة اليومية.'] },
  { id: 'g4', section: 'العملاء', title: 'استيراد جهات الاتصال', snippet: 'نقل قوائمك الحالية إلى المدار (تجريبي).', body: ['جهّز ملف CSV بالأعمدة: الاسم، الشركة، الجوال، البريد، المالك.', 'ارفع الملف من صفحة العملاء وراجع التطابقات قبل التأكيد.', 'ستُسند العملاء تلقائياً حسب قواعد التوزيع المفعّلة.'] },
  { id: 'g5', section: 'الصفقات', title: 'خط أنابيب الصفقات', snippet: 'المراحل والاحتمالات والإغلاق.', body: ['حرّك الصفقات بين المراحل: محتمل ← تواصل ← مؤهل ← عرض ← تفاوض ← فوز.', 'حدّث الاحتمالية والنشاط التالي في كل مرحلة لرفع دقة التوقعات.', 'خصّص المراحل والألوان من الإعدادات ← مراحل المبيعات.'] },
  { id: 'g6', section: 'الصفقات', title: 'تقارير الأداء', snippet: 'قراءة القمع ومعدلات التحويل.', body: ['قمع المبيعات يكشف أين تتسرب الصفقات — ركز تحسينك على أضيق مرحلة.', 'قارن أداء المندوبين شهرياً وأعد توزيع الصفقات الجديدة بعدالة.', 'فعّل المقارنة بالفترة السابقة لرصد أثر أي تغيير تجريه.'] },
  { id: 'g7', section: 'الذكاء', title: 'المساعد الذكي', snippet: 'اسأل بلغة طبيعية واحصل على خطط جاهزة.', body: ['اسأل عن المبيعات أو الصفقات أو المهام وستحصل على بطاقات ورسوم تفاعلية.', 'استخدم الردود الغنية: البطاقات المرجعية، الرسوم المصغرة، وأزرار الإجراءات.', 'كل ردود المساعد في العرض تجريبية ومبنية على بيانات محلية.'] },
  { id: 'g8', section: 'التكاملات', title: 'ربط واتساب والبريد', snippet: 'استقبال المحادثات في صندوق واحد.', body: ['من الإعدادات ← التكاملات اربط واتساب للأعمال والبريد الإلكتروني.', 'ستصل الردود الجديدة كإشعارات محادثات وتنبيهات فورية.', 'الربط في بيئة العرض تجريبي ولا يرسل رسائل حقيقية.'] },
]

const SECTION_META: Record<string, { icon: ReactNode; desc: string }> = {
  'البداية': { icon: <Rocket size={16} />, desc: 'انطلق من هنا' },
  'العملاء': { icon: <Users size={16} />, desc: 'إدارة جهات الاتصال' },
  'الصفقات': { icon: <Workflow size={16} />, desc: 'خط الأنابيب والتقارير' },
  'الذكاء': { icon: <Sparkles size={16} />, desc: 'المساعد والتحليلات' },
  'التكاملات': { icon: <Plug size={16} />, desc: 'الربط والأتمتة' },
}

const FAQS = [
  { q: 'هل بياناتي حقيقية أم تجريبية؟', a: 'كل البيانات في هذه البيئة تجريبية ومحفوظة محلياً في المتصفح لأغراض العرض، ولا تُرسل إلى أي خادم.' },
  { q: 'كيف أضيف عضواً جديداً للفريق؟', a: 'من صفحة الفريق اضغط «دعوة عضو» وأدخل البريد والدور، أو «إضافة عضو» للتسجيل المباشر. الدعوات تجريبية في العرض.' },
  { q: 'كيف أخصص مراحل المبيعات؟', a: 'من الإعدادات ← مراحل المبيعات يمكنك إضافة المراحل وإعادة ترتيبها وتغيير ألوانها لتناسب عملية البيع لديك.' },
  { q: 'هل يدعم المدار التقويم الهجري؟', a: 'نعم، فعّله من الإعدادات ← اللغة والمنطقة وستُعرض التواريخ بالهجري بجانب الميلادي.' },
  { q: 'كيف أصدّر التقارير؟', a: 'من صفحة التقارير اختر الفترة والموظف ثم اضغط «تصدير التقرير». التصدير في العرض تجريبي.' },
]

export default function Help() {
  const { toast } = useStore()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<Guide | null>(null)
  const [faq, setFaq] = useState<number | null>(0)
  const [msg, setMsg] = useState('')

  const guides = useMemo(() => {
    const t = q.trim()
    if (!t) return GUIDES
    return GUIDES.filter(g => g.title.includes(t) || g.snippet.includes(t) || g.section.includes(t))
  }, [q])
  const faqs = useMemo(() => {
    const t = q.trim()
    if (!t) return FAQS
    return FAQS.filter(f => f.q.includes(t) || f.a.includes(t))
  }, [q])

  return (
    <div className="page-wrap">
      <PageHeader title="مركز المساعدة" sub="أدلة وشروحات وأسئلة شائعة — كل المحتوى تجريبي" />
      <div className="card p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <SearchInput value={q} onChange={setQ} ph="ابحث في الأدلة والأسئلة…" />
        <p className="text-xs text-mut">{guides.length} دليل • {faqs.length} سؤال مطابق</p>
      </div>

      {Object.keys(SECTION_META).map(sec => {
        const list = guides.filter(g => g.section === sec)
        if (list.length === 0) return null
        return (
          <section key={sec}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-xl bg-brand-pale text-brand-dark inline-flex items-center justify-center">{SECTION_META[sec].icon}</span>
              <h2 className="font-bold">{sec === 'البداية' ? 'البدء السريع' : sec === 'العملاء' ? 'العملاء' : sec === 'الصفقات' ? 'الصفقات وخط الأنابيب' : sec === 'الذكاء' ? 'الذكاء الاصطناعي' : 'التكاملات'}</h2>
              <span className="text-xs text-mut">• {SECTION_META[sec].desc}</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {list.map(g => (
                <button key={g.id} onClick={() => setOpen(g)} className="card p-4 text-start hover:border-brand hover:shadow-soft transition">
                  <span className="w-9 h-9 rounded-xl bg-brand-pale text-brand-dark inline-flex items-center justify-center"><BookOpen size={16} /></span>
                  <p className="font-bold text-[13.5px] mt-2.5">{g.title}</p>
                  <p className="text-xs text-mut mt-1 leading-relaxed">{g.snippet}</p>
                  <span className="text-xs font-bold text-brand-dark mt-2 inline-block">قراءة الدليل ←</span>
                </button>
              ))}
            </div>
          </section>
        )
      })}
      {guides.length === 0 && <div className="card"><Empty title="لا نتائج مطابقة" sub="جرّب كلمات أخرى مثل: العملاء، الصفقات، الذكاء" /></div>}

      <Card title="الأسئلة الشائعة" sub="اضغط على السؤال لعرض الإجابة">
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <div key={f.q} className="rounded-xl border border-line overflow-hidden">
              <button onClick={() => setFaq(faq === i ? null : i)} className="w-full flex items-center justify-between gap-2 p-3.5 text-start">
                <span className="text-[13.5px] font-bold">{f.q}</span>
                <ChevronDown size={16} className={cx('text-mut shrink-0 transition', faq === i && 'rotate-180')} />
              </button>
              {faq === i && <p className="px-3.5 pb-3.5 text-[13px] text-mut leading-relaxed">{f.a}</p>}
            </div>
          ))}
          {faqs.length === 0 && <p className="text-sm text-mut">لا أسئلة مطابقة لبحثك.</p>}
        </div>
      </Card>

      <Card title="تواصل مع الدعم" sub="فريقنا يرد خلال ساعات العمل — تجريبي">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <MessageSquare size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input ps-9" value={msg} onChange={e => setMsg(e.target.value)} placeholder="اكتب استفسارك هنا…" />
          </div>
          <button className="btn-primary" onClick={() => { if (!msg.trim()) { toast({ title: 'اكتب رسالتك أولاً', kind: 'error' }); return } setMsg(''); toast({ title: 'تم إرسال طلبك', desc: 'سيتواصل معك فريق الدعم قريباً (تجريبي)' }) }}>
            <Send size={15} /> إرسال طلب
          </button>
          <button className="btn-secondary" onClick={() => toast({ title: 'المحادثة المباشرة', desc: 'ستتوفر قريباً في بيئة العرض (تجريبي)' })}>
            <Headset size={15} /> محادثة مباشرة
          </button>
        </div>
      </Card>

      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.title ?? ''} wide>
        {open && (
          <div className="space-y-3">
            <span className="badge bg-brand-pale text-brand-dark">{open.section} • تجريبي</span>
            {open.body.map((p, i) => <p key={i} className="text-[13.5px] leading-relaxed text-slate2">{p}</p>)}
            <button className="btn-primary w-full" onClick={() => { setOpen(null); toast({ title: 'أُضيف للمفضلة', desc: 'حُفظ الدليل في قائمتك (تجريبي)' }) }}>حفظ في المفضلة</button>
          </div>
        )}
      </Modal>
    </div>
  )
}
