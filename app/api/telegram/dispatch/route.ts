import { randomUUID } from 'node:crypto'
import { noticeMessage, type Delivery } from '@/lib/telegram/messages'
import { databaseFailure, matchesSecret, sendTelegram, telegramConfig, telegramDatabase } from '@/lib/telegram/server'

export const maxDuration = 60

export async function POST(request: Request) {
  const config = telegramConfig()
  if (!config) return new Response(null, { status: 503 })
  if (!matchesSecret(request.headers.get('authorization'), `Bearer ${config.dispatchSecret}`)) {
    return new Response(null, { status: 401 })
  }
  const db = telegramDatabase(config)
  const token = randomUUID()
  const { data: jobs, error } = await db.rpc('telegram_claim', { p_token: token }).returns<{ id: string; attempts: number }[]>()
  if (error || !Array.isArray(jobs)) {
    databaseFailure('claim outbox', error || {})
    return new Response(null, { status: 503 })
  }

  const results = await Promise.allSettled(jobs.map(async ({ id, attempts }) => {
    const { data: delivery, error: lookupError } = await db.rpc('telegram_delivery', {
      p_id: id, p_token: token,
    }).maybeSingle<Delivery>()
    if (lookupError) throw databaseFailure('resolve delivery', lookupError)
    const result = delivery && await sendTelegram(config, delivery.chat_id, noticeMessage(delivery, config.origin))
    if (!result || result.delivered || result.permanent || attempts >= 6) {
      const { error: removeError } = await db.from('telegram_outbox').delete().eq('id', id).eq('claim_token', token)
      if (removeError) throw databaseFailure('complete delivery', removeError)
      return result?.delivered ? 'sent' : 'discarded'
    }
    const retrySeconds = Math.max(30 * 2 ** (attempts - 1), result.retryAfter)
    const { error: retryError } = await db.from('telegram_outbox')
      .update({ available_at: new Date(Date.now() + retrySeconds * 1000).toISOString(), claim_token: null })
      .eq('id', id).eq('claim_token', token)
    if (retryError) throw databaseFailure('reschedule delivery', retryError)
    return 'retry'
  }))

  const failed = results.filter(result => result.status === 'rejected').length
  return Response.json({
    claimed: jobs.length,
    sent: results.filter(result => result.status === 'fulfilled' && result.value === 'sent').length,
    retry: results.filter(result => result.status === 'fulfilled' && result.value === 'retry').length,
    discarded: results.filter(result => result.status === 'fulfilled' && result.value === 'discarded').length,
    failed,
  }, { status: failed ? 503 : 200 })
}
