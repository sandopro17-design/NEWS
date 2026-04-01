import type { Session, User } from '@supabase/supabase-js'
import { createContext } from 'react'
import type { UserProfile } from '../lib/auth'

export type AuthContextValue = {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
