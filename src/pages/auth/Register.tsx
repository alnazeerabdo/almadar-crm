import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Building2, Lock, UserPlus } from 'lucide-react'
import AuthLayout from './AuthLayout'
import { useStore } from '../../lib/store'

export default function Register() {
  const nav = useNavigate()
  const { toast } = useStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [terms, setTerms] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim().length < 2) {
      toast({ title: 'يرجى إدخال الاسم الكامل', kind: 'error' })
      return
    }
    if (!email.includes('@')) {
      toast({ title: 'يرجى إدخال بريد إلكتروني صحيح', kind: 'error' })
      return
    }
    if (company.trim().length < 2) {
      toast({ title: 'يرجى إدخال اسم الشركة', kind: 'error' })
      return
    }
    if (password.length < 6) {
      toast({ title: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', kind: 'error' })
      return
    }
    if (password !== confirm) {
      toast({ title: 'تأكيد كلمة المرور غير متطابق', kind: 'error' })
      return
    }
    if (!terms) {
      toast({ title: 'يرجى الموافقة على الشروط والأحكام', kind: 'error' })
      return
    }
    toast({ title: 'تم إنشاء الحساب بنجاح', desc: 'أكمل إعداد مساحة العمل', kind: 'success' })
    nav('/workspace')
  }

  return (
    <AuthLayout title="إنشاء حساب جديد" sub="ابدأ رحلتك مع المدار خلال دقيقة واحدة">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <span className="label">الاسم الكامل</span>
          <div className="relative">
            <User size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input ps-9" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: خالد العتيبي" />
          </div>
        </div>
        <div>
          <span className="label">البريد الإلكتروني</span>
          <div className="relative">
            <Mail size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input ps-9" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.sa" />
          </div>
        </div>
        <div>
          <span className="label">اسم الشركة</span>
          <div className="relative">
            <Building2 size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input ps-9" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="مثال: شركة النخبة للتجارة" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <span className="label">كلمة المرور</span>
            <div className="relative">
              <Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input ps-9" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6 أحرف على الأقل" />
            </div>
          </div>
          <div>
            <span className="label">تأكيد كلمة المرور</span>
            <input className="input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="أعد إدخال كلمة المرور" />
          </div>
        </div>
        <label className="flex items-start gap-2 text-[13px] text-slate2 cursor-pointer leading-relaxed">
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="w-4 h-4 mt-0.5 rounded accent-[#16A34A]" />
          <span>أوافق على الشروط والأحكام وسياسة الخصوصية الخاصة بمنصة المدار</span>
        </label>
        <button type="submit" className="btn-primary w-full">
          <UserPlus size={16} />
          إنشاء الحساب والمتابعة
        </button>
      </form>
      <p className="text-center text-[13px] text-mut mt-5">
        لديك حساب بالفعل؟{' '}
        <Link to="/login" className="font-bold text-brand-dark hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </AuthLayout>
  )
}
