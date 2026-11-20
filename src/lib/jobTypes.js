// Job types offered on the lead form. The first entries come from
// siteConfig.services (which also drives service cards, footer and admin
// upload); the extras below are lead-form only so they do not create new
// service pages or cards. "Other" must stay last.
export const EXTRA_LEAD_JOB_TYPES = ['Cabling & bracing', 'Planting / transplanting', 'Other']

export function buildLeadJobTypes(services) {
  return [...services.map((service) => service.name), ...EXTRA_LEAD_JOB_TYPES]
}

export function isValidJobType(value, allowed) {
  return typeof value === 'string' && allowed.includes(value)
}
