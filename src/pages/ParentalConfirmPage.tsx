import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

type PageState = 'loading' | 'confirm' | 'already-used' | 'expired' | 'done-confirm' | 'done-reject' | 'error'

/** Linkul validat — necesar ca butoanele să știe pe cine confirmă/resping. */
interface ValidLink {
  userId: string
  linkId: string
}

export function ParentalConfirmPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const action = searchParams.get('action') as 'confirm' | 'reject' | null

  // Fără token nu e nimic de verificat — pornim direct în starea finală.
  const [state, setState] = useState<PageState>(token ? 'loading' : 'expired')
  const [childName, setChildName] = useState('')
  const [link, setLink] = useState<ValidLink | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleAction = useCallback(async (act: 'confirm' | 'reject', userId: string, linkId: string) => {
    setSubmitting(true)
    try {
      const { error: profileError } = act === 'confirm'
        ? await supabase.from('profiles').update({
            account_frozen: false,
            account_frozen_reason: null,
            parental_consent_given: true,
          }).eq('id', userId)
        : await supabase.from('profiles').update({
            account_frozen: true,
            account_frozen_reason: 'rejected',
            parental_consent_given: false,
          }).eq('id', userId)

      if (profileError) throw profileError

      // Marcăm linkul drept folosit abia după ce actualizarea contului a reușit,
      // ca părintele să poată reîncerca dacă ceva pică la mijloc.
      const { error: linkError } = await supabase
        .from('parental_links')
        .update({ used_at: new Date().toISOString() })
        .eq('id', linkId)
      if (linkError) throw linkError

      setState(act === 'confirm' ? 'done-confirm' : 'done-reject')
    } catch {
      setState('error')
    } finally {
      setSubmitting(false)
    }
  }, [])

  useEffect(() => {
    if (!token) return
    let cancelled = false

    const checkLink = async () => {
      const { data, error } = await supabase
        .from('parental_links')
        .select('*, profiles(username)')
        .eq('token', token)
        .maybeSingle()

      if (cancelled) return
      if (error) { setState('error'); return }
      if (!data) { setState('expired'); return }
      if (data.used_at) { setState('already-used'); return }
      if (new Date(data.expires_at) < new Date()) { setState('expired'); return }

      setChildName(data.profiles?.username ?? 'copilul tău')
      setLink({ userId: data.user_id, linkId: data.id })

      // Acțiune automată dacă linkul din e-mail conține deja intenția părintelui
      if (action === 'confirm' || action === 'reject') {
        await handleAction(action, data.user_id, data.id)
      } else {
        setState('confirm')
      }
    }

    void checkLink()
    return () => { cancelled = true }
  }, [token, action, handleAction])

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <p className="text-[#6B6B6B]">Se verifică linkul...</p>
      </div>
    )
  }

  if (state === 'error') {
    return <StatusPage icon="⚠️" title="Ceva n-a mers" message="Nu am putut procesa cererea. Încearcă din nou peste câteva minute — linkul rămâne valabil." />
  }

  if (state === 'expired') {
    return <StatusPage icon="⌛" title="Link expirat" message="Acest link de confirmare a expirat sau este invalid. Copilul poate solicita un nou link din pagina de înregistrare." />
  }

  if (state === 'already-used') {
    return <StatusPage icon="✅" title="Deja utilizat" message="Acest link a fost deja folosit. Dacă ai întâmpinit o problemă, contactează-ne." />
  }

  if (state === 'done-confirm') {
    return <StatusPage icon="✅" title="Cont activat!" message={`Contul lui ${childName} a fost activat. Se poate conecta acum pe platformă și începe să învețe șah.`} />
  }

  if (state === 'done-reject') {
    return <StatusPage icon="❌" title="Cerere respinsă" message={`Cererea lui ${childName} a fost respinsă. L-am anunțat că poate reveni cu o altă cerere.`} />
  }

  // state === 'confirm'
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="text-5xl mb-4">♟</div>
          <h1 className="text-2xl font-bold text-[#F0F0F0] mb-2">Cerere cont copil</h1>
          <p className="text-[#A0A0A0] text-sm">
            <span className="text-[#F0F0F0] font-semibold">{childName}</span> a solicitat un cont pe platforma noastră de șah.
            Ca părinte sau tutore, îți cerem acordul pentru activarea contului.
          </p>
        </div>

        <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-5 space-y-3 text-sm text-[#A0A0A0]">
          <p className="font-semibold text-[#F0F0F0]">Platforma oferă:</p>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>Cursuri interactive de șah pentru toate nivelele</li>
            <li>Puzzle-uri tactice cu rating și progres</li>
            <li>Sistem de ligi care recompensează perseverența</li>
            <li><strong className="text-[#E2B340]">Limită de 60 min/sesiune</strong> cu pauze progresive</li>
            <li>Raport săptămânal cu activitatea copilului</li>
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => link && void handleAction('reject', link.userId, link.linkId)}
            disabled={submitting || !link}
            className="rounded-lg bg-[#141414] border border-[#2A2A2A] text-[#FB7185] font-semibold py-3 hover:border-[#FB7185] transition-colors disabled:opacity-50"
          >
            Respinge
          </button>
          <button
            onClick={() => link && void handleAction('confirm', link.userId, link.linkId)}
            disabled={submitting || !link}
            className="rounded-lg bg-[#E2B340] text-black font-semibold py-3 hover:bg-[#F0C85A] transition-colors disabled:opacity-50"
          >
            Confirmă
          </button>
        </div>

        <p className="text-xs text-[#6B6B6B] text-center">
          Platforma nu colectează date personale ale copilului în afara unui username și progresului educațional.
        </p>
      </div>
    </div>
  )
}

function StatusPage({ icon, title, message }: { icon: string; title: string; message: string }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-4">
        <div className="text-5xl">{icon}</div>
        <h1 className="text-2xl font-bold text-[#F0F0F0]">{title}</h1>
        <p className="text-[#A0A0A0] text-sm">{message}</p>
      </div>
    </div>
  )
}
