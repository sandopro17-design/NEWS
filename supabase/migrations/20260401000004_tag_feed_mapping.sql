-- NEW-18: M3 taxonomy + RSS feed mapping

create table if not exists public.user_tag_sources (
  user_tag_id uuid not null references public.user_tags (id) on delete cascade,
  verified_source_id uuid not null references public.verified_sources (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_tag_id, verified_source_id)
);

create index if not exists user_tag_sources_source_idx
  on public.user_tag_sources (verified_source_id);

alter table public.user_tag_sources enable row level security;

drop policy if exists "user_tag_sources_own" on public.user_tag_sources;
create policy "user_tag_sources_own"
  on public.user_tag_sources for all
  to authenticated
  using (
    exists (
      select 1
      from public.user_tags ut
      where ut.id = user_tag_sources.user_tag_id
        and ut.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.user_tags ut
      where ut.id = user_tag_sources.user_tag_id
        and ut.user_id = auth.uid()
    )
  );

create or replace function public.get_user_rss_feed(
  p_tag text default null,
  p_metatag text default null,
  p_limit int default 40
)
returns table (
  feed_item_id uuid,
  title text,
  link text,
  summary text,
  published_at timestamptz,
  source_id uuid,
  source_name text,
  source_feed_url text,
  tag_id uuid,
  tag text,
  metatag_id uuid,
  metatag_name text
)
language sql
security definer
set search_path = public
as $$
  select
    fi.id as feed_item_id,
    fi.title,
    fi.link,
    fi.summary,
    fi.published_at,
    vs.id as source_id,
    vs.name as source_name,
    vs.feed_url as source_feed_url,
    ut.id as tag_id,
    ut.tag,
    um.id as metatag_id,
    um.name as metatag_name
  from public.user_tags ut
  join public.user_tag_sources uts on uts.user_tag_id = ut.id
  join public.verified_sources vs on vs.id = uts.verified_source_id
  join public.feed_items fi on fi.verified_source_id = vs.id
  left join public.user_tag_metatags utm on utm.user_tag_id = ut.id
  left join public.user_metatags um on um.id = utm.user_metatag_id
  where ut.user_id = auth.uid()
    and (p_tag is null or ut.tag = p_tag)
    and (p_metatag is null or um.name = p_metatag)
  order by coalesce(fi.published_at, fi.fetched_at) desc
  limit greatest(1, least(coalesce(p_limit, 40), 200));
$$;

grant execute on function public.get_user_rss_feed(text, text, int) to authenticated;

comment on table public.user_tag_sources is 'Mappatura tra tag utente e fonti RSS verificate';
comment on function public.get_user_rss_feed(text, text, int) is 'Feed RSS tematico utente filtrabile per tag/metatag';
