import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import {
  Users,
  UserPlus,
  Briefcase,
  TrendingUp,
  Percent,
  ClipboardList,
  Plus,
  Settings2,
  Sparkles,
  AlertTriangle,
  Target,
  Send,
} from 'lucide-react'
import {
  PageHeader,
  MetricCard,
  Card,
  StatusBadge,
  Avatar,
  AIInsight,
  Timeline,
} from '../components/ui'
import { useStore } from '../lib/store'
import { fmtNum, fmtMoney } from '../lib/utils'
import { leads } from '../data/leads'
import { deals, STAGES } from '../data/deals'
import { tasks } from '../data/tasks'
import { salesSeries, repPerf } from '../data/misc'

const RANGES = ['اليوم', 'آخر 7 أيام', 'آخر 30 يوماً', 'هذا الشهر', 'هذا الربع']

export default function Dashboard() {
  const { toast, setQuickOpen } = useStore()
  const nav = useNavigate()
  const [range, setRange] = useState(RANGES[2])
  const [done, setDone] = useState<string[]>(['t6'])
  const [prompt, setPrompt] = useState('')

  function toggleTask(id: string) {
    setDone((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  }

  const stageStats = STAGES.map((s) => {
    const list = deals.filter((d) => d.stage === s)
    return {
      name: s,
      count: list.length,
      total: list.reduce((a, d) => a + d.value, 0),
    }
  })
  const maxStage = Math.max(1, ...stageStats.map((s) => s.count))
  const maxRep = Math.max(1, ...repPerf.map((r) => r.v))
  const recentLeads = leads.slice(0, 5)
  const upcoming = tasks.slice(0, 5)

  function askAi(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim()) {
      toast({ title: 'اكتب سؤالك أولاً للمساعد الذكي', kind: 'info' })
      return
    }
    nav('/ai-assistant')
  }

  return (
    <div className="page-wrap">
      <PageHeader
        title="لوحة التحكم"
        sub="نظرة شاملة على أداء أعمالك اليوم"
        actions={
          <>
            <select
              className="input !w-auto text-[13px] font-semibold"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              aria-label="النطاق الزمني"
            >
              {RANGES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <button className="btn-secondary" onClick={() => toast({ title: 'تم حفظ تخصيص اللوحة', desc: `النطاق الحالي: ${range}`, kind: 'success' })}>
              <Settings2 size={15} />
              تخصيص
            </button>
            <button className="btn-primary" onClick={() => setQuickOpen(true)}>
              <Plus size={15} />
              إضافة جديد
            </button>
          </>
        }
      />

      {/* المؤشرات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <MetricCard label="إجمالي جهات الاتصال" value={fmtNum(2480)} delta="+12% هذا الشهر" icon={<Users size={18} />} tone="green" />
        <MetricCard label="العملاء المحتملون" value={fmtNum(186)} delta="+8 جدد هذا الأسبوع" icon={<UserPlus size={18} />} tone="blue" />
        <MetricCard label="قيمة خط المبيعات" value={fmtMoney(845000)} delta="12 صفقة نشطة" icon={<Briefcase size={18} />} tone="amber" />
        <MetricCard label="مبيعات الشهر" value={fmtMoney(328500)} delta="+13.2% عن الشهر الماضي" icon={<TrendingUp size={18} />} tone="green" />
        <MetricCard label="معدل التحويل" value="24.8%" delta="+2.1% تحسّن" icon={<Percent size={18} />} tone="blue" />
        <MetricCard label="مهام مستحقة" value={fmtNum(12)} delta="3 مهام متأخرة" icon={<ClipboardList size={18} />} tone="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* أداء المبيعات */}
        <Card
          title="أداء المبيعات"
          sub={`إجمالي المبيعات حسب الشهر — ${range}`}
          className="lg:col-span-2"
          action={<span className="badge bg-brand-pale text-brand-dark">آخر 6 أشهر</span>}
        >
          <div className="h-[280px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesSeries} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="m" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#9CA3AF"
                  tickFormatter={(v: number) => `${Math.round(Number(v) / 1000)} ألف`}
                />
                <Tooltip formatter={(v: unknown) => fmtMoney(Number(v))} labelStyle={{ fontWeight: 700 }} />
                <Line type="monotone" dataKey="v" stroke="#16A34A" strokeWidth={2.5} dot={{ r: 3.5, fill: '#16A34A' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* نظرة على خط المبيعات */}
        <Card title="نظرة على خط المبيعات" sub="عدد الصفقات وقيمتها لكل مرحلة" action={<span className="badge bg-gray-100 text-gray-600">{fmtNum(deals.length)} صفقة</span>}>
          <div className="space-y-3">
            {stageStats.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between text-[12.5px] mb-1">
                  <span className="font-bold">{s.name}</span>
                  <span className="text-mut tabular-nums">{s.count} • {fmtMoney(s.total)}</span>
                </div>
                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand transition-all"
                    style={{ width: `${Math.round((s.count / maxStage) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* أحدث العملاء */}
        <Card
          title="أحدث العملاء المحتملين"
          sub="آخر 5 عملاء تمت إضافتهم"
          className="lg:col-span-2"
          action={
            <button className="btn-ghost text-[13px] font-bold" onClick={() => nav('/leads')}>
              عرض الكل ←
            </button>
          }
        >
          <div className="overflow-auto -mx-4 md:-mx-5">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-line">
                  <th className="th">الاسم</th>
                  <th className="th">الشركة</th>
                  <th className="th">المرحلة</th>
                  <th className="th">النقاط</th>
                  <th className="th">المسؤول</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((l) => (
                  <tr key={l.id} className="border-b border-line/60 last:border-0 hover:bg-gray-50/60">
                    <td className="td font-bold">{l.name}</td>
                    <td className="td text-mut">{l.company}</td>
                    <td className="td"><StatusBadge value={l.stage} /></td>
                    <td className="td tabular-nums font-bold text-brand-dark">{l.score}</td>
                    <td className="td">
                      <span className="inline-flex items-center gap-2">
                        <Avatar name={l.owner} size={26} />
                        <span className="text-[13px]">{l.owner}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* المهام القادمة */}
        <Card
          title="المهام القادمة"
          sub="تابع أولويات اليوم وغداً"
          action={
            <button className="btn-ghost text-[13px] font-bold" onClick={() => nav('/tasks')}>
              عرض الكل ←
            </button>
          }
        >
          <ul className="space-y-2.5">
            {upcoming.map((t) => {
              const checked = done.includes(t.id)
              return (
                <li key={t.id} className="flex items-start gap-2.5 p-2.5 rounded-xl border border-line hover:border-brand/40 transition">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTask(t.id)}
                    className="w-4 h-4 mt-1 rounded accent-[#16A34A]"
                    aria-label={t.title}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-[13px] font-bold leading-snug ${checked ? 'line-through text-mut' : ''}`}>{t.title}</p>
                    <p className="text-xs text-mut mt-0.5">{t.contact} • {t.due}</p>
                    <span className="mt-1.5 inline-block"><StatusBadge value={t.priority} /></span>
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>

        {/* النشاط الأخير */}
        <Card title="النشاط الأخير" sub="آخر التحديثات في مساحة العمل">
          <Timeline
            items={[
              { title: 'صفقة جديدة في مرحلة التفاوض', sub: 'عقد إدارة العملاء السنوي — شركة النخبة', time: 'قبل 10 دقائق' },
              { title: 'عميل محتمل مؤهل', sub: 'سلطان الرشيدي — شركة روافد التقنية', time: 'قبل ساعة' },
              { title: 'اكتمال مهمة', sub: 'مراجعة عقد تقنية السحابة', time: 'قبل 3 ساعات' },
              { title: 'رد جديد عبر واتساب', sub: 'أحمد محمد: ننتظر العقد النهائي', time: 'قبل 4 ساعات' },
              { title: 'تقرير الأداء الأسبوعي جاهز', sub: 'ملخص المبيعات والتحويل', time: 'أمس' },
            ]}
          />
        </Card>

        {/* أفضل المندوبين */}
        <Card title="أفضل المندوبين" sub="حسب قيمة المبيعات المحققة">
          <div className="space-y-3">
            {repPerf.map((r, i) => (
              <div key={r.name} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-brand-pale text-brand-dark text-[13px] font-bold flex items-center justify-center shrink-0 tabular-nums">
                  {i + 1}
                </span>
                <Avatar name={r.name} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[13px] mb-1">
                    <span className="font-bold truncate">{r.name}</span>
                    <span className="tabular-nums font-bold text-brand-dark shrink-0">{fmtMoney(r.v)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${Math.round((r.v / maxRep) * 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* رؤى المدار الذكية */}
        <Card
          title="رؤى المدار الذكية"
          sub="توصيات تلقائية مبنية على بياناتك"
          action={<span className="badge bg-brand-pale text-brand-dark">ذكاء اصطناعي</span>}
        >
          <div className="space-y-2.5">
            <AIInsight
              icon={<Sparkles size={17} />}
              title="فرصة إغلاق قريبة"
              desc="صفقة النخبة للتجارة باحتمالية 75% — يُنصح باجتماع إغلاق هذا الأسبوع."
              action="عرض الصفقة"
            />
            <AIInsight
              icon={<AlertTriangle size={17} />}
              title="تنبيه مهام متأخرة"
              desc="3 مهام تجاوزت موعدها منها عرض أفق الأعمال — رتّب المتابعة اليوم."
              action="مراجعة المهام"
            />
            <AIInsight
              icon={<Target size={17} />}
              title="عميل عالي الأولوية"
              desc="ماجد الغامدي بتقييم 92 — إحالة جاهزة للشراء، تواصل خلال ساعتين."
              action="بدء التواصل"
            />
          </div>
          <form onSubmit={askAi} className="flex gap-2 mt-3">
            <input
              className="input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="اسأل المساعد الذكي عن مبيعاتك..."
            />
            <button type="submit" className="btn-primary !px-3.5 shrink-0" aria-label="إرسال">
              <Send size={16} />
            </button>
          </form>
        </Card>
      </div>
    </div>
  )
}
