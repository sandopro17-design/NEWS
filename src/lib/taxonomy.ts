import { supabase } from './supabase'

export type UserTag = {
  id: string
  tag: string
}

export type UserMetatag = {
  id: string
  name: string
}

export type TagMetatagLink = {
  user_tag_id: string
  user_metatag_id: string
}

export async function listUserTags(userId: string): Promise<UserTag[]> {
  const { data, error } = await supabase
    .from('user_tags')
    .select('id, tag')
    .eq('user_id', userId)
    .order('tag', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createUserTag(userId: string, tag: string): Promise<void> {
  const cleanTag = tag.trim()
  if (!cleanTag) return
  const { error } = await supabase.from('user_tags').insert({ user_id: userId, tag: cleanTag })
  if (error && error.code !== '23505') throw error
}

export async function deleteUserTag(tagId: string): Promise<void> {
  const { error } = await supabase.from('user_tags').delete().eq('id', tagId)
  if (error) throw error
}

export async function listUserMetatags(userId: string): Promise<UserMetatag[]> {
  const { data, error } = await supabase
    .from('user_metatags')
    .select('id, name')
    .eq('user_id', userId)
    .order('name', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createUserMetatag(userId: string, name: string): Promise<void> {
  const cleanName = name.trim()
  if (!cleanName) return
  const { error } = await supabase.from('user_metatags').insert({ user_id: userId, name: cleanName })
  if (error && error.code !== '23505') throw error
}

export async function deleteUserMetatag(metatagId: string): Promise<void> {
  const { error } = await supabase.from('user_metatags').delete().eq('id', metatagId)
  if (error) throw error
}

export async function listTagMetatagLinks(userId: string): Promise<TagMetatagLink[]> {
  const { data, error } = await supabase
    .from('user_tag_metatags')
    .select('user_tag_id, user_metatag_id, user_tags!inner(user_id)')
    .eq('user_tags.user_id', userId)
  if (error) throw error
  return (data ?? []).map((row) => ({
    user_tag_id: row.user_tag_id,
    user_metatag_id: row.user_metatag_id,
  }))
}

export async function attachTagToMetatag(tagId: string, metatagId: string): Promise<void> {
  const { error } = await supabase
    .from('user_tag_metatags')
    .insert({ user_tag_id: tagId, user_metatag_id: metatagId })
  if (error && error.code !== '23505') throw error
}

export async function detachTagFromMetatag(tagId: string, metatagId: string): Promise<void> {
  const { error } = await supabase
    .from('user_tag_metatags')
    .delete()
    .eq('user_tag_id', tagId)
    .eq('user_metatag_id', metatagId)
  if (error) throw error
}

export type VerifiedSource = {
  id: string
  name: string
  feed_url: string
}

export type TagSourceLink = {
  user_tag_id: string
  verified_source_id: string
}

export async function listVerifiedSources(limit = 100): Promise<VerifiedSource[]> {
  const { data, error } = await supabase
    .from('verified_sources')
    .select('id, name, feed_url')
    .order('verified_at', { ascending: false, nullsFirst: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function listTagSourceLinks(userId: string): Promise<TagSourceLink[]> {
  const { data, error } = await supabase
    .from('user_tag_sources')
    .select('user_tag_id, verified_source_id, user_tags!inner(user_id)')
    .eq('user_tags.user_id', userId)
  if (error) throw error
  return (data ?? []).map((row) => ({
    user_tag_id: row.user_tag_id,
    verified_source_id: row.verified_source_id,
  }))
}

export async function attachTagToSource(tagId: string, sourceId: string): Promise<void> {
  const { error } = await supabase
    .from('user_tag_sources')
    .insert({ user_tag_id: tagId, verified_source_id: sourceId })
  if (error && error.code !== '23505') throw error
}

export async function detachTagFromSource(tagId: string, sourceId: string): Promise<void> {
  const { error } = await supabase
    .from('user_tag_sources')
    .delete()
    .eq('user_tag_id', tagId)
    .eq('verified_source_id', sourceId)
  if (error) throw error
}

export type ThematicFeedItem = {
  feed_item_id: string
  title: string
  link: string
  summary: string | null
  published_at: string | null
  source_id: string
  source_name: string
  source_feed_url: string
  tag_id: string
  tag: string
  metatag_id: string | null
  metatag_name: string | null
}

export async function getUserRssFeed(params?: {
  tag?: string
  metatag?: string
  limit?: number
}): Promise<ThematicFeedItem[]> {
  const { data, error } = await supabase.rpc('get_user_rss_feed', {
    p_tag: params?.tag ?? null,
    p_metatag: params?.metatag ?? null,
    p_limit: params?.limit ?? 30,
  })
  if (error) throw error
  return (data ?? []) as ThematicFeedItem[]
}
