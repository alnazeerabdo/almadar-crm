export const STAGES = ['عميل محتمل', 'تم التواصل', 'مؤهل', 'عرض سعر', 'تفاوض', 'تم الفوز', 'تم الخسارة'] as const
export type Stage = typeof STAGES[number]
export interface Deal {
  id: string; title: string; customer: string; company: string; value: number;
  closeDate: string; owner: string; stage: Stage; priority: 'عالية' | 'متوسطة' | 'منخفضة';
  probability: number; nextActivity: string;
}
export const deals: Deal[] = [
  { id: 'd1', title: 'عقد إدارة العملاء السنوي', customer: 'أحمد محمد', company: 'شركة النخبة للتجارة', value: 85000, closeDate: '2026-10-20', owner: 'خالد العتيبي', stage: 'تفاوض', priority: 'عالية', probability: 75, nextActivity: 'اجتماع إغلاق الخميس' },
  { id: 'd2', title: 'باقة الحملات الذكية', customer: 'سارة عبدالله', company: 'مؤسسة أفق الأعمال', value: 42000, closeDate: '2026-10-15', owner: 'نورة القحطاني', stage: 'عرض سعر', priority: 'متوسطة', probability: 55, nextActivity: 'إرسال عرض محدث' },
  { id: 'd3', title: 'تكامل المتجر الإلكتروني', customer: 'محمد خالد', company: 'شركة حلول المستقبل', value: 64000, closeDate: '2026-11-02', owner: 'فهد الشمري', stage: 'مؤهل', priority: 'متوسطة', probability: 40, nextActivity: 'عرض تجريبي' },
  { id: 'd4', title: 'نظام متابعة الفروع', customer: 'ريم عبدالرحمن', company: 'مجموعة الريادة', value: 120000, closeDate: '2026-10-28', owner: 'لمى الدوسري', stage: 'تفاوض', priority: 'عالية', probability: 70, nextActivity: 'مراجعة الشروط' },
  { id: 'd5', title: 'اشتراك تجريبي — تعليم', customer: 'هند سلطان', company: 'مدارس المعرفة الأهلية', value: 36000, closeDate: '2026-10-12', owner: 'نورة القحطاني', stage: 'تم التواصل', priority: 'منخفضة', probability: 25, nextActivity: 'مكالمة تعريفية' },
  { id: 'd6', title: 'أتمتة واتساب للعيادات', customer: 'مها ناصر', company: 'عيادات الشفاء', value: 58000, closeDate: '2026-11-10', owner: 'خالد العتيبي', stage: 'عميل محتمل', priority: 'متوسطة', probability: 15, nextActivity: 'تأهيل أولي' },
  { id: 'd7', title: 'لوحة تحليلات المبيعات', customer: 'يوسف إبراهيم', company: 'مؤسسة البناء الحديث', value: 95000, closeDate: '2026-10-25', owner: 'عبدالله المطيري', stage: 'عرض سعر', priority: 'عالية', probability: 60, nextActivity: 'اجتماع تقني' },
  { id: 'd8', title: 'عقد دعم سنوي', customer: 'طارق وليد', company: 'تقنية السحابة', value: 48000, closeDate: '2026-09-30', owner: 'فهد الشمري', stage: 'تم الفوز', priority: 'متوسطة', probability: 100, nextActivity: '—' },
  { id: 'd9', title: 'حملة إطلاق منتج', customer: 'لينا عمر', company: 'شركة زهرة للتجميل', value: 25000, closeDate: '2026-09-28', owner: 'لمى الدوسري', stage: 'تم الخسارة', priority: 'منخفضة', probability: 0, nextActivity: '—' },
  { id: 'd10', title: 'نظام الحجوزات الذكي', customer: 'كريم عادل', company: 'مطاعم الديوان', value: 52000, closeDate: '2026-11-05', owner: 'عبدالله المطيري', stage: 'مؤهل', priority: 'متوسطة', probability: 45, nextActivity: 'زيارة ميدانية' },
  { id: 'd11', title: 'توسعة رخص الفريق', customer: 'عبدالعزيز سعد', company: 'شركة الأفق الذهبي', value: 31000, closeDate: '2026-10-18', owner: 'خالد العتيبي', stage: 'تم التواصل', priority: 'منخفضة', probability: 30, nextActivity: 'متابعة بريدية' },
  { id: 'd12', title: 'باقة النمو الشامل', customer: 'نوف فهد', company: 'دار الإبداع للتصميم', value: 27000, closeDate: '2026-10-14', owner: 'نورة القحطاني', stage: 'عميل محتمل', priority: 'منخفضة', probability: 20, nextActivity: 'مكالمة تأهيل' },
]
