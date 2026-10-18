export type ContactStatus = 'نشط' | 'جديد' | 'غير نشط' | 'مهم'
export interface Contact {
  id: string; name: string; company: string; phone: string; email: string;
  owner: string; lastContact: string; status: ContactStatus; type: 'شركة' | 'فرد';
  city: string; tags: string[]; value: number; deals: number;
}
export const OWNERS = ['خالد العتيبي', 'نورة القحطاني', 'فهد الشمري', 'لمى الدوسري', 'عبدالله المطيري']
export const contacts: Contact[] = [
  { id: 'c1', name: 'أحمد محمد', company: 'شركة النخبة للتجارة', phone: '0551234567', email: 'ahmed@nokhba.com', owner: 'خالد العتيبي', lastContact: 'قبل ساعتين', status: 'مهم', type: 'شركة', city: 'الرياض', tags: ['عميل دائم', 'أولوية عالية'], value: 185000, deals: 3 },
  { id: 'c2', name: 'سارة عبدالله', company: 'مؤسسة أفق الأعمال', phone: '0552345678', email: 'sara@ofoq.sa', owner: 'نورة القحطاني', lastContact: 'أمس', status: 'نشط', type: 'شركة', city: 'جدة', tags: ['جديد'], value: 92000, deals: 2 },
  { id: 'c3', name: 'محمد خالد', company: 'شركة حلول المستقبل', phone: '0553456789', email: 'm.khaled@future.sa', owner: 'فهد الشمري', lastContact: 'قبل 3 أيام', status: 'نشط', type: 'شركة', city: 'الدمام', tags: ['تقنية'], value: 64000, deals: 1 },
  { id: 'c4', name: 'ريم عبدالرحمن', company: 'مجموعة الريادة', phone: '0554567890', email: 'reem@riyada.sa', owner: 'لمى الدوسري', lastContact: 'قبل يومين', status: 'نشط', type: 'شركة', city: 'الرياض', tags: ['VIP'], value: 210000, deals: 4 },
  { id: 'c5', name: 'عبدالعزيز سعد', company: 'شركة الأفق الذهبي', phone: '0555678901', email: 'a.saad@goldenhorizon.sa', owner: 'خالد العتيبي', lastContact: 'قبل أسبوع', status: 'غير نشط', type: 'شركة', city: 'مكة', tags: ['يحتاج متابعة'], value: 38000, deals: 1 },
  { id: 'c6', name: 'نوف فهد', company: 'دار الإبداع للتصميم', phone: '0556789012', email: 'nouf@ibdaa.sa', owner: 'نورة القحطاني', lastContact: 'قبل 5 ساعات', status: 'جديد', type: 'فرد', city: 'الرياض', tags: ['جديد'], value: 27000, deals: 1 },
  { id: 'c7', name: 'يوسف إبراهيم', company: 'مؤسسة البناء الحديث', phone: '0557890123', email: 'y.ibrahim@modernbuild.sa', owner: 'عبدالله المطيري', lastContact: 'قبل 4 أيام', status: 'نشط', type: 'شركة', city: 'الخبر', tags: ['مقاولات'], value: 150000, deals: 2 },
  { id: 'c8', name: 'لينا عمر', company: 'شركة زهرة للتجميل', phone: '0558901234', email: 'lina@zahra.sa', owner: 'لمى الدوسري', lastContact: 'أمس', status: 'نشط', type: 'شركة', city: 'جدة', tags: ['تجزئة'], value: 45000, deals: 1 },
  { id: 'c9', name: 'طارق وليد', company: 'تقنية السحابة', phone: '0559012345', email: 't.waleed@cloudtech.sa', owner: 'فهد الشمري', lastContact: 'قبل 6 أيام', status: 'غير نشط', type: 'شركة', city: 'الرياض', tags: ['تقنية'], value: 78000, deals: 2 },
  { id: 'c10', name: 'هند سلطان', company: 'مدارس المعرفة الأهلية', phone: '0560123456', email: 'hind@knowledge.edu.sa', owner: 'نورة القحطاني', lastContact: 'قبل 3 ساعات', status: 'مهم', type: 'شركة', city: 'الرياض', tags: ['تعليم', 'أولوية عالية'], value: 132000, deals: 2 },
  { id: 'c11', name: 'كريم عادل', company: 'مطاعم الديوان', phone: '0561234567', email: 'karim@diwan.sa', owner: 'عبدالله المطيري', lastContact: 'قبل يومين', status: 'نشط', type: 'شركة', city: 'الدمام', tags: ['ضيافة'], value: 52000, deals: 1 },
  { id: 'c12', name: 'مها ناصر', company: 'عيادات الشفاء', phone: '0562345678', email: 'maha@shifa.sa', owner: 'خالد العتيبي', lastContact: 'قبل أسبوعين', status: 'غير نشط', type: 'شركة', city: 'جدة', tags: ['صحة'], value: 96000, deals: 2 },
]
