import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function elevenLabsTokenMiddleware(env) {
  return {
    name: 'elevenlabs-token-middleware',
    configureServer(server) {
      server.middlewares.use('/api/elevenlabs/conversation-token', async (_request, response) => {
        const apiKey = env.ELEVENLABS_API_KEY
        const agentId = env.VITE_ELEVENLABS_AGENT_ID || env.ELEVENLABS_AGENT_ID

        if (!apiKey || !agentId) {
          response.statusCode = 501
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ detail: 'ElevenLabs chua duoc cau hinh trong frontend/.env.local' }))
          return
        }

        try {
          const tokenResponse = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${encodeURIComponent(agentId)}`,
            {
              headers: {
                'xi-api-key': apiKey,
              },
            },
          )

          const responseBody = await tokenResponse.json().catch(() => ({}))

          if (!tokenResponse.ok) {
            response.statusCode = tokenResponse.status
            response.setHeader('Content-Type', 'application/json')
            response.end(JSON.stringify({
              detail: responseBody.detail || responseBody.message || 'ElevenLabs bao loi khi tao conversation token',
            }))
            return
          }

          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ token: responseBody.token }))
        } catch (error) {
          response.statusCode = 502
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ detail: error.message || 'Khong the ket noi ElevenLabs' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
    plugins: [react(), elevenLabsTokenMiddleware(env)],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
      },
    },
  }
})
