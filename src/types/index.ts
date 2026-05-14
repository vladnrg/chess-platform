export type League = 'cherestea' | 'tinichea' | 'bronz' | 'argint' | 'aur' | 'smarald' | 'diamant'
export type PlayingStyle = 'offensive' | 'balanced' | 'pragmatic' | 'defensive'
export type CourseLevel = 'fundamental' | 'beginner' | 'intermediate' | 'advanced'
export type SubscriptionPlan = 'monthly' | 'annual'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'

export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  playing_style: PlayingStyle | null
  current_league: League
  xp: number
  estimated_elo: number
  assessment_completed: boolean
  streak_days: number
  last_active_date: string | null
  city: string | null
  county: string | null
  lichess_username: string | null
  created_at: string
}

export type TournamentType = 'platform' | 'external'
export type TournamentCategory = 'online' | 'over_the_board' | 'workshop'

export interface Tournament {
  id: string
  title: string
  description: string | null
  type: TournamentType
  category: TournamentCategory | null
  city: string | null
  starts_at: string
  ends_at: string | null
  max_participants: number | null
  min_league: League | null
  is_open_to_minors: boolean
  registration_url: string | null
  organizer: string | null
  is_published: boolean
  created_at: string
}

export interface Course {
  id: string
  title: string
  slug: string
  description: string
  level: CourseLevel
  opening_family: string | null
  eco_code: string | null
  playing_styles: PlayingStyle[]
  is_premium: boolean
  is_foundational: boolean
  thumbnail_url: string | null
  lesson_count: number
  order_index: number
  created_at: string
  progress?: UserCourseProgress
}

export type LessonType = 'pgn' | 'rules' | 'notation'

export type ExerciseType = 'click_square' | 'move_piece' | 'identify_square'

export interface ClickSquareExercise {
  type: 'click_square'
  target: string
  fen: string
  instruction: string
}

export interface MovePieceExerciseData {
  type: 'move_piece'
  fen: string
  correct_move: string
  instruction: string
}

export interface IdentifySquareExercise {
  type: 'identify_square'
  square: string
  options: string[]
  instruction: string
  fen?: string
}

export type Exercise = ClickSquareExercise | MovePieceExerciseData | IdentifySquareExercise

export interface Lesson {
  id: string
  course_id: string
  title: string
  order_index: number
  lesson_type: LessonType
  pgn: string | null
  theory_html: string | null
  key_positions: KeyPosition[] | null
  exercises: Exercise[] | null
  is_premium: boolean
  duration_minutes: number
}

export interface KeyPosition {
  fen: string
  explanation: string
  move?: string
}

export interface UserCourseProgress {
  user_id: string
  course_id: string
  completed_lesson_ids: string[]
  last_lesson_id: string | null
  xp_earned: number
  started_at: string
  completed_at: string | null
}

export interface Puzzle {
  id: string
  fen: string
  moves: string
  rating: number
  themes: string[]
  game_url: string | null
}

export interface UserPuzzleAttempt {
  id: string
  user_id: string
  puzzle_id: string
  solved: boolean
  time_seconds: number
  attempted_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  created_at: string
}

export interface OpeningLine {
  id: string
  course_id: string
  variation_name: string
  variation_code: string
  popularity_pct: number
  order_index: number
  user_color: 'white' | 'black'
  moves_uci: string
  move_explanations: Record<string, string>
  created_at: string
}

export interface AssessmentResult {
  id: string
  user_id: string
  answers: Record<string, unknown>
  puzzle_score: number
  knowledge_score: number
  estimated_elo: number
  playing_style: PlayingStyle
  recommended_course_ids: string[]
  taken_at: string
}

export interface UserWeeklyXp {
  id: string
  user_id: string
  week_start: string
  xp_earned: number
  league_at_week_start: League
  relegation_warning_sent: boolean
}

export interface LeagueConfig {
  name: League
  label: string
  minXp: number
  maxXp: number | null
  weeklyMinXp: number
  color: string
  textColor: string
}

export const LEAGUES: LeagueConfig[] = [
  { name: 'cherestea', label: 'Cherestea', minXp: 0,    maxXp: 299,  weeklyMinXp: 30,  color: '#8B6914', textColor: '#fff' },
  { name: 'tinichea',  label: 'Tinichea',  minXp: 300,  maxXp: 699,  weeklyMinXp: 50,  color: '#71797E', textColor: '#fff' },
  { name: 'bronz',     label: 'Bronz',     minXp: 700,  maxXp: 1299, weeklyMinXp: 75,  color: '#CD7F32', textColor: '#fff' },
  { name: 'argint',    label: 'Argint',    minXp: 1300, maxXp: 2199, weeklyMinXp: 100, color: '#C0C0C0', textColor: '#111' },
  { name: 'aur',       label: 'Aur',       minXp: 2200, maxXp: 3499, weeklyMinXp: 150, color: '#FFD700', textColor: '#111' },
  { name: 'smarald',   label: 'Smarald',   minXp: 3500, maxXp: 5499, weeklyMinXp: 200, color: '#50C878', textColor: '#111' },
  { name: 'diamant',   label: 'Diamant',   minXp: 5500, maxXp: null, weeklyMinXp: 250, color: '#B9F2FF', textColor: '#111' },
]

export const PLAYING_STYLE_LABELS: Record<PlayingStyle, string> = {
  offensive: 'Ofensiv',
  balanced: 'Echilibrat',
  pragmatic: 'Pragmatic',
  defensive: 'Defensiv',
}

export const LEVEL_LABELS: Record<CourseLevel, string> = {
  fundamental: 'Baze',
  beginner: 'Începător',
  intermediate: 'Intermediar',
  advanced: 'Avansat',
}
