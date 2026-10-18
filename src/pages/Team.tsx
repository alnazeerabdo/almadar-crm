import { useMemo, useState } from 'react'
import { Check, Clock, Eye, Pencil, Plus, Send, ShieldCheck, Trash2, UserPlus, Users } from 'lucide-react'
import { Avatar, Card, Drawer, Field, MetricCard, Modal, PageHeader, StatusBadge, Timeline } from '../components/ui'
import { useStore } from '../lib/store'
import { cx } from '../lib/utils'
import { team as seedTeam, type TeamMember } from '../data/misc'

const ROLES = ['مالك', 'مدير', 'مبيعات', 'دعم']
const TEAMS = ['المبيعات', 'الدعم', 'التحليلات', 'الإدارة']
const CATS = ['العملاء', 'المحتملون', 'الصفقات', 'المحادثات', 'الحملات', 'التقارير', 'الفريق', 'الإعدادات', 'الذكاء']
const DEFAULT_PERM: Record<string, Record<string, boolean>> = {
  'العملاء': { 'مالك': true, 'مدير': true, 'مبيعات': true, 'دعم': true },
  'المحتملون': { 'مالك': true, 'مدير': true, 'مبيعات': true, 'دعم': false },
  'الصفقات': { 'مالك': true, 'مدير': true, 'مبيعات': true, 'دعم': false },
  'المحادثات': { 'مالك': true, 'مدير': true, 'مبيعات': true, 'دعم': true },
  'الحملات': { 'مالك': true, 'مدير': true, 'مبيعات': false, 'دعم': false },
  'التقارير': { 'مالك': true, 'مدير': true, 'مبيعات': false, 'دعم': false },
  'الفريق': { 'مالك': true, 'مدير': false, 'مبيعات': false, 'دعم': false },
  'الإعدادات': { 'مالك': true, 'مدير': false, 'مبيعات': false, 'دعم': false },
  'الذكاء': { 'مالك': true, 'مدير': true, 'مبيعات': true, 'دعم': true },
}

const emptyForm = { name: '', email: '', role: 'مبيعات', team: 'المبيعات' }

export default function Team() {
  const { toast } = useStore()
  const [members, setMembers] = useState<TeamMember[]>(seedTeam)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('مبيعات')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [profile, setProfile] = useState<TeamMember | null>(null)
  const [perm, setPerm] = useState(DEFAULT_PERM)

  const stats = useMemo(() => ({
    total: members.length,
    active: members.filter(m => m.status === 'نشط').length,
    pending: members.filter(m => m.status !== 'نشط').length,
    teams: new Set(members.map(m => m.team)).size,
  }), [members])

  const openAdd = () => { setEditing(null); setForm(emptyForm); setDrawerOpen(true) }
  const openEdit = (m: TeamMember) => { setEditing(m); setForm({ name: m.name, email: m.email, role: m.role, team: m.team }); setDrawerOpen(true) }

  const saveMember = () => {
    if (!form.name.trim() || !form.email.trim()) { toast({ title: 'بيانات ناقصة', desc: 'أدخل الاسم والبريد الإلكتروني', kind: 'error' }); return }
    if (editing) {
      setMembers(p => p.map(m => m.id === editing.id ? { ...m, ...form } : m))
      toast({ title: 'تم حفظ التعديلات', desc: `تم تحديث بيانات ${form.name} (تجريبي)` })
    } else {
      setMembers(p => [...p, { id: `u-${Date.now()}`, name: form.name, email: form.email, role: form.role, team: form.team, clients: 0, status: 'مدعو' }])
      toast({ title: 'تمت إضافة العضو', desc: `أُرسلت دعوة إلى ${form.email} (تجريبي)` })
    }
    setDrawerOpen(false)
  }

  const sendInvite = () => {
    if (!inviteEmail.trim()) { toast({ title: 'أدخل البريد', desc: 'البريد الإلكتروني مطلوب للدعوة', kind: 'error' }); return }
    setMembers(p => [...p, { id: `u-${Date.now()}`, name: inviteEmail.split('@')[0], email: inviteEmail, role: inviteRole, team: 'المبيعات', clients: 0, status: 'مدعو' }])
    setInviteEmail('')
    setInviteOpen(false)
    toast({ title: 'تم إرسال الدعوة', desc: 'وصلت الدعوة إلى البريد المحدد (تجريبي)' })
  }

  const remove = (id: string) => {
    setMembers(p => p.filter(m => m.id !== id))
    toast({ title: 'تم حذف العضو', desc: 'حُذف العضو من القائمة (تجريبي)' })
  }

  const togglePerm = (cat: string, role: string) =>
    setPerm(p => ({ ...p, [cat]: { ...p[cat], [role]: !p[cat][role] } }))

  return (
    <div className="page-wrap">
      <PageHeader
        title="الفريق والصلاحيات"
        sub="إدارة الأعضاء والأدوار ومصفوفة الصلاحيات — بيانات تجريبية"
        actions={
          <>
            <button className="btn-secondary" onClick={() => setInviteOpen(true)}><Send size={16} /> دعوة عضو</button>
            <button className="btn-primary" onClick={openAdd}><Plus size={16} /> إضافة عضو</button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="إجمالي الأعضاء" value={String(stats.total)} icon={<Users size={18} />} />
        <MetricCard label="أعضاء نشطون" value={String(stats.active)} delta="يعملون حالياً" icon={<UserPlus size={18} />} />
        <MetricCard label="دعوات معلقة" value={String(stats.pending)} delta="بانتظار التفعيل" icon={<Clock size={18} />} tone="amber" />
        <MetricCard label="الفرق" value={String(stats.teams)} icon={<ShieldCheck size={18} />} tone="blue" />
      </div>

      <Card title="أعضاء الفريق" sub={`${members.length} أعضاء في مساحة العمل`}>
        <div className="overflow-auto -mx-4 md:-mx-5 px-4 md:px-5">
          <table className="w-full min-w-[760px]">
            <thead><tr className="border-b border-line">
              <th className="th">الموظف</th><th className="th">البريد</th><th className="th">الدور</th>
              <th className="th">الفريق</th><th className="th">العملاء</th><th className="th">الحالة</th><th className="th">إجراءات</th>
            </tr></thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} className="border-b border-line last:border-0 hover:bg-gray-50/60">
                  <td className="td"><span className="flex items-center gap-2.5"><Avatar name={m.name} size={32} /><span className="font-bold">{m.name}</span></span></td>
                  <td className="td text-mut" dir="ltr">{m.email}</td>
                  <td className="td">{m.role}</td>
                  <td className="td">{m.team}</td>
                  <td className="td tabular-nums">{m.clients}</td>
                  <td className="td"><StatusBadge value={m.status === 'مدعو' ? 'بانتظار الرد' : m.status === 'معلق' ? 'غير نشط' : 'نشط'} /></td>
                  <td className="td">
                    <div className="flex items-center gap-1">
                      <button className="btn-ghost !p-2" title="عرض" onClick={() => setProfile(m)}><Eye size={16} /></button>
                      <button className="btn-ghost !p-2" title="تعديل" onClick={() => openEdit(m)}><Pencil size={16} /></button>
                      <button className="btn-ghost !p-2 hover:!text-red-600" title="حذف" onClick={() => remove(m.id)}><Trash2 size={16} /></button>
                      {m.status === 'مدعو' && (
                        <button className="btn-ghost !p-2" title="إعادة إرسال الدعوة"
                          onClick={() => toast({ title: 'أُعيد إرسال الدعوة', desc: `إلى ${m.email} (تجريبي)` })}><Send size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card
        title="مصفوفة الصلاحيات"
        sub="تحكم بالوصول حسب الدور — الحفظ تجريبي"
        action={<button className="btn-primary !py-2" onClick={() => toast({ title: 'تم حفظ الصلاحيات', desc: 'طُبقت المصفوفة على الأدوار (تجريبي)' })}>حفظ المصفوفة</button>}
      >
        <div className="overflow-auto -mx-4 md:-mx-5 px-4 md:px-5">
          <table className="w-full min-w-[560px]">
            <thead><tr className="border-b border-line">
              <th className="th">الصلاحية</th>
              {ROLES.map(r => <th key={r} className="th text-center">{r}</th>)}
            </tr></thead>
            <tbody>
              {CATS.map(c => (
                <tr key={c} className="border-b border-line last:border-0">
                  <td className="td font-semibold">{c}</td>
                  {ROLES.map(r => (
                    <td key={r} className="td text-center">
                      <button
                        onClick={() => togglePerm(c, r)}
                        aria-label={`${c} ${r}`}
                        className={cx('w-7 h-7 rounded-lg inline-flex items-center justify-center border transition',
                          perm[c]?.[r] ? 'bg-brand border-brand text-white' : 'bg-white border-line text-transparent hover:border-brand')}>
                        <Check size={15} />
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="دعوة عضو جديد">
        <Field label="البريد الإلكتروني"><input className="input" dir="ltr" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="name@company.sa" /></Field>
        <Field label="الدور">
          <select className="input" value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
        </Field>
        <div className="flex gap-2 mt-4">
          <button className="btn-primary flex-1" onClick={sendInvite}><Send size={16} /> إرسال الدعوة</button>
          <button className="btn-secondary" onClick={() => setInviteOpen(false)}>إلغاء</button>
        </div>
        <p className="text-[11px] text-mut mt-3">الدعوات تجريبية ولا تُرسل فعلياً في بيئة العرض.</p>
      </Modal>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? 'تعديل عضو' : 'إضافة عضو'}>
        <Field label="الاسم الكامل"><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="مثال: سارة العتيبي" /></Field>
        <Field label="البريد الإلكتروني"><input className="input" dir="ltr" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="name@company.sa" /></Field>
        <Field label="الدور">
          <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            {['مدير مبيعات', 'موظف مبيعات', 'موظفة مبيعات', 'موظف دعم', 'موظفة دعم', 'محلل تقارير', ...ROLES].map(r => <option key={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="الفريق">
          <select className="input" value={form.team} onChange={e => setForm({ ...form, team: e.target.value })}>
            {TEAMS.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <div className="flex gap-2 mt-4">
          <button className="btn-primary flex-1" onClick={saveMember}>حفظ</button>
          <button className="btn-secondary" onClick={() => setDrawerOpen(false)}>إلغاء</button>
        </div>
      </Drawer>

      <Drawer open={!!profile} onClose={() => setProfile(null)} title="الملف المهني">
        {profile && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar name={profile.name} size={56} />
              <div>
                <p className="font-bold text-lg">{profile.name}</p>
                <p className="text-[13px] text-mut">{profile.role} • فريق {profile.team}</p>
                <p className="text-xs text-mut mt-0.5" dir="ltr">{profile.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[['العملاء', String(profile.clients)], ['الصفقات', '6'], ['المهام', '9']].map(([l, v]) => (
                <div key={l} className="rounded-xl bg-gray-50 border border-line p-3">
                  <p className="text-lg font-bold tabular-nums">{v}</p>
                  <p className="text-[11px] text-mut">{l}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="font-bold text-sm mb-3">النشاط الأخير (تجريبي)</p>
              <Timeline items={[
                { title: 'أغلق صفقة جديدة', sub: 'بقيمة 48,000 ر.س', time: 'قبل يومين' },
                { title: 'أضاف 3 عملاء محتملين', sub: 'من حملة الموقع', time: 'قبل 4 أيام' },
                { title: 'حدّث مرحلة صفقة', sub: 'من عرض سعر إلى تفاوض', time: 'قبل أسبوع' },
              ]} />
            </div>
            <button className="btn-secondary w-full" onClick={() => { if (profile) openEdit(profile); setProfile(null) }}>
              <Pencil size={15} /> تعديل البيانات
            </button>
          </div>
        )}
      </Drawer>
    </div>
  )
}
