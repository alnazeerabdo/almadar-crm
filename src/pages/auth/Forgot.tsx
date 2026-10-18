import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Send, CheckCircle2, ArrowRight } from 'lucide-react'
import AuthLayout from './AuthLayout'
import { useStore } from '../../lib/store'

export default function Forgot() {
  const { toast } = useStore()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) {
      toast({ title: 'يرجى إدخال بريد إلكتروني صحيح', kind: 'error' })
      return
    }
    setSent(true)
    toast({ title: 'تم إرسال رابط الاستعادة', desc: 'تحقق من بريدك الإلكتروني', kind: 'success' })
  }

  return (
    <AuthLayout title="استعادة كلمة المرور" sub="أدخل بريدك وسنرسل لك رابط إعادة التعيين">
      {!sent ? (
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
                placeholder="name@company.sa"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">
            <Send size={16} />
            إرسال رابط الاستعادة
          </button>
        </form>
      ) : (
        <div className="text-center py-2">
          <span className="w-14 h-14 rounded-2xl bg-brand-pale text-brand-dark flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={26} />
          </span>
          <p className="font-bold text-[15px]">تم إرسال الرابط بنجاح</p>
          <p className="text-[13px] text-mut mt-1.5 leading-relaxed">
            أرسلنا رابط إعادة التعيين إلى {email} — تحقق من البريد والرسائل المزعجة
          </p>
          <Link to="/reset" className="btn-secondary w-full mt-5">
            المتابعة إلى صفحة التعيين (تجريبي)
          </Link>
          <button onClick={() => setSent(false)} className="btn-ghost w-full mt-2 text-[13px]">
            إرسال إلى بريد آخر
          </button>
        </div>
      )}
      <Link to="/login" className="flex items-center justify-center gap-1.5 text-[13px] font-bold text-brand-dark mt-5 hover:underline">
        <ArrowRight size={15} />
        العودة إلى تسجيل الدخول
      </Link>
    </AuthLayout>
  )
}
