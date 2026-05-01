import { createClient } from '@supabase/supabase-js'
import type { Profile, Course, Lesson, Puzzle, UserPuzzleAttempt, UserCourseProgress, Subscription, AssessmentResult, UserWeeklyXp } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars')
}

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      courses: { Row: Course; Insert: Partial<Course>; Update: Partial<Course> }
      lessons: { Row: Lesson; Insert: Partial<Lesson>; Update: Partial<Lesson> }
      puzzles: { Row: Puzzle; Insert: Partial<Puzzle>; Update: Partial<Puzzle> }
      user_puzzle_attempts: { Row: UserPuzzleAttempt; Insert: Partial<UserPuzzleAttempt>; Update: Partial<UserPuzzleAttempt> }
      user_course_progress: { Row: UserCourseProgress; Insert: Partial<UserCourseProgress>; Update: Partial<UserCourseProgress> }
      subscriptions: { Row: Subscription; Insert: Partial<Subscription>; Update: Partial<Subscription> }
      assessment_results: { Row: AssessmentResult; Insert: Partial<AssessmentResult>; Update: Partial<AssessmentResult> }
      user_weekly_xp: { Row: UserWeeklyXp; Insert: Partial<UserWeeklyXp>; Update: Partial<UserWeeklyXp> }
    }
    Functions: {
      award_xp: { Args: { p_user_id: string; p_amount: number }; Returns: void }
    }
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
