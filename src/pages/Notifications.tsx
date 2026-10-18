import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, Briefcase, CheckCheck, CheckSquare, MessageSquare, Settings2 } from 'lucide-react'
import { Empty, PageHeader, Tabs } from '../components/ui'
import { useStore } from '../lib/store'
import { cx } from '../lib/utils'
import { notifications as seed, type Notification } from '../data/misc'

const TABS = ['الكل', 'غير المقروءة', 'مهام', 'صفقات', 'محادثات', 'نظام']

const ICONS: Record<Notification['category'], ReactNode> = {
  'مهام': <CheckSquare size={17} />,
  'صفقات': <Briefcase size={17} />,
  'محادثات': <MessageSquare size={17} />,
  'نظام': <Bell size={17} />,
}

export default function Notifications() {
  const { toast } = useStore()
  const navigate = useNavigate()
  const [items, setItems] = useState<Notification[]>(seed)
  const [tab, setTab] = useState('الكل')

  const unread = useMemo(() => items.filter(n => !n.read).length, [items])
  const filtered = useMemo(() => {
    if (tab === 'الكل') return items
    if (tab === 'غير المقروءة') return items.filter(n => !n.read)
    return items.filter(n => n.category === tab)
  }, [items, tab])

  const markRead = (id: string) => setItems(p => p.map(n => n.id === id ? { ...n, read: true } : n))
  const markAll = () => {
    setItems(p => p.map(n => ({ ...n, read: true })))
    toast({ title: 'تم تعليم الكل كمقروء', desc: 'لا توجد إشعارات غير مقروءة الآن' })
  }

  return (
    <div className="page-wrap max-w-[900px]">
      <PageHeader
        title="الإشعارات"
        sub={unread > 0 ? `لديك ${unread} إشعارات غير مقروءة` : 'كل إشعاراتك مقروءة — أحسنت'}
        actions={
          <>
            <span className="badge bg-brand-pale text-brand-dark tabular-nums">{unread} غير مقروءة</span>
            <button className="btn-secondary" onClick={() => navigate('/settings')}><Settings2 size={15} /> تفضيلات الإشعارات</button>
            <button className="btn-primary" onClick={markAll} disabled={unread === 0}><CheckCheck size={16} /> تعليم الكل كمقروء</button>
          </>
        }
      />

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      <div className="space-y-2.5">
        {filtered.length === 0 && (
          <div className="card"><Empty title="لا توجد إشعارات" sub="لا عناصر مطابقة لهذا التبويب حالياً" /></div>
        )}
        {filtered.map(n => (
          <div key={n.id} className={cx('card p-4 flex gap-3 items-start transition', !n.read && 'border-brand-light bg-brand-pale/20')}>
            <span className={cx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
              !n.read ? 'bg-brand text-white' : 'bg-gray-100 text-mut')}>{ICONS[n.category]}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[13.5px] font-bold">{n.title}</p>
                {!n.read && <span className="w-2 h-2 rounded-full bg-brand shrink-0" />}
                <span className="badge bg-gray-100 text-gray-600 ms-auto">{n.category}</span>
              </div>
              <p className="text-[13px] text-mut mt-1 leading-relaxed">{n.desc}</p>
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                <span className="text-[11.5px] text-gray-400">{n.time}</span>
                <button onClick={() => navigate(n.link)}
                  className="text-xs font-bold text-brand-dark hover:underline inline-flex items-center gap-1">
                  الانتقال <ArrowLeft size={13} />
                </button>
                {!n.read && (
                  <button onClick={() => markRead(n.id)} className="text-xs font-bold text-mut hover:text-ink hover:underline">
                    تعليم كمقروء
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
