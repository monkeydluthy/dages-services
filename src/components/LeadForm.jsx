import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import siteConfig from '../config/siteConfig.json'
import { buildLeadJobTypes, isValidJobType } from '../lib/jobTypes'
import { getLeadAttribution } from '../lib/leadAttribution'

const PHONE_PATTERN = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/
const EMERGENCY_JOBS = new Set(['Storm cleanup', 'Hazardous removal'])
const LEAD_JOB_TYPES = buildLeadJobTypes(siteConfig.services)

const fieldClass =
  'w-full rounded-md border border-brand/30 px-3 py-2.5 text-base text-ink'

function LeadForm({ id = 'lead-form', plain = false, method = 'bottom' }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [jobType, setJobType] = useState('')
  const [urgency, setUrgency] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [contactPref, setContactPref] = useState('')
  const renderedAt = useRef(null)

  useEffect(() => {
    renderedAt.current = Date.now()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    setError('')

    if (!PHONE_PATTERN.test(phone.trim())) {
      setError('Enter a valid 10-digit phone number.')
      return
    }

    if (!isValidJobType(jobType, LEAD_JOB_TYPES)) {
      setError('Choose a job type from the list.')
      return
    }

    const isEmergency =
      urgency === siteConfig.urgencyOptions[0] || EMERGENCY_JOBS.has(jobType)

    setSubmitting(true)

    const attribution = getLeadAttribution()

    let result = null
    try {
      const response = await fetch('/.netlify/functions/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim() || null,
          job_type: jobType,
          urgency,
          notes: notes.trim() || null,
          is_emergency: isEmergency,
          contact_pref: contactPref,
          elapsedMs:
            renderedAt.current === null ? null : Date.now() - renderedAt.current,
          utm_source: attribution.utm_source,
          utm_medium: attribution.utm_medium,
          utm_campaign: attribution.utm_campaign,
          referrer: attribution.referrer,
          landing_path: attribution.landing_path,
        }),
      })
      result = response.ok ? await response.json() : null
    } catch {
      result = null
    }

    setSubmitting(false)

    if (!result?.ok) {
      setError('Something went wrong sending this. Please try again or call us.')
      return
    }

    if (result.filtered) {
      navigate('/thank-you')
      return
    }

    window.gtag?.('event', 'generate_lead', {
      method,
      job_type: jobType,
      is_emergency: isEmergency,
    })

    navigate(`/thank-you?lead_id=${result.lead_id}`)
  }

  return (
    <section id={id} className="w-full">
      <div
        className={
          plain
            ? 'w-full'
            : 'rounded-lg border border-brand/20 bg-white p-4 shadow-sm md:px-6 md:py-5'
        }
      >
        <h2 className="mb-2 text-xl font-bold text-ink sm:text-2xl">{siteConfig.cta}</h2>
        <p className="mb-4 text-sm text-ink/70 sm:mb-6 md:mb-4">
          No self-serve booking — tell us the job and how soon you need it. We'll
          follow up.
        </p>
        <form className="relative grid gap-4" onSubmit={handleSubmit}>
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '-10000px',
              top: 'auto',
              width: '1px',
              height: '1px',
              overflow: 'hidden',
            }}
          >
            <label>
              Contact preference
              <input
                type="text"
                name="contact_pref"
                tabIndex={-1}
                autoComplete="off"
                value={contactPref}
                onChange={(event) => setContactPref(event.target.value)}
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">Name</span>
              <input
                required
                name="name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">Phone</span>
              <input
                required
                type="tel"
                name="phone"
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                pattern="^\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}$"
                title="Use a 10-digit US phone number"
                className={fieldClass}
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">Email</span>
              <input
                required
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink/60">
                Property address <span className="font-normal">(optional)</span>
              </span>
              <input
                name="address"
                autoComplete="street-address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Where's the job?"
                className={fieldClass}
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">Job type</span>
            <select
              required
              name="jobType"
              value={jobType}
              onChange={(event) => setJobType(event.target.value)}
              className={fieldClass}
            >
              <option value="">Select a service</option>
              {LEAD_JOB_TYPES.map((jobTypeOption) => (
                <option key={jobTypeOption} value={jobTypeOption}>
                  {jobTypeOption}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="space-y-2 md:space-y-1">
            <legend className="mb-1 text-sm font-medium text-ink">Urgency</legend>
            {siteConfig.urgencyOptions.map((option) => (
              <label key={option} className="flex items-start gap-2 text-sm text-ink">
                <input
                  required
                  type="radio"
                  name="urgency"
                  value={option}
                  checked={urgency === option}
                  onChange={(event) => setUrgency(event.target.value)}
                  className="mt-1"
                />
                <span>{option}</span>
              </label>
            ))}
          </fieldset>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink/60">
              Notes <span className="font-normal">(optional)</span>
            </span>
            <textarea
              name="notes"
              rows="2"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Anything Joe should know before he calls"
              className={`${fieldClass} max-md:min-h-20`}
            />
          </label>
          <div className="min-h-5" aria-live="polite">
            {error ? (
              <p className="text-sm font-medium text-red-700" role="alert">
                {error}
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 min-h-12 w-full rounded-md bg-brand px-5 py-3 font-semibold text-brandTint hover:opacity-90 disabled:opacity-60 sm:w-auto"
          >
            {submitting ? 'Sending…' : siteConfig.cta}
          </button>
        </form>
      </div>
    </section>
  )
}

export default LeadForm
