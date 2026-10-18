import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, ShieldCheck, ArrowRight } from 'lucide-react'
import AuthLayout from './AuthLayout'
import { useStore } from '../../lib/store'

export default function Reset() {
  const nav = useNavigate()
  const { toast } = useStore()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      toast({ title: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', kind: 'error' })
      return
    }
    if (password !== confirm) {
      toast({ title: 'تأكيد كلمة المرور غير متطابق', kind: 'error' })
      return
    }
    toast({ title: 'تم تحديث كلمة المرور', desc: 'سجل الدخول بكلمة المرور الجديدة', kind: 'success' })
    nav('/login')
  }

  return (
    <AuthLayout title="تعيين كلمة مرور جديدة" sub="اختر كلمة مرور قوية لحماية حسابك">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <span className="label">كلمة المرور الجديدة</span>
          <div className="relative">
            <Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input ps-9"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6 أحرف على الأقل"
            />
          </div>
        </div>
        <div>
          <span className="label">تأكيد كلمة المرور الجديدة</span>
          <div className="relative">
            <ShieldCheck size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input ps-9"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="أعد إدخال كلمة المرور"
            />
          </div>
        </div>
        <button type="submit" className="btn-primary w-full">
          <ShieldCheck size={16} />
          حفظ وتسجيل الدخول
        </button>
      </form>
      <Link to="/login" className="flex items-center justify-center gap-1.5 text-[13px] font-bold text-brand-dark mt-5 hover:underline">
        <ArrowRight size={15} />
        العودة إلى تسجيل الدخول
      </Link>
    </AuthLayout>
  )
}
