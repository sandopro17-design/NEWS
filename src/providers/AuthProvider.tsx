import type { Session, User } from '@supabase/supabase-js'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { ensureProfile, getProfile, type UserProfile } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { AuthContext, type AuthContextValue } from './AuthContext'

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setProfile(null)
      return
    }
    const existing = await getProfile(user.id)
    if (existing) {
      setProfile(existing)
      return
    }
    const created = await ensureProfile(user)
    setProfile(created)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return
    const current = await getProfile(session.user.id)
    setProfile(current)
  }, [session?.user])

  useEffect(() => {
    let mounted = true

    const boot = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession()
        if (!mounted) return
        setSession(initialSession)
        await loadProfile(initialSession?.user ?? null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      void loadProfile(nextSession?.user ?? null)
    })

    void boot()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      refreshProfile,
    }),
    [loading, profile, refreshProfile, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
