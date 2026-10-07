import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { getContentRoutes, SITE_ORIGIN } from '../src/config/pages.js'

const lastmod = new Date().toISOString().slice(0, 10)
const urls = getContentRoutes()
  .map(
    (route) => `  <url>
    <loc>${SITE_ORIGIN}${route.path === '/' ? '/' : route.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sitemap.xml')
writeFileSync(out, xml)
console.log(`Wrote ${urls.split('<url>').length - 1} URLs to public/sitemap.xml`)
