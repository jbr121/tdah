import { buildPushHTTPRequest } from '@pushforge/builder'

const STORE = 'https://agora.malu/store'
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

async function loadStore() {
  const cached = await caches.default.match(STORE)
  if (!cached) return { subscription: null, reminders: [] }
  try {
    return await cached.json()
  } catch {
    return { subscription: null, reminders: [] }
  }
}

async function saveStore(data) {
  await caches.default.put(
    STORE,
    new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=31536000',
      },
    })
  )
}

async function sendPush(env, subscription, title, body) {
  if (!subscription?.endpoint) return false
  const privateJWK = JSON.parse(env.VAPID_PRIVATE_JWK)
  const { endpoint, headers, body: payload } = await buildPushHTTPRequest({
    privateJWK,
    subscription,
    message: {
      payload: { title, body, tag: 'malu' },
      adminContact: 'mailto:agora@local',
      options: { ttl: 60 * 60 * 12, urgency: 'high' },
    },
  })
  const response = await fetch(endpoint, { method: 'POST', headers, body: payload })
  return response.ok || response.status === 201
}

async function sendDue(env) {
  const store = await loadStore()
  if (!store.subscription) return { sent: 0 }
  const now = Date.now()
  let sent = 0
  for (const reminder of store.reminders) {
    if (reminder.sent || reminder.remindAt > now) continue
    const ok = await sendPush(env, store.subscription, 'Malu', reminder.text)
    reminder.sent = true
    if (ok) sent += 1
  }
  store.reminders = store.reminders.filter((item) => !item.sent || item.remindAt > now - 86400000)
  await saveStore(store)
  return { sent }
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS })
    }

    const url = new URL(request.url)

    if (request.method === 'GET' && url.pathname === '/health') {
      const store = await loadStore()
      return json({
        ok: true,
        hasSubscription: Boolean(store.subscription),
        reminders: store.reminders.filter((item) => !item.sent).length,
      })
    }

    if (request.method === 'POST' && url.pathname === '/subscribe') {
      const subscription = await request.json()
      const store = await loadStore()
      store.subscription = subscription
      await saveStore(store)
      return json({ ok: true })
    }

    if (request.method === 'POST' && url.pathname === '/reminder') {
      const reminder = await request.json()
      const store = await loadStore()
      store.reminders = store.reminders.filter((item) => item.id !== reminder.id)
      store.reminders.push({
        id: reminder.id,
        text: reminder.text,
        remindAt: reminder.remindAt,
        sent: false,
      })
      if (reminder.subscription) store.subscription = reminder.subscription
      await saveStore(store)
      const origin = new URL(request.url).origin
      ctx.waitUntil(fetch(`${origin}/wait-send?at=${reminder.remindAt}`))
      return json({ ok: true })
    }

    if (request.method === 'DELETE' && url.pathname === '/reminder') {
      const { id } = await request.json()
      const store = await loadStore()
      store.reminders = store.reminders.filter((item) => item.id !== id)
      await saveStore(store)
      return json({ ok: true })
    }

    if (request.method === 'POST' && url.pathname === '/test') {
      const store = await loadStore()
      const ok = await sendPush(env, store.subscription, 'Malu', 'Aviso de teste. Pode fechar o app.')
      return json({ ok })
    }

    if (request.method === 'GET' && url.pathname === '/tick') {
      return json(await sendDue(env))
    }

    if (request.method === 'GET' && url.pathname === '/wait-send') {
      const remindAt = Number(url.searchParams.get('at') || 0)
      const left = remindAt - Date.now()
      if (left > 2500) {
        const slice = Math.min(left, 20000)
        ctx.waitUntil(
          (async () => {
            await new Promise((resolve) => setTimeout(resolve, slice))
            await fetch(`${url.origin}/wait-send?at=${remindAt}`)
          })()
        )
        return json({ waitingMs: slice })
      }
      return json(await sendDue(env))
    }

    return json({ error: 'not found' }, 404)
  },

  async scheduled(_event, env) {
    await sendDue(env)
  },
}
