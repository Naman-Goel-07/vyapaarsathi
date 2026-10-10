import * as crypto from 'node:crypto'

export const GENESIS_HASH = '0'.repeat(64)

export interface Task {
  id: string
  notice_id: string
  action: string
  owner_role: 'owner' | 'ca'
  status: 'pending' | 'completed'
  documents_requested?: string[]
  created_at: string
}

export interface AuditBlock {
  index: number
  timestamp: string
  actor: 'Owner' | 'CA' | 'System'
  action: string
  prevHash: string
  hash: string
  payload: Record<string, unknown>
}

export interface ExtractedNotice {
  authority: string
  form: string
  issue: string
  deadline: string
  action: string
  documents: string[]
  owner_role: 'owner' | 'ca'
  confidence: number
  din_number?: string
  penalty_amount?: number
}

/**
 * SHA-256 string hasher
 */
export function sha256(message: string): string {
  return crypto.createHash('sha256').update(message).digest('hex')
}

/**
 * Audit Log Chaining Formula from PROJECT.md:
 * H_i = SHA256(i + ':' + timestamp + ':' + actor + ':' + action + ':' + H_prev + ':' + payload)
 */
export function computeBlockHash(
  index: number,
  timestamp: string,
  actor: 'Owner' | 'CA' | 'System',
  action: string,
  prevHash: string,
  payload: Record<string, unknown>
): string {
  const payloadStr = JSON.stringify(payload)
  const raw = `${index}:${timestamp}:${actor}:${action}:${prevHash}:${payloadStr}`
  return sha256(raw)
}

/**
 * Create a new audit block linked to previous block
 */
export function createAuditBlock(
  index: number,
  timestamp: string,
  actor: 'Owner' | 'CA' | 'System',
  action: string,
  prevHash: string,
  payload: Record<string, unknown>
): AuditBlock {
  const hash = computeBlockHash(index, timestamp, actor, action, prevHash, payload)
  return {
    index,
    timestamp,
    actor,
    action,
    prevHash,
    hash,
    payload,
  }
}

/**
 * Audit chain integrity verifier
 */
export function verifyAuditChain(chain: AuditBlock[]): {
  isValid: boolean
  corruptedIndex?: number
  reason?: string
} {
  if (chain.length === 0) {
    return { isValid: false, reason: 'Empty chain: Genesis block missing' }
  }

  // Genesis block validation
  if (chain[0].index !== 0) {
    return { isValid: false, corruptedIndex: 0, reason: 'First block index must be 0' }
  }
  if (chain[0].prevHash !== GENESIS_HASH) {
    return { isValid: false, corruptedIndex: 0, reason: `Genesis prevHash must be ${GENESIS_HASH}` }
  }

  const genesisExpectedHash = computeBlockHash(
    0,
    chain[0].timestamp,
    chain[0].actor,
    chain[0].action,
    GENESIS_HASH,
    chain[0].payload
  )
  if (chain[0].hash !== genesisExpectedHash) {
    return { isValid: false, corruptedIndex: 0, reason: 'Genesis block hash does not match payload' }
  }

  // Chained block verification
  for (let i = 1; i < chain.length; i++) {
    const block = chain[i]
    const prevBlock = chain[i - 1]

    if (block.index !== i) {
      return { isValid: false, corruptedIndex: i, reason: `Block index out of sequence: expected ${i}, got ${block.index}` }
    }

    if (block.prevHash !== prevBlock.hash) {
      return {
        isValid: false,
        corruptedIndex: i,
        reason: `Previous hash mismatch at block ${i}: expected ${prevBlock.hash}, got ${block.prevHash}`,
      }
    }

    const expectedHash = computeBlockHash(
      block.index,
      block.timestamp,
      block.actor,
      block.action,
      block.prevHash,
      block.payload
    )

    if (block.hash !== expectedHash) {
      return {
        isValid: false,
        corruptedIndex: i,
        reason: `Tampered hash at block ${i}: computed ${expectedHash}, recorded ${block.hash}`,
      }
    }
  }

  return { isValid: true }
}

/**
 * 5-Step Collaborative Pipeline Active Step Computation
 * Step 1: Notice Logged (open, no doc requests)
 * Step 2: Documents Requested (open, task pending)
 * Step 3: Documents Uploaded (open, task completed)
 * Step 4: Clarification Filed (status: filed)
 * Step 5: Case Closed & Sealed (status: closed)
 */
export function computeActiveStep(
  noticeStatus: 'open' | 'filed' | 'closed',
  tasks: Task[]
): number {
  if (noticeStatus === 'closed') return 5
  if (noticeStatus === 'filed') return 4

  // Notice is 'open':
  const docTask = tasks.find(
    (t) => t.documents_requested && t.documents_requested.length > 0
  )
  if (!docTask) return 1
  if (docTask.status === 'completed') return 3
  return 2
}

/**
 * Role-Based Workflow Transition Validator
 */
export function canPerformAction(
  role: 'owner' | 'ca',
  currentStep: number,
  targetAction: 'REQUISITION_DOCS' | 'SUBMIT_DOCS' | 'RECORD_FILING' | 'SEAL_CASE'
): { allowed: boolean; reason?: string } {
  if (targetAction === 'REQUISITION_DOCS') {
    if (role !== 'ca') return { allowed: false, reason: 'Only CA Bench may requisition documents' }
    if (currentStep !== 1) return { allowed: false, reason: 'Can only requisition documents from Step 1' }
    return { allowed: true }
  }

  if (targetAction === 'SUBMIT_DOCS') {
    if (role !== 'owner') return { allowed: false, reason: 'Only Business Owner Desk can submit requested documents' }
    if (currentStep !== 2) return { allowed: false, reason: 'Can only submit documents in Step 2' }
    return { allowed: true }
  }

  if (targetAction === 'RECORD_FILING') {
    if (role !== 'ca') return { allowed: false, reason: 'Only CA Bench can record government portal filing' }
    if (currentStep !== 3) return { allowed: false, reason: 'Can only file reply after documents are uploaded (Step 3)' }
    return { allowed: true }
  }

  if (targetAction === 'SEAL_CASE') {
    if (role !== 'ca') return { allowed: false, reason: 'Only CA Bench can seal and close case file' }
    if (currentStep !== 4) return { allowed: false, reason: 'Can only close case after reply has been filed (Step 4)' }
    return { allowed: true }
  }

  return { allowed: false, reason: 'Unknown action' }
}

/**
 * Statutory Late Fee Calculator (Section 47 CGST Act: ₹50/day)
 */
export function calculateLateFee(
  deadline: string | null | undefined,
  now: Date = new Date(),
  status: 'open' | 'filed' | 'closed' = 'open'
): {
  isOverdue: boolean
  isFrozen: boolean
  daysOverdue: number
  lateFee: number
  subSecondRate: number
} {
  const SUB_SECOND_RATE = 50 / 86400

  // Status awareness: fee calculation halts if filed or closed
  if (status === 'filed' || status === 'closed') {
    return {
      isOverdue: false,
      isFrozen: true,
      daysOverdue: 0,
      lateFee: 0,
      subSecondRate: 0,
    }
  }

  if (!deadline) {
    return {
      isOverdue: false,
      isFrozen: false,
      daysOverdue: 0,
      lateFee: 0,
      subSecondRate: 0,
    }
  }

  const deadlineDate = new Date(deadline)
  if (isNaN(deadlineDate.getTime())) {
    return {
      isOverdue: false,
      isFrozen: false,
      daysOverdue: 0,
      lateFee: 0,
      subSecondRate: 0,
    }
  }

  const diffMs = deadlineDate.getTime() - now.getTime()

  if (diffMs > 0) {
    // Within deadline
    return {
      isOverdue: false,
      isFrozen: false,
      daysOverdue: 0,
      lateFee: 0,
      subSecondRate: 0,
    }
  }

  // Past deadline (Overdue)
  const elapsedMs = now.getTime() - deadlineDate.getTime()
  const daysOverdue = Math.max(1, Math.floor(elapsedMs / (1000 * 60 * 60 * 24)))
  const lateFee = daysOverdue * 50

  return {
    isOverdue: true,
    isFrozen: false,
    daysOverdue,
    lateFee,
    subSecondRate: SUB_SECOND_RATE,
  }
}

/**
 * Portfolio-wide Late Fee Exposure Calculator
 */
export function calculatePortfolioExposure(
  notices: Array<{ deadline?: string | null; status: 'open' | 'filed' | 'closed' }>,
  now: Date = new Date()
): {
  totalExposure: number
  overdueCount: number
  dailyBurnRate: number
} {
  let totalExposure = 0
  let overdueCount = 0

  for (const n of notices) {
    const fee = calculateLateFee(n.deadline, now, n.status)
    if (fee.isOverdue) {
      totalExposure += fee.lateFee
      overdueCount += 1
    }
  }

  const dailyBurnRate = overdueCount * 50

  return {
    totalExposure,
    overdueCount,
    dailyBurnRate,
  }
}

/**
 * Dynamic Countdown Urgency Classifier
 */
export function getCountdownUrgency(
  deadline: string | null | undefined,
  now: Date = new Date()
): 'none' | 'safe' | 'approaching' | 'critical' | 'urgent' | 'overdue' {
  if (!deadline) return 'none'

  const deadlineDate = new Date(deadline)
  if (isNaN(deadlineDate.getTime())) return 'none'

  const diffMs = deadlineDate.getTime() - now.getTime()
  if (diffMs <= 0) return 'overdue'

  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffHours / 24

  if (diffHours < 24) return 'urgent'
  if (diffHours < 72) return 'critical'
  if (diffDays <= 7) return 'approaching'
  return 'safe'
}

/**
 * Multi-File Dropzone Acceptance Validator
 */
export function validateDropzoneFile(file: {
  name: string
  size: number
  type: string
}): { valid: boolean; reason?: string } {
  const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg']
  const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg']
  const maxSizeBytes = 25 * 1024 * 1024 // 25 MB

  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

  if (!allowedExtensions.includes(ext) && !allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      reason: `Unsupported file type: ${ext || file.type}. Only PDF and images are accepted.`,
    }
  }

  if (file.size <= 0) {
    return { valid: false, reason: 'File is empty (0 bytes).' }
  }

  if (file.size > maxSizeBytes) {
    return { valid: false, reason: `File size exceeds 25 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).` }
  }

  return { valid: true }
}
