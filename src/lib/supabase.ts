import { createClient } from '@supabase/supabase-js'
import type { Profile, Course, Lesson, Puzzle, UserPuzzleAttempt, UserCourseProgress, Subscription, AssessmentResult, UserWeeklyXp, Tournament } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

type TableDef<Row> = { Row: Row; Insert: AnyRecord; Update: AnyRecord }

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<Profile>
      courses: TableDef<Course>
      lessons: TableDef<Lesson>
      puzzles: TableDef<Puzzle>
      user_puzzle_attempts: TableDef<UserPuzzleAttempt>
      user_course_progress: TableDef<UserCourseProgress>
      subscriptions: TableDef<Subscription>
      assessment_results: TableDef<AssessmentResult>
      user_weekly_xp: TableDef<UserWeeklyXp>
      tournaments: TableDef<Tournament>
      tournament_participants: TableDef<{ tournament_id: string; user_id: string; registered_at: string }>
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Functions: Record<string, { Args: any; Returns: any }>
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient(supabaseUrl, supabaseAnonKey) as any
