import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Rocket } from 'lucide-react'
import AuthLayout from './AuthLayout'
import { useStore } from '../../lib/store'

const INDUSTRIES = ['التجارة والتجزئة', 'التقنية والبرمجيات', 'العقارات والمقاولات', 'الصحة والعيادات', 'التعليم والتدريب', 'الضيافة والمطاعم', 'الخدمات المالية', 'أخرى']
const TEAM_SIZES = ['فرد واحد', '2 - 5 أفراد', '6 - 20 فرداً', '21 - 100 فرد', 'أكثر من 100']
const CURRENCIES = ['الريال السعودي (ر.س)', 'الدرهم الإماراتي', 'الدينار الكويتي', 'الدولار الأمريكي']
const TIMEZONES = ['الرياض (GMT+3)', 'دبي (GMT+4)', 'الكويت (GMT+3)', 'القاهرة (GMT+2)']

export default function Workspace() {
  const nav = useNavigate()
  const { toast } = useStore()
  const [company, setCompany] = useState('')
  const [industry, setIndustry] = useState(INDUSTRIES[0])
  const [size, setSize] = useState(TEAM_SIZES[1])
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [timezone, setTimezone] = useState(TIMEZONES[0])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (company.trim().length < 2) {
      toast({ title: 'يرجى إدخال اسم الشركة', kind: 'error' })
      return
    }
    toast({ title: 'تم إعداد مساحة العمل', desc: `أهلاً بك في ${company}`, kind: 'success' })
    nav('/dashboard')
  }

  return (
    <AuthLayout title="إعداد مساحة العمل" sub="خصّص بيئة عملك لتبدأ إدارة عملائك فوراً">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <span className="label">اسم الشركة</span>
          <div className="relative">
            <Building2 size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input ps-9" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="مثال: شركة النخبة للتجارة" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <span className="label">القطاع</span>
            <select className="input" value={industry} onChange={(e) => setIndustry(e.target.value)}>
              {INDUSTRIES.map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="label">حجم الفريق</span>
            <select className="input" value={size} onChange={(e) => setSize(e.target.value)}>
              {TEAM_SIZES.map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="label">العملة</span>
            <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="label">المنطقة الزمنية</span>
            <select className="input" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
              {TIMEZONES.map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="btn-primary w-full">
          <Rocket size={16} />
          بدء استخدام المدار
        </button>
      </form>
    </AuthLayout>
  )
}
