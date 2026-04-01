-- NEW-17: social graph operativo + feed personale (M2)

create table if not exists public.profile_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profile_posts_body_not_empty check (char_length(trim(body)) > 0)
);

create index if not exists profile_posts_author_created_idx
  on public.profile_posts (author_id, created_at desc);
create index if not exists profile_posts_created_idx
  on public.profile_posts (created_at desc);

alter table public.profile_posts enable row level security;

drop policy if exists "profile_posts_select_personal_feed" on public.profile_posts;
create policy "profile_posts_select_personal_feed"
  on public.profile_posts for select
  to authenticated
  using (
    author_id = auth.uid()
    or exists (
      select 1
      from public.follows f
      where f.follower_id = auth.uid()
        and f.followee_id = profile_posts.author_id
    )
  );

drop policy if exists "profile_posts_insert_own" on public.profile_posts;
create policy "profile_posts_insert_own"
  on public.profile_posts for insert
  to authenticated
  with check (author_id = auth.uid());

drop policy if exists "profile_posts_update_own" on public.profile_posts;
create policy "profile_posts_update_own"
  on public.profile_posts for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

drop policy if exists "profile_posts_delete_own" on public.profile_posts;
create policy "profile_posts_delete_own"
  on public.profile_posts for delete
  to authenticated
  using (author_id = auth.uid());

comment on table public.profile_posts is 'Aggiornamenti pubblicati dagli utenti per feed personale dei follower';
