import React from 'react'
import { cx, avatarColor, initials } from '../lib/utils'
import { Search, X } from 'lucide-react'

export function Logo({ size = 38 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="15.5" stroke="#16A34A" strokeWidth="3.2" />
        <ellipse cx="20" cy="20" rx="18" ry="7.5" stroke="#15803D" strokeWidth="1.6" opacity=".55" transform="rotate(-20 20 20)" />
        <circle cx="20" cy="20" r="6" fill="#16A34A" />
        <circle cx="31.5" cy="11" r="3.2" fill="#15803D" />
      </svg>
      <span className="leading-tight">
        <span className="block text-[17px] font-bold text-ink">المدار</span>
        <span className="block text-[10.5px] font-semibold tracking-widest text-brand-dark">CRM • مساحة العمل</span>
      </span>
    </span>
  )
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <span className="inline-flex items-center justify-center rounded-full text-white font-bold shrink-0"
      style={{ width: size, height: size, background: avatarColor(name), fontSize: size * 0.36 }}>{initials(name)}</span>
  )
}

export function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    'نشط': 'bg-brand-pale text-brand-dark', 'جديد': 'bg-blue-50 text-blue-700', 'مهم': 'bg-amber-50 text-amber-700',
    'غير نشط': 'bg-gray-100 text-gray-500', 'مؤهل': 'bg-brand-pale text-brand-dark', 'تم التواصل': 'bg-blue-50 text-blue-700',
    'تفاوض': 'bg-amber-50 text-amber-700', 'محول': 'bg-brand-pale text-brand-dark', 'مفقود': 'bg-red-50 text-red-600',
    'تم الفوز': 'bg-brand-pale text-brand-dark', 'تم الخسارة': 'bg-red-50 text-red-600', 'عرض سعر': 'bg-violet-50 text-violet-700',
    'عميل محتمل': 'bg-gray-100 text-gray-600', 'عالية': 'bg-red-50 text-red-600', 'متوسطة': 'bg-amber-50 text-amber-700',
    'منخفضة': 'bg-gray-100 text-gray-500', 'قيد التنفيذ': 'bg-blue-50 text-blue-700', 'مكتملة': 'bg-brand-pale text-brand-dark',
    'متأخرة': 'bg-red-50 text-red-600', 'جديدة': 'bg-gray-100 text-gray-600', 'نشطة': 'bg-brand-pale text-brand-dark',
    'مجدولة': 'bg-blue-50 text-blue-700', 'مكتملة ': 'bg-gray-100 text-gray-500', 'مسودة': 'bg-gray-100 text-gray-500',
    'مفتوحة': 'bg-brand-pale text-brand-dark', 'بانتظار الرد': 'bg-amber-50 text-amber-700', 'مغلقة': 'bg-gray-100 text-gray-500',
    'متصل تجريبياً': 'bg-brand-pale text-brand-dark', 'غير متصل': 'bg-gray-100 text-gray-500', 'يحتاج إلى إعداد': 'bg-amber-50 text-amber-700',
  }
  return <span className={cx('badge', map[value] ?? 'bg-gray-100 text-gray-600')}>{value}</span>
}

export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-ink">{title}</h1>
        {sub && <p className="text-[13.5px] text-mut mt-1">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function MetricCard({ label, value, delta, icon, tone = 'green' }: { label: string; value: string; delta?: string; icon: React.ReactNode; tone?: 'green' | 'red' | 'blue' | 'amber' }) {
  const tones: Record<string, string> = {
    green: 'bg-brand-pale text-brand-dark', red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-700', amber: 'bg-amber-50 text-amber-700',
  }
  return (
    <div className="card p-4 flex items-start justify-between gap-3">
      <div>
        <p className="text-[12.5px] text-mut font-medium">{label}</p>
        <p className="text-[22px] font-bold mt-1 tabular-nums">{value}</p>
        {delta && <p className={cx('text-xs mt-1 font-semibold', tone === 'red' ? 'text-red-600' : 'text-brand-dark')}>{delta}</p>}
      </div>
      <span className={cx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', tones[tone])}>{icon}</span>
    </div>
  )
}

export function Card({ title, sub, action, children, className }: { title?: string; sub?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cx('card p-4 md:p-5', className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>{title && <h3 className="section-title">{title}</h3>}{sub && <p className="section-sub mt-0.5">{sub}</p>}</div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function SearchInput({ value, onChange, ph = 'بحث...' }: { value: string; onChange: (v: string) => void; ph?: string }) {
  return (
    <div className="relative min-w-[200px] flex-1 max-w-sm">
      <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input className="input ps-9" value={value} onChange={e => onChange(e.target.value)} placeholder={ph} />
    </div>
  )
}

export function Empty({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-10 px-4">
      <div className="w-12 h-12 rounded-2xl bg-brand-pale text-brand-dark flex items-center justify-center mx-auto mb-3"><Search size={20} /></div>
      <p className="font-bold">{title}</p>
      {sub && <p className="text-[13px] text-mut mt-1">{sub}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={cx('relative bg-white w-full rounded-t-3xl sm:rounded-2xl shadow-pop max-h-[92vh] overflow-auto', wide ? 'sm:max-w-2xl' : 'sm:max-w-lg')}>
        <div className="sticky top-0 bg-white border-b border-line px-5 py-4 flex items-center justify-between">
          <h3 className="font-bold">{title}</h3>
          <button onClick={onClose} className="btn-ghost !p-2"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="absolute inset-y-0 start-0 w-full sm:w-[440px] bg-white shadow-pop flex flex-col animate-in">
        <div className="border-b border-line px-5 py-4 flex items-center justify-between">
          <h3 className="font-bold">{title}</h3>
          <button onClick={onClose} className="btn-ghost !p-2"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto p-5">{children}</div>
      </aside>
    </div>
  )
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block mb-3"><span className="label">{label}</span>{children}</label>
}

export function Tabs({ tabs, value, onChange }: { tabs: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit max-w-full overflow-auto">
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)}
          className={cx('px-3.5 py-2 rounded-lg text-[13px] font-semibold whitespace-nowrap transition', value === t ? 'bg-white shadow-soft text-ink' : 'text-mut hover:text-ink')}>{t}</button>
      ))}
    </div>
  )
}

export function AIInsight({ icon, title, desc, action }: { icon: React.ReactNode; title: string; desc: string; action?: string }) {
  return (
    <div className="flex gap-3 p-3 rounded-xl bg-brand-pale/60 border border-brand-light">
      <span className="w-9 h-9 rounded-xl bg-white text-brand-dark flex items-center justify-center shrink-0 shadow-soft">{icon}</span>
      <div className="min-w-0">
        <p className="text-[13.5px] font-bold">{title}</p>
        <p className="text-[12.5px] text-slate2 mt-0.5 leading-relaxed">{desc}</p>
        {action && <button className="text-[12.5px] font-bold text-brand-dark mt-1 hover:underline">{action} ←</button>}
      </div>
    </div>
  )
}

export function Timeline({ items }: { items: { title: string; sub: string; time: string }[] }) {
  return (
    <ul className="relative space-y-4 before:absolute before:start-[5px] before:top-2 before:bottom-2 before:w-px before:bg-line">
      {items.map((a, i) => (
        <li key={i} className="relative ps-6">
          <span className="absolute start-0 top-1.5 w-[11px] h-[11px] rounded-full bg-brand border-2 border-white shadow-soft" />
          <p className="text-[13px] font-semibold">{a.title}</p>
          <p className="text-xs text-mut">{a.sub}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{a.time}</p>
        </li>
      ))}
    </ul>
  )
}
