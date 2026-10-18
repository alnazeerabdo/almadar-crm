export type TaskStatus = 'جديدة' | 'قيد التنفيذ' | 'مكتملة' | 'متأخرة'
export type TaskPriority = 'عالية' | 'متوسطة' | 'منخفضة'
export interface Task {
  id: string; title: string; contact: string; deal?: string; owner: string;
  priority: TaskPriority; status: TaskStatus; due: string; type: 'مكالمة' | 'اجتماع' | 'متابعة' | 'بريد إلكتروني' | 'مهمة عامة';
}
export const tasks: Task[] = [
  { id: 't1', title: 'متابعة عرض سعر النخبة للتجارة', contact: 'أحمد محمد', deal: 'عقد إدارة العملاء السنوي', owner: 'خالد العتيبي', priority: 'عالية', status: 'قيد التنفيذ', due: 'اليوم 15:00', type: 'متابعة' },
  { id: 't2', title: 'مكالمة تعريفية مع مدارس المعرفة', contact: 'هند سلطان', owner: 'نورة القحطاني', priority: 'متوسطة', status: 'جديدة', due: 'اليوم 17:30', type: 'مكالمة' },
  { id: 't3', title: 'اجتماع إغلاق مجموعة الريادة', contact: 'ريم عبدالرحمن', deal: 'نظام متابعة الفروع', owner: 'لمى الدوسري', priority: 'عالية', status: 'قيد التنفيذ', due: 'غداً 10:00', type: 'اجتماع' },
  { id: 't4', title: 'إرسال عرض محدث لأفق الأعمال', contact: 'سارة عبدالله', deal: 'باقة الحملات الذكية', owner: 'نورة القحطاني', priority: 'متوسطة', status: 'متأخرة', due: 'أمس', type: 'بريد إلكتروني' },
  { id: 't5', title: 'تجهيز العرض التجريبي لحلول المستقبل', contact: 'محمد خالد', owner: 'فهد الشمري', priority: 'متوسطة', status: 'جديدة', due: 'غداً 13:00', type: 'مهمة عامة' },
  { id: 't6', title: 'مراجعة عقد تقنية السحابة', contact: 'طارق وليد', owner: 'فهد الشمري', priority: 'منخفضة', status: 'مكتملة', due: 'تم', type: 'مهمة عامة' },
  { id: 't7', title: 'متابعة عميل الأفق الذهبي المتأخرة', contact: 'عبدالعزيز سعد', owner: 'خالد العتيبي', priority: 'عالية', status: 'متأخرة', due: 'قبل يومين', type: 'متابعة' },
  { id: 't8', title: 'زيارة مطاعم الديوان', contact: 'كريم عادل', owner: 'عبدالله المطيري', priority: 'متوسطة', status: 'جديدة', due: 'الأحد 11:00', type: 'اجتماع' },
]
export const events = [
  { id: 'e1', title: 'اجتماع إغلاق — النخبة', customer: 'شركة النخبة للتجارة', time: '10:00 - 11:00', day: 'السبت 11', type: 'اجتماع', owner: 'خالد العتيبي', color: '#16A34A' },
  { id: 'e2', title: 'مكالمة تأهيل — متاجر لمسة', customer: 'متاجر لمسة', time: '12:30 - 13:00', day: 'السبت 11', type: 'مكالمة', owner: 'نورة القحطاني', color: '#2563EB' },
  { id: 'e3', title: 'عرض تجريبي — حلول المستقبل', customer: 'شركة حلول المستقبل', time: '15:00 - 16:00', day: 'الأحد 12', type: 'اجتماع', owner: 'فهد الشمري', color: '#16A34A' },
  { id: 'e4', title: 'متابعة واتساب — عيادات الشفاء', customer: 'عيادات الشفاء', time: '09:00', day: 'الاثنين 13', type: 'متابعة', owner: 'لمى الدوسري', color: '#D97706' },
  { id: 'e5', title: 'اجتماع داخلي — مراجعة Pipeline', customer: 'الفريق', time: '14:00 - 15:00', day: 'الاثنين 13', type: 'اجتماع داخلي', owner: 'الكل', color: '#6B7280' },
]
