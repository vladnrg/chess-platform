import { useState } from 'react'
import {
  CheckCircle2, XCircle, ArrowRight, CalendarClock, Sparkles, RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { Spinner } from '@/components/ui/Spinner'
import { OpeningBoard } from './OpeningBoard'
import { dayLabel } from '@/lib/events'
import {
  useChallengeStatus, useStartSession, useAnswerQuestion, useFinishSession,
} from '@/hooks/useOpeningChallenge'
import { OPENING_XP } from '@/types'
import type {
  OpeningSession, OpeningAnswerResult, OpeningSessionSummary,
} from '@/types'

/**
 * Zilele tale din săptămâna asta. Nu mai sunt aceleaşi pentru toată lumea:
 * ziua în care deschizi prima oară pagina de evenimente îţi dă seria.
 */
const ZILE: Record<0 | 1, string> = {
  1: 'luni · miercuri · vineri · duminică',
  0: 'marți · joi · sâmbătă',
}

/**
 * Regulile, pe scurt — se văd şi înainte de a începe, şi între calupuri.
 *
 * `parity` lipseşte cât timp migrarea 087 nu e rulată; atunci cad pe zilele
 * impare, care erau oricum programul fix de dinainte.
 */
function Rules({ parity }: { parity?: number }) {
  return (
    <ul className="space-y-1.5 text-sm text-[#A0A0A0]">
      <li>Cinci poziţii, {ZILE[parity === 0 ? 0 : 1]}.</li>
      <li>O singură șansă la fiecare — răspunsul rămâne cum l-ai dat.</li>
      <li>
        <span className="text-[#4ade80]">+{OPENING_XP.perCorrect} XP</span> pentru fiecare corect,{' '}
        <span className="text-[#FB7185]">{OPENING_XP.perWrong} XP</span> pentru fiecare greșit,
        plus <span className="text-[#E2B340]">{OPENING_XP.perfectBonus}</span> dacă le iei pe toate.
      </li>
      <li>Săptămâna viitoare primești alte deschideri.</li>
    </ul>
  )
}

/** Rezumatul de la finalul calupului. */
function Summary({ result }: { result: OpeningSessionSummary }) {
  const perfect = result.correct === result.total
  const positive = result.xp > 0

  return (
    <div className="space-y-4 text-center">
      <div>
        <p className="font-display text-4xl font-bold text-[#F0F0F0]">
          {result.correct}
          <span className="text-2xl text-[#6B6B6B]"> / {result.total}</span>
        </p>
        <p className="mt-1 text-sm text-[#6B6B6B]">răspunsuri corecte</p>
      </div>

      <p
        className={`font-display text-2xl font-bold ${positive ? 'text-[#4ade80]' : result.xp === 0 ? 'text-[#6B6B6B]' : 'text-[#FB7185]'}`}
      >
        {positive ? '+' : ''}{result.xp} XP
      </p>

      <p className="text-sm text-[#A0A0A0]">
        {perfect
          ? 'Toate cinci. Le recunoști din prima mutare.'
          : result.correct >= 3
            ? 'Bine. Deschiderile pe care le-ai ratat revin peste câteva săptămâni.'
            : 'Se învață. Citește explicațiile — data viitoare le prinzi.'}
      </p>
    </div>
  )
}

interface ChallengeRunProps {
  session: OpeningSession
  onDone: (summary: OpeningSessionSummary) => void
}

/** Fluxul propriu-zis: întrebare, răspuns definitiv, explicaţie, următoarea. */
function ChallengeRun({ session, onDone }: ChallengeRunProps) {
  // Pornim de unde a rămas: sesiunea poate fi reluată mai târziu în aceeaşi zi.
  const [cursor, setCursor] = useState(session.answered)
  const [picked, setPicked] = useState<number | null>(null)
  const [result, setResult] = useState<OpeningAnswerResult | null>(null)

  const answer = useAnswerQuestion()
  const finish = useFinishSession()

  const total = session.total
  const question = session.questions[cursor]

  // Toate răspunse, dar calupul nu s-a închis încă (ex. ai reîncărcat pagina).
  if (!question) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-[#A0A0A0]">Ai răspuns la toate cele {total}.</p>
        <Button
          size="lg"
          disabled={finish.isPending}
          onClick={() => void finish.mutateAsync(session.id).then(onDone)}
        >
          {finish.isPending ? 'Socotesc…' : 'Vezi rezultatul'}
        </Button>
      </div>
    )
  }

  async function submit() {
    if (picked === null) return
    const r = await answer.mutateAsync({ sessionId: session.id, answer: picked })
    setResult(r)
  }

  async function next() {
    if (result?.is_last) {
      const summary = await finish.mutateAsync(session.id)
      onDone(summary)
      return
    }
    setCursor(c => c + 1)
    setPicked(null)
    setResult(null)
  }

  return (
    <div className="space-y-5">
      {/* Unde sunt în calup */}
      <div>
        <div className="mb-1.5 flex items-baseline justify-between text-sm">
          <span className="text-[#6B6B6B]">Întrebarea {cursor + 1} din {total}</span>
          <span className="text-[#6B6B6B]">{question.title}</span>
        </div>
        <Progress value={(cursor / total) * 100} barClassName="bg-[#E2B340]" />
      </div>

      <OpeningBoard moves={question.moves} />

      <p className="text-lg leading-relaxed text-[#F0F0F0]">{question.prompt}</p>

      <div className="grid gap-2 sm:grid-cols-2">
        {question.options.map((option, idx) => {
          const isCorrect = result?.answer === idx
          const isPicked = picked === idx
          const showWrong = result && !result.correct && isPicked

          return (
            <button
              key={option}
              type="button"
              disabled={!!result || answer.isPending}
              onClick={() => setPicked(idx)}
              className={[
                'flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                'disabled:cursor-default',
                result && isCorrect
                  ? 'border-[#4ade80] bg-[rgba(74,222,128,0.1)] text-[#F0F0F0]'
                  : showWrong
                    ? 'border-[#FB7185] bg-[rgba(251,113,133,0.1)] text-[#F0F0F0]'
                    : isPicked
                      ? 'border-[#E2B340] bg-[rgba(226,179,64,0.08)] text-[#F0F0F0]'
                      : 'border-[#2A2A2A] bg-[#141414] text-[#A0A0A0] hover:border-[#3A3A3A] hover:text-[#F0F0F0]',
              ].join(' ')}
            >
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-current text-xs font-semibold">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1">{option}</span>
              {result && isCorrect && <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#4ade80]" />}
              {showWrong && <XCircle className="h-4 w-4 flex-shrink-0 text-[#FB7185]" />}
            </button>
          )
        })}
      </div>

      {!result ? (
        <Button onClick={() => void submit()} disabled={picked === null || answer.isPending}>
          {answer.isPending ? 'Verific…' : 'Răspunde'}
        </Button>
      ) : (
        <div className="space-y-3">
          <p className={`text-sm font-semibold ${result.correct ? 'text-[#4ade80]' : 'text-[#FB7185]'}`}>
            {result.correct ? 'Corect.' : 'Nu de data asta.'}
          </p>

          <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-4">
            <p className="text-sm leading-relaxed text-[#A0A0A0]">{result.explanation}</p>
          </div>

          <Button onClick={() => void next()} disabled={finish.isPending}>
            {result.is_last
              ? finish.isPending ? 'Socotesc…' : 'Vezi rezultatul'
              : 'Următoarea'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * Provocarea deschiderilor.
 *
 * Calupuri de cinci, din două în două zile — douăzeci deodată sunt prea multe
 * pentru cât stă un copil atent. XP-ul vine la final, după câte ai nimerit, şi
 * poate fi şi negativ: un răspuns care nu costă nimic nu e un răspuns.
 */
export function OpeningChallenge() {
  const { data: status, isLoading } = useChallengeStatus()
  const start = useStartSession()
  const [session, setSession] = useState<OpeningSession | null>(null)
  const [summary, setSummary] = useState<OpeningSessionSummary | null>(null)

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner className="h-7 w-7" /></div>
  }
  if (!status) return null

  const shell = (children: React.ReactNode) => (
    <div className="rounded-2xl border border-[#2A2A2A] bg-[#0F0F0F] p-5 sm:p-6">{children}</div>
  )

  // Am terminat chiar acum
  if (summary) {
    return shell(
      <div className="space-y-6">
        <Summary result={summary} />
        <div className="border-t border-[#2A2A2A] pt-5 text-center">
          <p className="flex items-center justify-center gap-2 text-sm text-[#6B6B6B]">
            <CalendarClock className="h-4 w-4" />
            Următorul calup: {dayLabel(status.next_day)}
          </p>
        </div>
      </div>
    )
  }

  // Calup în desfăşurare
  if (session) {
    return shell(<ChallengeRun session={session} onDone={setSummary} />)
  }

  // Terminat mai devreme azi
  if (status.finished) {
    return shell(
      <div className="space-y-6">
        <Summary result={{
          correct: status.correct_count ?? 0,
          total: status.total,
          xp: status.xp_awarded ?? 0,
        }} />
        <div className="border-t border-[#2A2A2A] pt-5 text-center">
          <p className="flex items-center justify-center gap-2 text-sm text-[#6B6B6B]">
            <CalendarClock className="h-4 w-4" />
            Gata pe azi. Revino {dayLabel(status.next_day)}.
          </p>
        </div>
      </div>
    )
  }

  // Nu e zi de provocare
  if (!status.is_challenge_day) {
    return shell(
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <CalendarClock className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#6B6B6B]" />
          <div>
            <p className="font-semibold text-[#F0F0F0]">
              Azi nu e zi de provocare
            </p>
            <p className="mt-0.5 text-sm text-[#A0A0A0]">
              Următorul calup de cinci întrebări se deschide {dayLabel(status.next_day)}.
            </p>
          </div>
        </div>
        <div className="border-t border-[#2A2A2A] pt-5">
          <Rules parity={status.parity} />
        </div>
      </div>
    )
  }

  // E zi de provocare: de început sau de continuat
  const resuming = status.answered > 0

  return shell(
    <div className="space-y-5">
      <div>
        <p className="font-display text-xl font-bold text-[#F0F0F0]">
          {resuming
            ? `Ai rămas la întrebarea ${status.answered + 1}`
            : 'Cinci poziții te așteaptă'}
        </p>
        <p className="mt-1 text-sm text-[#A0A0A0]">
          {resuming
            ? 'Continuă de unde ai rămas — răspunsurile date rămân.'
            : 'Durează câteva minute.'}
        </p>
      </div>

      <Rules parity={status.parity} />

      <Button
        size="lg"
        disabled={start.isPending}
        onClick={() => void start.mutateAsync().then(setSession)}
      >
        {resuming ? <RotateCcw className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
        {start.isPending ? 'Pregătesc…' : resuming ? 'Continuă' : 'Începe'}
      </Button>
    </div>
  )
}
