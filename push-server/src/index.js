import { buildPushHTTPRequest } from '@pushforge/builder'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })
}

function asSubscription(value) {
  if (!value?.endpoint || !value?.keys?.p256dh || !value?.keys?.auth) return null
  return {
    endpoint: value.endpoint,
    expirationTime: value.expirationTime ?? null,
    keys: {
      p256dh: value.keys.p256dh,
      auth: value.keys.auth,
    },
  }
}

async function sendPush(env, subscription, title, body) {
  const sub = asSubscription(subscription)
  if (!sub) return { ok: false, reason: 'subscription' }
  const privateJWK = JSON.parse(env.VAPID_PRIVATE_JWK)
  const { endpoint, headers, body: payload } = await buildPushHTTPRequest({
    privateJWK,
    subscription: sub,
    message: {
      payload: { title, body, tag: 'malu' },
      adminContact: 'mailto:agora@local',
      options: { ttl: 60 * 60 * 12, urgency: 'high' },
    },
  })
  const response = await fetch(endpoint, { method: 'POST', headers, body: payload })
  const ok = response.status >= 200 && response.status < 300
  return { ok, status: response.status }
}

async function continueWait(origin, ctx, job) {
  const left = job.remindAt - Date.now()
  if (left <= 2500) {
    const result = await sendPush(job.env, job.subscription, 'Malu', job.text)
    return { sent: result.ok, status: result.status }
  }

  const slice = Math.min(left, 15000)
  const hops = (job.hops || 0) + 1
  if (hops > 6000) return { sent: false, reason: 'expired' }

  ctx.waitUntil(
    (async () => {
      await new Promise((resolve) => setTimeout(resolve, slice))
      await fetch(`${origin}/wait-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: job.id,
          text: job.text,
          remindAt: job.remindAt,
          subscription: job.subscription,
          hops,
        }),
      })
    })()
  )

  return { waitingMs: slice, hops }
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS })
    }

    const url = new URL(request.url)
    const origin = url.origin

    if (request.method === 'GET' && url.pathname === '/health') {
      return json({ ok: true })
    }

    if (request.method === 'POST' && url.pathname === '/subscribe') {
      const body = await request.json()
      const subscription = asSubscription(body)
      if (!subscription) return json({ ok: false, reason: 'subscription' }, 400)
      return json({ ok: true })
    }

    if (request.method === 'POST' && url.pathname === '/reminder') {
      const reminder = await request.json()
      const subscription = asSubscription(reminder.subscription)
      if (!subscription || !reminder.remindAt) {
        return json({ ok: false, reason: 'invalid' }, 400)
      }
      const result = await continueWait(origin, ctx, {
        env,
        id: reminder.id,
        text: reminder.text || 'Hora de olhar pra isso.',
        remindAt: reminder.remindAt,
        subscription,
        hops: 0,
      })
      return json({ ok: true, ...result })
    }

    if (request.method === 'POST' && url.pathname === '/wait-send') {
      const job = await request.json()
      const subscription = asSubscription(job.subscription)
      if (!subscription) return json({ ok: false, reason: 'subscription' }, 400)
      const result = await continueWait(origin, ctx, {
        env,
        ...job,
        subscription,
      })
      return json({ ok: true, ...result })
    }

    if (request.method === 'POST' && url.pathname === '/test') {
      const body = await request.json()
      const result = await sendPush(
        env,
        body.subscription,
        'Malu',
        body.text || 'Aviso de teste. Se você viu isto, os avisos estão ligados.'
      )
      return json(result, result.ok ? 200 : 502)
    }

    if (request.method === 'DELETE' && url.pathname === '/reminder') {
      return json({ ok: true })
    }

    return json({ error: 'not found' }, 404)
  },
}
