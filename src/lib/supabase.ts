import { createClient } from '@supabase/supabase-js'
import type {
  Profile, Course, Lesson, Puzzle, UserPuzzleAttempt, UserCourseProgress,
  Subscription, AssessmentResult, UserWeeklyXp, Tournament, OpeningLine, League,
  CosmeticKind, CosmeticRarity, EventKind, EventTaskType,
  SeasonalEvent, SeasonalEventDetail, TaskResult, ChessathonProgress, OwnedCosmetic,
  OpeningChallengeStatus, OpeningSession, OpeningAnswerResult, OpeningSessionSummary,
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

export type ChallengeStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'expired'

export interface MatchChallenge {
  id: string
  from_user: string
  to_user: string
  rated: boolean
  minutes: number
  increment_seconds: number
  status: ChallengeStatus
  match_id: string | null
  created_at: string
  expires_at: string
}

export type MatchStatus = 'active' | 'finished' | 'aborted'
export type MatchResult = 'white' | 'black' | 'draw'
export type MatchReason =
  | 'checkmate' | 'resign' | 'timeout' | 'stalemate'
  | 'insufficient' | 'repetition' | 'fifty' | 'agreement' | 'abandon'

export interface Match {
  id: string
  white_id: string
  black_id: string
  rated: boolean
  /** Ligile de la începutul partidei — XP-ul se calculează din diferenţa lor. */
  white_league: League
  black_league: League
  minutes: number
  increment_seconds: number
  fen: string
  /** Mutările în notaţie UCI, separate prin spaţiu. */
  moves: string
  turn: 'w' | 'b'
  white_time_ms: number
  black_time_ms: number
  last_move_at: string
  draw_offer_by: string | null
  status: MatchStatus
  result: MatchResult | null
  result_reason: MatchReason | null
  winner_id: string | null
  xp_awarded: number
  started_at: string
  finished_at: string | null
}

// ============================================================
// Evenimente şi cosmetice (migrările 030–031)
// ============================================================
// Rândurile brute. În aplicaţie se citesc aproape exclusiv prin RPC-uri, fiindcă
// `event_tasks` nu are politică de select — payload-ul conţine răspunsul corect.

export interface CosmeticRow {
  id: string
  kind: CosmeticKind
  name: string
  description: string | null
  rarity: CosmeticRarity
  payload: Record<string, unknown>
  created_at: string
}

export interface UserCosmeticRow {
  user_id: string
  cosmetic_id: string
  earned_at: string
  source: string | null
}

export interface EventRow {
  id: string
  slug: string
  kind: EventKind
  title: string
  tagline: string | null
  description: string | null
  starts_at: string
  ends_at: string
  config: Record<string, unknown>
  accent_color: string
  icon: string
  is_published: boolean
  created_at: string
}

export interface EventTaskRow {
  id: string
  event_id: string
  order_index: number
  available_at: string | null
  title: string
  prompt: string | null
  task_type: EventTaskType
  puzzle_id: string | null
  payload: Record<string, unknown>
  xp_reward: number
  cosmetic_reward: string | null
}

export interface UserEventTaskRow {
  user_id: string
  task_id: string
  completed_at: string
  correct: boolean
}

export interface XpLedgerRow {
  id: number
  user_id: string
  amount: number
  source: string | null
  created_at: string
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
      match_challenges: TableDef<MatchChallenge, 'id' | 'created_at' | 'expires_at' | 'status' | 'match_id'>
      matches: TableDef<
        Match,
        'id' | 'started_at' | 'last_move_at' | 'fen' | 'moves' | 'turn' | 'status' | 'xp_awarded',
        [{
          foreignKeyName: 'matches_white_id_fkey'
          columns: ['white_id']
          isOneToOne: false
          referencedRelation: 'profiles'
          referencedColumns: ['id']
        }, {
          foreignKeyName: 'matches_black_id_fkey'
          columns: ['black_id']
          isOneToOne: false
          referencedRelation: 'profiles'
          referencedColumns: ['id']
        }]
      >
      cosmetics: TableDef<CosmeticRow, 'created_at'>
      user_cosmetics: TableDef<
        UserCosmeticRow,
        'earned_at',
        [{
          foreignKeyName: 'user_cosmetics_cosmetic_id_fkey'
          columns: ['cosmetic_id']
          isOneToOne: false
          referencedRelation: 'cosmetics'
          referencedColumns: ['id']
        }]
      >
      events: TableDef<EventRow, Generated | 'config' | 'accent_color' | 'icon' | 'is_published'>
      event_tasks: TableDef<EventTaskRow, 'id' | 'payload' | 'xp_reward'>
      user_event_tasks: TableDef<UserEventTaskRow, 'completed_at' | 'correct'>
      xp_ledger: TableDef<XpLedgerRow, Generated>
    }
    Views: Record<string, never>
    Functions: {
      award_xp: {
        /** `p_source` etichetează rândul din jurnal ('puzzle', 'event:slug'...). */
        Args: { p_user_id: string; p_amount: number; p_source?: string | null }
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
      league_rank: {
        Args: { p_league: string }
        Returns: number
      }
      create_challenge: {
        Args: { p_to_user: string; p_rated: boolean; p_minutes: number; p_increment: number }
        Returns: string
      }
      respond_challenge: {
        Args: { p_challenge_id: string; p_accept: boolean }
        /** Id-ul partidei create la acceptare; `null` la refuz. */
        Returns: string | null
      }
      resign_match: {
        Args: { p_match_id: string }
        Returns: void
      }
      offer_or_accept_draw: {
        Args: { p_match_id: string }
        Returns: 'offered' | 'accepted'
      }
      claim_timeout: {
        Args: { p_match_id: string }
        Returns: void
      }
      my_league_standing: {
        Args: { p_week_start: string }
        Returns: {
          rank: number
          weekly_xp: number
          members: number
          promote_slots: number
          relegate_slots: number
          in_promotion_zone: boolean
          in_relegation_zone: boolean
          shields_left: number
        } | null
      }
      set_title: {
        /** `null` scoate titlul. Serverul verifică dacă e deblocat. */
        Args: { p_title: string | null }
        Returns: void
      }
      wins_leaderboard: {
        /** `p_since` null = din totdeauna; altfel doar de la data dată. */
        Args: { p_since: string | null }
        Returns: { user_id: string; username: string; current_league: League; wins: number }[]
      }
      player_record: {
        Args: { p_user_id: string }
        Returns: { wins: number; draws: number; losses: number }[]
      }
      list_events: {
        Args: Record<string, never>
        Returns: SeasonalEvent[]
      }
      event_detail: {
        Args: { p_slug: string }
        Returns: SeasonalEventDetail | null
      }
      complete_event_task: {
        /** `p_answer` e indexul variantei alese; null pentru sarcini fără quiz. */
        Args: { p_task_id: string; p_answer?: number | null }
        Returns: TaskResult
      }
      event_task_puzzle: {
        Args: { p_task_id: string }
        Returns: Puzzle | null
      }
      chessathon_progress: {
        Args: { p_slug: string }
        Returns: ChessathonProgress | null
      }
      claim_chessathon_reward: {
        Args: { p_slug: string }
        Returns: { cosmetic: string; cosmetic_is_new: boolean }
      }
      my_cosmetics: {
        Args: Record<string, never>
        Returns: OwnedCosmetic[]
      }
      equip_cosmetic: {
        Args: { p_cosmetic_id: string }
        Returns: void
      }
      unequip_cosmetic: {
        Args: { p_kind: CosmeticKind }
        Returns: void
      }
      opening_challenge_status: {
        Args: Record<string, never>
        Returns: OpeningChallengeStatus | null
      }
      start_opening_session: {
        Args: Record<string, never>
        Returns: OpeningSession
      }
      opening_session_state: {
        Args: { p_session_id: string }
        Returns: OpeningSession | null
      }
      answer_opening_question: {
        Args: { p_session_id: string; p_answer: number }
        Returns: OpeningAnswerResult
      }
      finish_opening_session: {
        Args: { p_session_id: string }
        Returns: OpeningSessionSummary
      }
      next_puzzle_for: {
        Args: { p_floor: number; p_ceil: number }
        /** `unseen_left` spune când merită completată banda de la Lichess. */
        Returns: { puzzle: Puzzle | null; unseen_left: number; band_total: number }
      }
      store_lichess_puzzle: {
        Args: {
          p_id: string; p_fen: string; p_moves: string
          p_rating: number; p_themes: string[]; p_game_url: string | null
        }
        Returns: void
      }
      puzzle_band_counts: {
        Args: Record<string, never>
        Returns: { floor_rating: number; total: number }[]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
