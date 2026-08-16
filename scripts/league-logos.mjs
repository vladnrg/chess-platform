/**
 * Construieşte siglele de ligă din emblemele originale.
 *
 * Sursele sunt embleme izolate — scut sau medalion — aşezate pe fundal alb.
 * Aici li se scoate fundalul, se taie la conturul lor real şi se aşază centrat
 * într-un pătrat, ca toate şapte să pară de aceeaşi mărime în aplicaţie.
 *
 * CE FACE, PE RÂND
 *
 * 1. Fundalul, prin umplere din margini. Nu o simplă înlocuire de culoare:
 *    albul are un uşor gradient, iar o potrivire exactă prinde sub 9% din
 *    pixeli. Nici „toţi pixelii deschişi" nu merge — reflexele argintii sunt la
 *    fel de luminoase. Doar zona deschisă care se ţine de marginea imaginii
 *    devine transparentă; ce e închis în interiorul emblemei rămâne.
 *
 * 2. Tăierea la contur. Emblemele au forme diferite: unele rotunde, altele
 *    scut, înalte şi înguste. Fără tăiere, cele rotunde par mult mai mari, căci
 *    umplu mai mult din pătratul lor. Tăiate la conturul propriu şi reaşezate,
 *    ajung toate la aceeaşi înălţime.
 *
 * 3. Aşezarea în pătrat, cu o margine mică de respiraţie.
 *
 * Rulare:
 *   node scripts/league-logos.mjs           → scrie în .tmp-leagues/
 *   node scripts/league-logos.mjs --apply   → scrie peste public/leagues/
 */
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const SRC = 'surse-imagini/ligi'
const OUT = process.argv.includes('--apply') ? 'public/leagues' : '.tmp-leagues'

/** Latura siglei. Cea mai mare afişare e 112px, deci 256 ajunge şi pe ecrane dense. */
const LATURA = 256

/** Peste atât, un pixel legat de margine e fundal. Colţurile măsoară 240–253. */
const PRAG_SUS = 225
/** Sub atât, e sigur emblemă. Între cele două se face trecerea lină. */
const PRAG_JOS = 185

/**
 * Cât de opac trebuie să fie un pixel ca să conteze la tăierea conturului.
 *
 * Emblemele au un halou colorat în jur. Măsurat de la primul pixel vizibil,
 * conturul ar include tot haloul, iar emblema propriu-zisă ar ieşi cu vreo 15%
 * mai mică decât a celorlalte. Pragul ăsta lasă haloul afară din măsurătoare,
 * dar nu îl şterge — se vede în continuare, doar că nu mai decide dimensiunea.
 */
const PRAG_CONTUR = 60

/** Margine în jurul emblemei, în procente din latură. */
const MARGINE = 0.03

/**
 * Ligile, în ordinea urcării. Numele scurt e identificatorul din baza de date
 * (`profiles.current_league`) şi tot el dă numele fişierului servit; eticheta e
 * ce vede omul în aplicaţie.
 *
 * Sursa fiecăreia se recunoaşte după coada numelui de fişier:
 * `4-bazat-argint.png` -> `argint`. Înainte se lua după poziţia alfabetică
 * într-o listă scrisă de mână — adică era de ajuns să resalvezi sau să
 * redenumeşti un fişier ca toate emblemele să se mute de la o ligă la alta,
 * fără niciun semn că s-a stricat ceva.
 */
const LIGI = [
  { id: 'cherestea', eticheta: 'Iniţiat' },     // pion de bronz în medalion de lemn
  { id: 'tinichea', eticheta: 'Integrat' },     // rege argintiu pe scut întunecat
  { id: 'bronz', eticheta: 'Pretendent' },      // cal de bronz pe scut
  { id: 'argint', eticheta: 'Bazat' },          // nebun argintiu pe scut întunecat
  { id: 'aur', eticheta: 'Avansat' },           // turn auriu cu aripi
  { id: 'smarald', eticheta: 'Remarcabil' },    // damă verde pe scut ornat
  { id: 'diamant', eticheta: 'Legendar' },      // damă albastră cu coroană şi lauri
]

const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b

async function construieste(fisier, liga) {
  const { data, info } = await sharp(join(SRC, fisier))
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h, channels: c } = info
  const px = w * h

  // ── 1. Fundalul ───────────────────────────────────────────────────────────
  const fundal = new Uint8Array(px)
  const vazut = new Uint8Array(px)
  const coada = []

  // Umplerea trece şi prin pixelii deja transparenţi: o siglă are colţurile
  // rotunjite şi goale, dar albul stă înăuntrul lor.
  const potential = i =>
    data[i * c + 3] < 8 ||
    lum(data[i * c], data[i * c + 1], data[i * c + 2]) >= PRAG_SUS

  for (let x = 0; x < w; x++) {
    for (const i of [x, (h - 1) * w + x]) if (!vazut[i] && potential(i)) { vazut[i] = 1; coada.push(i) }
  }
  for (let y = 0; y < h; y++) {
    for (const i of [y * w, y * w + w - 1]) if (!vazut[i] && potential(i)) { vazut[i] = 1; coada.push(i) }
  }
  while (coada.length) {
    const i = coada.pop()
    fundal[i] = 1
    const x = i % w, y = (i / w) | 0
    const vec = []
    if (x > 0) vec.push(i - 1)
    if (x < w - 1) vec.push(i + 1)
    if (y > 0) vec.push(i - w)
    if (y < h - 1) vec.push(i + w)
    for (const j of vec) if (!vazut[j] && potential(j)) { vazut[j] = 1; coada.push(j) }
  }

  let scosi = 0
  for (let i = 0; i < px; i++) {
    if (fundal[i]) { data[i * c + 3] = 0; scosi++; continue }

    const x = i % w, y = (i / w) | 0
    const langa =
      (x > 0 && fundal[i - 1]) || (x < w - 1 && fundal[i + 1]) ||
      (y > 0 && fundal[i - w]) || (y < h - 1 && fundal[i + w])
    if (!langa) continue

    // Conturul primeşte transparenţă parţială, ca marginea să nu iasă zimţată.
    const l = lum(data[i * c], data[i * c + 1], data[i * c + 2])
    if (l <= PRAG_JOS) continue
    const t = (l - PRAG_JOS) / (PRAG_SUS - PRAG_JOS)
    data[i * c + 3] = Math.round(data[i * c + 3] * (1 - t))
  }

  // ── 2. Conturul real ──────────────────────────────────────────────────────
  let x0 = w, y0 = h, x1 = -1, y1 = -1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * c + 3] < PRAG_CONTUR) continue
      if (x < x0) x0 = x
      if (x > x1) x1 = x
      if (y < y0) y0 = y
      if (y > y1) y1 = y
    }
  }
  if (x1 < 0) throw new Error(`${fisier}: nu am găsit nicio emblemă`)

  // ── 3. Aşezarea în pătrat ─────────────────────────────────────────────────
  const util = Math.round(LATURA * (1 - 2 * MARGINE))
  const decupat = await sharp(data, { raw: { width: w, height: h, channels: c } })
    .extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 })
    .resize(util, util, { fit: 'inside' })
    .png()
    .toBuffer()

  mkdirSync(OUT, { recursive: true })
  await sharp({
    create: {
      width: LATURA, height: LATURA, channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: decupat, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, `${liga}.png`))

  return {
    fundal: (100 * scosi / px).toFixed(1),
    contur: `${x1 - x0 + 1}×${y1 - y0 + 1}`,
  }
}

const { readdirSync } = await import('node:fs')
const fisiere = readdirSync(SRC).filter(f => /\.(png|jpe?g|webp)$/i.test(f))

// Fiecare ligă îşi caută sursa după identificatorul din coada numelui, nu după
// poziţie: aşa, un fişier lipsă sau prost numit opreşte scriptul pe loc, în loc
// să mute emblemele de la o ligă la alta.
for (const { id, eticheta } of LIGI) {
  const gasite = fisiere.filter(f => f.replace(/\.[^.]+$/, '').endsWith('-' + id))
  if (gasite.length !== 1) {
    throw new Error(`pentru "${id}" aştept exact un fişier terminat în "-${id}", am găsit ${gasite.length}`)
  }
  const r = await construieste(gasite[0], id)
  console.log(`${eticheta.padEnd(12)} (${id.padEnd(9)}) <- ${gasite[0].padEnd(26)} fundal ${r.fundal}%  contur ${r.contur}`)
}

console.log(`\nScris în ${OUT}`)
