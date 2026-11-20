import { classifyLead } from './leadSpam.js'

const PHONE_PATTERN = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_LEN = 5000

function text(value, max = 500) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

function optionalText(value, max = 500) {
  return text(value, max) || null
}

// Validates the public form body and returns { error } or { row, spam, reasons }.
// Pure: no database access.
export function buildLeadRow(body) {
  if (!body || typeof body !== 'object') return { error: 'Bad payload' }

  const name = text(body.name, 200)
  const phone = text(body.phone, 40)
  const email = text(body.email, 320)
  const jobType = text(body.job_type, 200)
  const urgency = text(body.urgency, 200)

  if (!name || !jobType || !urgency) return { error: 'Missing required fields' }
  if (!PHONE_PATTERN.test(phone)) return { error: 'Invalid phone' }
  if (!EMAIL_PATTERN.test(email)) return { error: 'Invalid email' }

  const { spam, reasons } = classifyLead(body)

  const row = {
    name,
    phone,
    email,
    address: optionalText(body.address),
    job_type: jobType,
    urgency,
    notes: optionalText(body.notes, MAX_LEN),
    // Spam never carries the emergency flag.
    is_emergency: spam ? false : body.is_emergency === true,
    source: 'landing_page',
    utm_source: optionalText(body.utm_source),
    utm_medium: optionalText(body.utm_medium),
    utm_campaign: optionalText(body.utm_campaign),
    referrer: optionalText(body.referrer, 2000),
    landing_path: optionalText(body.landing_path, 2000),
  }
  if (spam) row.status = 'spam'

  return { row, spam, reasons }
}
