import { captureSeoSnapshot } from '../lib/seoSnapshot.js'

async function run(req) {
  try {
    const body = await req.json()
    if (body?.next_run) console.log('seo-snapshot next_run', body.next_run)
  } catch {
    // Manual invoke and local tests often send an empty body.
  }

  try {
    const result = await captureSeoSnapshot()
    return new Response(JSON.stringify(result), {
      status: result.ok ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('seo-snapshot failed:', error.message)
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export default run

export async function handler() {
  try {
    const result = await captureSeoSnapshot()
    return {
      statusCode: result.ok ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    }
  } catch (error) {
    console.error('seo-snapshot failed:', error.message)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: error.message }),
    }
  }
}

export const config = {
  schedule: '@weekly',
}
