import React from 'react'
import { Logo } from '../../components/ui'
import { CheckCircle2, Sparkles, Users, TrendingUp } from 'lucide-react'

export default function AuthLayout({
  children,
  title,
  sub,
}: {
  children: React.ReactNode
  title: string
  sub?: string
}) {
  const features = [
    { t: 'إدارة شاملة للعملاء والصفقات', d: 'تابع كل جهات الاتصال وخط المبيعات من مكان واحد' },
    { t: 'مساعد ذكي بالعربية', d: 'رؤى وتوصيات تلقائية لرفع التحويل والإغلاق' },
    { t: 'تقارير وأتمتة متقدمة', d: 'حملات ومهام وتقارير تساعد فريقك على الإنجاز' },
  ]
  const stats = [
    { v: '+2,480', l: 'جهة اتصال' },
    { v: '24.8%', l: 'معدل تحويل' },
    { v: '98%', l: 'رضا العملاء' },
  ]

  return (
    <div className="min-h-screen flex bg-bgmain">
      {/* لوحة العلامة — تظهر أولاً في اليمين بسبب الاتجاه */}
      <aside className="hidden lg:flex w-[46%] shrink-0 bg-brand-dark text-white p-10 flex-col justify-between">
        <div>
          <span className="inline-flex bg-white rounded-2xl px-3 py-2">
            <Logo />
          </span>
          <h2 className="text-2xl xl:text-3xl font-bold mt-8 leading-snug">
            منصة المدار لإدارة علاقات العملاء
          </h2>
          <p className="text-white/70 text-[14px] mt-3 leading-relaxed">
            نظّم عملاءك وصفقاتك ومهامك، ودع الذكاء الاصطناعي يقترح عليك الخطوة التالية باللغة العربية.
          </p>
          <ul className="mt-8 space-y-4">
            {features.map((f) => (
              <li key={f.t} className="flex gap-3 items-start">
                <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} />
                </span>
                <span>
                  <span className="block font-bold text-[14px]">{f.t}</span>
                  <span className="block text-white/65 text-[13px] mt-0.5">{f.d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="grid grid-cols-3 gap-3 mt-10">
            {stats.map((s) => (
              <div key={s.l} className="bg-white/10 rounded-2xl p-4 text-center">
                <p className="text-xl font-bold tabular-nums">{s.v}</p>
                <p className="text-white/65 text-xs mt-1">{s.l}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-6 text-white/60 text-xs">
            <Sparkles size={14} />
            <span>مدعوم برؤى المدار الذكية لفرق المبيعات العربية</span>
          </div>
        </div>
      </aside>

      {/* جهة النموذج */}
      <main className="flex-1 flex items-center justify-center p-5 md:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-6">
            <Logo />
          </div>
          <div className="card p-6 md:p-8">
            <div className="flex items-center gap-2 text-brand-dark text-xs font-bold bg-brand-pale rounded-full px-3 py-1.5 w-fit mb-4">
              <Users size={14} />
              <span>مساحة عمل عربية متكاملة</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-ink">{title}</h1>
            {sub && <p className="text-[13.5px] text-mut mt-1.5 leading-relaxed">{sub}</p>}
            <div className="mt-6">{children}</div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-6 text-xs text-mut">
            <span className="flex items-center gap-1">
              <TrendingUp size={13} />
              أداء موثوق
            </span>
            <span>•</span>
            <span>خصوصية وأمان</span>
            <span>•</span>
            <span>دعم بالعربية</span>
          </div>
        </div>
      </main>
    </div>
  )
}
