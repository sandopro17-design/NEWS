/**
 * Smoke post-deploy (Pages + Edge Function search-ai).
 *
 * Uso (dopo secrets GitHub + deploy Pages + deploy function + GEMINI_API_KEY):
 *   HOSTED_PAGES_URL=https://<org>.github.io/NEWS \
 *   SUPABASE_URL=https://<ref>.supabase.co \
 *   SUPABASE_ANON_KEY=<anon-jwt> \
 *   node scripts/hosted-smoke.mjs
 */
const pagesBase = process.env.HOSTED_PAGES_URL?.replace(/\/$/, '')
const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '')
const anonKey = process.env.SUPABASE_ANON_KEY

function fail(message) {
  console.error(message)
  process.exit(1)
}

if (!pagesBase) {
  fail('HOSTED_PAGES_URL mancante (es. https://org.github.io/NEWS)')
}
if (!supabaseUrl) {
  fail('SUPABASE_URL mancante')
}
if (!anonKey?.trim()) {
  fail('SUPABASE_ANON_KEY mancante')
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
  const fnRes = await fetch(fnUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
    },
    body: JSON.stringify({ query: 'Rispondi solo con la parola OK.' }),
  })

  const raw = await fnRes.text()
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
