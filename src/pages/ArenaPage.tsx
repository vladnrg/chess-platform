import { Link } from 'react-router-dom'
import { Flame, Swords, TrendingUp, Timer, Lock, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useArenaStats, ARENA_MIN_COURSES, ARENA_ROUNDS } from '@/hooks/useArena'
import { Spinner } from '@/components/ui/Spinner'
import { formatPawns, targetEloFor, engineSettings, ELO_FLOOR } from '@/lib/arena'

/**
 * Intrarea în Proba de foc.
 *
 * Pagina explică regula o singură dată şi în cuvinte simple, fiindcă e o
 * mecanică nouă: nu „câştigă partida", ci „îmbunătăţeşte poziţia". Cine nu
 * înţelege asta din prima ecranare va crede că a pierdut când de fapt a punctat.
 */
export function ArenaPage() {
  const { profile } = useAuth()
  const { data: stats, isLoading } = useArenaStats()

  const targetElo = targetEloFor(profile?.puzzle_rating ?? profile?.estimated_elo)
  const settings = engineSettings(targetElo)
  const ready = (stats?.eligible_courses ?? 0) >= ARENA_MIN_COURSES

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner /></div>
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Antet */}
      <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#1A1410] to-[#141414] p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#E2B340]/10">
            <Flame className="h-6 w-6 text-[#E2B340]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-[#F0F0F0]">Proba de foc</h1>
            <p className="mt-1 text-sm leading-relaxed text-[#A0A0A0]">
              Trei poziţii din deschiderile pe care le-ai învăţat, contra unui adversar
              mai tare decât tine. Nu trebuie să câştigi partida — trebuie să
              <span className="text-[#F0F0F0]"> îmbunătăţeşti poziţia</span> faţă de
              cum ai primit-o.
            </p>
          </div>
        </div>
      </div>

      {/* Regula, în trei paşi */}
      <div className="grid gap-3 sm:grid-cols-3">
        <RuleCard
          icon={Swords}
          title="Porneşti dintr-o poziţie"
          body={`${ARENA_ROUNDS} runde, fiecare dintr-un alt curs pe care l-ai parcurs. Uneori de la egalitate, alteori dintr-o greşeală deja făcută.`}
        />
        <RuleCard
          icon={TrendingUp}
          title="Contează diferenţa"
          body="Motorul măsoară poziţia la început şi la sfârşit. Scorul tău e cât ai câştigat între cele două momente."
        />
        <RuleCard
          icon={Timer}
          title="Ai un singur ceas"
          body="Opt minute pentru toată proba. Când o rundă se termină, următoarea începe imediat."
        />
      </div>

      {/* De ce e corect şi pentru negru */}
      <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-4">
        <p className="text-sm leading-relaxed text-[#A0A0A0]">
          <span className="font-semibold text-[#F0F0F0]">De ce se punctează aşa.</span>{' '}
          O poziţie de start proastă nu te dezavantajează: dacă primeşti{' '}
          <span className="tabular-nums text-[#FB7185]">−1.20</span> şi ajungi la{' '}
          <span className="tabular-nums text-[#F0F0F0]">0.00</span>, ai acelaşi punctaj
          ca cineva care a primit{' '}
          <span className="tabular-nums text-[#F0F0F0]">0.00</span> şi a ajuns la{' '}
          <span className="tabular-nums text-[#4ade80]">+1.20</span>. Şi de-aia jucătorii
          de negru nu sunt în dezavantaj în clasament.
        </p>
      </div>

      {/* Adversarul */}
      <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
              Adversarul tău
            </p>
            <p className="mt-1 text-sm text-[#A0A0A0]">
              Călușul savant, reglat la <span className="font-semibold text-[#F0F0F0]">
                {targetElo}
              </span> — cu 200 peste nivelul tău estimat.
            </p>
            {!settings.limitStrength && (
              <p className="mt-2 text-xs leading-relaxed text-[#6B6B6B]">
                Sub {ELO_FLOOR} motorul nu poate fi reglat pe Elo, aşa că îl slăbim
                altfel. La nivelurile mici joacă puţin peste ţintă — dar cum punctajul
                e diferenţa, nu rezultatul, proba rămâne câştigabilă.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Rezultatele tale */}
      {stats && stats.runs > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Probe duse la capăt" value={String(stats.runs)} />
          <StatCard
            label="Cel mai bun rezultat"
            value={stats.best_cp === null ? '—' : formatPawns(stats.best_cp)}
            accent
          />
          <StatCard
            label="Cel mai bun, săptămâna asta"
            value={stats.best_week_cp === null ? '—' : formatPawns(stats.best_week_cp)}
          />
        </div>
      )}

      {/* Pornirea */}
      {ready ? (
        <Link
          to="/proba/joc"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E2B340] px-6 py-4 font-semibold text-black transition-colors hover:bg-[#EFC25C]"
        >
          <Flame className="h-5 w-5" />
          Începe proba
        </Link>
      ) : (
        <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-5 text-center">
          <Lock className="mx-auto h-6 w-6 text-[#3A3A3A]" />
          <p className="mt-3 text-sm font-medium text-[#F0F0F0]">
            Proba se deschide după {ARENA_MIN_COURSES} cursuri începute
          </p>
          <p className="mt-1 text-sm text-[#6B6B6B]">
            Ai {stats?.eligible_courses ?? 0} până acum. Poziţiile din probă vin din
            deschiderile tale, deci ai nevoie de câteva la care să te întorci.
          </p>
          <Link
            to="/courses"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#E2B340] hover:underline"
          >
            Vezi cursurile
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <Link
        to="/clasament"
        className="block text-center text-sm text-[#6B6B6B] transition-colors hover:text-[#A0A0A0]"
      >
        Vezi clasamentul probei
      </Link>
    </div>
  )
}

function RuleCard({
  icon: Icon, title, body,
}: { icon: typeof Swords; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-4">
      <Icon className="h-5 w-5 text-[#E2B340]" />
      <p className="mt-2.5 text-sm font-semibold text-[#F0F0F0]">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-[#6B6B6B]">{body}</p>
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-4 text-center">
      <p className={`text-lg font-bold tabular-nums ${accent ? 'text-[#E2B340]' : 'text-[#F0F0F0]'}`}>
        {value}
      </p>
      <p className="mt-1 text-xs leading-tight text-[#6B6B6B]">{label}</p>
    </div>
  )
}
