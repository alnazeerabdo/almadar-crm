import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import AuthLayout from './AuthLayout'
import { useStore } from '../../lib/store'

export default function Login() {
  const nav = useNavigate()
  const { toast } = useStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [show, setShow] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@') || email.trim().length < 5) {
      toast({ title: 'يرجى إدخال بريد إلكتروني صحيح', kind: 'error' })
      return
    }
    if (password.length < 6) {
      toast({ title: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', kind: 'error' })
      return
    }
    toast({ title: 'مرحباً بعودتك', desc: 'تم تسجيل الدخول بنجاح', kind: 'success' })
    nav('/dashboard')
  }

  return (
    <AuthLayout title="تسجيل الدخول" sub="مرحباً بعودتك إلى مساحة عملك في المدار">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <span className="label">البريد الإلكتروني</span>
          <div className="relative">
            <Mail size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input ps-9"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="مثال: name@company.sa"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="label !mb-0">كلمة المرور</span>
            <Link to="/forgot" className="text-xs font-bold text-brand-dark hover:underline">
              نسيت كلمة المرور؟
            </Link>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input ps-9 pe-10"
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-ink"
              aria-label="إظهار كلمة المرور"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <label className="flex items-center gap-2 text-[13px] font-medium text-slate2 cursor-pointer">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded accent-[#16A34A]"
          />
          تذكرني على هذا الجهاز
        </label>
        <button type="submit" className="btn-primary w-full">
          <LogIn size={16} />
          دخول إلى لوحة التحكم
        </button>
      </form>

      <div className="mt-4 p-3 rounded-xl bg-brand-pale border border-brand-light text-[12.5px] leading-relaxed">
        <p className="font-bold text-brand-dark">حساب تجريبي للاستكشاف</p>
        <p className="text-slate2 mt-0.5">البريد: demo@almadar.sa — كلمة المرور: 123456</p>
      </div>

      <p className="text-center text-[13px] text-mut mt-5">
        ليس لديك حساب؟{' '}
        <Link to="/register" className="font-bold text-brand-dark hover:underline">
          إنشاء حساب جديد
        </Link>
      </p>
    </AuthLayout>
  )
}
