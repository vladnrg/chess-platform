import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useDateDeCurs } from '@/hooks/useDateDeCurs'
import { ChapterPath, type PathNode } from '@/components/courses/ChapterPath'
import { CourseIcon } from '@/components/ui/CourseIcon'
import { Spinner } from '@/components/ui/Spinner'
import { capitoleDeDeschidere, capitolDeLectii, capitolulCurent } from '@/lib/capitole-curs'
import type { Course, Lesson, OpeningLine, UserCourseProgress } from '@/types'

/**
 * Unde ai rămas — jumătatea dreaptă a Bârlogului.
 *
 * Arată cursul la care ai fost ultima dată, deschis exact la capitolul unde
 * te-ai oprit, cu acelaşi traseu ca pe pagina cursului. Săgeţile trec prin
 * celelalte cursuri începute.
 *
 * Nu e un catalog: cursurile neîncepute nu apar aici. Cine vrea unul nou se duce
 * la Cursuri — pagina asta răspunde la „ce făceam?", nu la „ce aş putea face?".
 */
export function CursulCurent() {
  const { user } = useAuth()
  const [ales, setAles] = useState(0)

  const { data: incepute, isLoading } = useQuery({
    queryKey: ['barlog-cursuri-incepute', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: progres } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', user!.id)
      if (!progres?.length) return []

      const { data: cursuri } = await supabase
        .from('courses')
        .select('*')
        .in('id', progres.map(p => p.course_id))
      const dupaId = new Map((cursuri ?? []).map(c => [c.id, c as Course]))

      return (progres as UserCourseProgress[])
        .map(p => ({ progres: p, curs: dupaId.get(p.course_id) }))
        .filter((x): x is { progres: UserCourseProgress; curs: Course } => !!x.curs)
        // Ordonăm noi, nu baza: `last_activity_at` a apărut în migrarea 090, iar
        // o bază care încă n-a primit-o ar răspunde cu eroare la `order`, deci
        // caseta ar fi goală în loc să arate ceva puţin mai vechi.
        .sort((a, b) =>
          (b.progres.last_activity_at ?? b.progres.started_at).localeCompare(
            a.progres.last_activity_at ?? a.progres.started_at))
    },
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[20rem] items-center justify-center rounded-2xl border border-[#2A2A2A] bg-[#141414]">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  if (!incepute?.length) return <NiciunCurs />

  const i = Math.min(ales, incepute.length - 1)
  const { curs, progres } = incepute[i]

  return (
    <div className="rounded-2xl border border-[#2A2A2A] bg-[#141414]">
      <AntetCurs
        curs={curs}
        cate={incepute.length}
        pozitie={i}
        onSchimba={pas => setAles((i + pas + incepute.length) % incepute.length)}
      />
      <CapitolulCursului
        // Cheia forţează remontarea la schimbarea cursului: altfel capitolul
        // deschis ar rămâne cel de la cursul dinainte.
        key={curs.id}
        curs={curs}
        parcurse={progres.completed_lesson_ids ?? []}
      />
    </div>
  )
}

function NiciunCurs() {
  return (
    <div className="flex min-h-[20rem] flex-col items-center justify-center gap-3 rounded-2xl border border-[#2A2A2A] bg-[#141414] p-8 text-center">
      <p className="font-display text-lg font-semibold text-[#F0F0F0]">
        Încă n-ai început niciun curs
      </p>
      <p className="max-w-xs text-sm text-[#6B6B6B]">
        Aici o să vezi unde ai rămas, de fiecare dată când te întorci.
      </p>
      <Link
        to="/courses"
        className="mt-1 rounded-xl bg-[#E2B340] px-5 py-2.5 text-sm font-semibold text-[#0A0A0A] transition-colors hover:bg-[#F0C450]"
      >
        Alege un curs
      </Link>
    </div>
  )
}

/** Numele cursului, poza lui şi săgeţile către celelalte cursuri începute. */
function AntetCurs({ curs, cate, pozitie, onSchimba }: {
  curs: Course
  cate: number
  pozitie: number
  onSchimba: (pas: number) => void
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[#2A2A2A] p-4">
      <CourseIcon color={culoareaCursului(curs.slug)} size="md" className="flex-shrink-0">
        {simbolulCursului(curs)}
      </CourseIcon>

      <div className="min-w-0 flex-1">
        <Link
          to={`/courses/${curs.slug}`}
          className="block truncate font-display text-base font-bold text-[#F0F0F0] hover:text-[#E2B340]"
        >
          {curs.title}
        </Link>
        {/* Numărul apare doar când chiar sunt mai multe — la un singur curs ar
            fi „1 din 1", adică o informaţie care nu spune nimic. */}
        {cate > 1 && (
          <p className="text-xs text-[#6B6B6B]">Cursul {pozitie + 1} din {cate} începute</p>
        )}
      </div>

      {/* Săgeţile lipsesc când n-au unde duce, ca la cuferele cu tactici. */}
      {cate > 1 && (
        <div className="flex flex-shrink-0 gap-1.5">
          {[-1, 1].map(pas => (
            <button
              key={pas}
              onClick={() => onSchimba(pas)}
              aria-label={pas < 0 ? 'Cursul anterior' : 'Cursul următor'}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2A2A2A] bg-[#1C1C1C] text-[#A0A0A0] transition-colors hover:border-[#3A3A3A] hover:text-[#F0F0F0]"
            >
              {pas < 0 ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Capitolul la care ai rămas, cu traseul lui.
 *
 * Unul singur, nu tot cuprinsul: pagina de start spune unde eşti, nu tot ce
 * conţine cursul. Cine vrea lista întreagă apasă pe numele cursului.
 */
function CapitolulCursului({ curs, parcurse }: { curs: Course; parcurse: string[] }) {
  const { data: linii } = useQuery({
    queryKey: ['opening-lines', curs.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('opening_lines').select('*').eq('course_id', curs.id).order('order_index')
      return (data ?? []) as OpeningLine[]
    },
  })

  const { data: lectii } = useQuery({
    queryKey: ['lessons', curs.id],
    // Doar la cursurile fără variante — altfel am cere lecţii care nu există.
    enabled: !!linii && linii.length === 0,
    queryFn: async () => {
      const { data } = await supabase
        .from('lessons').select('*').eq('course_id', curs.id).order('order_index')
      return (data ?? []) as Lesson[]
    },
  })

  const { data: dinCurs } = useDateDeCurs(linii?.length ? curs.slug : undefined)

  const capitole = useMemo(() => {
    if (!linii) return []
    return linii.length > 0
      ? capitoleDeDeschidere(curs.slug, linii, parcurse, dinCurs)
      : capitolDeLectii(curs.slug, lectii ?? [], parcurse)
  }, [linii, lectii, dinCurs, curs.slug, parcurse])

  // Capitolul curent la montare; de-acolo încolo îl mută utilizatorul.
  const [capitol, setCapitol] = useState<number | null>(null)
  const iCurent = capitol ?? capitolulCurent(capitole)

  if (!linii || capitole.length === 0) {
    return (
      <div className="flex min-h-[16rem] items-center justify-center p-6 text-center text-sm text-[#6B6B6B]">
        {linii ? 'Cursul încă n-are conţinut de parcurs.' : <Spinner className="h-5 w-5" />}
      </div>
    )
  }

  const cap = capitole[Math.min(Math.max(iCurent, 0), capitole.length - 1)]

  return (
    <div className="p-4">
      <div className="flex items-center gap-2">
        {capitole.length > 1 && (
          <button
            onClick={() => setCapitol((iCurent - 1 + capitole.length) % capitole.length)}
            aria-label="Capitolul anterior"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#2A2A2A] bg-[#1C1C1C] text-[#A0A0A0] transition-colors hover:border-[#3A3A3A] hover:text-[#F0F0F0]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        <div className="min-w-0 flex-1 rounded-xl bg-[#1A1A1A] px-4 py-2.5 text-center">
          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6B6B6B]">
            Capitolul {Math.min(Math.max(iCurent, 0), capitole.length - 1) + 1}
            {capitole.length > 1 && ` din ${capitole.length}`}
          </p>
          <p className="flex items-center justify-center gap-1.5 truncate font-display font-semibold text-[#F0F0F0]">
            {cap.titlu}
            {cap.terminat && <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#4ade80]" />}
          </p>
          <p className="truncate text-xs text-[#6B6B6B]">{cap.subtitlu}</p>
        </div>

        {capitole.length > 1 && (
          <button
            onClick={() => setCapitol((iCurent + 1) % capitole.length)}
            aria-label="Capitolul următor"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#2A2A2A] bg-[#1C1C1C] text-[#A0A0A0] transition-colors hover:border-[#3A3A3A] hover:text-[#F0F0F0]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <TraseuIncadrat noduri={cap.noduri} />
    </div>
  )
}

/**
 * Traseul, ţinut la înălţimea unui ecran.
 *
 * Pe pagina cursului traseul se întinde cât are nevoie — acolo asta şi vrei. Aici
 * nu: „Mişcarea pieselor" are zece lecţii, adică vreo mie de pixeli de traseu,
 * care ar împinge graficul de XP undeva sus şi ar face pagina de start să curgă
 * de trei ori. Deci fereastră fixă, care derulează pe dinăuntru.
 *
 * La deschidere sare la pasul curent. Fără asta, cine e la lecţia a şaptea ar
 * vedea şase bifate şi ar trebui să caute singur unde a rămas — exact întrebarea
 * la care pagina asta trebuie să răspundă fără să fie întrebată.
 */
function TraseuIncadrat({ noduri }: { noduri: PathNode[] }) {
  const fereastra = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cutie = fereastra.current
    const curent = cutie?.querySelector<HTMLElement>('[data-nod-curent]')
    if (!cutie || !curent) return
    // `scrollTop`, nu `scrollIntoView`: al doilea derulează şi pagina, nu doar
    // caseta, şi ar muta Bârlogul sub ochii omului la fiecare intrare.
    cutie.scrollTop = curent.offsetTop - cutie.clientHeight / 2 + curent.offsetHeight / 2
  }, [noduri])

  return (
    <div
      ref={fereastra}
      // `relative` nu e ornament: `offsetTop` de mai sus se măsoară faţă de cel
      // mai apropiat strămoş poziţionat. Fără el, nodurile îşi raportau poziţia
      // faţă de toată pagina, iar derularea sărea cu câteva sute de pixeli peste.
      className="relative mt-1 max-h-[22rem] overflow-y-auto overscroll-contain"
    >
      <ChapterPath nodes={noduri} />
    </div>
  )
}

/**
 * Culoarea plăcuţei, dedusă din numele scurt al cursului.
 *
 * Din nume, nu la întâmplare: aşa acelaşi curs are aceeaşi culoare de fiecare
 * dată, pe orice ecran, fără să ţinem o coloană în plus în bază.
 */
function culoareaCursului(slug: string): string {
  const paleta = ['#2DD4BF', '#E2B340', '#A78BFA', '#F472B6', '#60A5FA', '#4ADE80', '#FB923C']
  let suma = 0
  for (const semn of slug) suma = (suma + semn.charCodeAt(0)) % 9973
  return paleta[suma % paleta.length]
}

/** Regele alb pentru repertoriul cu albul, cel negru pentru apărări, pionul la baze. */
function simbolulCursului(curs: Course): string {
  if (curs.is_foundational) return '♟'
  return curs.slug.includes('defense') || curs.slug.includes('apararea') ? '♚' : '♔'
}
