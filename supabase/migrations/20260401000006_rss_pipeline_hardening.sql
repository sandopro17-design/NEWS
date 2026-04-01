-- NEW-47: RSS pipeline hardening (dedupe race safety + normalized hash)

-- 1) Clean any accidental duplicates before enforcing uniqueness.
with ranked as (
  select
    id,
    row_number() over (
      partition by verified_source_id, ingest_hash
      order by coalesce(ingested_at, fetched_at, published_at) desc, id desc
    ) as rn
  from public.feed_items
  where ingest_hash is not null
)
delete from public.feed_items fi
using ranked r
where fi.id = r.id
  and r.rn > 1;

-- 2) Enforce one item per source+dedupe key at storage level.
create unique index if not exists feed_items_source_ingest_hash_unique
  on public.feed_items (verified_source_id, ingest_hash)
  where ingest_hash is not null;

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

  -- Fallback policy: skip ingest for inactive/low-trust sources.
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

revoke all on function public.ingest_verified_feed_item(
  uuid,
  text,
  text,
  text,
  text,
  timestamptz,
  integer
) from public;

grant execute on function public.ingest_verified_feed_item(
  uuid,
  text,
  text,
  text,
  text,
  timestamptz,
  integer
) to service_role;

comment on index feed_items_source_ingest_hash_unique is 'Unique dedupe guard per source+ingest_hash to avoid concurrent duplicates';
comment on function public.ingest_verified_feed_item(
  uuid,
  text,
  text,
  text,
  text,
  timestamptz,
  integer
) is 'Ingest RSS item with trust gate + concurrent-safe dedupe via source+ingest_hash';
