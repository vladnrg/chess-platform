/**
 * Geometria traseului: ce mărime are fiecare fel de pas, cât e golul dintre
 * paşi, cât şerpuieşte şi cât ocupă totul pe verticală.
 *
 * Separat de componentă fiindcă Bârlogul are nevoie doar de numere — trebuie să
 * ştie cât de înalt iese un traseu ca să-l poată micşora exact cât să încapă.
 * (Şi fiindcă un fişier care exportă şi componente, şi funcţii, strică
 * reîncărcarea la cald în timpul lucrului.)
 */
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
export const FORME: Record<NodeKind, { latura: number; raza: number; rotit: boolean; icoana: string }> = {
  lectie:    { latura: 68, raza: 22, rotit: false, icoana: 'h-8 w-8' },
  exercitiu: { latura: 70, raza: 20, rotit: true,  icoana: 'h-7 w-7' },
  test:      { latura: 78, raza: 26, rotit: false, icoana: 'h-9 w-9' },
}

/** Cât coboară faţa peste umbră la apăsare. */
export const GROSIME = 7

/**
 * Cât se abate fiecare nod de la mijloc, în paşi.
 *
 * Tiparul se repetă din patru în patru şi dă şerpuirea. Nu e ornament: pe un şir
 * perfect drept, douăzeci de casete identice arată ca o listă, iar ochiul nu mai
 * simte că înaintează. Abaterea le face să se citească drept drum.
 */
export const ZIGZAG = [0, 1, 0, -1]
export const PAS_LATERAL = 62

/** Înălţimea spaţiului dintre două noduri — tot atâta cât ţine şi legătura. */
export const GOL = 46

/** Aerul de deasupra primului nod şi de sub ultimul. */
export const PADDING = 16

/** Abaterea laterală a nodului de pe poziţia `i`. */
export const abatere = (i: number) => ZIGZAG[i % ZIGZAG.length] * PAS_LATERAL

/**
 * Cât din golul de deasupra/dedesubt e acoperit deja de nodul vecin.
 *
 * Diamantul îşi depăşeşte caseta cu colţurile — jumătate din diferenţa dintre
 * diagonală şi latură. Fără corecţia asta, primele buline ale legăturii ar fi
 * desenate peste el. Se calculează din latură, nu se scrie de mână: altfel
 * orice schimbare de mărime ar strica firul fără să spună nimeni nimic.
 */
export const colt = (kind: NodeKind) =>
  FORME[kind].rotit ? Math.round((FORME[kind].latura * (Math.SQRT2 - 1)) / 2) : 0

export const iesireJos = (kind: NodeKind) => colt(kind) + GROSIME
export const intrareSus = (kind: NodeKind) => colt(kind)

/**
 * Cât ocupă pe verticală un traseu, în pixeli, la mărimea lui naturală.
 *
 * Calculat din aceleaşi constante cu care e desenat, nu măsurat după randare:
 * Bârlogul are nevoie de numărul ăsta ca să ştie cu cât să micşoreze traseul ca
 * să încapă tot, iar o măsurătoare ar veni prea târziu — după ce omul a apucat
 * să vadă cum sare pagina.
 *
 * Aici, nu acolo: dacă mâine se schimbă mărimea nodurilor sau golul dintre ele,
 * formula se schimbă odată cu ele, în acelaşi fişier.
 */
export function inaltimeaTraseului(noduri: PathNode[]): number {
  if (noduri.length === 0) return 0
  const inaltimeNoduri = noduri.reduce((sumă, n) => sumă + FORME[n.kind].latura, 0)
  return PADDING * 2 + inaltimeNoduri + (noduri.length - 1) * GOL + GROSIME
}
