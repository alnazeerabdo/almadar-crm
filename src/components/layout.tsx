import React from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserPlus, KanbanSquare, HandCoins, MessagesSquare, ListChecks,
  CalendarDays, Megaphone, Sparkles, BarChart3, ShieldCheck, Settings as SettingsIcon,
  Search, Bell, Plus, Menu, X, ChevronDown, LifeBuoy, ChevronsRight, CircleHelp,
} from 'lucide-react'
import { Logo, Avatar } from './ui'
import { useStore } from '../lib/store'
import { cx } from '../lib/utils'
import { GlobalSearch, QuickCreate, HelpPanel, Toasts } from './overlays'

const NAV: { group?: string; items: { to: string; label: string; icon: React.ReactNode }[] }[] = [
  { items: [
    { to: '/dashboard', label: 'الرئيسية', icon: <LayoutDashboard size={19} /> },
  ]},
  { group: 'إدارة العلاقات', items: [
    { to: '/contacts', label: 'العملاء', icon: <Users size={19} /> },
    { to: '/leads', label: 'العملاء المحتملون', icon: <UserPlus size={19} /> },
    { to: '/deals', label: 'الصفقات', icon: <HandCoins size={19} /> },
    { to: '/pipeline', label: 'مسار المبيعات', icon: <KanbanSquare size={19} /> },
    { to: '/conversations', label: 'المحادثات', icon: <MessagesSquare size={19} /> },
  ]},
  { group: 'التنظيم والنمو', items: [
    { to: '/tasks', label: 'المهام والأنشطة', icon: <ListChecks size={19} /> },
    { to: '/calendar', label: 'التقويم', icon: <CalendarDays size={19} /> },
    { to: '/campaigns', label: 'الحملات التسويقية', icon: <Megaphone size={19} /> },
    { to: '/ai-assistant', label: 'مساعد المدار الذكي', icon: <Sparkles size={19} /> },
    { to: '/reports', label: 'التقارير والتحليلات', icon: <BarChart3 size={19} /> },
  ]},
  { group: 'الإدارة', items: [
    { to: '/team', label: 'الفريق والصلاحيات', icon: <ShieldCheck size={19} /> },
    { to: '/settings', label: 'الإعدادات', icon: <SettingsIcon size={19} /> },
  ]},
]

const CRUMBS: Record<string, string[]> = {
  '/dashboard': ['الرئيسية', 'لوحة التحكم'], '/contacts': ['الرئيسية', 'العملاء'],
  '/leads': ['الرئيسية', 'العملاء المحتملون'], '/deals': ['الرئيسية', 'الصفقات'],
  '/pipeline': ['الرئيسية', 'مسار المبيعات'], '/conversations': ['الرئيسية', 'المحادثات'],
  '/tasks': ['الرئيسية', 'المهام والأنشطة'], '/calendar': ['الرئيسية', 'التقويم'],
  '/campaigns': ['الرئيسية', 'الحملات التسويقية'], '/ai-assistant': ['الرئيسية', 'مساعد المدار الذكي'],
  '/reports': ['الرئيسية', 'التقارير والتحليلات'], '/team': ['الرئيسية', 'الفريق والصلاحيات'],
  '/settings': ['الرئيسية', 'الإعدادات'], '/notifications': ['الرئيسية', 'الإشعارات'],
  '/profile': ['الرئيسية', 'الملف الشخصي'], '/help': ['الرئيسية', 'المساعدة'],
}

export function Sidebar() {
  const { collapsed, setCollapsed, mobileNav, setMobileNav } = useStore()
  const body = (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        {!collapsed && <Logo />}
        {collapsed && (
          <svg width={32} height={32} viewBox="0 0 40 40"><circle cx="20" cy="20" r="15.5" stroke="#16A34A" strokeWidth="3.4" /><circle cx="20" cy="20" r="6" fill="#16A34A" /><circle cx="31.5" cy="11" r="3.2" fill="#15803D" /></svg>
        )}
        <button className="btn-ghost !p-1.5 hidden lg:inline-flex" onClick={() => setCollapsed(!collapsed)} title="طي القائمة">
          <ChevronsRight size={17} className={cx('transition', !collapsed && 'rotate-180')} />
        </button>
      </div>
      {!collapsed && (
        <div className="mx-4 mb-3 p-2.5 rounded-xl bg-bgmain border border-line flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center font-bold text-sm">م</span>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-bold truncate">شركة الأفق الحديث</p>
            <p className="text-[11px] text-mut">مساحة العمل الحالية</p>
          </div>
          <ChevronDown size={15} className="text-mut" />
        </div>
      )}
      <nav className="flex-1 overflow-auto px-3 pb-3 space-y-4">
        {NAV.map((g, gi) => (
          <div key={gi}>
            {g.group && !collapsed && <p className="px-3 mb-1.5 text-[11px] font-bold text-gray-400">{g.group}</p>}
            <div className="space-y-0.5">
              {g.items.map(it => (
                <NavLink key={it.to} to={it.to} onClick={() => setMobileNav(false)}
                  className={({ isActive }) => cx('navlink', isActive && 'navlink-active', collapsed && 'justify-center px-2')}>
                  <span className="shrink-0">{it.icon}</span>
                  {!collapsed && <span className="truncate">{it.label}</span>}
                  {!collapsed && it.to === '/ai-assistant' && <span className="ms-auto text-[10px] font-bold bg-brand text-white rounded-full px-2 py-0.5">جديد</span>}
                </NavLink>
              ))}
            </div>
            {gi < NAV.length - 1 && !collapsed && <div className="mx-3 mt-3 border-t border-line" />}
          </div>
        ))}
      </nav>
      <div className="border-t border-line p-3 space-y-1">
        {!collapsed && (
          <button className="navlink"><LifeBuoy size={19} /><span>المساعدة والدعم</span></button>
        )}
        <div className={cx('flex items-center gap-2.5 rounded-xl p-2 hover:bg-gray-50', collapsed && 'justify-center')}>
          <Avatar name="سارة المدير" size={34} />
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold truncate">سارة المدير</p>
                <p className="text-[11px] text-mut truncate">مديرة المبيعات</p>
              </div>
              <ChevronDown size={15} className="text-mut" />
            </>
          )}
        </div>
      </div>
    </div>
  )
  return (
    <>
      <aside className={cx('hidden lg:flex flex-col bg-white border-s-0 border-e border-line h-screen sticky top-0 shrink-0 transition-all', collapsed ? 'w-[76px]' : 'w-[264px]')}>{body}</aside>
      {mobileNav && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNav(false)} />
          <aside className="absolute inset-y-0 end-0 w-[280px] bg-white shadow-pop flex flex-col">
            <div className="flex justify-end p-2"><button className="btn-ghost !p-2" onClick={() => setMobileNav(false)}><X size={18} /></button></div>
            <div className="flex-1 overflow-hidden">{body}</div>
          </aside>
        </div>
      )}
    </>
  )
}

export function Header() {
  const { setSearchOpen, setQuickOpen, setHelpOpen, setMobileNav } = useStore()
  const loc = useLocation()
  const nav = useNavigate()
  const crumbs = CRUMBS[loc.pathname] ?? ['الرئيسية']
  React.useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [setSearchOpen])
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-line">
      <div className="flex items-center gap-2 px-4 md:px-6 h-[62px]">
        <button className="btn-ghost !p-2 lg:hidden" onClick={() => setMobileNav(true)}><Menu size={20} /></button>
        <nav className="hidden md:flex items-center gap-1.5 text-[12.5px] text-mut whitespace-nowrap">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-gray-300">/</span>}
              <span className={i === crumbs.length - 1 ? 'font-bold text-ink' : ''}>{c}</span>
            </span>
          ))}
        </nav>
        <div className="flex-1" />
        <button onClick={() => setSearchOpen(true)} className="hidden sm:flex items-center gap-2 bg-bgmain border border-line rounded-xl px-3 py-2 text-[13px] text-gray-400 w-64 hover:border-brand transition">
          <Search size={16} /><span className="flex-1 text-start">بحث في العملاء والصفقات...</span>
          <kbd className="text-[10.5px] bg-white border border-line rounded-md px-1.5 py-0.5 font-bold">Ctrl K</kbd>
        </button>
        <button className="btn-ghost !p-2 sm:hidden" onClick={() => setSearchOpen(true)}><Search size={19} /></button>
        <button onClick={() => setQuickOpen(true)} className="btn-primary !py-2"><Plus size={17} /><span className="hidden md:inline">إضافة جديد</span></button>
        <button onClick={() => nav('/ai-assistant')} title="مساعد المدار الذكي" className="w-9 h-9 rounded-xl bg-brand-pale text-brand-dark flex items-center justify-center hover:bg-brand-light transition"><Sparkles size={18} /></button>
        <button onClick={() => nav('/notifications')} className="relative w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-slate2 transition">
          <Bell size={19} /><span className="absolute top-1.5 end-1.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
        </button>
        <button onClick={() => setHelpOpen(true)} className="hidden md:flex w-9 h-9 rounded-xl hover:bg-gray-100 items-center justify-center text-slate2"><CircleHelp size={19} /></button>
        <button onClick={() => nav('/profile')}><Avatar name="سارة المدير" size={34} /></button>
      </div>
    </header>
  )
}

export function AppLayout() {
  return (
    <div className="min-h-screen flex" dir="rtl">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header />
        <main className="flex-1 min-w-0"><Outlet /></main>
      </div>
      <GlobalSearch />
      <QuickCreate />
      <HelpPanel />
      <Toasts />
    </div>
  )
}
