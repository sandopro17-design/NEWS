import { supabase } from './supabase'

export type SocialProfile = {
  id: string
  display_name: string | null
  headline: string | null
  avatar_url: string | null
}

export type FeedPost = {
  id: string
  body: string
  created_at: string
  author_id: string
  author: SocialProfile | null
}

export async function getFollowingIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('follows')
    .select('followee_id')
    .eq('follower_id', userId)

  if (error) throw error
  return (data ?? []).map((row) => row.followee_id)
}

export async function getSuggestedProfiles(userId: string, limit = 10): Promise<SocialProfile[]> {
  const followingIds = await getFollowingIds(userId)
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, headline, avatar_url')
    .order('updated_at', { ascending: false })
    .limit(limit * 3)

  if (error) throw error
  const excludedIds = new Set([userId, ...followingIds])
  return (data ?? []).filter((profile) => !excludedIds.has(profile.id)).slice(0, limit)
}

export async function followUser(userId: string, followeeId: string): Promise<void> {
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: userId, followee_id: followeeId })

  if (error && error.code !== '23505') throw error
}

export async function unfollowUser(userId: string, followeeId: string): Promise<void> {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', userId)
    .eq('followee_id', followeeId)

  if (error) throw error
}

export async function getPersonalFeed(
  userId: string,
  page: number,
  pageSize: number,
): Promise<FeedPost[]> {
  const followingIds = await getFollowingIds(userId)
  const authorIds = [...new Set([userId, ...followingIds])]

  if (authorIds.length === 0) return []

  const from = page * pageSize
  const to = from + pageSize - 1

  const { data, error } = await supabase
    .from('profile_posts')
    .select(
      'id, body, created_at, author_id, author:profiles!profile_posts_author_id_fkey(id, display_name, headline, avatar_url)',
    )
    .in('author_id', authorIds)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error
  return (data ?? []).map((row) => ({
    id: row.id,
    body: row.body,
    created_at: row.created_at,
    author_id: row.author_id,
    author: Array.isArray(row.author) ? (row.author[0] ?? null) : row.author,
  }))
}

export async function createProfilePost(authorId: string, body: string): Promise<void> {
  const cleanBody = body.trim()
  if (!cleanBody) return
  const { error } = await supabase.from('profile_posts').insert({
    author_id: authorId,
    body: cleanBody,
  })
  if (error) throw error
}
