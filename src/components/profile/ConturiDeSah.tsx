import { useState } from 'react'
import toast from 'react-hot-toast'
import { Check, Copy, Link2, Unlink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { codVerificare, pornesteLegareLichess, profilChesscom, ratingChesscom } from '@/lib/conturi-sah'
import type { Profile } from '@/types'

/**
 * Conturile de Chess.com şi Lichess, legate de profil (cerut pe 2026-11-25).
 * Din ele vine ratingul după care cursurile arată procentele: Lichess → ale
 * jucătorilor de pe Lichess, Chess.com → ale celor de pe Chess.com. Fără cont,
 * testul de plasament.
 */
export function ConturiDeSah() {
  const { profile, user, fetchProfile } = useAuth()
  const [lucreaza, setLucreaza] = useState(false)
  // Chess.com, în doi paşi: numele, apoi codul pus în „Locaţie".
  const [numeCc, setNumeCc] = useState('')
  const [cod, setCod] = useState<string | null>(null)

  if (!profile || !user) return null

  const salveaza = async (campuri: Partial<Profile>) => {
    const { error } = await supabase.from('profiles').update(campuri).eq('id', user.id)
    if (error) throw error
    await fetchProfile(user.id)
  }

  const legatLichess = !!profile.lichess_username && profile.lichess_rating != null
  const legatChesscom = !!profile.chesscom_username

  const verificaChesscom = async () => {
    if (!cod) return
    setLucreaza(true)
    try {
      const p = await profilChesscom(numeCc.trim())
      if (!p) throw new Error('Nu găsesc contul ăsta pe Chess.com.')
      if (!p.locatie.includes(cod)) throw new Error('Nu văd încă codul în câmpul „Locație". Ai salvat profilul pe Chess.com?')
      const r = await ratingChesscom(p.username)
      await salveaza({
        chesscom_username: p.username,
        chesscom_rating: r?.rating ?? null,
        sursa_rating: r ? 'chesscom' : profile.sursa_rating ?? null,
        rating_ritm: r?.ritm ?? profile.rating_ritm ?? null,
        rating_actualizat_la: new Date().toISOString(),
      })
      setCod(null)
      setNumeCc('')
      toast.success(r ? `Cont legat: ${p.username}, ${r.ritm} ${r.rating}. Poți șterge codul din profil.` : 'Cont legat, dar n-are încă rating de rapid sau blitz.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Nu am putut lega contul.')
    } finally {
      setLucreaza(false)
    }
  }

  const deconecteaza = async (sursa: 'chesscom' | 'lichess') => {
    setLucreaza(true)
    try {
      const cealalta = sursa === 'chesscom' ? (legatLichess ? 'lichess' : null) : (legatChesscom ? 'chesscom' : null)
      await salveaza(sursa === 'chesscom'
        ? { chesscom_username: null, chesscom_rating: null, sursa_rating: profile.sursa_rating === 'chesscom' ? cealalta : profile.sursa_rating }
        : { lichess_username: null, lichess_rating: null, sursa_rating: profile.sursa_rating === 'lichess' ? cealalta : profile.sursa_rating })
    } catch {
      toast.error('Nu am putut deconecta contul.')
    } finally {
      setLucreaza(false)
    }
  }

  const rand = 'flex items-center justify-between gap-3 rounded-lg bg-[#141414] p-3'

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div>
          <h2 className="font-semibold text-[#F0F0F0]">Conturi de șah</h2>
          <p className="mt-1 text-sm text-[#A0A0A0]">
            Leagă-ți contul, iar cursurile îți arată cât de des apare fiecare variantă la ratingul tău real.
            {!legatLichess && !legatChesscom && ` Acum folosim nivelul din testul de plasament (~${profile.estimated_elo}).`}
          </p>
        </div>

        {/* Lichess */}
        <div className={rand}>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#F0F0F0]">Lichess</p>
            <p className="truncate text-xs text-[#6B6B6B]">
              {legatLichess
                ? `${profile.lichess_username} · ${profile.lichess_rating}${profile.sursa_rating === 'lichess' && profile.rating_ritm ? ` (${profile.rating_ritm})` : ''}`
                : 'Neconectat'}
            </p>
          </div>
          {legatLichess ? (
            <Button variant="ghost" size="sm" onClick={() => deconecteaza('lichess')} disabled={lucreaza}>
              <Unlink className="h-4 w-4" /> Deconectează
            </Button>
          ) : (
            <Button size="sm" onClick={() => void pornesteLegareLichess()}>
              <Link2 className="h-4 w-4" /> Conectează-te cu Lichess
            </Button>
          )}
        </div>

        {/* Chess.com */}
        <div className="space-y-3 rounded-lg bg-[#141414] p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#F0F0F0]">Chess.com</p>
              <p className="truncate text-xs text-[#6B6B6B]">
                {legatChesscom
                  ? `${profile.chesscom_username} · ${profile.chesscom_rating ?? 'fără rating'}${profile.sursa_rating === 'chesscom' && profile.rating_ritm ? ` (${profile.rating_ritm})` : ''}`
                  : 'Neconectat'}
              </p>
            </div>
            {legatChesscom && (
              <Button variant="ghost" size="sm" onClick={() => deconecteaza('chesscom')} disabled={lucreaza}>
                <Unlink className="h-4 w-4" /> Deconectează
              </Button>
            )}
          </div>

          {!legatChesscom && !cod && (
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input label="Numele tău pe Chess.com" value={numeCc} onChange={e => setNumeCc(e.target.value)} placeholder="ex: VladPopescu" />
              </div>
              <Button size="sm" disabled={!numeCc.trim()} onClick={() => setCod(codVerificare())}>Continuă</Button>
            </div>
          )}

          {!legatChesscom && cod && (
            <div className="space-y-3 text-sm text-[#A0A0A0]">
              <p>
                Ca să știm că e contul tău: deschide profilul de pe Chess.com (Setări → Profil), pune codul de mai jos în
                câmpul <span className="text-[#F0F0F0]">„Locație"</span> și salvează. După verificare îl poți șterge.
              </p>
              <button
                type="button"
                onClick={() => { void navigator.clipboard.writeText(cod); toast.success('Cod copiat.') }}
                className="flex w-full items-center justify-between rounded-lg border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-2 font-mono text-[#E2B340]"
              >
                {cod} <Copy className="h-4 w-4" />
              </button>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setCod(null)}>Înapoi</Button>
                <Button size="sm" className="flex-1" onClick={verificaChesscom} loading={lucreaza}>
                  <Check className="h-4 w-4" /> Am pus codul, verifică
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Cu ambele conturi, alegi după care se iau procentele. */}
        {legatLichess && legatChesscom && profile.chesscom_rating != null && (
          <div className="space-y-2">
            <p className="text-sm text-[#A0A0A0]">Procentele din cursuri vin din:</p>
            <div className="flex gap-2">
              {(['chesscom', 'lichess'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  disabled={lucreaza}
                  onClick={() => void salveaza({ sursa_rating: s }).catch(() => toast.error('Nu am putut salva.'))}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                    profile.sursa_rating === s
                      ? 'border-[#E2B340] bg-[rgba(226,179,64,0.1)] text-[#E2B340]'
                      : 'border-[#2A2A2A] text-[#A0A0A0] hover:text-[#F0F0F0]'
                  }`}
                >
                  {s === 'chesscom' ? 'Chess.com' : 'Lichess'}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
