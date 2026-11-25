/**
 * Legarea conturilor de Chess.com şi Lichess (cerut pe 2026-11-25): de aici vine
 * ratingul după care se aleg procentele de frecvenţă din cursuri.
 *
 * Totul se face din browser — ambele site-uri răspund direct paginilor noastre:
 *  - Lichess: legare adevărată, cu „Conectează-te cu Lichess" (OAuth cu PKCE,
 *    fără parolă şi fără aplicaţie înregistrată). Tokenul se foloseşte o
 *    singură dată, ca să aflăm numele contului, apoi se revocă.
 *  - Chess.com nu oferă aşa ceva site-urilor ca al nostru. Contul se dovedeşte
 *    cu un cod pus câteva minute în câmpul „Locaţie" din profilul public.
 *
 * Ratingul folosit: rapid; blitz dacă rapidul lipseşte sau e încă nesigur.
 */
export type Ritm = 'rapid' | 'blitz'
export interface RatingCont { rating: number; ritm: Ritm }

/** Peste atâta „deviaţie", ratingul de pe Chess.com e încă provizoriu. */
const RD_MAXIM = 150

// ── Chess.com ─────────────────────────────────────────────────────────────────

interface StatChesscom { last?: { rating: number; rd?: number } }

export async function ratingChesscom(username: string): Promise<RatingCont | null> {
  const r = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}/stats`)
  if (!r.ok) return null
  const j = await r.json() as { chess_rapid?: StatChesscom; chess_blitz?: StatChesscom }
  const sigur = (s?: StatChesscom) => s?.last?.rating && (s.last.rd ?? 0) <= RD_MAXIM ? s.last.rating : null
  const rapid = sigur(j.chess_rapid)
  if (rapid) return { rating: rapid, ritm: 'rapid' }
  const blitz = sigur(j.chess_blitz)
  if (blitz) return { rating: blitz, ritm: 'blitz' }
  // Niciunul sigur: luăm ce există, decât să ignorăm contul.
  const oricare = j.chess_rapid?.last?.rating ?? j.chess_blitz?.last?.rating
  return oricare ? { rating: oricare, ritm: j.chess_rapid?.last ? 'rapid' : 'blitz' } : null
}

/** Profilul public: există contul şi ce scrie la „Locaţie". */
export async function profilChesscom(username: string): Promise<{ username: string; locatie: string } | null> {
  const r = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}`)
  if (!r.ok) return null
  const j = await r.json() as { username?: string; location?: string }
  return j.username ? { username: j.username, locatie: j.location ?? '' } : null
}

/** Codul de pus în „Locaţie": scurt, uşor de copiat, diferit la fiecare încercare. */
export function codVerificare(): string {
  const litere = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  const b = crypto.getRandomValues(new Uint8Array(6))
  return 'CleanChess-' + [...b].map(x => litere[x % litere.length]).join('')
}

// ── Lichess ───────────────────────────────────────────────────────────────────

interface PerfLichess { rating: number; prov?: boolean; games?: number }

function dinPerfs(perfs?: { rapid?: PerfLichess; blitz?: PerfLichess }): RatingCont | null {
  const sigur = (p?: PerfLichess) => p && !p.prov && (p.games ?? 0) > 0 ? p.rating : null
  const rapid = sigur(perfs?.rapid)
  if (rapid) return { rating: rapid, ritm: 'rapid' }
  const blitz = sigur(perfs?.blitz)
  if (blitz) return { rating: blitz, ritm: 'blitz' }
  return null
}

export async function ratingLichess(username: string): Promise<RatingCont | null> {
  const r = await fetch(`https://lichess.org/api/user/${encodeURIComponent(username)}`)
  if (!r.ok) return null
  const j = await r.json() as { perfs?: { rapid?: PerfLichess; blitz?: PerfLichess } }
  return dinPerfs(j.perfs)
}

const LICHESS = 'https://lichess.org'
const CLIENT_ID = 'cleanchess'
const CHEIE_PKCE = 'lichess-pkce'
export const ADRESA_INTOARCERE_LICHESS = '/conturi/lichess'

function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Pleacă spre Lichess; acolo omul apasă „Autorizează" şi revine la noi. */
export async function pornesteLegareLichess(): Promise<void> {
  const verificator = base64url(crypto.getRandomValues(new Uint8Array(48)))
  const stare = base64url(crypto.getRandomValues(new Uint8Array(16)))
  const provocare = base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verificator))))
  sessionStorage.setItem(CHEIE_PKCE, JSON.stringify({ verificator, stare }))
  const p = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: window.location.origin + ADRESA_INTOARCERE_LICHESS,
    code_challenge_method: 'S256',
    code_challenge: provocare,
    state: stare,
  })
  window.location.assign(`${LICHESS}/oauth?${p}`)
}

/**
 * La întoarcere: schimbă codul pe un token, află contul şi ratingul, apoi
 * revocă tokenul — nu păstrăm nimic care să ne dea acces la contul lui.
 */
export async function incheieLegareLichess(params: URLSearchParams): Promise<{ username: string; rating: RatingCont | null }> {
  const salvat = JSON.parse(sessionStorage.getItem(CHEIE_PKCE) ?? 'null') as { verificator: string; stare: string } | null
  sessionStorage.removeItem(CHEIE_PKCE)
  if (params.get('error')) throw new Error('Ai anulat legarea pe Lichess.')
  const cod = params.get('code')
  if (!salvat || !cod || params.get('state') !== salvat.stare) throw new Error('Legarea a expirat. Încearcă din nou.')

  const r = await fetch(`${LICHESS}/api/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: cod,
      code_verifier: salvat.verificator,
      redirect_uri: window.location.origin + ADRESA_INTOARCERE_LICHESS,
      client_id: CLIENT_ID,
    }),
  })
  if (!r.ok) throw new Error('Lichess n-a confirmat legarea. Încearcă din nou.')
  const { access_token: token } = await r.json() as { access_token: string }

  try {
    const a = await fetch(`${LICHESS}/api/account`, { headers: { Authorization: `Bearer ${token}` } })
    if (!a.ok) throw new Error('Nu am putut citi contul de Lichess.')
    const cont = await a.json() as { username: string; perfs?: { rapid?: PerfLichess; blitz?: PerfLichess } }
    return { username: cont.username, rating: dinPerfs(cont.perfs) }
  } finally {
    void fetch(`${LICHESS}/api/token`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
  }
}
