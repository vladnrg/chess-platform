import { createClient } from '@supabase/supabase-js'
import type {
  Profile, Course, Lesson, Puzzle, UserPuzzleAttempt, UserCourseProgress,
  Subscription, AssessmentResult, UserWeeklyXp, Tournament, OpeningLine,
} from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars')
}

/**
 * supabase-js cere `Row extends Record<string, unknown>`. Un `interface` din TS nu
 * primește index signature implicit, deci nu satisface constrângerea și tot clientul
 * cade pe `never`. Trecerea prin acest mapped type produce un tip obiect anonim,
 * echivalent structural, care o satisface.
 */
type Cols<T> = { [K in keyof T]: T[K] }

/** Cheile a căror valoare poate fi `null` — coloane nullable în Postgres. */
type NullableKeys<T> = { [K in keyof T]-?: null extends T[K] ? K : never }[keyof T]

/** Cheie străină, în forma pe care o folosește postgrest-js ca să tipeze join-urile. */
type Relationship = {
  foreignKeyName: string
  columns: string[]
  isOneToOne?: boolean
  referencedRelation: string
  referencedColumns: string[]
}

/**
 * Definiția unui tabel în forma cerută de supabase-js.
 *
 * La insert sunt opționale coloanele nullable (Postgres pune NULL) plus cele
 * enumerate în `Defaulted` (au DEFAULT). Restul rămân obligatorii. `Relationships`
 * e obligatoriu — fără el tipul nu satisface `GenericTable` și clientul cade pe `never`.
 */
type TableDef<
  Row,
  Defaulted extends keyof Row = never,
  Rels extends Relationship[] = [],
> = {
  Row: Cols<Row>
  Insert: Cols<
    Omit<Row, Defaulted | NullableKeys<Row>> &
      Partial<Pick<Row, Defaulted | NullableKeys<Row>>>
  >
  Update: Cols<Partial<Row>>
  Relationships: Rels
}

// Coloane generate de Postgres, deci opționale la insert în aproape toate tabelele.
type Generated = 'id' | 'created_at'

export interface ChildSession {
  id: string
  user_id: string
  session_number: number
  started_at: string
  expires_at: string
  ended_at: string | null
  break_duration_minutes: number
  break_starts_at: string | null
  break_ends_at: string | null
  last_seen_at: string | null
  warning_sent: boolean
}

export interface ParentalLink {
  id: string
  user_id: string
  token: string
  type: 'confirm' | 'reject' | 'stats' | 'payment'
  expires_at: string
  used_at: string | null
}

export interface PuzzleRatingHistory {
  id: string
  user_id: string
  rating: number
  created_at: string
}

export interface UserOpeningStats {
  id: string
  user_id: string
  eco: string
  opening_name: string
  color: 'white' | 'black'
  wins: number
  draws: number
  losses: number
  last_imported_at: string | null
}

export interface TournamentParticipant {
  tournament_id: string
  user_id: string
  registered_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<Profile, 'created_at'>
      courses: TableDef<Course, Generated>
      lessons: TableDef<Lesson, 'id'>
      puzzles: TableDef<Puzzle, never>
      user_puzzle_attempts: TableDef<UserPuzzleAttempt, 'id' | 'attempted_at'>
      user_course_progress: TableDef<UserCourseProgress, 'started_at' | 'completed_at'>
      subscriptions: TableDef<Subscription, Generated>
      assessment_results: TableDef<AssessmentResult, 'id' | 'taken_at'>
      user_weekly_xp: TableDef<
        UserWeeklyXp,
        'id',
        [{
          foreignKeyName: 'user_weekly_xp_user_id_fkey'
          columns: ['user_id']
          isOneToOne: false
          referencedRelation: 'profiles'
          referencedColumns: ['id']
        }]
      >
      tournaments: TableDef<Tournament, Generated>
      tournament_participants: TableDef<TournamentParticipant, 'registered_at'>
      opening_lines: TableDef<OpeningLine, Generated>
      child_sessions: TableDef<ChildSession, 'id' | 'started_at' | 'last_seen_at' | 'warning_sent'>
      parental_links: TableDef<
        ParentalLink,
        'id' | 'token',
        [{
          foreignKeyName: 'parental_links_user_id_fkey'
          columns: ['user_id']
          isOneToOne: false
          referencedRelation: 'profiles'
          referencedColumns: ['id']
        }]
      >
      puzzle_rating_history: TableDef<PuzzleRatingHistory, Generated>
      user_opening_stats: TableDef<UserOpeningStats, 'id' | 'last_imported_at'>
    }
    Views: Record<string, never>
    Functions: {
      award_xp: {
        Args: { p_user_id: string; p_amount: number }
        Returns: void
      }
      set_puzzle_placement: {
        Args: { p_user_id: string; p_rating: number }
        Returns: number
      }
      apply_puzzle_result: {
        Args: { p_user_id: string; p_puzzle_id: string; p_solved: boolean }
        // Funcția întoarce jsonb: fie rezultatul, fie un obiect de eroare
        // ('not_placed' / 'puzzle_not_found' / 'out_of_range').
        Returns:
          | { rating: number; delta: number; promoted: boolean; streak: number; offset: number }
          | { error: string; offset?: number }
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
