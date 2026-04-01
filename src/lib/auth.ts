import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

export type UserProfile = {
  id: string
  display_name: string | null
  headline: string | null
  avatar_url: string | null
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, headline, avatar_url')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function ensureProfile(user: User): Promise<UserProfile> {
  const fallbackName = user.user_metadata?.display_name
  const profilePatch = {
    id: user.id,
    display_name:
      typeof fallbackName === 'string' && fallbackName.trim().length > 0
        ? fallbackName.trim()
        : null,
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(profilePatch, { onConflict: 'id' })
    .select('id, display_name, headline, avatar_url')
    .single()

  if (error) throw error
  return data
}

export async function updateProfile(
  userId: string,
  patch: {
    display_name?: string | null
    headline?: string | null
  },
): Promise<UserProfile> {
  const payload: { id: string; display_name?: string | null; headline?: string | null } = {
    id: userId,
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'display_name')) {
    payload.display_name = patch.display_name ?? null
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'headline')) {
    payload.headline = patch.headline ?? null
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('id, display_name, headline, avatar_url')
    .single()

  if (error) throw error
  return data
}
