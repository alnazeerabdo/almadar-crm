export interface Campaign { id: string; name: string; channel: 'بريد إلكتروني' | 'واتساب' | 'رسائل نصية'; audience: number; status: 'نشطة' | 'مجدولة' | 'مكتملة' | 'مسودة'; created: string; openRate: number; clickRate: number }
export const campaigns: Campaign[] = [
  { id: 'k1', name: 'عرض نهاية العام للشركات', channel: 'واتساب', audience: 2400, status: 'نشطة', created: '2026-10-01', openRate: 68, clickRate: 21 },
  { id: 'k2', name: 'الترحيب بالعملاء الجدد', channel: 'بريد إلكتروني', audience: 1850, status: 'نشطة', created: '2026-09-20', openRate: 54, clickRate: 14 },
  { id: 'k3', name: 'تذكير تجديد الاشتراكات', channel: 'رسائل نصية', audience: 960, status: 'مجدولة', created: '2026-10-05', openRate: 0, clickRate: 0 },
  { id: 'k4', name: 'إطلاق ميزة التحليلات الذكية', channel: 'بريد إلكتروني', audience: 3200, status: 'مكتملة', created: '2026-09-10', openRate: 61, clickRate: 18 },
  { id: 'k5', name: 'استطلاع رضا العملاء', channel: 'واتساب', audience: 1200, status: 'مسودة', created: '2026-10-08', openRate: 0, clickRate: 0 },
]
export interface TeamMember { id: string; name: string; email: string; role: string; team: string; clients: number; status: 'نشط' | 'معلق' | 'مدعو' }
export const team: TeamMember[] = [
  { id: 'u1', name: 'خالد العتيبي', email: 'khaled@almadar.sa', role: 'مدير مبيعات', team: 'المبيعات', clients: 48, status: 'نشط' },
  { id: 'u2', name: 'نورة القحطاني', email: 'noura@almadar.sa', role: 'موظفة مبيعات', team: 'المبيعات', clients: 36, status: 'نشط' },
  { id: 'u3', name: 'فهد الشمري', email: 'fahad@almadar.sa', role: 'موظف مبيعات', team: 'المبيعات', clients: 29, status: 'نشط' },
  { id: 'u4', name: 'لمى الدوسري', email: 'lama@almadar.sa', role: 'موظفة دعم', team: 'الدعم', clients: 41, status: 'نشط' },
  { id: 'u5', name: 'عبدالله المطيري', email: 'abdullah@almadar.sa', role: 'محلل تقارير', team: 'التحليلات', clients: 12, status: 'نشط' },
  { id: 'u6', name: 'ريم الحربي', email: 'reem@almadar.sa', role: 'موظفة مبيعات', team: 'المبيعات', clients: 0, status: 'مدعو' },
]
export interface Notification { id: string; title: string; desc: string; time: string; read: boolean; category: 'مهام' | 'صفقات' | 'محادثات' | 'نظام'; link: string }
export const notifications: Notification[] = [
  { id: 'n1', title: 'تم إسناد عميل جديد إليك', desc: 'العميل سلطان الرشيدي — شركة روافد التقنية بانتظار التواصل', time: 'قبل 10 دقائق', read: false, category: 'مهام', link: '/leads' },
  { id: 'n2', title: 'مهمة متأخرة تحتاج مراجعة', desc: 'إرسال عرض محدث لأفق الأعمال تجاوز موعده', time: 'قبل ساعة', read: false, category: 'مهام', link: '/tasks' },
  { id: 'n3', title: 'اقتراب موعد إغلاق صفقة', desc: 'صفقة النخبة للتجارة بقيمة 85,000 ر.س تُغلق خلال 11 يوماً', time: 'قبل 3 ساعات', read: false, category: 'صفقات', link: '/deals' },
  { id: 'n4', title: 'رد جديد من أحد العملاء', desc: 'أحمد محمد رد عبر واتساب: ننتظر العقد النهائي', time: 'قبل 4 ساعات', read: true, category: 'محادثات', link: '/conversations' },
  { id: 'n5', title: 'تقرير الأداء الأسبوعي جاهز', desc: 'تقرير تجريبي يلخص أداء المبيعات والتحويل', time: 'أمس', read: true, category: 'نظام', link: '/reports' },
]
export const salesSeries = [
  { m: 'مايو', v: 210000 }, { m: 'يونيو', v: 245000 }, { m: 'يوليو', v: 228000 },
  { m: 'أغسطس', v: 290000 }, { m: 'سبتمبر', v: 328500 }, { m: 'أكتوبر', v: 186000 },
]
export const funnel = [
  { name: 'عميل محتمل', v: 186 }, { name: 'تم التواصل', v: 132 }, { name: 'مؤهل', v: 88 }, { name: 'عرض سعر', v: 54 }, { name: 'تفاوض', v: 31 }, { name: 'فوز', v: 18 },
]
export const repPerf = [
  { name: 'خالد العتيبي', v: 148000 }, { name: 'نورة القحطاني', v: 96000 }, { name: 'فهد الشمري', v: 72000 }, { name: 'لمى الدوسري', v: 64000 }, { name: 'عبدالله المطيري', v: 38000 },
]
export const leadSourcePerf = [
  { name: 'الموقع', v: 42 }, { name: 'إحالة', v: 35 }, { name: 'حملة', v: 28 }, { name: 'تواصل', v: 19 }, { name: 'مباشر', v: 14 },
]
