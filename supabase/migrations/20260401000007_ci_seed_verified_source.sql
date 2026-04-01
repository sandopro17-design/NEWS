-- CI: almeno una verified_sources attiva per lo smoke RPC `worker:rss:upsert`
-- (scripts/rss-ingest-upsert-smoke.mjs → pickVerifiedSourceId senza RSS_UPSERT_VERIFIED_SOURCE_ID).

insert into public.verified_sources (
  name,
  feed_url,
  website_url,
  trust_score,
  is_active,
  verified_at,
  last_checked_at
)
values (
  'CI smoke seed (NEWS)',
  'https://news.google.com/rss?cf:all&hl=en&gl=IT&ceid=IT:it',
  'https://news.google.com',
  100,
  true,
  now(),
  now()
)
on conflict (feed_url) do update set
  trust_score = excluded.trust_score,
  is_active = excluded.is_active,
  verified_at = excluded.verified_at,
  last_checked_at = excluded.last_checked_at,
  updated_at = now();
