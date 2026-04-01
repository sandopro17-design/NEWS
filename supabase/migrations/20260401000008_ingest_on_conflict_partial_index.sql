-- Fix: la unique index su (verified_source_id, ingest_hash) è parziale (WHERE ingest_hash IS NOT NULL).
-- Senza la stessa clausola in ON CONFLICT, Postgres non usa l'indice per l'upsert e il secondo insert
-- dello smoke RPC fallisce con duplicate key. Vedi RSS Poller Readiness "Run RSS upsert RPC smoke".

create or replace function public.ingest_verified_feed_item(
  p_verified_source_id uuid,
  p_external_id text default null,
  p_title text default null,
  p_link text default null,
  p_summary text default null,
  p_published_at timestamptz default null,
  p_min_trust_score integer default 40
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item_id uuid;
  v_source_trust integer;
  v_source_active boolean;
  v_effective_external_id text;
  v_effective_link text;
  v_dedup_key text;
begin
  if p_verified_source_id is null then
    raise exception 'verified source is required';
  end if;

  select trust_score, is_active
  into v_source_trust, v_source_active
  from public.verified_sources
  where id = p_verified_source_id;

  if not found then
    raise exception 'verified source % not found', p_verified_source_id;
  end if;

  if coalesce(v_source_active, false) = false then
    return null;
  end if;

  if coalesce(v_source_trust, 0) < greatest(0, least(coalesce(p_min_trust_score, 40), 100)) then
    return null;
  end if;

  v_effective_external_id := nullif(lower(trim(coalesce(p_external_id, ''))), '');
  v_effective_link := nullif(trim(coalesce(p_link, '')), '');

  if v_effective_external_id is null and v_effective_link is null then
    raise exception 'external_id or link is required for dedup';
  end if;

  v_dedup_key := coalesce(v_effective_external_id, md5(lower(v_effective_link)));

  insert into public.feed_items (
    verified_source_id,
    external_id,
    title,
    link,
    summary,
    published_at,
    fetched_at,
    ingest_hash,
    source_trust_score,
    ingested_at
  )
  values (
    p_verified_source_id,
    v_effective_external_id,
    coalesce(nullif(trim(coalesce(p_title, '')), ''), '(untitled)'),
    coalesce(v_effective_link, 'about:blank'),
    nullif(trim(coalesce(p_summary, '')), ''),
    p_published_at,
    now(),
    v_dedup_key,
    v_source_trust,
    now()
  )
  on conflict (verified_source_id, ingest_hash)
    where (ingest_hash is not null)
  do update
  set
    external_id = coalesce(excluded.external_id, public.feed_items.external_id),
    title = coalesce(excluded.title, public.feed_items.title),
    link = coalesce(excluded.link, public.feed_items.link),
    summary = coalesce(excluded.summary, public.feed_items.summary),
    published_at = coalesce(excluded.published_at, public.feed_items.published_at),
    fetched_at = now(),
    source_trust_score = excluded.source_trust_score,
    ingested_at = now()
  returning id into v_item_id;

  update public.verified_sources
  set updated_at = now(), last_checked_at = now()
  where id = p_verified_source_id;

  return v_item_id;
end;
$$;
