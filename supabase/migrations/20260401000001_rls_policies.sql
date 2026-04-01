-- NEW-6: RLS TrueFlow (allineato a schema NEW-5)
-- Scritture su verified_sources / feed_items solo da service role (nessuna policy INSERT/UPDATE/DELETE).

alter table public.profiles enable row level security;
alter table public.follows enable row level security;
alter table public.user_tags enable row level security;
alter table public.user_metatags enable row level security;
alter table public.user_tag_metatags enable row level security;
alter table public.verified_sources enable row level security;
alter table public.feed_items enable row level security;

-- Profili: lettura pubblica (directory); modifica solo sulla propria riga
create policy "profiles_select_public"
  on public.profiles for select
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  to authenticated
  using (auth.uid() = id);

-- Follow: grafo visibile a tutti (anon + autenticati); mutazioni solo come follower
create policy "follows_select_public"
  on public.follows for select
  using (true);

create policy "follows_insert_as_follower"
  on public.follows for insert
  to authenticated
  with check (auth.uid() = follower_id);

create policy "follows_delete_as_follower"
  on public.follows for delete
  to authenticated
  using (auth.uid() = follower_id);

-- Tag e metatag: solo il proprietario
create policy "user_tags_own"
  on public.user_tags for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_metatags_own"
  on public.user_metatags for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Collegamenti tag↔metatag: solo se entrambi appartengono all’utente corrente
create policy "user_tag_metatags_own"
  on public.user_tag_metatags for all
  to authenticated
  using (
    exists (
      select 1 from public.user_tags ut
      where ut.id = user_tag_metatags.user_tag_id and ut.user_id = auth.uid()
    )
    and exists (
      select 1 from public.user_metatags um
      where um.id = user_tag_metatags.user_metatag_id and um.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.user_tags ut
      where ut.id = user_tag_metatags.user_tag_id and ut.user_id = auth.uid()
    )
    and exists (
      select 1 from public.user_metatags um
      where um.id = user_tag_metatags.user_metatag_id and um.user_id = auth.uid()
    )
  );

-- Fonti e item feed: sola lettura lato client (ingestion con service role)
create policy "verified_sources_select_public"
  on public.verified_sources for select
  using (true);

create policy "feed_items_select_public"
  on public.feed_items for select
  using (true);
