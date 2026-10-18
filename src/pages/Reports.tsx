import { useMemo, useState } from 'react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { Download, GitBranch, Scale, Sparkles, Target, Timer, TrendingUp, Users, Wallet } from 'lucide-react'
import { AIInsight, Card, MetricCard, PageHeader, Tabs } from '../components/ui'
import { useStore } from '../lib/store'
import { funnel, leadSourcePerf, repPerf, salesSeries } from '../data/misc'

const RANGES = ['آخر 7 أيام', 'آخر 30 يوم', 'آخر 90 يوم', 'آخر 12 شهر'] as const
const FACTOR: Record<string, number> = { 'آخر 7 أيام': 0.25, 'آخر 30 يوم': 1, 'آخر 90 يوم': 2.6, 'آخر 12 شهر': 9.5 }
const REPORT_TABS = ['المبيعات', 'الصفقات', 'العملاء', 'التسويق']
const EMPLOYEES = ['الكل', ...repPerf.map(r => r.name)]
const PIE_COLORS = ['#16A34A', '#2563EB', '#D97706', '#8B5CF6', '#0D9488']

export default function Reports() {
  const { toast } = useStore()
  const [range, setRange] = useState<string>('آخر 30 يوم')
  const [employee, setEmployee] = useState('الكل')
  const [compare, setCompare] = useState(true)
  const [tab, setTab] = useState(REPORT_TABS[0])
  const factor = FACTOR[range] ?? 1

  const scaledSales = useMemo(() => salesSeries.map(s => ({ m: s.m, v: Math.round(s.v * factor) })), [factor])
  const scaledRep = useMemo(() => {
    const base = employee === 'الكل' ? repPerf : repPerf.filter(r => r.name === employee)
    return base.map(r => ({ name: r.name.split(' ')[0], full: r.name, v: Math.round(r.v * factor) }))
  }, [factor, employee])
  const scaledFunnel = useMemo(() => funnel.map(f => ({ name: f.name, v: Math.round(f.v * (factor > 1 ? 1 + (factor - 1) / 4 : factor)) })), [factor])
  const scaledSources = useMemo(() => leadSourcePerf.map(s => ({ name: s.name, v: Math.round(s.v * factor) })), [factor])
  const acquisition = useMemo(() => salesSeries.map((s, i) => ({ m: s.m, v: Math.round((18 + i * 7) * (factor > 1 ? 1 + (factor - 1) / 5 : factor)) })), [factor])
  const pieData = useMemo(() => [
    { name: 'تم الفوز', value: Math.max(4, Math.round(18 * factor)) },
    { name: 'تفاوض', value: Math.max(6, Math.round(31 * factor)) },
    { name: 'عرض سعر', value: Math.max(8, Math.round(54 * factor)) },
    { name: 'مؤهل', value: Math.max(10, Math.round(88 * factor)) },
  ], [factor])

  const money = (n: number) => `${n.toLocaleString('en-US')} ر.س`

  return (
    <div className="page-wrap">
      <PageHeader
        title="التقارير والتحليلات"
        sub="بيانات تجريبية للعرض — تتغير القيم بتغير الفلاتر لأغراض التوضيح"
        actions={
          <button className="btn-primary" onClick={() => toast({ title: 'تم تجهيز التصدير', desc: 'سيصلك ملف التقرير قريباً (تجريبي)' })}>
            <Download size={16} /> تصدير التقرير
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <MetricCard label="إجمالي المبيعات" value={money(Math.round(328500 * factor))} delta={compare ? '+12.4% عن الفترة السابقة' : undefined} icon={<Wallet size={18} />} />
        <MetricCard label="الصفقات المفتوحة" value={money(Math.round(845000 * factor))} delta={compare ? '+8.1% عن الفترة السابقة' : undefined} icon={<GitBranch size={18} />} tone="blue" />
        <MetricCard label="معدل الفوز" value="64%" delta={compare ? '+3.2 نقطة عن الفترة السابقة' : undefined} icon={<Target size={18} />} />
        <MetricCard label="متوسط قيمة الصفقة" value={money(Math.round(58000 * (1 + (factor - 1) / 8)))} icon={<Scale size={18} />} tone="amber" />
        <MetricCard label="دورة البيع" value="21 يوم" delta="−2 يوم تحسن" icon={<Timer size={18} />} tone="blue" />
        <MetricCard label="معدل التحويل" value="24.8%" delta={compare ? '+1.6 نقطة عن الفترة السابقة' : undefined} icon={<TrendingUp size={18} />} />
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="label !mb-0">الفترة:</span>
          <select className="input !w-auto" value={range} onChange={e => setRange(e.target.value)}>
            {RANGES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="label !mb-0">الموظف:</span>
          <select className="input !w-auto" value={employee} onChange={e => setEmployee(e.target.value)}>
            {EMPLOYEES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 text-[13px] font-semibold cursor-pointer select-none">
          <button
            role="switch" aria-checked={compare} onClick={() => setCompare(c => !c)}
            className={`w-10 h-6 rounded-full transition relative ${compare ? 'bg-brand' : 'bg-gray-300'}`}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${compare ? 'start-[18px]' : 'start-0.5'}`} />
          </button>
          مقارنة بالفترة السابقة
        </label>
        <div className="ms-auto"><Tabs tabs={REPORT_TABS} value={tab} onChange={setTab} /></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="تطور المبيعات" sub={`حسب الفترة: ${range} (تجريبي)`}>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scaledSales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="m" tick={{ fontSize: 12 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} width={70} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v) => [`${Number(v).toLocaleString('en-US')} ر.س`, 'المبيعات']} />
                <Line type="monotone" dataKey="v" stroke="#16A34A" strokeWidth={2.5} dot={{ r: 3, fill: '#16A34A' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="الإيراد حسب المندوب" sub={employee === 'الكل' ? 'كل الفريق (تجريبي)' : employee}>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scaledRep}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} width={70} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v) => [`${Number(v).toLocaleString('en-US')} ر.س`, 'الإيراد']} />
                <Bar dataKey="v" fill="#16A34A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="قمع المبيعات" sub="عدد الصفقات في كل مرحلة (تجريبي)">
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scaledFunnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} tickLine={false} width={80} />
                <Tooltip />
                <Bar dataKey="v" fill="#15803D" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="توزيع مراحل الصفقات" sub="نسب المراحل النشطة (تجريبي)">
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="أداء مصادر العملاء" sub="عدد العملاء لكل مصدر (تجريبي)">
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scaledSources}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} width={40} />
                <Tooltip />
                <Bar dataKey="v" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="اكتساب العملاء شهرياً" sub="عملاء جدد كل شهر (تجريبي)">
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={acquisition}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="m" tick={{ fontSize: 12 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} width={40} />
                <Tooltip />
                <Area type="monotone" dataKey="v" stroke="#16A34A" fill="#16A34A" fillOpacity={0.18} strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="تحليل المدار الذكي" sub="ملاحظات تجريبية مولدة من بيانات العرض" action={<span className="badge bg-brand-pale text-brand-dark">تجريبي</span>}>
        <div className="grid md:grid-cols-2 gap-3">
          <AIInsight icon={<TrendingUp size={16} />} title="نمو قوي في سبتمبر" desc="المبيعات بلغت 328,500 ر.س وهي الأعلى في 6 أشهر. الزخم مدفوع بصفقتي النخبة والريادة في مرحلة التفاوض." action="عرض التفاصيل" />
          <AIInsight icon={<Users size={16} />} title="تركز الأداء على مندوبين" desc="خالد ونورة يحققان معاً 63% من الإيراد. وزّع الصفقات الجديدة على فهد ولمى لرفع طاقة الفريق." action="إعادة التوزيع" />
          <AIInsight icon={<Target size={16} />} title="تسرب في منتصف القمع" desc="الانتقال من «مؤهل» إلى «عرض سعر» يفقد 39% من الصفقات. راجع جودة التأهيل وسرعة إرسال العروض." action="تحسين القمع" />
          <AIInsight icon={<Sparkles size={16} />} title="الإحالات الأعلى تحويلاً" desc="رغم أن الموقع يجلب أكبر عدد، الإحالات تتحول بمعدل أعلى. أطلق برنامج إحالة بمكافآت هذا الشهر." action="إنشاء حملة" />
        </div>
      </Card>
    </div>
  )
}
