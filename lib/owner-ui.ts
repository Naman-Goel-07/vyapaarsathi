import { differenceInCalendarDays, format, isValid, parseISO } from 'date-fns'
import { enIN, hi } from 'date-fns/locale'

export const money = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
export function daysLeft(deadline?: string | null, now = new Date()) {
  if (!deadline) return null
  const date = parseISO(deadline)
  return isValid(date) ? differenceInCalendarDays(date, now) : null
}
export function shortDate(value?: string | null, lang = 'en') {
  if (!value || !isValid(parseISO(value))) return '—'
  return format(parseISO(value), 'd MMM', { locale: lang === 'hi' ? hi : enIN })
}
export function noticeTone(notice: any) {
  if (notice.status === 'closed') return 'closed'
  if (notice.status === 'filed') return 'fine'
  const days = daysLeft(notice.deadline)
  return days === null ? 'neutral' : days < 0 ? 'overdue' : days <= 7 ? 'soon' : 'fine'
}
export function waitingOnOwner(notice: any) {
  return Array.isArray(notice.tasks) && notice.tasks.some((t: any) => t.owner_role === 'owner' && t.status === 'pending')
}
export function noticeGroup(notice: any) {
  if (notice.status === 'closed') return 'closed'
  if (notice.status === 'filed') return 'withCA'
  if (Array.isArray(notice.tasks) && !waitingOnOwner(notice)) return 'withCA'
  return 'needsAction'
}
export function nearestFirst(notices: any[]) {
  return [...notices].sort((a, b) => (daysLeft(a.deadline) ?? Infinity) - (daysLeft(b.deadline) ?? Infinity))
}
export function noticeTitle(notice: any) {
  const text = `${notice.authority || ''} ${notice.form || ''}`.toLowerCase()
  return /gst|goods|जीएसटी/.test(text) ? 'gst' : /income|आयकर/.test(text) ? 'incomeTax' : /epfo|provident|employee/.test(text) ? 'epfo' : 'other'
}
