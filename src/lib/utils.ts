export const fmtNum = (n: number) => n.toLocaleString('en-US')
export const fmtMoney = (n: number) => `${n.toLocaleString('en-US')} ر.س`
export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')
export const uid = (p = 'id') => `${p}-${Math.random().toString(36).slice(2, 8)}`
export function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('')
}
const AVATAR_COLORS = ['#16A34A', '#15803D', '#2563EB', '#D97706', '#0D9488', '#4D7C0F', '#1D4ED8']
export function avatarColor(name: string) {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 997
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}
