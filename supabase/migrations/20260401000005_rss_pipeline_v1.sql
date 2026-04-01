-- NEW-32: pipeline RSS v1 (trust scoring + dedup ingest)

alter table public.verified_sources
  add column if not exists trust_score integer not null default 50,
  add column if not exists is_active boolean not null default true,
  add column if not exists last_checked_at timestamptz;

alter table public.verified_sources
  drop constraint if exists verified_sources_trust_score_range;

alter table public.verified_sources
  add constraint verified_sources_trust_score_range
  check (trust_score between 0 and 100);

alter table public.feed_items
  add column if not exists ingest_hash text,
  add column if not exists source_trust_score integer,
  add column if not exists ingested_at timestamptz not null default now();

create index if not exists verified_sources_active_trust_idx
  on public.verified_sources (is_active, trust_score desc);

create index if not exists feed_items_ingest_hash_idx
  on public.feed_items (ingest_hash);

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

  v_effective_external_id := nullif(trim(coalesce(p_external_id, '')), '');
  v_effective_link := nullif(trim(coalesce(p_link, '')), '');

  if v_effective_external_id is null and v_effective_link is null then
    raise exception 'external_id or link is required for dedup';
  end if;

  v_dedup_key := coalesce(v_effective_external_id, md5(lower(v_effective_link)));

  select fi.id
  into v_item_id
  from public.feed_items fi
  where fi.verified_source_id = p_verified_source_id
    and fi.ingest_hash = v_dedup_key
  limit 1;

  if v_item_id is null then
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
    returning id into v_item_id;
  else
    update public.feed_items
    set
      title = coalesce(nullif(trim(coalesce(p_title, '')), ''), title),
      link = coalesce(v_effective_link, link),
      summary = coalesce(nullif(trim(coalesce(p_summary, '')), ''), summary),
      published_at = coalesce(p_published_at, published_at),
      fetched_at = now(),
      source_trust_score = v_source_trust,
      ingested_at = now()
    where id = v_item_id;
  end if;

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

comment on function public.ingest_verified_feed_item(
  uuid,
  text,
  text,
  text,
  text,
  timestamptz,
  integer
) is 'Ingest RSS item da fonte verificata con dedup applicativo e gate trust score';
