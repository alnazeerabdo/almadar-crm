import { useMemo, useState } from 'react'
import { Plus, Upload, Download, Eye, Pencil, Trash2, ArrowUpDown, Users, Sparkles, Phone, Mail, Building2, MapPin } from 'lucide-react'
import { PageHeader, SearchInput, StatusBadge, Avatar, Card, Empty, Modal, Drawer, Field, MetricCard, AIInsight, Timeline } from '../components/ui'
import { contacts as seedContacts, OWNERS, type Contact, type ContactStatus } from '../data/contacts'
import { deals } from '../data/deals'
import { tasks } from '../data/tasks'
import { useStore } from '../lib/store'
import { fmtNum, fmtMoney, uid, cx } from '../lib/utils'

const STATUSES: ContactStatus[] = ['نشط', 'جديد', 'غير نشط', 'مهم']
const TYPES = ['شركة', 'فرد'] as const
const PAGE_SIZE = 8

type FormState = { name: string; company: string; phone: string; email: string; owner: string; status: ContactStatus; type: 'شركة' | 'فرد'; city: string }
const emptyForm: FormState = { name: '', company: '', phone: '', email: '', owner: OWNERS[0], status: 'جديد', type: 'شركة', city: 'الرياض' }

export default function Contacts() {
  const { toast } = useStore()
  const [list, setList] = useState<Contact[]>(seedContacts)
  const [query, setQuery] = useState('')
  const [statusF, setStatusF] = useState('الكل')
  const [ownerF, setOwnerF] = useState('الكل')
  const [typeF, setTypeF] = useState('الكل')
  const [sortAsc, setSortAsc] = useState(true)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string[]>([])
  const [bulkOwner, setBulkOwner] = useState(OWNERS[0])

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  const [drawer, setDrawer] = useState<Contact | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})

  const filtered = useMemo(() => {
    const q = query.trim()
    let r = list.filter(c => {
      if (statusF !== 'الكل' && c.status !== statusF) return false
      if (ownerF !== 'الكل' && c.owner !== ownerF) return false
      if (typeF !== 'الكل' && c.type !== typeF) return false
      if (q && !(c.name.includes(q) || c.company.includes(q) || c.email.includes(q) || c.phone.includes(q))) return false
      return true
    })
    r = [...r].sort((a, b) => (sortAsc ? a.name.localeCompare(b.name, 'ar') : b.name.localeCompare(a.name, 'ar')))
    return r
  }, [list, query, statusF, ownerF, typeF, sortAsc])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const cur = Math.min(page, pages)
  const rows = filtered.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE)

  const activeCount = list.filter(c => c.status === 'نشط' || c.status === 'مهم').length

  function resetPage() { setPage(1) }

  function openAdd() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }
  function openEdit(c: Contact) {
    setEditing(c)
    setForm({ name: c.name, company: c.company, phone: c.phone, email: c.email, owner: c.owner, status: c.status, type: c.type, city: c.city })
    setModalOpen(true)
  }
  function saveForm() {
    if (!form.name.trim() || !form.company.trim()) {
      toast({ title: 'أكمل الحقول المطلوبة', desc: 'الاسم والشركة حقلان إلزاميان', kind: 'error' })
      return
    }
    if (editing) {
      setList(p => p.map(c => (c.id === editing.id ? { ...c, ...form } : c)))
      if (drawer?.id === editing.id) setDrawer({ ...editing, ...form })
      toast({ title: 'تم حفظ التعديلات', desc: `تم تحديث بيانات ${form.name}`, kind: 'success' })
    } else {
      const c: Contact = { id: uid('c'), ...form, lastContact: 'الآن', tags: ['جديد'], value: 0, deals: 0 }
      setList(p => [c, ...p])
      toast({ title: 'تمت إضافة العميل', desc: `أُضيف ${c.name} إلى قائمة العملاء`, kind: 'success' })
    }
    setModalOpen(false)
  }
  function remove(id: string) {
    if (!window.confirm('هل أنت متأكد من حذف هذا العميل؟')) return
    setList(p => p.filter(c => c.id !== id))
    setSelected(p => p.filter(s => s !== id))
    if (drawer?.id === id) setDrawer(null)
    toast({ title: 'تم حذف العميل', kind: 'info' })
  }
  function toggleSelect(id: string) {
    setSelected(p => (p.includes(id) ? p.filter(s => s !== id) : [...p, id]))
  }
  function toggleAll() {
    const ids = rows.map(r => r.id)
    const all = ids.every(id => selected.includes(id))
    setSelected(p => (all ? p.filter(s => !ids.includes(s)) : [...new Set([...p, ...ids])]))
  }
  function bulkDelete() {
    if (!window.confirm(`حذف ${selected.length} من العملاء المحددين؟`)) return
    setList(p => p.filter(c => !selected.includes(c.id)))
    toast({ title: `تم حذف ${selected.length} عملاء`, kind: 'info' })
    setSelected([])
  }
  function bulkAssign() {
    setList(p => p.map(c => (selected.includes(c.id) ? { ...c, owner: bulkOwner } : c)))
    toast({ title: 'تم تعيين المسؤول', desc: `أُسند ${selected.length} عملاء إلى ${bulkOwner}`, kind: 'success' })
    setSelected([])
  }

  const drawerDeals = drawer ? deals.filter(d => d.company === drawer.company || d.customer === drawer.name) : []
  const drawerTasks = drawer ? tasks.filter(t => t.contact === drawer.name) : []

  return (
    <div className="page-wrap">
      <PageHeader
        title="العملاء"
        sub={`إدارة قاعدة العملاء — ${fmtNum(list.length)} عميل مسجل`}
        actions={
          <>
            <button className="btn-secondary" onClick={() => toast({ title: 'استيراد العملاء', desc: 'اختر ملف CSV لاستيراد العملاء (عرض تجريبي)', kind: 'info' })}><Upload size={16} /> استيراد</button>
            <button className="btn-secondary" onClick={() => toast({ title: 'تصدير العملاء', desc: `تم تجهيز ملف يضم ${fmtNum(filtered.length)} عميل (عرض تجريبي)`, kind: 'success' })}><Download size={16} /> تصدير</button>
            <button className="btn-primary" onClick={openAdd}><Plus size={16} /> إضافة عميل</button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard label="إجمالي العملاء" value={fmtNum(list.length)} delta={`${fmtNum(activeCount)} عميل نشط`} icon={<Users size={20} />} />
        <MetricCard label="عملاء مهمون" value={fmtNum(list.filter(c => c.status === 'مهم').length)} icon={<Users size={20} />} tone="amber" />
        <MetricCard label="عملاء جدد" value={fmtNum(list.filter(c => c.status === 'جديد').length)} icon={<Plus size={20} />} tone="blue" />
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={query} onChange={v => { setQuery(v); resetPage() }} ph="ابحث بالاسم أو الشركة أو البريد..." />
          <select className="input !w-auto" value={statusF} onChange={e => { setStatusF(e.target.value); resetPage() }}>
            <option value="الكل">كل الحالات</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input !w-auto" value={ownerF} onChange={e => { setOwnerF(e.target.value); resetPage() }}>
            <option value="الكل">كل المسؤولين</option>
            {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <select className="input !w-auto" value={typeF} onChange={e => { setTypeF(e.target.value); resetPage() }}>
            <option value="الكل">كل الأنواع</option>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {selected.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-brand-pale border border-brand-light px-3 py-2">
            <span className="text-[13px] font-bold text-brand-dark">{fmtNum(selected.length)} محدد</span>
            <select className="input !w-auto !py-1.5" value={bulkOwner} onChange={e => setBulkOwner(e.target.value)}>
              {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <button className="btn-secondary !py-1.5" onClick={bulkAssign}>تعيين</button>
            <button className="btn-secondary !py-1.5 !text-red-600 !border-red-200" onClick={bulkDelete}><Trash2 size={14} /> حذف المحدد</button>
            <button className="btn-ghost !py-1.5" onClick={() => setSelected([])}>إلغاء التحديد</button>
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="bg-gray-50 border-b border-line">
              <tr>
                <th className="th w-10"><input type="checkbox" checked={rows.length > 0 && rows.every(r => selected.includes(r.id))} onChange={toggleAll} /></th>
                <th className="th">
                  <button className="inline-flex items-center gap-1 hover:text-ink" onClick={() => setSortAsc(v => !v)}>
                    العميل <ArrowUpDown size={13} />
                  </button>
                </th>
                <th className="th">الشركة</th>
                <th className="th">الهاتف</th>
                <th className="th">البريد</th>
                <th className="th">المسؤول</th>
                <th className="th">آخر تواصل</th>
                <th className="th">الحالة</th>
                <th className="th">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/60 cursor-pointer" onClick={() => setDrawer(c)}>
                  <td className="td" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} /></td>
                  <td className="td">
                    <div className="flex items-center gap-2">
                      <Avatar name={c.name} size={34} />
                      <div><p className="font-bold">{c.name}</p><p className="text-xs text-mut">{c.email}</p></div>
                    </div>
                  </td>
                  <td className="td">{c.company}</td>
                  <td className="td tabular-nums" dir="ltr">{c.phone}</td>
                  <td className="td text-mut">{c.email}</td>
                  <td className="td">{c.owner}</td>
                  <td className="td text-mut">{c.lastContact}</td>
                  <td className="td"><StatusBadge value={c.status} /></td>
                  <td className="td" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button className="btn-ghost !p-2" title="عرض" onClick={() => setDrawer(c)}><Eye size={16} /></button>
                      <button className="btn-ghost !p-2" title="تعديل" onClick={() => openEdit(c)}><Pencil size={16} /></button>
                      <button className="btn-ghost !p-2 !text-red-600" title="حذف" onClick={() => remove(c.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <Empty title="لا توجد نتائج" sub="جرّب تعديل البحث أو الفلاتر" action={<button className="btn-primary" onClick={openAdd}><Plus size={16} /> إضافة عميل</button>} />}
        <div className="flex items-center justify-between px-4 py-3 border-t border-line">
          <p className="text-xs text-mut">صفحة {fmtNum(cur)} من {fmtNum(pages)} — {fmtNum(filtered.length)} نتيجة</p>
          <div className="flex gap-2">
            <button className="btn-secondary !py-1.5" disabled={cur <= 1} onClick={() => setPage(p => p - 1)}>السابق</button>
            <button className="btn-secondary !py-1.5" disabled={cur >= pages} onClick={() => setPage(p => p + 1)}>التالي</button>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'تعديل العميل' : 'إضافة عميل جديد'}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="اسم العميل *"><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="مثال: أحمد محمد" /></Field>
          <Field label="الشركة *"><input className="input" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="اسم الشركة" /></Field>
          <Field label="الهاتف"><input className="input" dir="ltr" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="05xxxxxxxx" /></Field>
          <Field label="البريد الإلكتروني"><input className="input" dir="ltr" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="name@company.sa" /></Field>
          <Field label="المسؤول">
            <select className="input" value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })}>
              {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="الحالة">
            <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as ContactStatus })}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="النوع">
            <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as 'شركة' | 'فرد' })}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="المدينة"><input className="input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="الرياض" /></Field>
        </div>
        <div className="flex gap-2 mt-4">
          <button className="btn-primary flex-1" onClick={saveForm}>{editing ? 'حفظ التعديلات' : 'إضافة العميل'}</button>
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>إلغاء</button>
        </div>
      </Modal>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer ? drawer.name : ''}>
        {drawer && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={drawer.name} size={52} />
              <div className="min-w-0">
                <p className="font-bold text-[16px]">{drawer.name}</p>
                <p className="text-[13px] text-mut flex items-center gap-1"><Building2 size={13} /> {drawer.company}</p>
                <div className="mt-1 flex flex-wrap gap-1"><StatusBadge value={drawer.status} /><span className="badge bg-gray-100 text-gray-600">{drawer.type}</span></div>
              </div>
            </div>

            <Card title="بيانات التواصل">
              <div className="space-y-2 text-[13.5px]">
                <p className="flex items-center gap-2"><Phone size={15} className="text-brand-dark" /> <span dir="ltr" className="tabular-nums">{drawer.phone}</span></p>
                <p className="flex items-center gap-2"><Mail size={15} className="text-brand-dark" /> <span dir="ltr">{drawer.email}</span></p>
                <p className="flex items-center gap-2"><MapPin size={15} className="text-brand-dark" /> {drawer.city} — المسؤول: {drawer.owner}</p>
                <p className="text-mut text-[12.5px]">آخر تواصل: {drawer.lastContact} — القيمة: {fmtMoney(drawer.value)} — الصفقات: {fmtNum(drawer.deals)}</p>
              </div>
            </Card>

            <Card title="الوسوم والحالة">
              <div className="flex flex-wrap gap-1.5">
                {drawer.tags.map(t => <span key={t} className="badge bg-brand-pale text-brand-dark">{t}</span>)}
              </div>
            </Card>

            <Card title="الصفقات المرتبطة" sub={drawerDeals.length ? `${drawerDeals.length} صفقات` : undefined}>
              {drawerDeals.length === 0 ? <p className="text-[13px] text-mut">لا توجد صفقات مرتبطة بهذا العميل.</p> : (
                <div className="space-y-2">
                  {drawerDeals.map(d => (
                    <div key={d.id} className="flex items-center justify-between rounded-xl border border-line px-3 py-2">
                      <div><p className="text-[13px] font-bold">{d.title}</p><p className="text-xs text-mut">{d.stage}</p></div>
                      <span className="text-[13px] font-bold tabular-nums">{fmtMoney(d.value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title="المهام المرتبطة">
              {drawerTasks.length === 0 ? <p className="text-[13px] text-mut">لا توجد مهام مرتبطة.</p> : (
                <div className="space-y-2">
                  {drawerTasks.map(t => (
                    <div key={t.id} className="flex items-center justify-between gap-2 text-[13px]">
                      <span className="font-semibold">{t.title}</span>
                      <StatusBadge value={t.status} />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title="سجل النشاط">
              <Timeline items={[
                { title: 'آخر تواصل مسجل', sub: drawer.lastContact, time: drawer.lastContact },
                { title: 'تم إنشاء ملف العميل', sub: `بواسطة ${drawer.owner}`, time: 'قبل شهر' },
                ...drawerTasks.slice(0, 2).map(t => ({ title: t.title, sub: `${t.owner} — ${t.due}`, time: t.due })),
              ]} />
            </Card>

            <Card title="ملاحظات">
              <textarea
                className={cx('input min-h-[90px]')}
                placeholder="اكتب ملاحظة عن العميل..."
                value={notes[drawer.id] ?? ''}
                onChange={e => setNotes(p => ({ ...p, [drawer.id]: e.target.value }))}
              />
              <button className="btn-secondary mt-2" onClick={() => toast({ title: 'تم حفظ الملاحظة', kind: 'success' })}>حفظ الملاحظة</button>
            </Card>

            <Card title="ملخص ذكي">
              <AIInsight
                icon={<Sparkles size={18} />}
                title="نبذة ذكية عن العميل"
                desc={`${drawer.name} من ${drawer.company} بحالة ${drawer.status}، آخر تواصل ${drawer.lastContact}. لديه ${drawerDeals.length} صفقات مرتبطة بقيمة تقديرية. يُنصح بمتابعة دورية للحفاظ على الزخم.`}
                action="عرض توصيات المتابعة"
              />
            </Card>

            <div className="flex gap-2">
              <button className="btn-primary flex-1" onClick={() => { const c = drawer; setDrawer(null); if (c) openEdit(c) }}><Pencil size={15} /> تعديل</button>
              <button className="btn-secondary !text-red-600 !border-red-200" onClick={() => remove(drawer.id)}><Trash2 size={15} /> حذف</button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
