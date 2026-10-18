import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

export type Toast = { id: string; title: string; desc?: string; kind?: 'success' | 'info' | 'error' }

type Store = {
  toasts: Toast[]
  toast: (t: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
  searchOpen: boolean
  setSearchOpen: (v: boolean) => void
  quickOpen: boolean
  setQuickOpen: (v: boolean) => void
  helpOpen: boolean
  setHelpOpen: (v: boolean) => void
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  mobileNav: boolean
  setMobileNav: (v: boolean) => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)

  const dismiss = useCallback((id: string) => setToasts(p => p.filter(t => t.id !== id)), [])
  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(p => [...p, { ...t, id }])
    setTimeout(() => setToasts(p => p.filter(x => x.id !== id)), 3400)
  }, [])

  const v = useMemo(() => ({ toasts, toast, dismiss, searchOpen, setSearchOpen, quickOpen, setQuickOpen, helpOpen, setHelpOpen, collapsed, setCollapsed, mobileNav, setMobileNav }),
    [toasts, toast, dismiss, searchOpen, quickOpen, helpOpen, collapsed, mobileNav])
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('StoreProvider missing')
  return s
}
