/**
 * Repară faza damierului din jumătatea dreaptă a peretelui, deasupra stemei.
 *
 * CE E STRICAT
 * La x=372, adică exact mijlocul imaginii, alternanţa sare peste un pas.
 * Măsurat pe centrul fiecărei celule, pe rândul de lângă stemă:
 *   156→39  228→14  300→50  372→52  444→13  516→31
 * Cele două valori de 50 şi 52 sunt două pătrate deschise lipite. De acolo
 * încolo, jumătatea dreaptă e în contratimp faţă de cea stângă.
 *
 * CUM SE REPARĂ
 * Celulele defazate se rescriu cu textura unei celule DONATOARE de tonul
 * potrivit, luată din stânga imaginii, departe de stemă. Copierea se face la
 * acelaşi y, deci lumina rândului se potriveşte de la sine.
 *
 * De ce donator îndepărtat şi nu vecinul din stânga: s-a încercat, şi sursa de
 * lângă mijloc conţine muchia stemei. Rezultatul avea fantome — o copie a
 * conturului argintiu apărea în plin câmp de damier.
 *
 * De ce se mişcă DOUĂ rânduri: reparat singur, rândul de lângă stemă ar deveni
 * identic cu cel de deasupra lui, iar damierul ar arăta ca dungi verticale.
 * Rândurile de sub stemă rămân neatinse — acolo îmbinarea e ascunsă de stemă.
 *
 * Rulare: node scripts/repara-damier.mjs [sursă.png] [rezultat.png]
 */
import sharp from 'sharp'

const SRC = process.argv[2] ?? '.tmp-sursa.png'
const DST = process.argv[3] ?? '.tmp-reparat.png'

/**
 * Geometria a fost măsurată pe o imagine de 750px lăţime; aici se scalează după
 * cât are cea primită. Verificat pe originalul de 1254px: graniţele rândurilor
 * ies la 93, 212, 331, 450 — adică exact valorile de la 750 înmulţite cu 1,672.
 */
const REFERINTA = 750

/** Latura unui pătrat şi originea grilei, la scara de referinţă. */
const PAS_REF = 72
const X0_REF = 12
/**
 * Prima celulă defazată (mijlocul imaginii) şi ultima atinsă.
 *
 * Se opreşte la a opta, nu la ultima: aceea cade peste curbura ramei şi peste
 * ornamentul din colţ, unde orice rescriere lasă dungi. Iar tonul ei oricum nu
 * se vede — vigneta o duce la 2-3 din 255, adică negru pentru orice ochi.
 */
const K_PRIM = 5
const K_ULTIM = 8
/** Banda de reparat: cele două rânduri de deasupra stemei, la scara de referinţă. */
const Y_SUS_REF = 16
const Y_JOS_REF = 128
/** Trecere lină la margini, ca să nu rămână cusături. */
const PANA_REF = 5

/**
 * Celulele donatoare, alese pentru că sunt departe de stemă şi expuse complet.
 *
 * Tonul lor se schimbă de la un rând la altul exact ca al celulelor de reparat:
 * k3 are aceeaşi paritate cu k5, k7, k9, iar k2 cu k6 şi k8. Aşa, aceleaşi două
 * donatoare servesc şi rândul de sus, şi pe cel de jos, fără să ştim ce ton are
 * fiecare — parităţile se ocupă singure.
 */
const DONATOR = { par: 3, impar: 2 }

/**
 * Peste atât, un pixel e metal: rama, ornamentele, muchia stemei.
 * Pătratele deschise ajung la ~76, argintul trece de 100.
 */
const PRAG_METAL = 100

const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: w, height: h, channels: c } = info
const orig = Buffer.from(data)

const S = w / REFERINTA
const r = v => Math.round(v * S)
const PAS = r(PAS_REF), X0 = r(X0_REF)
const Y_SUS = r(Y_SUS_REF), Y_JOS = r(Y_JOS_REF), PANA = Math.max(3, r(PANA_REF))
const ORN = { x0: r(340), x1: r(412), y0: 0, y1: r(52) }
console.log(`imagine ${w}×${h}, scară ${S.toFixed(3)} → pas ${PAS}px, bandă y=${Y_SUS}..${Y_JOS}`)
const L = (x, y) => {
  const i = (y * w + x) * c
  return lum(orig[i], orig[i + 1], orig[i + 2])
}

// ── Unde începe stema, pe fiecare coloană ───────────────────────────────────
const varfStema = new Int32Array(w).fill(h)
for (let x = 0; x < w; x++) {
  for (let y = r(40); y < r(220); y++) {
    const d = Math.max(1, r(1)); const jos = (L(x, y) + L(x, y + d) + L(x, y + 2*d)) / 3
    const sus = (L(x, y - 4*d) + L(x, y - 3*d) + L(x, y - 2*d)) / 3
    if (jos - sus > 24 && jos > 60) { varfStema[x] = y; break }
  }
}

// Detecţia de mai sus se împiedică din când în când de câte o sclipire din
// textură şi raportează o muchie mult prea sus, pe o singură coloană. Coloana
// aceea rămâne apoi nerescrisă şi se vede ca o dungă verticală. Mediana pe o
// fereastră îngustă şterge rateurile izolate şi lasă conturul adevărat al
// stemei, care e neted pe zeci de coloane.
{
  const FER = Math.max(5, r(9)) | 1
  const jum = (FER - 1) / 2
  const copie = Int32Array.from(varfStema)
  for (let x = 0; x < w; x++) {
    const f = []
    for (let d = -jum; d <= jum; d++) {
      const xx = x + d
      if (xx >= 0 && xx < w) f.push(copie[xx])
    }
    f.sort((a, b) => a - b)
    varfStema[x] = f[(f.length - 1) >> 1]
  }
}

// ── Anvelopa de lumină, pe orizontală ───────────────────────────────────────
// Vigneta întunecă marginile, iar donatoarele vin dintr-o zonă mai luminoasă.
const anvelopa = new Float64Array(w)
for (let x = 0; x < w; x++) {
  let s = 0, n = 0
  for (let dx = -r(110); dx <= r(110); dx += Math.max(1, r(5))) {
    const xx = x + dx
    if (xx < 0 || xx >= w) continue
    for (let y = Y_SUS; y <= Y_JOS; y += 4) { s += L(xx, y); n++ }
  }
  anvelopa[x] = n ? Math.max(4, s / n) : 4
}

// ── Ce e în afara plăcii ────────────────────────────────────────────────────
// Placa are colţurile rotunjite, iar în jurul lor e negru curat. Celula din colţ
// depăşeşte marginea, aşa că fără paza asta se picta damier peste fundalul
// negru — de-acolo veneau dungile verticale din colţul din dreapta sus.
const PRAG_NEGRU = 26
const afara = new Uint8Array(w * h)
{
  const vazut = new Uint8Array(w * h)
  const coada = []
  const negru = i => lum(orig[i * c], orig[i * c + 1], orig[i * c + 2]) < PRAG_NEGRU
  for (let x = 0; x < w; x++) {
    for (const i of [x, (h - 1) * w + x]) if (!vazut[i] && negru(i)) { vazut[i] = 1; coada.push(i) }
  }
  for (let y = 0; y < h; y++) {
    for (const i of [y * w, y * w + w - 1]) if (!vazut[i] && negru(i)) { vazut[i] = 1; coada.push(i) }
  }
  while (coada.length) {
    const i = coada.pop()
    afara[i] = 1
    const x = i % w, y = (i / w) | 0
    const vec = []
    if (x > 0) vec.push(i - 1)
    if (x < w - 1) vec.push(i + 1)
    if (y > 0) vec.push(i - w)
    if (y < h - 1) vec.push(i + w)
    for (const j of vec) if (!vazut[j] && negru(j)) { vazut[j] = 1; coada.push(j) }
  }
}

// ── Cât de aproape e fiecare pixel de metal ─────────────────────────────────
// Un prag tăiat brusc lasă dungi: pixelii de pe conturul atenuat al argintului
// cad de-o parte şi de alta a lui, aşa că unii se rescriu şi alţii nu. Aici
// protecţia se stinge treptat pe câţiva pixeli în jurul oricărei suprafeţe
// metalice, iar tranziţia devine invizibilă.
const RAZA = Math.max(3, r(4))
const departeDeMetal = new Float32Array(w * (Y_JOS - Y_SUS + 1))
const idx = (x, y) => (y - Y_SUS) * w + x
for (let y = Y_SUS; y <= Y_JOS; y++) {
  for (let x = 0; x < w; x++) departeDeMetal[idx(x, y)] = (L(x, y) > PRAG_METAL || afara[y * w + x]) ? 0 : 1
}
for (let pas = 0; pas < RAZA; pas++) {
  const copie = Float32Array.from(departeDeMetal)
  for (let y = Y_SUS + 1; y < Y_JOS; y++) {
    for (let x = 1; x < w - 1; x++) {
      const min = Math.min(
        copie[idx(x - 1, y)], copie[idx(x + 1, y)],
        copie[idx(x, y - 1)], copie[idx(x, y + 1)],
      )
      departeDeMetal[idx(x, y)] = Math.min(copie[idx(x, y)], min + 1 / RAZA)
    }
  }
}

// ── Rescrierea celulelor defazate ───────────────────────────────────────────
let atinsi = 0
for (let k = K_PRIM; k <= K_ULTIM; k++) {
  const cx = X0 + k * PAS
  const dx0 = X0 + (((k - 3) % 2 === 0) ? DONATOR.par : DONATOR.impar) * PAS

  for (let dx = 0; dx < PAS; dx++) {
    const x = cx + dx
    const sx = dx0 + dx
    if (x >= w || sx >= w) continue

    for (let y = Y_SUS; y <= Y_JOS; y++) {
      if (y >= varfStema[x] - r(3)) continue          // destinaţia e stema
      if (y >= varfStema[sx] - r(3)) continue         // donatorul e stema
      if (L(x, y) > PRAG_METAL) continue           // destinaţia e metal
      if (L(sx, y) > PRAG_METAL) continue          // donatorul e metal
      // Ornamentul din vârful ramei stă peste marginea primei celule reparate.
      // Pragul de metal îl prinde oricum, dar zona e păzită şi pe geometrie,
      // ca o umbră a lui să nu fie luată drept damier.
      if (x >= ORN.x0 && x <= ORN.x1 && y >= ORN.y0 && y <= ORN.y1) continue

      const t = Math.min(
        (k === K_PRIM ? dx : PANA) / PANA,
        (y - Y_SUS) / PANA,
        (Y_JOS - y) / PANA,
        (varfStema[x] - r(3) - y) / PANA,
        departeDeMetal[idx(x, y)],
        departeDeMetal[idx(sx, y)],
        1,
      )
      if (t <= 0) continue

      const kv = anvelopa[x] / anvelopa[sx]
      const iD = (y * w + x) * c
      const iS = (y * w + sx) * c
      for (let ch = 0; ch < 3; ch++) {
        const nou = Math.max(0, Math.min(255, orig[iS + ch] * kv))
        data[iD + ch] = Math.round(orig[iD + ch] * (1 - t) + nou * t)
      }
      atinsi++
    }
  }
}

await sharp(data, { raw: { width: w, height: h, channels: c } }).png().toFile(DST)
console.log(`pixeli rescrişi: ${atinsi}  →  ${DST}`)
