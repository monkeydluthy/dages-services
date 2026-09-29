import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

function googleReviewsDevPlugin(env) {
  return {
    name: 'google-reviews-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split('?')[0]
        if (path !== '/.netlify/functions/google-reviews') {
          next()
          return
        }

        process.env.GOOGLE_PLACES_API_KEY ||= env.GOOGLE_PLACES_API_KEY
        process.env.GOOGLE_PLACE_ID ||= env.GOOGLE_PLACE_ID

        const { default: reviews } = await import('./netlify/functions/google-reviews.js')
        const result = await reviews(
          new Request('http://localhost/.netlify/functions/google-reviews', { method: 'GET' }),
        )
        res.statusCode = result.status
        result.headers.forEach((value, key) => {
          res.setHeader(key, value)
        })
        res.end(await result.text())
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), googleReviewsDevPlugin(env)],
  }
})
