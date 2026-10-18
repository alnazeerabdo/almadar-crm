export interface Message { id: string; from: 'عميل' | 'موظف' | 'نظام'; text: string; time: string }
export interface Conversation {
  id: string; customer: string; company: string; channel: 'واتساب' | 'بريد' | 'موقع';
  lastMessage: string; time: string; unread: number; owner: string; status: 'مفتوحة' | 'بانتظار الرد' | 'مغلقة'; messages: Message[];
}
export const conversations: Conversation[] = [
  { id: 'm1', customer: 'أحمد محمد', company: 'شركة النخبة للتجارة', channel: 'واتساب', lastMessage: 'ممتاز، ننتظر العقد النهائي للتوقيع', time: 'قبل 10 دقائق', unread: 2, owner: 'خالد العتيبي', status: 'بانتظار الرد',
    messages: [
      { id: 'a1', from: 'موظف', text: 'أهلاً أستاذ أحمد، أرسلت لك مسودة العقد النهائية مع البنود المتفق عليها.', time: '10:20' },
      { id: 'a2', from: 'عميل', text: 'شكراً، راجعتها مع الإدارة وعندنا استفسار بسيط عن مدة الدعم.', time: '10:35' },
      { id: 'a3', from: 'موظف', text: 'الدعم السنوي مشمول بالكامل مع أولوية الاستجابة خلال 4 ساعات.', time: '10:40' },
      { id: 'a4', from: 'عميل', text: 'ممتاز، ننتظر العقد النهائي للتوقيع', time: '10:52' },
    ] },
  { id: 'm2', customer: 'سارة عبدالله', company: 'مؤسسة أفق الأعمال', channel: 'بريد', lastMessage: 'هل يمكن تعديل موعد العرض التجريبي؟', time: 'قبل ساعة', unread: 1, owner: 'نورة القحطاني', status: 'مفتوحة',
    messages: [
      { id: 'b1', from: 'عميل', text: 'مرحباً، هل يمكن تعديل موعد العرض التجريبي؟', time: '09:10' },
      { id: 'b2', from: 'موظف', text: 'بالتأكيد، ما الوقت المناسب لكم؟', time: '09:20' },
    ] },
  { id: 'm3', customer: 'محمد خالد', company: 'شركة حلول المستقبل', channel: 'موقع', lastMessage: 'شكراً على التوضيح', time: 'أمس', unread: 0, owner: 'فهد الشمري', status: 'مغلقة',
    messages: [{ id: 'c1', from: 'عميل', text: 'شكراً على التوضيح', time: 'أمس' }] },
  { id: 'm4', customer: 'ريم عبدالرحمن', company: 'مجموعة الريادة', channel: 'واتساب', lastMessage: 'تم إرسال المستندات المطلوبة', time: 'قبل 3 ساعات', unread: 0, owner: 'لمى الدوسري', status: 'مفتوحة',
    messages: [{ id: 'd1', from: 'عميل', text: 'تم إرسال المستندات المطلوبة', time: '08:00' }] },
  { id: 'm5', customer: 'هند سلطان', company: 'مدارس المعرفة الأهلية', channel: 'واتساب', lastMessage: 'نريد تجربة نظام التذكير أولاً', time: 'قبل يوم', unread: 3, owner: 'نورة القحطاني', status: 'بانتظار الرد',
    messages: [{ id: 'e1', from: 'عميل', text: 'نريد تجربة نظام التذكير أولاً', time: 'أمس' }] },
]
