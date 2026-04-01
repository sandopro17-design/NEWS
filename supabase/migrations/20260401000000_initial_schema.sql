-- TrueFlow: schema iniziale (NEW-5)
-- Tabelle: profiles, follows, user_tags, user_metatags, associazione tag↔metatag, verified_sources, feed_items
-- RLS e policy: ticket dedicato (NEW-6)

-- Profilo applicativo legato a auth.users (1:1)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  headline text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_updated_at_idx on public.profiles (updated_at desc);

-- Follower → followee (modello “segui persone”)
create table public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followee_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint follows_no_self check (follower_id <> followee_id),
  constraint follows_follower_followee_unique unique (follower_id, followee_id)
);

create index follows_follower_id_idx on public.follows (follower_id);
create index follows_followee_id_idx on public.follows (followee_id);

-- Tag configurati dall’utente (dimensione feed verticale)
create table public.user_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  tag text not null,
  created_at timestamptz not null default now(),
  constraint user_tags_user_tag_unique unique (user_id, tag)
);

create index user_tags_user_id_idx on public.user_tags (user_id);

-- Metatag (seconda dimensione / raggruppamento lato utente)
create table public.user_metatags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  constraint user_metatags_user_name_unique unique (user_id, name)
);

create index user_metatags_user_id_idx on public.user_metatags (user_id);

-- Associazione molti-a-molti: quali tag ricadono sotto quali metatag (per utente, via FK)
create table public.user_tag_metatags (
  user_tag_id uuid not null references public.user_tags (id) on delete cascade,
  user_metatag_id uuid not null references public.user_metatags (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_tag_id, user_metatag_id)
);

create index user_tag_metatags_metatag_id_idx on public.user_tag_metatags (user_metatag_id);

-- Fonti RSS certificate (curate / verificate)
create table public.verified_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  feed_url text not null,
  website_url text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint verified_sources_feed_url_unique unique (feed_url)
);

create index verified_sources_verified_at_idx on public.verified_sources (verified_at desc nulls last);

-- Item da feed collegati a una fonte verificata
create table public.feed_items (
  id uuid primary key default gen_random_uuid(),
  verified_source_id uuid not null references public.verified_sources (id) on delete cascade,
  external_id text,
  title text not null,
  link text not null,
  summary text,
  published_at timestamptz,
  fetched_at timestamptz not null default now(),
  constraint feed_items_source_external_unique unique (verified_source_id, external_id)
);

create index feed_items_source_published_idx on public.feed_items (verified_source_id, published_at desc nulls last);
create index feed_items_published_at_idx on public.feed_items (published_at desc nulls last);

comment on table public.profiles is 'Profilo utente TrueFlow, allineato a auth.users';
comment on table public.follows is 'Relazione follower/followee tra profili';
comment on table public.user_tags is 'Tag scelti dall’utente per il feed verticale';
comment on table public.user_metatags is 'Metatag configurabili dall’utente';
comment on table public.user_tag_metatags is 'Collegamento tag ↔ metatag';
comment on table public.verified_sources is 'Fonti RSS certificate';
comment on table public.feed_items is 'Articoli/item da fonti verificate';
