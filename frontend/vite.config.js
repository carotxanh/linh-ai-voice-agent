import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function isMissingRetellEnv(value, placeholderName) {
  return !value || value === placeholderName || value.startsWith('YOUR_')
}

async function retellRequest(path, apiKey, options = {}) {
  const retellResponse = await fetch(`https://api.retellai.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const responseBody = await retellResponse.json().catch(() => ({}))

  if (!retellResponse.ok) {
    throw {
      status: retellResponse.status,
      detail: responseBody.detail || responseBody.message || `Retell AI bao loi o ${path}`,
    }
  }

  return responseBody
}

async function resolveRetellAgentId(apiKey, configuredAgentId) {
  if (!isMissingRetellEnv(configuredAgentId, 'VITE_RETELL_AGENT_ID')) {
    return configuredAgentId
  }

  const agents = await retellRequest('/v2/list-agents?limit=50', apiKey, {
    method: 'POST',
    body: JSON.stringify({
      filter_criteria: {
        channel: {
          op: 'eq',
          value: 'voice',
        },
      },
    }),
  })
  const agent = agents.items?.find((item) => item.agent_id)

  if (!agent) {
    throw {
      status: 404,
      detail: 'Tai khoan Retell AI chua co voice agent. Hay tao agent tren Retell roi thu lai.',
    }
  }

  return agent.agent_id
}

function retellDemoCallMiddleware(env) {
  return {
    name: 'retell-demo-call-middleware',
    configureServer(server) {
      server.middlewares.use('/api/retell/demo-call', async (request, response) => {
        if (request.method !== 'POST') {
          response.statusCode = 405
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ detail: 'Method not allowed' }))
          return
        }

        const apiKey = env.RETELL_API_KEY || env.VITE_RETELL_API_KEY
        const configuredAgentId = env.VITE_RETELL_AGENT_ID || env.RETELL_AGENT_ID

        if (isMissingRetellEnv(apiKey, 'RETELL_API_KEY')) {
          response.statusCode = 501
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ detail: 'Retell AI chua duoc cau hinh API key trong frontend/.env.local' }))
          return
        }

        try {
          const agentId = await resolveRetellAgentId(apiKey, configuredAgentId)
          const responseBody = await retellRequest('/v2/create-web-call', apiKey, {
            method: 'POST',
            body: JSON.stringify({
              agent_id: agentId,
              metadata: {
                source: 'linhvoice_demo',
              },
            }),
          })

          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({
            accessToken: responseBody.access_token,
            callId: responseBody.call_id,
            agentId: responseBody.agent_id,
          }))
        } catch (error) {
          response.statusCode = error.status || 502
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ detail: error.detail || error.message || 'Khong the ket noi Retell AI' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
    plugins: [react(), retellDemoCallMiddleware(env)],
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
