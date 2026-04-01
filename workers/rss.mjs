import { createClient } from '@supabase/supabase-js'
import Parser from 'rss-parser'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const minTrustScore = Number(process.env.RSS_MIN_TRUST_SCORE ?? 40)

if (!supabaseUrl || !supabaseServiceRoleKey) {
  process.stderr.write('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing\n')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const parser = new Parser({
  timeout: 10000,
})

async function run() {
  const { data: sources, error } = await supabase
    .from('verified_sources')
    .select('id, feed_url, trust_score')
    .eq('is_active', true)
    .gte('trust_score', minTrustScore)

  if (error) {
    throw error
  }

  if (!sources || sources.length === 0) {
    console.log('No active verified sources found matching criteria.')
    return
  }

  for (const source of sources) {
    try {
      console.log(`Fetching feed for source ${source.id}: ${source.feed_url}`)
      const feed = await parser.parseURL(source.feed_url)

      for (const item of feed.items) {
        // Prepare published_at
        let publishedAt = null
        if (item.isoDate || item.pubDate) {
          try {
            publishedAt = new Date(item.isoDate || item.pubDate).toISOString()
          } catch (e) {
            // Ignore parsing error
          }
        }

        const { error: ingestError } = await supabase.rpc(
          'ingest_verified_feed_item',
          {
            p_verified_source_id: source.id,
            p_external_id: item.guid || item.id || null,
            p_title: item.title || null,
            p_link: item.link || null,
            p_summary:
              item.contentSnippet || item.content || item.summary || null,
            p_published_at: publishedAt,
            p_min_trust_score: minTrustScore,
          }
        )

        if (ingestError) {
          console.error(`Error ingesting item ${item.title}:`, ingestError)
        }
      }
    } catch (err) {
      console.error(
        `Failed to fetch or parse feed for source ${source.id}:`,
        err.message
      )
    }
  }
}

run().catch((err) => {
  console.error('Ingestion failed:', err)
  process.exit(1)
})
