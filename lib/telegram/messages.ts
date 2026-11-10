export type BotLanguage = 'en' | 'hi'
type Notice = { notice_id: string; business_name: string; deadline: string | null }
export type WorkItem = Notice & { total: number }
export type Delivery = Notice & {
  chat_id: string
  lang: BotLanguage
  recipient_role: 'owner' | 'ca'
  event: 'new_notice' | 'owner_action' | 'owner_completed' | 'ca_action' | 'filed' | 'closed'
}

function businessName(name: string) {
  return name.replace(/[\s\u202a-\u202e\u2066-\u2069]+/g, ' ').trim().slice(0, 100)
}

function deadlineLine(deadline: string | null, lang: BotLanguage) {
  const date = deadline ? new Date(`${deadline}T00:00:00Z`) : null
  if (!date || !Number.isFinite(date.getTime())) return lang === 'hi' ? 'जवाब की तारीख दर्ज नहीं है' : 'No reply date recorded'
  const formatted = new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(date)
  return lang === 'hi' ? `जवाब की आखिरी तारीख ${formatted}` : `Reply by ${formatted}`
}

const eventCopy = {
  en: {
    new_notice: 'A new notice was added.',
    owner_action: 'Your CA has requested an action from you.',
    owner_completed: 'The owner’s step was marked complete. Review the notice for the next step.',
    ca_action: 'This notice has a task for you.',
    filed: 'VyapaarSathi shows the reply as filed. Open the notice to review the filing details.',
    closed: 'Your CA marked the notice closed in VyapaarSathi.',
  },
  hi: {
    new_notice: 'एक नया नोटिस जोड़ा गया है।',
    owner_action: 'आपके सीए ने आपसे एक काम पूरा करने को कहा है।',
    owner_completed: 'व्यवसाय के मालिक का काम पूरा दर्ज किया गया है। अगला कदम देखने के लिए नोटिस खोलें।',
    ca_action: 'इस नोटिस पर आपका एक काम बाकी है।',
    filed: 'व्यापारीसाथी में जवाब दाखिल दिख रहा है। विवरण देखने के लिए नोटिस खोलें।',
    closed: 'आपके सीए ने व्यापारीसाथी में नोटिस बंद कर दिया है।',
  },
}

export function noticeMessage(notice: Delivery, origin: string) {
  const { lang } = notice
  const summary = [businessName(notice.business_name), eventCopy[lang][notice.event]]
  if (notice.event !== 'filed' && notice.event !== 'closed') summary.push(deadlineLine(notice.deadline, lang))
  return {
    text: summary.join('\n'),
    links: [{ text: lang === 'hi' ? 'नोटिस खोलें' : 'Open notice', url: `${origin}/dashboard/notices/${notice.notice_id}` }],
  }
}

export function workMessage(items: WorkItem[], lang: BotLanguage, origin: string, role: 'owner' | 'ca') {
  const hi = lang === 'hi'
  const dashboard = role === 'ca' ? '/dashboard/ca' : '/dashboard/owner/notices'
  const dashboardLink = { text: hi ? 'डैशबोर्ड खोलें' : 'Open dashboard', url: origin + dashboard }
  if (!items.length) {
    return {
      text: hi ? 'अभी किसी खुले नोटिस पर आपका काम बाकी नहीं है।' : 'No open notices need your attention right now.',
      links: [dashboardLink],
    }
  }
  const list = items.map((item, index) => `${index + 1}. ${businessName(item.business_name)} · ${deadlineLine(item.deadline, lang)}`)
  const heading = hi ? 'जिन नोटिसों पर आपका काम बाकी है' : 'Notices that need your attention'
  const more = items[0].total > items.length
    ? (hi ? `कुल ${items[0].total} नोटिस। पूरी सूची डैशबोर्ड पर देखें।` : `${items[0].total} notices in total. See the dashboard for the full list.`)
    : ''
  return {
    text: [heading, '', ...list, more].filter(Boolean).join('\n'),
    links: [
      ...items.map((item, index) => ({
        text: hi ? `नोटिस ${index + 1} खोलें` : `Open notice ${index + 1}`,
        url: `${origin}/dashboard/notices/${item.notice_id}`,
      })),
      dashboardLink,
    ],
  }
}
