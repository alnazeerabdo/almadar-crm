import { useState } from 'react'
import { Bell, Globe, Lock, Mail, Phone, ShieldCheck } from 'lucide-react'
import { Avatar, Card, Field, MetricCard, PageHeader, Tabs, Timeline } from '../components/ui'
import { useStore } from '../lib/store'
import { BarChart3, Briefcase, CheckSquare, Users } from 'lucide-react'

const TABS = ['النشاط', 'التفضيلات', 'الأمان']

export default function Profile() {
  const { toast } = useStore()
  const [tab, setTab] = useState(TABS[0])
  const [prefs, setPrefs] = useState({ lang: 'العربية', emailNotif: true, smsNotif: false, weekly: true })
  const [pw, setPw] = useState({ next: '', conf: '' })
  const [two, setTwo] = useState(false)

  return (
    <div className="page-wrap max-w-[1000px]">
      <PageHeader title="الملف الشخصي" sub="بياناتك ونشاطك وتفضيلاتك" />

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Avatar name="خالد العتيبي" size={72} />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold">خالد العتيبي</h2>
            <p className="text-[13px] text-mut">مدير المبيعات • فريق المبيعات • الرياض</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[12.5px] text-mut">
              <span className="inline-flex items-center gap-1.5" dir="ltr"><Mail size={13} /> khaled@almadar.sa</span>
              <span className="inline-flex items-center gap-1.5" dir="ltr"><Phone size={13} /> 0551234567</span>
            </div>
          </div>
          <button className="btn-secondary shrink-0" onClick={() => toast({ title: 'تعديل الملف', desc: 'عدّل بياناتك من صفحة الإعدادات (تجريبي)' })}>تعديل الملف</button>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="عملائي" value="48" icon={<Users size={18} />} />
        <MetricCard label="صفقاتي النشطة" value="6" icon={<Briefcase size={18} />} tone="blue" />
        <MetricCard label="مهامي" value="9" icon={<CheckSquare size={18} />} tone="amber" />
        <MetricCard label="إيرادي المحقق" value="148,000 ر.س" delta="+12% هذا الشهر" icon={<BarChart3 size={18} />} />
      </div>

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'النشاط' && (
        <Card title="النشاط الأخير" sub="تحركاتك في مساحة العمل (تجريبي)">
          <Timeline items={[
            { title: 'أغلقت صفقة عقد الدعم السنوي', sub: 'تقنية السحابة — 48,000 ر.س', time: 'قبل يومين' },
            { title: 'أضفت 3 مهام متابعة', sub: 'النخبة للتجارة والأفق الذهبي', time: 'قبل 3 أيام' },
            { title: 'حدّثت مرحلة صفقة', sub: 'نظام متابعة الفروع — إلى تفاوض', time: 'قبل 5 أيام' },
            { title: 'أرسلت عرض سعر', sub: 'باقة الحملات الذكية — أفق الأعمال', time: 'قبل أسبوع' },
            { title: 'سجلت عميلاً جديداً', sub: 'عيادات الشفاء — مها ناصر', time: 'قبل أسبوعين' },
          ]} />
        </Card>
      )}

      {tab === 'التفضيلات' && (
        <Card title="التفضيلات" sub="اللغة والإشعارات الخاصة بك">
          <Field label="لغة الواجهة">
            <select className="input" value={prefs.lang} onChange={e => setPrefs({ ...prefs, lang: e.target.value })}>
              <option>العربية</option><option>العربية + English</option>
            </select>
          </Field>
          {([['emailNotif', 'إشعارات البريد', 'ملخص يومي على بريدك'], ['smsNotif', 'إشعارات الجوال', 'تنبيهات فورية للمهام العاجلة'], ['weekly', 'التقرير الأسبوعي', 'أداءك الشخصي كل أحد']] as const).map(([k, t, d]) => (
            <div key={k} className="flex items-center justify-between rounded-xl border border-line p-3 mb-2 last:mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-brand-pale text-brand-dark flex items-center justify-center">
                  {k === 'emailNotif' ? <Mail size={15} /> : k === 'smsNotif' ? <Bell size={15} /> : <Globe size={15} />}
                </span>
                <div><p className="text-sm font-bold">{t}</p><p className="text-xs text-mut">{d}</p></div>
              </div>
              <button role="switch" aria-checked={prefs[k]} onClick={() => setPrefs({ ...prefs, [k]: !prefs[k] })}
                className={`w-10 h-6 rounded-full transition relative ${prefs[k] ? 'bg-brand' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${prefs[k] ? 'start-[18px]' : 'start-0.5'}`} />
              </button>
            </div>
          ))}
          <button className="btn-primary" onClick={() => toast({ title: 'تم الحفظ', desc: 'حُفظت تفضيلاتك (تجريبي)' })}>حفظ التفضيلات</button>
        </Card>
      )}

      {tab === 'الأمان' && (
        <Card title="الأمان" sub="كلمة المرور والتحقق بخطوتين — تجريبي">
          <div className="grid sm:grid-cols-2 gap-x-4">
            <Field label="كلمة المرور الجديدة"><input type="password" className="input" value={pw.next} onChange={e => setPw({ ...pw, next: e.target.value })} /></Field>
            <Field label="تأكيد كلمة المرور"><input type="password" className="input" value={pw.conf} onChange={e => setPw({ ...pw, conf: e.target.value })} /></Field>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-primary" onClick={() => { setPw({ next: '', conf: '' }); toast({ title: 'تم التحديث', desc: 'تغيّرت كلمة المرور (تجريبي)' }) }}>
              <Lock size={15} /> تحديث كلمة المرور
            </button>
            <button className="btn-secondary" onClick={() => { setTwo(t => !t); toast({ title: two ? 'تم الإيقاف' : 'تم التفعيل', desc: 'التحقق بخطوتين (تجريبي)' }) }}>
              <ShieldCheck size={15} /> {two ? 'إيقاف التحقق بخطوتين' : 'تفعيل التحقق بخطوتين'}
            </button>
          </div>
        </Card>
      )}
    </div>
  )
}
