// Title / meta description overrides, one entry per page path, written by the DDS SEO pod
// (dds-agents `python -m seopod.titles pr`: one PR, seo/titles.json only, merged with
// `approve` in Slack). {} = nothing overridden. When a wording settles, move it into the
// page's own copy and drop the entry; this file is the pod's inbox, not the copy's home.
export function normalizePath(path) {
  if (!path) return '/'
  const p = String(path).split(/[?#]/)[0]
  return p === '/' ? p : p.replace(/\/+$/, '') || '/'
}

/** {title, description} for this path, or null. `table` is seo/titles.json, passed in by the caller (so Node tests need no JSON import). */
export function titleOverride(path, table) {
  const entry = table?.[normalizePath(path)]
  if (!entry || typeof entry.title !== 'string' || typeof entry.description !== 'string') return null
  return entry
}

/** Path of a canonical URL ("https://dagesservices.com/x/" -> "/x"). */
export function pathOfCanonical(canonical) {
  try {
    return normalizePath(new URL(canonical).pathname)
  } catch {
    return null
  }
}
