// Pure spam rules for public lead submissions. No database, network or email
// access here so the rules can be unit-tested with stand-in payloads.

export const HONEYPOT_FIELD = 'contact_pref'
export const MIN_FILL_MS = 3000

// Whole-word, case-insensitive. Multi-word phrases match across any whitespace.
export const SPAM_PHRASES = [
  'seo',
  'search engine',
  'backlinks',
  'guest post',
  'web design',
  'website design',
  'web development',
  'digital marketing',
  'lead generation',
  'social media marketing',
  'google ranking',
  'first page of google',
  'crypto',
  'bitcoin',
]

const URL_PATTERN = /https?:\/\/|www\./i

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const PHRASE_PATTERNS = SPAM_PHRASES.map((phrase) => ({
  phrase,
  pattern: new RegExp(
    `\\b${phrase.split(/\s+/).map(escapeRegExp).join('\\s+')}\\b`,
    'i',
  ),
}))

export function honeypotFilled(value) {
  return typeof value === 'string' ? value.trim() !== '' : value != null && value !== false
}

// Missing / non-numeric elapsedMs is not flagged on timing alone.
export function tooFast(elapsedMs) {
  if (elapsedMs === null || elapsedMs === undefined || elapsedMs === '') return false
  const ms = Number(elapsedMs)
  return Number.isFinite(ms) && ms < MIN_FILL_MS
}

export function textSpamReasons(text) {
  if (typeof text !== 'string' || !text.trim()) return []
  const reasons = []
  if (URL_PATTERN.test(text)) reasons.push('url')
  for (const { phrase, pattern } of PHRASE_PATTERNS) {
    if (pattern.test(text)) reasons.push(`phrase:${phrase}`)
  }
  return reasons
}

// Checks the honeypot, fill time, and the message (notes) and service
// (job_type) fields.
export function classifyLead(body = {}) {
  const reasons = []
  if (honeypotFilled(body[HONEYPOT_FIELD])) reasons.push('honeypot')
  if (tooFast(body.elapsedMs)) reasons.push('too_fast')
  for (const field of ['notes', 'job_type']) {
    for (const reason of textSpamReasons(body[field])) {
      reasons.push(`${field}:${reason}`)
    }
  }
  return { spam: reasons.length > 0, reasons }
}

export function isSpamRecord(record) {
  return String(record?.status || '').trim().toLowerCase() === 'spam'
}
