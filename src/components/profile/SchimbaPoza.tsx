import { useRef, useState } from 'react'
import { Camera, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { AvatarJucator } from '@/components/ui/AvatarJucator'
import { Spinner } from '@/components/ui/Spinner'

/** Cât acceptă raftul din migrarea 090. Verificăm şi aici, ca să nu urcăm degeaba. */
const MARIME_MAXIMA = 2 * 1024 * 1024
const TIPURI = ['image/png', 'image/jpeg', 'image/webp']

/**
 * Poza de profil: încarcă alta sau întoarce-te la cea din contul Google.
 *
 * Fişierul urcă în raftul `avatare`, într-un folder numit cu id-ul tău — aşa
 * cer politicile din bază, ca nimeni să nu scrie peste poza altcuiva.
 *
 * Numele fişierului poartă ora încărcării. Fără asta, a doua poză ar avea exact
 * aceeaşi adresă ca prima, iar browserul ar arăta-o mai departe pe cea veche,
 * din memoria lui — omul ar crede că n-a mers.
 */
export function SchimbaPoza() {
  const { profile, user, fetchProfile } = useAuth()
  const camp = useRef<HTMLInputElement>(null)
  const [seIncarca, setSeIncarca] = useState(false)

  if (!profile || !user) return null

  const pozaDinGoogle =
    (user.user_metadata?.avatar_url as string | undefined) ??
    (user.user_metadata?.picture as string | undefined) ??
    null

  const scrieAdresa = async (adresa: string | null) => {
    const { error } = await supabase.from('profiles').update({ avatar_url: adresa }).eq('id', user.id)
    if (error) throw error
    await fetchProfile(user.id)
  }

  const incarca = async (fisier: File) => {
    if (!TIPURI.includes(fisier.type)) {
      toast.error('Doar poze PNG, JPG sau WEBP.')
      return
    }
    if (fisier.size > MARIME_MAXIMA) {
      toast.error('Poza e mai mare de 2 MB. Alege una mai mică.')
      return
    }

    setSeIncarca(true)
    try {
      const extensie = fisier.type.split('/')[1].replace('jpeg', 'jpg')
      const cale = `${user.id}/poza-${Date.now()}.${extensie}`
      const { error } = await supabase.storage.from('avatare').upload(cale, fisier, { upsert: true })
      if (error) throw error

      const { data } = supabase.storage.from('avatare').getPublicUrl(cale)
      await scrieAdresa(data.publicUrl)
      toast.success('Poza a fost schimbată.')
    } catch {
      toast.error('N-am reușit să încarc poza. Mai încearcă o dată.')
    } finally {
      setSeIncarca(false)
      if (camp.current) camp.current.value = '' // ca aceeaşi poză să poată fi aleasă din nou
    }
  }

  const scoate = async () => {
    setSeIncarca(true)
    try {
      // Înapoi la poza din Google dacă există; altfel la incognito.
      await scrieAdresa(pozaDinGoogle)
      toast.success(pozaDinGoogle ? 'Ai revenit la poza din contul Google.' : 'Poza a fost ștearsă.')
    } catch {
      toast.error('N-am reușit să șterg poza.')
    } finally {
      setSeIncarca(false)
    }
  }

  const areAltaDecatCeaDinGoogle = !!profile.avatar_url && profile.avatar_url !== pozaDinGoogle

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <AvatarJucator src={profile.avatar_url} nume={profile.username} marime={72} inel="#E2B340" />
        {seIncarca && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-[#0A0A0A]/70">
            <Spinner className="h-5 w-5" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#F0F0F0]">Poza ta</p>
        <p className="mb-2 text-xs text-[#6B6B6B]">
          {profile.avatar_url
            ? 'PNG, JPG sau WEBP, cel mult 2 MB.'
            : 'Momentan apari cu pălăria și ochelarii. Pune o poză dacă vrei.'}
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => camp.current?.click()}
            disabled={seIncarca}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#2A2A2A] bg-[#1C1C1C] px-3 py-1.5 text-xs font-semibold text-[#F0F0F0] transition-colors hover:border-[#3A3A3A] disabled:opacity-50"
          >
            <Camera className="h-3.5 w-3.5" />
            Alege o poză
          </button>

          {areAltaDecatCeaDinGoogle && (
            <button
              type="button"
              onClick={() => void scoate()}
              disabled={seIncarca}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#2A2A2A] bg-[#1C1C1C] px-3 py-1.5 text-xs font-semibold text-[#A0A0A0] transition-colors hover:border-[#3A3A3A] hover:text-[#F0F0F0] disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {pozaDinGoogle ? 'Înapoi la cea din Google' : 'Șterge'}
            </button>
          )}
        </div>

        <input
          ref={camp}
          type="file"
          accept={TIPURI.join(',')}
          className="hidden"
          onChange={e => {
            const fisier = e.target.files?.[0]
            if (fisier) void incarca(fisier)
          }}
        />
      </div>
    </div>
  )
}
