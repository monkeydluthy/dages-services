import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const siteConfig = JSON.parse(
  readFileSync(new URL('../src/config/siteConfig.json', import.meta.url), 'utf8'),
)

function jsonLdBlocks(source) {
  return [...source.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(
    (match) => JSON.parse(match[1]),
  )
}

test('index.html has exactly one LocalBusiness graph', () => {
  const businesses = jsonLdBlocks(html).filter((block) => block['@type'] === 'LocalBusiness')
  assert.equal(businesses.length, 1)
})

test('static LocalBusiness sameAs keeps Google Maps and lists every social link', () => {
  const [business] = jsonLdBlocks(html).filter((block) => block['@type'] === 'LocalBusiness')
  assert.deepEqual(business.sameAs, [
    `https://www.google.com/maps/place/?q=place_id:${siteConfig.google.placeId}`,
    ...siteConfig.socialLinks.map((link) => link.url),
  ])
})

test('social links have a name and an https url', () => {
  assert.equal(siteConfig.socialLinks.length, 4)
  for (const link of siteConfig.socialLinks) {
    assert.ok(link.name)
    assert.match(link.url, /^https:\/\//)
  }
})
