export type LeadStage = 'جديد' | 'تم التواصل' | 'مؤهل' | 'تفاوض' | 'محول' | 'مفقود'
export interface Lead {
  id: string; name: string; company: string; source: string; score: number;
  stage: LeadStage; owner: string; lastFollow: string; createdAt: string; phone: string; email: string; notes: string;
}
export const LEAD_SOURCES = ['الموقع الإلكتروني', 'حملة تسويقية', 'إحالة', 'وسائل التواصل', 'اتصال مباشر', 'معرض تجاري']
export const leads: Lead[] = [
  { id: 'l1', name: 'سلطان الرشيدي', company: 'شركة روافد التقنية', source: 'الموقع الإلكتروني', score: 86, stage: 'مؤهل', owner: 'خالد العتيبي', lastFollow: 'اليوم', createdAt: '2026-09-28', phone: '0571112233', email: 'sultan@rawafed.sa', notes: 'مهتم بباقة الشركات، طلب عرض سعر خلال أسبوع.' },
  { id: 'l2', name: 'جواهر الحربي', company: 'متاجر لمسة', source: 'حملة تسويقية', score: 74, stage: 'تم التواصل', owner: 'نورة القحطاني', lastFollow: 'أمس', createdAt: '2026-09-30', phone: '0572223344', email: 'jawaher@lamsa.sa', notes: 'تفاعلت مع حملة واتساب، تريد تجربة مجانية.' },
  { id: 'l3', name: 'ماجد الغامدي', company: 'مؤسسة البيرق', source: 'إحالة', score: 92, stage: 'تفاوض', owner: 'فهد الشمري', lastFollow: 'قبل ساعتين', createdAt: '2026-09-25', phone: '0573334455', email: 'majed@albayraq.sa', notes: 'إحالة من عميل حالي، جاهزية شرائية عالية.' },
  { id: 'l4', name: 'أروى الشهري', company: 'صالونات أروى', source: 'وسائل التواصل', score: 58, stage: 'جديد', owner: 'لمى الدوسري', lastFollow: 'قبل 3 أيام', createdAt: '2026-10-02', phone: '0574445566', email: 'arwa@salon.sa', notes: 'استفسار عبر إنستغرام عن الأسعار.' },
  { id: 'l5', name: 'فيصل الدوسري', company: 'شركة دروب اللوجستية', source: 'اتصال مباشر', score: 67, stage: 'تم التواصل', owner: 'عبدالله المطيري', lastFollow: 'قبل يومين', createdAt: '2026-09-27', phone: '0575556677', email: 'faisal@doroob.sa', notes: 'يحتاج حل تتبع العملاء لأسطول المبيعات.' },
  { id: 'l6', name: 'دانا العمودي', company: 'مدارس دانا الأهلية', source: 'معرض تجاري', score: 81, stage: 'مؤهل', owner: 'نورة القحطاني', lastFollow: 'اليوم', createdAt: '2026-09-29', phone: '0576667788', email: 'dana@schools.sa', notes: 'قابلناها في المعرض، مهتمة بنظام المتابعة.' },
  { id: 'l7', name: 'راكان العنزي', company: 'مقهى راكان المختص', source: 'الموقع الإلكتروني', score: 44, stage: 'جديد', owner: 'خالد العتيبي', lastFollow: 'قبل 5 أيام', createdAt: '2026-10-01', phone: '0577778899', email: 'rakan@cafe.sa', notes: 'سجل عبر نموذج الموقع، لم يتم التواصل بعد.' },
  { id: 'l8', name: 'شهد المطيري', company: 'عيادة شهد للأسنان', source: 'إحالة', score: 78, stage: 'مؤهل', owner: 'لمى الدوسري', lastFollow: 'أمس', createdAt: '2026-09-26', phone: '0578889900', email: 'shahad@dental.sa', notes: 'تريد نظام تذكير المواعيد عبر واتساب.' },
]
