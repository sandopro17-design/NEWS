/**
 * Smoke post-deploy (Pages + Edge Function search-ai).
 *
 * Uso (dopo secrets GitHub + deploy Pages + deploy function + GEMINI_API_KEY):
 *   HOSTED_PAGES_URL=https://<org>.github.io/NEWS \
 *   SUPABASE_URL=https://<ref>.supabase.co \
 *   SUPABASE_ANON_KEY=<anon-jwt> \
 *   node scripts/hosted-smoke.mjs
 *
 * Oppure metti in .env.local (non committare): HOSTED_PAGES_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY.
 *
 * 429 da Gemini: opzionale — SMOKE_SEARCH_AI_MAX_ATTEMPTS (default 4), SMOKE_SEARCH_AI_RETRY_MS (default 20000).
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

function loadDotEnvFiles() {
  for (const name of ['.env.local', '.env']) {
    const p = resolve(process.cwd(), name)
    if (!existsSync(p)) continue
    const text = readFileSync(p, 'utf8')
    for (const line of text.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq <= 0) continue
      const key = trimmed.slice(0, eq).trim()
      let val = trimmed.slice(eq + 1).trim()
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      if (process.env[key] === undefined) {
        process.env[key] = val
      }
    }
  }
  if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL) {
    process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL
  }
  if (!process.env.SUPABASE_ANON_KEY && process.env.VITE_SUPABASE_ANON_KEY) {
    process.env.SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
  }
}

loadDotEnvFiles()

function normalizeSupabaseKey(raw) {
  let s = String(raw ?? '').trim()
  if (s.toLowerCase().startsWith('bearer ')) {
    s = s.slice(7).trim()
  }
  s = s.replace(/\s+/g, '')
  return s
}

/** Gateway legacy verify_jwt: solo JWT a 3 segmenti; publishable sb_* non è JWT. */
function looksLikeJwt(s) {
  const parts = s.split('.')
  return parts.length === 3 && parts.every((p) => p.length > 0)
}

const pagesBase = process.env.HOSTED_PAGES_URL?.replace(/\/$/, '')
const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '')
const anonKey = normalizeSupabaseKey(process.env.SUPABASE_ANON_KEY ?? '')

function fail(message) {
  console.error(message)
  process.exit(1)
}

if (!pagesBase) {
  fail(
    'HOSTED_PAGES_URL mancante: esportala o aggiungila in .env.local (es. https://org.github.io/NEWS)',
  )
}
if (!supabaseUrl) {
  fail(
    'SUPABASE_URL mancante: esportala o metti VITE_SUPABASE_URL in .env.local',
  )
}
if (!anonKey) {
  fail(
    'SUPABASE_ANON_KEY mancante: Dashboard Supabase → Settings → API → anon public, poi VITE_SUPABASE_ANON_KEY in .env.local',
  )
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

/** Dopo deploy o cold start Gemini a volte risponde 429/502/503: ritenta. */
function shouldRetrySearchAi(status, raw) {
  if (status === 429) return true
  if (status !== 502 && status !== 503) return false
  try {
    const data = JSON.parse(raw)
    if (
      typeof data.error === 'string' &&
      data.error.includes('GEMINI_API_KEY')
    ) {
      return false
    }
  } catch {
    /* risposta non JSON: ritenta 502/503 */
  }
  return true
}

async function postSearchAi(fnUrl, headers, body) {
  const max = Math.max(
    1,
    Number(process.env.SMOKE_SEARCH_AI_MAX_ATTEMPTS ?? 4),
  )
  const retryMs = Math.max(
    5000,
    Number(process.env.SMOKE_SEARCH_AI_RETRY_MS ?? 20000),
  )
  const payload = JSON.stringify(body)
  let lastRes = null
  let lastRaw = ''

  for (let attempt = 1; attempt <= max; attempt++) {
    lastRes = await fetch(fnUrl, { method: 'POST', headers, body: payload })
    lastRaw = await lastRes.text()

    if (lastRes.ok) {
      return { res: lastRes, raw: lastRaw }
    }

    if (!shouldRetrySearchAi(lastRes.status, lastRaw) || attempt === max) {
      return { res: lastRes, raw: lastRaw }
    }

    console.error(
      `search-ai: HTTP ${lastRes.status}, nuovo tentativo ${attempt + 1}/${max} tra ${retryMs / 1000}s…`,
    )
    await sleep(retryMs)
  }

  return { res: lastRes, raw: lastRaw }
}

async function main() {
  const indexRes = await fetch(`${pagesBase}/`)
  if (!indexRes.ok) {
    fail(`Pages: atteso 200, ricevuto ${indexRes.status} per ${pagesBase}/`)
  }
  const html = await indexRes.text()
  if (!html.includes('id="root"')) {
    fail('Pages: index HTML senza mount #root')
  }

  const fnUrl = `${supabaseUrl}/functions/v1/search-ai`
  const headers = {
    'Content-Type': 'application/json',
    apikey: anonKey,
  }
  if (looksLikeJwt(anonKey)) {
    headers.Authorization = `Bearer ${anonKey}`
  }

  const { res: fnRes, raw } = await postSearchAi(fnUrl, headers, {
    query: 'Rispondi solo con la parola OK.',
  })
  let data
  try {
    data = JSON.parse(raw)
  } catch {
    fail(`search-ai: risposta non JSON: ${raw.slice(0, 240)}`)
  }

  if (
    fnRes.status === 503 &&
    typeof data.error === 'string' &&
    data.error.includes('GEMINI_API_KEY')
  ) {
    fail(
      'search-ai: funzione raggiungibile ma GEMINI_API_KEY non configurata sul progetto Supabase',
    )
  }

  if (!fnRes.ok) {
    if (fnRes.status === 429) {
      fail(
        'search-ai: ancora HTTP 429 dopo i tentativi — quota/rate limit Google (AI Studio: controlla usage; riprova tra qualche minuto o aumenta piano).',
      )
    }
    fail(`search-ai: HTTP ${fnRes.status} ${JSON.stringify(data)}`)
  }

  if (typeof data.text !== 'string' || !data.text.trim()) {
    fail(`search-ai: atteso { text }, ricevuto: ${JSON.stringify(data)}`)
  }

  console.log(
    JSON.stringify(
      { ok: true, pages: `${pagesBase}/`, searchAi: 'ok' },
      null,
      2,
    ),
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
