import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Dumbbell, GraduationCap, Check, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Ce fel de pas e un nod din traseu.
 *
 * `lectie`    — înveţi ceva, cu programul care te duce de mână
 * `exercitiu` — parcurgi singur, fără ajutor
 * `test`      — întrebări din tot capitolul, la final
 *
 * Nu există nod de tip „video": platforma nu are filme, iar un tip de nod care
 * nu duce nicăieri e mai rău decât unul lipsă.
 */
export type NodeKind = 'lectie' | 'exercitiu' | 'test'

export interface PathNode {
  id: string
  kind: NodeKind
  /** Nu se scrie sub nod — apare doar la trecerea cu mouse-ul peste el. */
  title: string
  /** Unde duce. Lipsă = pasul există, dar încă n-are unde trimite. */
  href?: string
  done?: boolean
}

const ICOANE = { lectie: BookOpen, exercitiu: Dumbbell, test: GraduationCap }

/**
 * Silueta fiecărui tip de pas.
 *
 * De când nu mai scrie nimic sub noduri, forma e singurul lucru care spune ce
 * fel de pas urmează — culoarea e deja ocupată cu starea (unde eşti, ce ai
 * terminat, ce e închis). Două limbaje care nu se calcă pe picioare.
 *
 * `latura` e latura pătratului, nu lăţimea pe ecran: rotit la 45°, diamantul se
 * întinde cât diagonala lui, adică de 1,41 ori mai mult.
 *
 * Diamantul are latura cea mai generoasă din trei, deşi pare cel mic. Motivul e
 * lacătul: el stă pe muchia dinspre dreapta-jos, iar muchia unui diamant trece
 * mai aproape de mijloc decât colţul unui pătrat. Cu latura strânsă, lacătul
 * ajungea peste gantere. Icoana a rămas la mărimea ei tocmai ca să se lăţească
 * spaţiul dintre ele.
 */
const FORME: Record<NodeKind, { latura: number; raza: number; rotit: boolean; icoana: string }> = {
  lectie:    { latura: 68, raza: 22, rotit: false, icoana: 'h-8 w-8' },
  exercitiu: { latura: 70, raza: 20, rotit: true,  icoana: 'h-7 w-7' },
  test:      { latura: 78, raza: 26, rotit: false, icoana: 'h-9 w-9' },
}

/** Cât coboară faţa peste umbră la apăsare. */
const GROSIME = 7

/**
 * Cât se abate fiecare nod de la mijloc, în paşi.
 *
 * Tiparul se repetă din patru în patru şi dă şerpuirea. Nu e ornament: pe un şir
 * perfect drept, douăzeci de casete identice arată ca o listă, iar ochiul nu mai
 * simte că înaintează. Abaterea le face să se citească drept drum.
 */
const ZIGZAG = [0, 1, 0, -1]
const PAS_LATERAL = 62

/** Înălţimea spaţiului dintre două noduri — tot atâta cât ţine şi legătura. */
const GOL = 46

/** Abaterea laterală a nodului de pe poziţia `i`. */
const abatere = (i: number) => ZIGZAG[i % ZIGZAG.length] * PAS_LATERAL

/**
 * Cât din golul de deasupra/dedesubt e acoperit deja de nodul vecin.
 *
 * Diamantul îşi depăşeşte caseta cu colţurile — jumătate din diferenţa dintre
 * diagonală şi latură. Fără corecţia asta, primele buline ale legăturii ar fi
 * desenate peste el. Se calculează din latură, nu se scrie de mână: altfel
 * orice schimbare de mărime ar strica firul fără să spună nimeni nimic.
 */
const colt = (kind: NodeKind) =>
  FORME[kind].rotit ? Math.round((FORME[kind].latura * (Math.SQRT2 - 1)) / 2) : 0

const iesireJos = (kind: NodeKind) => colt(kind) + GROSIME
const intrareSus = (kind: NodeKind) => colt(kind)

/**
 * Firul punctat dintre două noduri.
 *
 * Odată am scos legăturile fiindcă ieşeau nişte liniuţe oblice care păreau
 * scame. Diferenţa acum e că firul pleacă şi ajunge pe verticală, prin două
 * puncte de control aşezate exact sub şi deasupra nodurilor: se citeşte ca o
 * cărare care şerpuieşte, nu ca o linie trasă cu rigla între două căsuţe.
 */
function Legatura({ de, la, dinKind, spreKind }: {
  de: number
  la: number
  dinKind: NodeKind
  spreKind: NodeKind
}) {
  // Pânza e simetrică faţă de mijloc, ca să se centreze singură în coloană.
  const raza = Math.max(Math.abs(de), Math.abs(la)) + 16
  const x1 = raza + de
  const x2 = raza + la
  const y1 = iesireJos(dinKind)
  const y2 = GOL - intrareSus(spreKind)
  const mijloc = (y2 - y1) / 2

  return (
    <svg
      width={raza * 2}
      height={GOL}
      className="pointer-events-none flex-shrink-0"
      aria-hidden="true"
    >
      <path
        d={`M ${x1} ${y1} C ${x1} ${y1 + mijloc}, ${x2} ${y2 - mijloc}, ${x2} ${y2}`}
        fill="none"
        stroke="#4A4238"
        strokeWidth={3}
        // Buline, nu liniuţe: segment de lungime zero cu capete rotunde.
        strokeDasharray="0.1 9"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Starea unui nod, dedusă o singură dată ca să nu se repete prin randare. */
function stareaNodului(node: PathNode, esteCurent: boolean, blocat: boolean) {
  if (node.done) return 'gata' as const
  if (blocat) return 'blocat' as const
  if (esteCurent) return 'curent' as const
  return 'deschis' as const
}

/**
 * Traseul dinăuntrul unui capitol, în stil Duolingo.
 *
 * Nodurile se deblochează în ordine: primul nefinalizat e cel curent, tot ce
 * urmează după el stă cu lacăt. Regula e derivată din `done`, nu ţinută separat
 * — altfel ar exista două adevăruri despre acelaşi lucru.
 */
export function ChapterPath({ nodes }: { nodes: PathNode[] }) {
  const idxCurent = nodes.findIndex(n => !n.done)

  return (
    <div className="flex flex-col items-center py-4">
      {nodes.map((node, i) => {
        const esteCurent = i === idxCurent
        const blocat = idxCurent !== -1 && i > idxCurent
        const stare = stareaNodului(node, esteCurent, blocat)
        const Icoana = ICOANE[node.kind]

        // Legătura stă în firul paginii, între noduri, şi ţine ea distanţa —
        // de asta nodurile n-au margine proprie.
        return (
          <Fragment key={node.id}>
            {i > 0 && (
              <Legatura
                de={abatere(i - 1)}
                la={abatere(i)}
                dinKind={nodes[i - 1].kind}
                spreKind={node.kind}
              />
            )}
            <div
              className="flex flex-col items-center"
              style={{ transform: `translateX(${abatere(i)}px)` }}
            >
              <NodTraseu node={node} stare={stare} Icoana={Icoana} />
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}

function NodTraseu({
  node, stare, Icoana,
}: {
  node: PathNode
  stare: 'gata' | 'curent' | 'blocat' | 'deschis'
  Icoana: typeof BookOpen
}) {
  const blocat = stare === 'blocat' || !node.href

  // Nodul închis e galben stins, nu gri: ţine de acelaşi drum ca restul, doar
  // că e stânjenit. Griul îl scotea din şir şi îl făcea să pară stricat.
  const culori = {
    gata:    { fata: '#4ade80', umbra: '#2f9c5a', icoana: '#0A0A0A' },
    curent:  { fata: '#E2B340', umbra: '#9c7a20', icoana: '#0A0A0A' },
    deschis: { fata: '#2A2A2A', umbra: '#1A1A1A', icoana: '#A0A0A0' },
    blocat:  { fata: '#54471F', umbra: '#392F14', icoana: '#A08A46' },
  }[stare]

  const forma = FORME[node.kind]
  const rotire = forma.rotit ? 'rotate(45deg)' : undefined

  const continut = (
    <>
      {/* Grosimea casetei. Un strat mai închis, împins în jos — de aici vine
          senzaţia de buton care se poate apăsa, nu de pătrat desenat.
          La diamant se roteşte odată cu faţa, altfel i-ar ieşi colţurile de sub
          ea. Rotaţia stă în dreapta translaţiei ca să rămână împins pe verticala
          ecranului, nu pe diagonala lui proprie. */}
      <span
        className="absolute inset-0"
        style={{
          background: culori.umbra,
          borderRadius: forma.raza,
          transform: `translateY(${GROSIME}px) ${rotire ?? ''}`.trim(),
        }}
      />

      {/* Faţa. Stratul din afară face coborârea la apăsare, cel dinăuntru ţine
          forma — dacă ar fi unul singur, apăsarea ar şterge rotaţia. */}
      <span className="absolute inset-0 transition-transform group-active:translate-y-[7px]">
        <span
          className={cn(
            'flex h-full w-full items-center justify-center',
            stare === 'curent' && 'animate-node-glow',
          )}
          style={{
            background: culori.fata,
            borderRadius: forma.raza,
            transform: rotire,
          }}
        >
          {/* Icoana se roteşte înapoi, ca ganterele să stea drept în diamant. */}
          <span style={{ transform: forma.rotit ? 'rotate(-45deg)' : undefined }}>
            {stare === 'gata'
              ? <Check className={forma.icoana} style={{ color: culori.icoana }} strokeWidth={3} />
              : <Icoana className={forma.icoana} style={{ color: culori.icoana }} />}
          </span>
        </span>
      </span>

      {/* Lăcăţelul. Stă pe colţul din dreapta-jos al plăcuţei, iar la diamant pe
          muchia dinspre dreapta-jos — la 75% pe amândouă axele cade exact pe ea.
          Inelul închis din jur îl desprinde de faţa galbenă de dedesubt. */}
      {stare === 'blocat' && (
        <span
          className="absolute flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-[#0F0F0F] bg-[#2A2413]"
          style={{
            left: forma.rotit ? '75%' : `${forma.latura - 8}px`,
            top: forma.rotit ? '75%' : `${forma.latura - 8}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Lock className="h-3 w-3" style={{ color: culori.icoana }} />
        </span>
      )}
    </>
  )

  // Cutia care ţine cele două straturi. Are mărimea formei, fiindcă straturile
  // sunt aşezate absolut peste ea. Diamantul iese din ea cu colţurile — asta e
  // în regulă, distanţele dintre noduri sunt calculate ştiind asta.
  const cutie = { width: forma.latura, height: forma.latura }

  // Fără text sub noduri. Cele patru-cinci rânduri de etichete umpleau traseul
  // de cuvinte şi îl făceau să arate iar a listă — exact ce încearcă să nu fie.
  // Ce fel de pas e fiecare se vede acum din formă şi din icoană, iar numele
  // întreg apare la trecerea cu mouse-ul, prin `title`.
  //
  // Nodurile închise nu mai poartă lacăt: îşi păstrează icoana, stinsă. Aşa vezi
  // ce urmează, nu doar că e închis — un lacăt spune „nu poţi", o gantere stinsă
  // spune „urmează un exerciţiu". A doua e o promisiune, prima e un zid.
  if (blocat) {
    return (
      <div title={node.title} className="flex cursor-not-allowed flex-col items-center">
        <span className="relative block" style={cutie}>{continut}</span>
      </div>
    )
  }

  return (
    <Link
      to={node.href!}
      title={node.title}
      className="group flex flex-col items-center"
    >
      {/* La apăsare, faţa coboară peste umbră — mişcarea pe care o aşteaptă
          oricine a atins vreodată un buton din Duolingo.
          Nodul curent respiră: scalarea stă aici, pe cutie, ca să nu calce
          peste rotaţia diamantului. */}
      <span
        className={cn('relative block', stare === 'curent' && 'animate-node-breathe')}
        style={cutie}
      >
        {continut}
      </span>
    </Link>
  )
}
