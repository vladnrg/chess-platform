import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import type { Profile } from '@/types'
import { supabase } from '@/lib/supabase'

interface AuthState {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  initialized: boolean
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  fetchProfile: (userId: string) => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  setSession: (session) => {
    set({ session, user: session?.user ?? null })
    if (session?.user) {
      void get().fetchProfile(session.user.id)
    } else {
      set({ profile: null })
    }
  },

  setProfile: (profile) => set({ profile }),

  fetchProfile: async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) set({ profile: data as Profile })
  },

  /**
   * Deconectarea. Starea locală se curăţă ÎNTÂI, nu după răspunsul serverului.
   *
   * Aşa era înainte: `await supabase.auth.signOut()` şi abia apoi curăţarea. Iar
   * apelul acela poate să nu se întoarcă niciodată cu bine:
   *
   *  - dacă sesiunea e deja invalidă pe server (expirată, revocată din alt
   *    dispozitiv), răspunde cu 403 şi aruncă;
   *  - dacă în acelaşi moment se reîmprospătează token-ul, apelul aşteaptă
   *    lacătul luat de bibliotecă şi poate rămâne agăţat.
   *
   * În ambele cazuri, tot ce venea după `await` nu se mai executa: utilizatorul
   * rămânea conectat, nu se naviga nicăieri, iar butonul părea mort — exact
   * simptomul raportat.
   *
   * Deconectarea e o decizie a utilizatorului, nu o cerere pe care serverul o
   * poate refuza. Curăţăm local pe loc, iar confirmarea o aşteptăm după.
   */
  signOut: async () => {
    set({ session: null, user: null, profile: null })

    try {
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, respinge) =>
          setTimeout(() => respinge(new Error('fără răspuns')), RASPUNS_SERVER_MS)),
      ])
    } catch {
      // Serverul n-a confirmat. Ştergem noi jetonul păstrat, altfel o simplă
      // reîncărcare de pagină ar reînvia sesiunea tocmai închisă.
      stergeJetonulPastrat()
    }
  },
}))

/** Cât aşteptăm confirmarea serverului înainte să mergem mai departe. */
const RASPUNS_SERVER_MS = 3000

/**
 * Şterge jetonul pe care supabase-js îl ţine în `localStorage`.
 *
 * Plasă de siguranţă, folosită doar când `signOut()` n-a răspuns. Cheia are
 * forma `sb-<proiect>-auth-token`, aşa cum o scrie biblioteca.
 */
function stergeJetonulPastrat() {
  try {
    for (const cheie of Object.keys(localStorage)) {
      if (cheie.startsWith('sb-') && cheie.endsWith('-auth-token')) {
        localStorage.removeItem(cheie)
      }
    }
  } catch {
    // Mod privat sau spaţiu plin. Starea din memorie e deja curăţată, deci
    // utilizatorul e oricum deconectat în sesiunea asta.
  }
}
