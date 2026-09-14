import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import siteConfig from '../config/siteConfig.json'
import { supabase } from '../lib/supabaseClient'

const PHONE_PATTERN = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/
const EMERGENCY_JOBS = new Set(['Storm cleanup', 'Hazardous removal'])

const fieldClass = 'w-full rounded-md border border-brand/30 px-3 py-2.5 text-ink'

function LeadForm({ id = 'lead-form' }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [jobType, setJobType] = useState('')
  const [urgency, setUrgency] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!PHONE_PATTERN.test(phone.trim())) {
      setError('Enter a valid 10-digit phone number.')
      return
    }

    const isEmergency =
      urgency === siteConfig.urgencyOptions[0] || EMERGENCY_JOBS.has(jobType)

    const leadId = crypto.randomUUID()

    setSubmitting(true)

    const { error: insertError } = await supabase.from('leads').insert({
      id: leadId,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      job_type: jobType,
      urgency,
      notes: notes.trim() || null,
      is_emergency: isEmergency,
      source: 'landing_page',
    })

    setSubmitting(false)

    if (insertError) {
      setError('Something went wrong sending this. Please try again or call us.')
      return
    }

    navigate(`/thank-you?lead_id=${leadId}`)
  }

  return (
    <section id={id} className="w-full">
      <div className="rounded-lg border border-brand/20 bg-white p-4 shadow-sm md:px-6 md:py-5">
        <h2 className="mb-2 text-xl font-bold text-ink sm:text-2xl">{siteConfig.cta}</h2>
        <p className="mb-4 text-sm text-ink/70 sm:mb-6 md:mb-4">
          No self-serve booking — tell us the job and how soon you need it. Joseph
          calls you back.
        </p>
        <form className="grid gap-4" onSubmit={handleSubmit}>
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
                pattern="^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$"
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
              <span className="mb-1 block text-sm font-medium text-ink">Job type</span>
              <select
                required
                name="jobType"
                value={jobType}
                onChange={(event) => setJobType(event.target.value)}
                className={fieldClass}
              >
                <option value="">Select a service</option>
                {siteConfig.services.map((service) => (
                  <option key={service.id} value={service.name}>
                    {service.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
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
              className={`${fieldClass} text-sm max-md:min-h-20`}
            />
          </label>
          {error ? (
            <p className="text-sm font-medium text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-md bg-brand px-5 py-3 font-semibold text-brandTint hover:opacity-90 disabled:opacity-60 sm:w-auto"
          >
            {submitting ? 'Sending…' : siteConfig.cta}
          </button>
        </form>
      </div>
    </section>
  )
}

export default LeadForm
