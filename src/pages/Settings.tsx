import { useState } from 'react'
import {
  Bell, Building2, ChevronDown, Compass, Globe, ListPlus, Lock, Plug, Plus,
  ShieldCheck, Sparkles, Trash2, User, ArrowUp, ArrowDown, Check,
} from 'lucide-react'
import { Avatar, Card, Field, PageHeader, StatusBadge } from '../components/ui'
import { useStore } from '../lib/store'
import { cx } from '../lib/utils'

const SECTIONS = [
  { id: 'profile', label: 'الملف الشخصي', icon: <User size={16} /> },
  { id: 'workspace', label: 'مساحة العمل', icon: <Building2 size={16} /> },
  { id: 'locale', label: 'اللغة والمنطقة', icon: <Globe size={16} /> },
  { id: 'fields', label: 'الحقول المخصصة', icon: <ListPlus size={16} /> },
  { id: 'stages', label: 'مراحل المبيعات', icon: <Compass size={16} /> },
  { id: 'sources', label: 'مصادر العملاء', icon: <Compass size={16} /> },
  { id: 'notif', label: 'الإشعارات', icon: <Bell size={16} /> },
  { id: 'integr', label: 'التكاملات', icon: <Plug size={16} /> },
  { id: 'ai', label: 'الذكاء الاصطناعي', icon: <Sparkles size={16} /> },
  { id: 'security', label: 'الأمان', icon: <ShieldCheck size={16} /> },
]

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} role="switch" aria-checked={on} aria-label={label}
      className={cx('w-10 h-6 rounded-full transition relative shrink-0', on ? 'bg-brand' : 'bg-gray-300')}>
      <span className={cx('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all', on ? 'start-[18px]' : 'start-0.5')} />
    </button>
  )
}

export default function Settings() {
  const { toast } = useStore()
  const [section, setSection] = useState('profile')
  const saved = (t: string) => toast({ title: 'تم الحفظ', desc: t })

  const [profile, setProfile] = useState({ name: 'خالد العتيبي', title: 'مدير المبيعات', email: 'khaled@almadar.sa', phone: '0551234567' })
  const [ws, setWs] = useState({ company: 'شركة المدار', industry: 'تقنية', country: 'السعودية', currency: 'ر.س', tz: 'Asia/Riyadh', date: 'ميلادي' })
  const [locale, setLocale] = useState({ lang: 'العربية', hijri: false, week: 'الأحد' })
  const [fields, setFields] = useState(['رقم السجل التجاري', 'المدينة', 'مصدر العميل'])
  const [newField, setNewField] = useState('')
  const [stages, setStages] = useState([
    { name: 'عميل محتمل', color: '#6B7280' }, { name: 'تم التواصل', color: '#2563EB' },
    { name: 'مؤهل', color: '#0D9488' }, { name: 'عرض سعر', color: '#8B5CF6' },
    { name: 'تفاوض', color: '#D97706' }, { name: 'تم الفوز', color: '#16A34A' },
  ])
  const [newStage, setNewStage] = useState('')
  const [sources, setSources] = useState([
    { name: 'الموقع الإلكتروني', on: true }, { name: 'حملة تسويقية', on: true },
    { name: 'إحالة', on: true }, { name: 'وسائل التواصل', on: false }, { name: 'معرض تجاري', on: false },
  ])
  const [newSource, setNewSource] = useState('')
  const [notif, setNotif] = useState({ tasks: true, deals: true, chats: true, weekly: false, sound: true })
  const [integr, setIntegr] = useState<Record<string, boolean>>({ mail: true, whatsapp: true, cal: false, forms: false, auto: true })
  const [ai, setAi] = useState({ enable: true, summary: true, scoring: true, tone: 'احترافية ودية' })
  const [two, setTwo] = useState(false)
  const [pw, setPw] = useState({ cur: '', next: '', conf: '' })
  const [adv, setAdv] = useState(false)

  const moveStage = (i: number, dir: number) => {
    const j = i + dir
    if (j < 0 || j >= stages.length) return
    const arr = [...stages]
    const [s] = arr.splice(i, 1)
    arr.splice(j, 0, s)
    setStages(arr)
  }

  const INTEGRATIONS = [
    { id: 'mail', name: 'البريد الإلكتروني', desc: 'مزامنة الرسائل الصادرة والواردة (تجريبي)' },
    { id: 'whatsapp', name: 'واتساب للأعمال', desc: 'إرسال واستقبال من صندوق المحادثات (تجريبي)' },
    { id: 'cal', name: 'تقويم جوجل', desc: 'مزامنة الاجتماعات والمهام (تجريبي)' },
    { id: 'forms', name: 'نماذج الموقع', desc: 'استقبال العملاء تلقائياً (تجريبي)' },
    { id: 'auto', name: 'الأتمتة والربط', desc: 'قواعد تلقائية للإسناد والمتابعة (تجريبي)' },
  ]

  return (
    <div className="page-wrap">
      <PageHeader title="الإعدادات" sub="تخصيص مساحة العمل — كل الحفظ محلي وتجريبي" />
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <nav className="card p-2.5 w-full lg:w-60 shrink-0 lg:sticky lg:top-4">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)}
              className={cx('navlink', section === s.id && 'navlink-active')}>
              {s.icon} {s.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 w-full min-w-0 space-y-4">
          {section === 'profile' && (
            <Card title="الملف الشخصي" sub="بيانات حسابك الأساسية">
              <div className="flex items-center gap-3 mb-4"><Avatar name={profile.name} size={52} />
                <button className="btn-secondary !py-2" onClick={() => saved('تم تحديث الصورة الرمزية (تجريبي)')}>تغيير الصورة</button>
              </div>
              <div className="grid sm:grid-cols-2 gap-x-4">
                <Field label="الاسم الكامل"><input className="input" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} /></Field>
                <Field label="المسمى الوظيفي"><input className="input" value={profile.title} onChange={e => setProfile({ ...profile, title: e.target.value })} /></Field>
                <Field label="البريد الإلكتروني"><input className="input" dir="ltr" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} /></Field>
                <Field label="الجوال"><input className="input" dir="ltr" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} /></Field>
              </div>
              <button className="btn-primary" onClick={() => saved('حُفظ الملف الشخصي بنجاح')}>حفظ التغييرات</button>
            </Card>
          )}

          {section === 'workspace' && (
            <Card title="مساحة العمل" sub="هوية الشركة والإعدادات العامة">
              <div className="grid sm:grid-cols-2 gap-x-4">
                <Field label="اسم الشركة"><input className="input" value={ws.company} onChange={e => setWs({ ...ws, company: e.target.value })} /></Field>
                <Field label="النشاط"><select className="input" value={ws.industry} onChange={e => setWs({ ...ws, industry: e.target.value })}>{['تقنية', 'تجزئة', 'عقارات', 'صحة', 'تعليم', 'خدمات'].map(o => <option key={o}>{o}</option>)}</select></Field>
                <Field label="الدولة"><select className="input" value={ws.country} onChange={e => setWs({ ...ws, country: e.target.value })}>{['السعودية', 'الإمارات', 'الكويت', 'قطر', 'مصر'].map(o => <option key={o}>{o}</option>)}</select></Field>
                <Field label="العملة"><select className="input" value={ws.currency} onChange={e => setWs({ ...ws, currency: e.target.value })}>{['ر.س', 'د.إ', 'د.ك', '$'].map(o => <option key={o}>{o}</option>)}</select></Field>
                <Field label="المنطقة الزمنية"><select className="input" value={ws.tz} onChange={e => setWs({ ...ws, tz: e.target.value })}>{['Asia/Riyadh', 'Asia/Dubai', 'Asia/Kuwait'].map(o => <option key={o}>{o}</option>)}</select></Field>
                <Field label="التقويم"><select className="input" value={ws.date} onChange={e => setWs({ ...ws, date: e.target.value })}>{['ميلادي', 'هجري'].map(o => <option key={o}>{o}</option>)}</select></Field>
              </div>
              <button className="btn-primary" onClick={() => saved('حُفظت بيانات مساحة العمل')}>حفظ التغييرات</button>
            </Card>
          )}

          {section === 'locale' && (
            <Card title="اللغة والمنطقة" sub="لغة الواجهة وخيارات التاريخ">
              <Field label="لغة الواجهة"><select className="input" value={locale.lang} onChange={e => setLocale({ ...locale, lang: e.target.value })}>{['العربية', 'العربية + English'].map(o => <option key={o}>{o}</option>)}</select></Field>
              <Field label="بداية الأسبوع"><select className="input" value={locale.week} onChange={e => setLocale({ ...locale, week: e.target.value })}>{['الأحد', 'الاثنين', 'السبت'].map(o => <option key={o}>{o}</option>)}</select></Field>
              <div className="flex items-center justify-between rounded-xl border border-line p-3 mb-3">
                <div><p className="text-sm font-bold">التقويم الهجري</p><p className="text-xs text-mut">عرض التواريخ بالهجري بجانب الميلادي</p></div>
                <Toggle on={locale.hijri} onClick={() => setLocale({ ...locale, hijri: !locale.hijri })} label="التقويم الهجري" />
              </div>
              <button className="btn-primary" onClick={() => saved('حُفظت إعدادات اللغة والمنطقة')}>حفظ التغييرات</button>
            </Card>
          )}

          {section === 'fields' && (
            <Card title="الحقول المخصصة" sub="حقول إضافية تظهر في بطاقات العملاء">
              <div className="space-y-2 mb-4">
                {fields.map(f => (
                  <div key={f} className="flex items-center justify-between rounded-xl border border-line p-3">
                    <span className="text-sm font-semibold">{f}</span>
                    <button className="btn-ghost !p-2 hover:!text-red-600" onClick={() => setFields(p => p.filter(x => x !== f))}><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input className="input flex-1" value={newField} onChange={e => setNewField(e.target.value)} placeholder="اسم الحقل الجديد…" />
                <button className="btn-primary" onClick={() => { if (!newField.trim()) return; setFields(p => [...p, newField.trim()]); setNewField(''); saved('أُضيف الحقل المخصص') }}><Plus size={15} /> إضافة</button>
              </div>
            </Card>
          )}

          {section === 'stages' && (
            <Card title="مراحل المبيعات" sub="رتب المراحل ولوّنها حسب خط الأنابيب">
              <div className="space-y-2 mb-4">
                {stages.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-2.5 rounded-xl border border-line p-2.5">
                    <span className="w-4 h-4 rounded-full shrink-0" style={{ background: s.color }} />
                    <input type="color" value={s.color} onChange={e => setStages(p => p.map((x, j) => j === i ? { ...x, color: e.target.value } : x))} className="w-8 h-8 rounded cursor-pointer bg-transparent" />
                    <span className="text-sm font-bold flex-1">{i + 1}. {s.name}</span>
                    <button className="btn-ghost !p-1.5" onClick={() => moveStage(i, -1)} aria-label="للأعلى"><ArrowUp size={15} /></button>
                    <button className="btn-ghost !p-1.5" onClick={() => moveStage(i, 1)} aria-label="للأسفل"><ArrowDown size={15} /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input className="input flex-1" value={newStage} onChange={e => setNewStage(e.target.value)} placeholder="مرحلة جديدة…" />
                <button className="btn-primary" onClick={() => { if (!newStage.trim()) return; setStages(p => [...p, { name: newStage.trim(), color: '#16A34A' }]); setNewStage(''); saved('أُضيفت المرحلة') }}><Plus size={15} /> إضافة</button>
              </div>
            </Card>
          )}

          {section === 'sources' && (
            <Card title="مصادر العملاء" sub="فعّل المصادر المستخدمة في مساحة العمل">
              <div className="space-y-2 mb-4">
                {sources.map((s, i) => (
                  <div key={s.name} className="flex items-center justify-between rounded-xl border border-line p-3">
                    <span className="text-sm font-semibold">{s.name}</span>
                    <Toggle on={s.on} onClick={() => setSources(p => p.map((x, j) => j === i ? { ...x, on: !x.on } : x))} label={s.name} />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input className="input flex-1" value={newSource} onChange={e => setNewSource(e.target.value)} placeholder="مصدر جديد…" />
                <button className="btn-primary" onClick={() => { if (!newSource.trim()) return; setSources(p => [...p, { name: newSource.trim(), on: true }]); setNewSource(''); saved('أُضيف المصدر') }}><Plus size={15} /> إضافة</button>
              </div>
            </Card>
          )}

          {section === 'notif' && (
            <Card title="الإشعارات" sub="اختر ما يصلك من تنبيهات">
              <div className="space-y-2 mb-4">
                {([['tasks', 'تنبيهات المهام', 'استحقاق وتأخر المهام'], ['deals', 'تنبيهات الصفقات', 'اقتراب الإغلاق وتغير المراحل'], ['chats', 'تنبيهات المحادثات', 'ردود العملاء الجديدة'], ['weekly', 'التقرير الأسبوعي', 'ملخص الأداء كل أحد'], ['sound', 'الصوت', 'تشغيل صوت عند الإشعار']] as const).map(([k, t, d]) => (
                  <div key={k} className="flex items-center justify-between rounded-xl border border-line p-3">
                    <div><p className="text-sm font-bold">{t}</p><p className="text-xs text-mut">{d}</p></div>
                    <Toggle on={notif[k]} onClick={() => setNotif({ ...notif, [k]: !notif[k] })} label={t} />
                  </div>
                ))}
              </div>
              <button className="btn-primary" onClick={() => saved('حُفظت تفضيلات الإشعارات')}>حفظ التغييرات</button>
            </Card>
          )}

          {section === 'integr' && (
            <Card title="التكاملات" sub="اربط أدواتك الخارجية — كلها تجريبية" action={<span className="badge bg-amber-50 text-amber-700">تجريبي</span>}>
              <div className="grid sm:grid-cols-2 gap-3">
                {INTEGRATIONS.map(g => (
                  <div key={g.id} className="rounded-2xl border border-line p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm">{g.name}</p>
                      <StatusBadge value={integr[g.id] ? 'متصل تجريبياً' : 'غير متصل'} />
                    </div>
                    <p className="text-xs text-mut leading-relaxed">{g.desc}</p>
                    <button className={integr[g.id] ? 'btn-secondary !py-2' : 'btn-primary !py-2'}
                      onClick={() => { setIntegr(p => ({ ...p, [g.id]: !p[g.id] })); toast({ title: integr[g.id] ? 'تم قطع الاتصال' : 'تم الاتصال', desc: `${g.name} (تجريبي)` }) }}>
                      {integr[g.id] ? 'قطع الاتصال' : 'ربط الآن'}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {section === 'ai' && (
            <div className="space-y-4">
              <Card title="الذكاء الاصطناعي" sub="التحكم في قدرات المدار الذكي (تجريبي)" action={<span className="badge bg-brand-pale text-brand-dark">تجريبي</span>}>
                <div className="space-y-2 mb-4">
                  {([['enable', 'تفعيل المساعد الذكي', 'الردود والاقتراحات في كل الصفحات'], ['summary', 'الملخصات التلقائية', 'ملخص المحادثات والصفقات'], ['scoring', 'تقييم العملاء', 'نقاط التأهيل التنبؤية']] as const).map(([k, t, d]) => (
                    <div key={k} className="flex items-center justify-between rounded-xl border border-line p-3">
                      <div><p className="text-sm font-bold">{t}</p><p className="text-xs text-mut">{d}</p></div>
                      <Toggle on={ai[k]} onClick={() => setAi({ ...ai, [k]: !ai[k] })} label={t} />
                    </div>
                  ))}
                </div>
                <Field label="نبرة الردود"><select className="input" value={ai.tone} onChange={e => setAi({ ...ai, tone: e.target.value })}>{['احترافية ودية', 'رسمية', 'تسويقية حماسية', 'مختصرة'].map(o => <option key={o}>{o}</option>)}</select></Field>
                <button className="btn-primary" onClick={() => saved('حُفظت إعدادات الذكاء الاصطناعي')}>حفظ التغييرات</button>
              </Card>
              <Card title="استهلاك الاستخدام" sub="حصص العرض التجريبي">
                {[['الملخصات', 68], ['تقييم العملاء', 42], ['صياغة الرسائل', 85]].map(([l, v]) => (
                  <div key={l as string} className="mb-3 last:mb-0">
                    <div className="flex justify-between text-xs font-semibold mb-1"><span>{l}</span><span className="tabular-nums">{v}%</span></div>
                    <div className="h-2 rounded-full bg-gray-100"><div className="h-2 rounded-full bg-brand" style={{ width: `${v}%` }} /></div>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {section === 'security' && (
            <div className="space-y-4">
              <Card title="الأمان" sub="كلمة المرور والتحقق بخطوتين">
                <div className="grid sm:grid-cols-3 gap-x-4">
                  <Field label="الحالية"><input type="password" className="input" value={pw.cur} onChange={e => setPw({ ...pw, cur: e.target.value })} /></Field>
                  <Field label="الجديدة"><input type="password" className="input" value={pw.next} onChange={e => setPw({ ...pw, next: e.target.value })} /></Field>
                  <Field label="تأكيد الجديدة"><input type="password" className="input" value={pw.conf} onChange={e => setPw({ ...pw, conf: e.target.value })} /></Field>
                </div>
                <button className="btn-primary" onClick={() => { setPw({ cur: '', next: '', conf: '' }); saved('تم تغيير كلمة المرور (تجريبي)') }}>
                  <Lock size={15} /> تحديث كلمة المرور
                </button>
                <div className="flex items-center justify-between rounded-xl border border-line p-3 mt-3">
                  <div><p className="text-sm font-bold">التحقق بخطوتين</p><p className="text-xs text-mut">رمز إضافي عند تسجيل الدخول</p></div>
                  <Toggle on={two} onClick={() => { setTwo(t => !t); toast({ title: two ? 'تم إيقاف التحقق' : 'تم تفعيل التحقق', desc: 'التحقق بخطوتين (تجريبي)' }) }} label="التحقق بخطوتين" />
                </div>
              </Card>
              <Card title="الجلسات النشطة" sub="الأجهزة المسجلة حالياً (تجريبي)">
                {[['متصفح كروم — الرياض', 'نشطة الآن'], ['تطبيق الجوال — iOS', 'قبل ساعتين']].map(([d, t]) => (
                  <div key={d} className="flex items-center justify-between rounded-xl border border-line p-3 mb-2 last:mb-0">
                    <span className="text-sm font-semibold">{d} <span className="text-xs text-mut">• {t}</span></span>
                    <button className="text-xs font-bold text-red-600 hover:underline" onClick={() => toast({ title: 'تم إنهاء الجلسة', desc: d })}>إنهاء</button>
                  </div>
                ))}
                <button className="btn-ghost text-sm mt-2 inline-flex items-center gap-1" onClick={() => setAdv(a => !a)}>
                  خيارات متقدمة <ChevronDown size={14} className={cx('transition', adv && 'rotate-180')} />
                </button>
                {adv && (
                  <div className="rounded-xl bg-gray-50 border border-line p-3 text-xs text-mut leading-relaxed mt-2 flex items-start gap-2">
                    <Check size={14} className="text-brand-dark shrink-0 mt-0.5" />
                    سجل الدخول، سجل العمليات، وتصدير بيانات النشاط — كلها تجريبية في بيئة العرض ولا تؤثر على بيانات حقيقية.
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
