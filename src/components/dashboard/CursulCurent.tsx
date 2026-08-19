import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useDateDeCurs } from '@/hooks/useDateDeCurs'
import { ChapterPath, type PathNode } from '@/components/courses/ChapterPath'
import { inaltimeaTraseului } from '@/components/courses/geometrie-traseu'
import { PozaCursului } from '@/components/ui/PozaCursului'
import { Spinner } from '@/components/ui/Spinner'
import { capitoleDeDeschidere, capitolDeLectii, capitolulCurent, type Capitol } from '@/lib/capitole-curs'
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

/**
 * Numele cursului şi poza lui, la mijloc; săgeţile către celelalte cursuri
 * începute stau lipite de marginea din dreapta.
 *
 * Centrat, nu aliniat la stânga: caseta e lată, iar un titlu împins în colţ lăsa
 * jumătate de rând gol şi arăta a antet uitat acolo. Săgeţile ies din şir, prin
 * poziţionare absolută — altfel ar fi împins titlul spre stânga şi n-ar mai fi
 * fost centrat pe casetă, ci pe ce rămâne din ea.
 */
function AntetCurs({ curs, cate, pozitie, onSchimba }: {
  curs: Course
  cate: number
  pozitie: number
  onSchimba: (pas: number) => void
}) {
  return (
    <div className="relative flex items-center justify-center border-b border-[#2A2A2A] p-4">
      {/* Lăsăm loc de săgeţi în ambele părţi, ca titlul lung să nu ajungă sub ele. */}
      <div className={`flex min-w-0 items-center gap-3 ${cate > 1 ? 'max-w-[calc(100%-7rem)]' : ''}`}>
        <PozaCursului
          slug={curs.slug}
          titlu={curs.title}
          className="h-14 w-14 flex-shrink-0 rounded-xl"
        />
        <div className="min-w-0">
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
      </div>

      {/* Săgeţile lipsesc când n-au unde duce, ca la cuferele cu tactici. */}
      {cate > 1 && (
        <div className="absolute right-4 flex gap-1.5">
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

  const i = Math.min(Math.max(iCurent, 0), capitole.length - 1)
  const cap = capitole[i]
  const { deSus, deJos } = vecinii(capitole, i)

  return (
    <div className="space-y-2 p-4">
      {/* Capitolele din urmă. Apar doar când nu mai e nimic înainte — drumul se
          citeşte în jos, deci ce a trecut stă deasupra. */}
      {deSus.map(v => (
        <CasetaCapitol key={v.capitol.id} capitol={v.capitol} numar={v.numar} onMergi={() => setCapitol(v.numar - 1)} />
      ))}

      <div className="flex items-center gap-2">
        {capitole.length > 1 && (
          <button
            onClick={() => setCapitol((i - 1 + capitole.length) % capitole.length)}
            aria-label="Capitolul anterior"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#2A2A2A] bg-[#1C1C1C] text-[#A0A0A0] transition-colors hover:border-[#3A3A3A] hover:text-[#F0F0F0]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        <div className="min-w-0 flex-1 rounded-xl border border-[#E2B340]/25 bg-[#1A1A1A] px-4 py-2.5 text-center">
          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#E2B340]">
            Capitolul {i + 1}
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
            onClick={() => setCapitol((i + 1) % capitole.length)}
            aria-label="Capitolul următor"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#2A2A2A] bg-[#1C1C1C] text-[#A0A0A0] transition-colors hover:border-[#3A3A3A] hover:text-[#F0F0F0]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <TraseuIncadrat noduri={cap.noduri} />

      {/* Ce urmează. Casetele astea nu-s decor: fără ele, capitolul curent pare
          tot ce există, iar drumul se termină la marginea traseului. */}
      {deJos.map(v => (
        <CasetaCapitol key={v.capitol.id} capitol={v.capitol} numar={v.numar} onMergi={() => setCapitol(v.numar - 1)} />
      ))}
    </div>
  )
}

/**
 * Ce capitole se mai arată, în afară de cel curent.
 *
 * Două, atât — cât să se vadă că drumul continuă, fără să se transforme în
 * cuprins. Se preferă cele care urmează: pe ele le are omul de făcut. Când e la
 * ultimul capitol şi nu mai urmează nimic, se completează cu cele din urmă, ca
 * să nu rămână singur în josul casetei.
 */
function vecinii(capitole: Capitol[], i: number) {
  const dupa = capitole.slice(i + 1, i + 3)
  const inainte = capitole.slice(Math.max(0, i - (2 - dupa.length)), i)
  const cuNumar = (c: Capitol) => ({ capitol: c, numar: capitole.indexOf(c) + 1 })
  return { deSus: inainte.map(cuNumar), deJos: dupa.map(cuNumar) }
}

/** Un capitol vecin, strâns pe un rând. Se apasă şi te duce la el. */
function CasetaCapitol({ capitol, numar, onMergi }: {
  capitol: Capitol
  numar: number
  onMergi: () => void
}) {
  return (
    <button
      onClick={onMergi}
      className="flex w-full items-center gap-2.5 rounded-xl border border-[#242424] bg-[#171717] px-3 py-2 text-left transition-colors hover:border-[#3A3A3A] hover:bg-[#1C1C1C]"
    >
      <span className="flex-shrink-0 rounded-md bg-[#242424] px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-[#6B6B6B]">
        Cap. {numar}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-[#A0A0A0]">{capitol.titlu}</span>
      {capitol.terminat && <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#4ade80]" />}
    </button>
  )
}

/**
 * Traseul, micşorat cât să încapă tot.
 *
 * Pe pagina cursului se întinde cât are nevoie — acolo asta şi vrei. Aici nu:
 * „Mişcarea pieselor" are zece lecţii, adică peste o mie de pixeli, iar o
 * fereastră care derulează arată trei noduri şi ascunde tocmai lucrul pentru
 * care e caseta — cât drum mai e.
 *
 * Deci se micşorează, nu se taie. Ce se pierde din mărimea nodurilor se câştigă
 * la înţeles: se vede dintr-o privire că sunt zece şi unde eşti între ele.
 */

/** Cât loc are traseul pe verticală, în pixeli. */
const INALTIME_TRASEU = 520

function TraseuIncadrat({ noduri }: { noduri: PathNode[] }) {
  const natural = inaltimeaTraseului(noduri)
  // Fără prag de jos: orice capitol trebuie să încapă întreg, oricât ar fi de
  // lung. Un capitol scurt nu se umflă însă peste mărimea lui firească.
  const scara = Math.min(1, INALTIME_TRASEU / natural)

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: Math.ceil(natural * scara) }}
    >
      {/* Stratul dinăuntru stă scos din flux (`absolute`). Altfel ar cere în
          continuare cei o mie de pixeli ai lui — `transform` schimbă doar cum
          arată, nu cât loc ocupă — iar caseta ar căpăta o bară de derulare
          pentru un conţinut care încape deja pe ecran. */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: natural,
          transform: `scale(${scara})`,
          transformOrigin: 'top center',
        }}
      >
        <ChapterPath nodes={noduri} />
      </div>
    </div>
  )
}
