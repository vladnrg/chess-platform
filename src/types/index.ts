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
  puzzle_rating: number | null
  puzzle_win_streak: number
  assessment_completed: boolean
  streak_days: number
  last_active_date: string | null
  city: string | null
  county: string | null
  lichess_username: string | null
  created_at: string
  // Conturi de copil (migrarea 003). `is_minor` se calculează în cod din birth_year.
  birth_year: number | null
  parental_email: string | null
  parental_consent_token: string | null
  parental_consent_given: boolean
  parental_consent_expires_at: string | null
  account_frozen: boolean
  account_frozen_reason: 'awaiting_parental_consent' | 'rejected' | null
  // Deblocări pe niveluri (migrarea 027)
  /** Titlul ales dintre cele deblocate; `null` = niciunul. */
  title: string | null
  /** Câte scuturi de retrogradare a consumat. Câte are se deduce din nivel. */
  shields_used: number
  /** Câte promovări onorifice a consumat. La fel, câte are se deduce din nivel. */
  honorary_used: number
  // Cosmetice (migrarea 030)
  /** Id-ul badge-ului afişat lângă nume; `null` = niciunul. */
  equipped_badge: string | null
  /** Id-ul temei de tablă; `null` = tema implicită. */
  equipped_board: string | null
}

// ============================================================
// Evenimente sezoniere şi cosmetice (migrările 030–031)
// ============================================================

export type CosmeticKind = 'badge' | 'board'
export type CosmeticRarity = 'common' | 'rare' | 'epic' | 'legendary'

/** Culorile câmpurilor pentru o temă de tablă. */
export interface BoardPayload {
  light: string
  dark: string
}

/** Emoji-ul şi culoarea unui badge de profil. */
export interface BadgePayload {
  emoji: string
  color: string
}

export interface Cosmetic {
  id: string
  kind: CosmeticKind
  name: string
  description: string | null
  rarity: CosmeticRarity
  payload: BoardPayload | BadgePayload | Record<string, never>
}

/** Un cosmetic pe care îl deţin, cu momentul şi evenimentul din care a venit. */
export interface OwnedCosmetic extends Cosmetic {
  earned_at: string
  source: string | null
}

export type EventKind = 'chessathon' | 'player_day' | 'name_opening' | 'advent' | 'promo'
export type EventStatus = 'upcoming' | 'live' | 'ended'
export type EventTaskType = 'puzzle' | 'quiz' | 'info'

/**
 * Datele unei sarcini. Câmpurile `answer` şi `explanation` lipsesc până când
 * răspunzi — serverul le taie din `event_detail`, ca răspunsul să nu poată fi
 * citit din consola browserului.
 */
export interface EventTaskPayload {
  options?: string[]
  answer?: number
  explanation?: string
  /**
   * Mutările de arătat pe tablă, în notaţie UCI („e2e4 e7e5 g1f3").
   * Prezente la întrebările despre deschideri: notaţia singură nu spune nimic
   * cuiva care încă n-o citeşte din cap.
   */
  moves?: string
}

export interface EventTask {
  id: string
  order_index: number
  title: string
  prompt: string | null
  task_type: EventTaskType
  puzzle_id: string | null
  xp_reward: number
  cosmetic_reward: string | null
  available_at: string | null
  /** Fereastra sarcinii s-a deschis (uşile de calendar nu se deschid mai devreme). */
  is_open: boolean
  done: boolean
  payload: EventTaskPayload
}

/** Un eveniment aşa cum apare în listă — fără sarcini, doar cu progresul. */
export interface SeasonalEvent {
  slug: string
  kind: EventKind
  title: string
  tagline: string | null
  description: string | null
  starts_at: string
  ends_at: string
  config: Record<string, unknown>
  accent_color: string
  /** Numele unui icon lucide-react, rezolvat în client. */
  icon: string
  status: EventStatus
  total_tasks: number
  done_tasks: number
}

export type SeasonalEventDetail = Omit<SeasonalEvent, 'total_tasks' | 'done_tasks'> & {
  tasks: EventTask[]
}

export interface ChessathonProgress {
  target_xp: number
  my_xp: number
  community_xp: number
  participants: number
  reached: boolean
}

/** Ce s-a întâmplat după ce ai rezolvat o sarcină. */
export interface TaskResult {
  correct: boolean
  xp: number
  already_done?: boolean
  cosmetic?: string | null
  cosmetic_is_new?: boolean
  answer?: number
  explanation?: string | null
}

// ============================================================
// Provocarea deschiderilor (migrările 033–034)
// ============================================================

/**
 * O întrebare dintr-un calup. `answer` şi `explanation` sunt `null` până când
 * răspunzi — serverul le taie, ca soluţia să nu poată fi citită din consolă.
 */
export interface OpeningQuestion {
  index: number
  /** Mutările în notaţie UCI, pentru tablă. */
  moves: string
  title: string
  prompt: string
  options: string[]
  /** Ce am răspuns. `null` = încă n-am ajuns aici. */
  my_answer: number | null
  answer: number | null
  explanation: string | null
}

export interface OpeningSession {
  id: string
  session_date: string
  total: number
  answered: number
  correct_count: number | null
  xp_awarded: number | null
  finished: boolean
  questions: OpeningQuestion[]
}

/** Ce întoarce serverul imediat după un răspuns. Definitiv — nu se reia. */
export interface OpeningAnswerResult {
  index: number
  correct: boolean
  answer: number
  explanation: string
  is_last: boolean
}

export interface OpeningSessionSummary {
  correct: number
  total: number
  xp: number
  already?: boolean
}

/** Starea provocării de azi — pentru butonul din Bârlog. */
export interface OpeningChallengeStatus {
  is_challenge_day: boolean
  today: string
  next_day: string
  /** 1 = zile impare (luni, miercuri, vineri, duminică); 0 = pare (marți, joi, sâmbătă). */
  parity: 0 | 1
  /** Paritatea a fost deja fixată pentru săptămâna asta. */
  schedule_locked: boolean
  session_id: string | null
  answered: number
  total: number
  finished: boolean
  correct_count: number | null
  xp_awarded: number | null
}

/** XP-ul unui calup. Trebuie să corespundă cu `opening_session_xp` din 033. */
export const OPENING_XP = {
  perCorrect: 8,
  perWrong: -3,
  perfectBonus: 15,
} as const

export function openingSessionXp(correct: number, total: number): number {
  return correct * OPENING_XP.perCorrect
    + (total - correct) * OPENING_XP.perWrong
    + (total > 0 && correct === total ? OPENING_XP.perfectBonus : 0)
}

export const COSMETIC_RARITY_LABELS: Record<CosmeticRarity, string> = {
  common: 'Obişnuit',
  rare: 'Rar',
  epic: 'Epic',
  legendary: 'Legendar',
}

/** Culoarea ramei, pe raritate. */
export const COSMETIC_RARITY_COLORS: Record<CosmeticRarity, string> = {
  common: '#6B6B6B',
  rare: '#2DD4BF',
  epic: '#8B5CF6',
  legendary: '#E2B340',
}

export const EVENT_KIND_LABELS: Record<EventKind, string> = {
  chessathon: 'Chessathon',
  player_day: 'Ziua unui jucător',
  name_opening: 'Quiz de deschideri',
  advent: 'Calendar',
  promo: 'Promoţie',
}

/**
 * Tema implicită a tablei, când nu e echipată niciuna.
 *
 * Sunt exact culorile pe care le-a avut aplicaţia dintotdeauna. Când am adăugat
 * temele de tablă am pus aici, din reflex, verdele de pe chess.com — ceea ce a
 * schimbat înfăţişarea fiecărei table fără să ceară nimeni, şi doar pe jumătate
 * dintre ele. Implicitul nu e locul unde se schimbă designul.
 */
export const DEFAULT_BOARD: BoardPayload = { light: '#f0d9b5', dark: '#3A3A3A' }

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
  /** Cursurile nepublicate nu apar în catalog şi nu se pot deschide. */
  is_published: boolean
  thumbnail_url: string | null
  lesson_count: number
  order_index: number
  created_at: string
  progress?: UserCourseProgress
}

export type LessonType = 'pgn' | 'rules' | 'notation'

export type ExerciseType = 'click_square' | 'move_piece' | 'identify_square'

/**
 * Ce a mutat adversarul cu o clipă înainte, ca `de`+`la` (`"d7d5"`).
 *
 * Se vede pe tablă: pătratele de plecare şi de sosire colorate, plus o săgeată
 * între ele. Lipseşte la aproape toate exerciţiile, fiindcă poziţia lor nu vine
 * dintr-o partidă şi nu s-a întâmplat nimic înainte. La en passant nu trebuie
 * scrisă deloc: se deduce singură din câmpul de en passant al FEN-ului, care
 * există exact fiindcă un pion tocmai a fost împins cu două pătrate.
 */
interface CuUltimaMutare {
  last_move?: string
}

export interface ClickSquareExercise extends CuUltimaMutare {
  type: 'click_square'
  target: string
  fen: string
  instruction: string
}

/**
 * Un pas dintr-un exerciţiu care ţine mai mult de o mutare.
 *
 * Există fiindcă unele lucruri nu se pot arăta într-o singură mutare. „Pionul
 * ajunge damă" e o mutare doar dacă pionul stă deja pe rândul şapte — iar
 * atunci poziţia e aranjată, nu adevărată. Un pion care porneşte de la mijlocul
 * tablei cere trei împingeri, cu regele advers alergând după el între ele.
 */
export interface PasDeMutare {
  /** Ce cer de la om, ca `de`+`la`: `g6g7`, sau `g7g8r` când alege şi piesa. */
  move: string
  /** Ce are de făcut ACUM. Se arată sus, în locul cerinţei generale. */
  instruction: string
  /** Ce răspunde adversarul imediat după. Lipseşte doar la ultimul pas. */
  reply?: string
}

export interface MovePieceExerciseData extends CuUltimaMutare {
  type: 'move_piece'
  fen: string
  /** `e2e4`, sau `e7e8n` când promovarea cere o anume piesă. */
  correct_move?: string
  instruction: string
  /**
   * Exerciţiul se joacă în mai multe mutări: ale mele şi răspunsurile lui.
   *
   * Când e aici, `correct_move` nu se mai foloseşte — fiecare pas îşi are
   * mutarea lui. Între paşi, adversarul mută singur, iar mutarea lui rămâne
   * arătată pe tablă, ca la en passant.
   */
  line?: PasDeMutare[]
  /**
   * La promovare, orice piesă aleasă e bună.
   *
   * Există fiindcă promovarea se învaţă în doi paşi. Întâi că **poţi alege** —
   * acolo regina, tura, nebunul şi calul sunt la fel de corecte, iar litera din
   * `correct_move` nu decide nimic. Apoi că **alegerea contează**: la poziţia cu
   * calul care dă şah şi atacă regina, o damă în plus nu face nimic, deci
   * răspunsul e doar calul.
   *
   * Lipsă = piesa cerută e cea din `correct_move`.
   */
  any_promotion?: boolean
}

export interface IdentifySquareExercise extends CuUltimaMutare {
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
  /**
   * Ultima dată când ai deschis cursul (migrarea 090). Bârlogul îl arată pe cel
   * mai recent — `started_at` n-ar fi bun, fiindcă cine începe trei cursuri într-o
   * zi şi lucrează de-atunci la unul singur ar vedea mereu altul în faţă.
   *
   * Opţional în tip: bazele care n-au primit încă migrarea întorc rândul fără el.
   */
  last_activity_at?: string | null
}

export interface Puzzle {
  id: string
  fen: string
  moves: string
  rating: number
  themes: string[]
  game_url: string | null
  title?: string | null
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
  color: string
  textColor: string
}

/**
 * Ligile, în ordine.
 *
 * `weeklyMinXp` a dispărut odată cu migrarea 038: nu mai există niciun prag
 * săptămânal. Liga se decide numai pe clasament — prima treime urcă, ultima
 * coboară — deci un „minim" nu mai însemna nimic nicăieri.
 */
export const LEAGUES: LeagueConfig[] = [
  { name: 'cherestea', label: 'Inițiat',     minXp: 0,    maxXp: 299,  color: '#8B6914', textColor: '#fff' },
  { name: 'tinichea',  label: 'Integrat',    minXp: 300,  maxXp: 699,  color: '#71797E', textColor: '#fff' },
  { name: 'bronz',     label: 'Pretendent',  minXp: 700,  maxXp: 1299, color: '#CD7F32', textColor: '#fff' },
  { name: 'argint',    label: 'Bazat',       minXp: 1300, maxXp: 2199, color: '#C0C0C0', textColor: '#141414' },
  { name: 'aur',       label: 'Avansat',     minXp: 2200, maxXp: 3499, color: '#FFD700', textColor: '#141414' },
  { name: 'smarald',   label: 'Remarcabil',  minXp: 3500, maxXp: 5499, color: '#50C878', textColor: '#141414' },
  { name: 'diamant',   label: 'Legendar',    minXp: 5500, maxXp: null, color: '#B9F2FF', textColor: '#141414' },
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
