import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
} as const

/**
 * Modello Google AI (AI Studio / Generative Language API).
 * Default: gemini-2.5-flash (rapporto qualità/prezzo consigliato per carichi flash).
 * Solo costo: secret GEMINI_MODEL=gemini-2.5-flash-lite (più economico).
 */
function geminiModel(): string {
  return Deno.env.get('GEMINI_MODEL')?.trim() || 'gemini-2.5-flash'
}

function geminiGenerateUrl(): string {
  const model = geminiModel()
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Metodo non consentito' }), {
      status: 405,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey?.trim()) {
    return new Response(
      JSON.stringify({
        error:
          'GEMINI_API_KEY non configurata: impostala nei secrets del progetto Supabase.',
      }),
      { status: 503, headers: { ...cors, 'Content-Type': 'application/json' } },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'JSON non valido' }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  const q =
    typeof body === 'object' &&
    body !== null &&
    'query' in body &&
    typeof (body as { query: unknown }).query === 'string'
      ? (body as { query: string }).query.trim()
      : ''

  if (!q) {
    return new Response(JSON.stringify({ error: 'Campo query obbligatorio' }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  const geminiRes = await fetch(
    `${geminiGenerateUrl()}?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: q }] }],
        generationConfig: { temperature: 0.35, maxOutputTokens: 1024 },
      }),
    },
  )

  if (geminiRes.status === 429) {
    return new Response(
      JSON.stringify({ error: 'Troppe richieste al modello. Riprova tra poco.' }),
      { status: 429, headers: { ...cors, 'Content-Type': 'application/json' } },
    )
  }

  if (!geminiRes.ok) {
    const errBody = await geminiRes.text()
    const model = geminiModel()
    console.error('[search-ai] Gemini upstream', {
      model,
      httpStatus: geminiRes.status,
      bodySample: errBody.slice(0, 600),
    })
    let upstreamHint: string | undefined
    try {
      const j = JSON.parse(errBody) as { error?: { message?: string } }
      const msg = j.error?.message?.trim()
      if (msg) upstreamHint = msg.slice(0, 240)
    } catch {
      /* ignore */
    }
    return new Response(
      JSON.stringify({
        error: 'Servizio AI temporaneamente non disponibile.',
        upstreamStatus: geminiRes.status,
        model,
        ...(upstreamHint ? { upstreamHint } : {}),
      }),
      { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } },
    )
  }

  const j = (await geminiRes.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const text =
    j.candidates
      ?.flatMap((c) => c.content?.parts ?? [])
      .map((p) => p.text ?? '')
      .join('')
      .trim() ?? ''

  if (!text) {
    return new Response(JSON.stringify({ error: 'Risposta vuota dal modello.' }), {
      status: 502,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ text }), {
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
})
