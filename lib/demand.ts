/**
 * Statutory Demand & Penalty Extractor Utility
 *
 * Extracts the monetary demand / penalty amount and DIN from a notice object,
 * its enriched issue text, or nested metadata.
 * This guarantees reliable financial calculations across all risk engines even when
 * the database schema does not have a dedicated `penalty_amount` column.
 */

export function extractDemandAmount(
  notice: any
): number {
  if (!notice) return 0

  // 1. Direct candidate numeric / string property checks
  const candidateProps = [
    notice.penalty_amount,
    notice.penaltyAmount,
    notice.penalty,
    notice.demand_amount,
    notice.demandAmount,
    notice.amount,
    notice.liability,
    notice.tax_demand
  ]

  for (const prop of candidateProps) {
    if (typeof prop === 'number' && !isNaN(prop) && prop > 0) {
      return prop
    }
    if (typeof prop === 'string') {
      const parsed = parseFloat(prop.replace(/[^0-9.]/g, ''))
      if (!isNaN(parsed) && parsed > 0) {
        return parsed
      }
    }
  }

  // 2. Check metadata if present
  if (notice.metadata && typeof notice.metadata === 'object') {
    const metaAmount = extractDemandAmount(notice.metadata)
    if (metaAmount > 0) return metaAmount
  }

  if (!notice.issue || typeof notice.issue !== 'string') return 0

  // 3. Check for tagged Demand / Penalty / Exposure (e.g. "[Demand: ₹7,68,000]" or "Demand: Rs 50,000")
  const taggedMatch = notice.issue.match(
    /(?:Demand|Penalty|Exposure|Liability|Tax Demand)\s*[:=]\s*(?:₹|Rs\.?|INR)?\s*([\d,]+(?:\.\d+)?)/i
  )
  if (taggedMatch && taggedMatch[1]) {
    const parsed = parseFloat(taggedMatch[1].replace(/,/g, ''))
    if (!isNaN(parsed) && parsed > 0) return parsed
  }

  // 4. Check for currency symbols followed by amounts (e.g. "₹7,68,000" or "Rs. 75,000")
  const currencyMatch = notice.issue.match(/(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d+)?)/i)
  if (currencyMatch && currencyMatch[1]) {
    const parsed = parseFloat(currencyMatch[1].replace(/,/g, ''))
    if (!isNaN(parsed) && parsed > 0) return parsed
  }

  return 0
}

export function extractDIN(
  notice: any
): string {
  if (!notice) return ''

  if (notice.din_number && typeof notice.din_number === 'string') {
    return notice.din_number.trim()
  }
  if (notice.dinNumber && typeof notice.dinNumber === 'string') {
    return notice.dinNumber.trim()
  }
  if (notice.din && typeof notice.din === 'string') {
    return notice.din.trim()
  }

  if (!notice.issue || typeof notice.issue !== 'string') return ''

  const dinMatch = notice.issue.match(/DIN\s*[:=]\s*([A-Za-z0-9_-]+)/i)
  if (dinMatch && dinMatch[1]) {
    return dinMatch[1].trim()
  }

  return ''
}

export function formatDemandDisplay(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    return '₹0'
  }
  return `₹${amount.toLocaleString('en-IN')}`
}
