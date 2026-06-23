import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

type PageState = 'loading' | 'confirm' | 'already-used' | 'expired' | 'done-confirm' | 'done-reject'

export function ParentalConfirmPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const action = searchParams.get('action') as 'confirm' | 'reject' | null

  const [state, setState] = useState<PageState>('loading')
  const [childName, setChildName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) { setState('expired'); return }

    const checkLink = async () => {
      const { data: link } = await supabase
        .from('parental_links')
        .select('*, profiles(username, birth_year)')
        .eq('token', token)
        .single() as any

      if (!link) { setState('expired'); return }
      if (link.used_at) { setState('already-used'); return }
      if (new Date(link.expires_at) < new Date()) { setState('expired'); return }

      const profile = link.profiles as any
      setChildName(profile?.username ?? 'copilul tău')

      // Auto-action if action param present
      if (action === 'confirm' || action === 'reject') {
        await handleAction(action, link.user_id, link.id)
      } else {
        setState('confirm')
      }
    }

    checkLink()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, action])

  async function handleAction(act: 'confirm' | 'reject', userId: string, linkId: string) {
    setSubmitting(true)
    try {
      if (act === 'confirm') {
        await supabase.from('profiles').update({
          account_frozen: false,
          account_frozen_reason: null,
          parental_consent_given: true,
        }).eq('id', userId) as any
        setState('done-confirm')
      } else {
        await supabase.from('profiles').update({
          account_frozen: true,
          account_frozen_reason: 'rejected',
          parental_consent_given: false,
        }).eq('id', userId) as any
        setState('done-reject')
      }

      await supabase.from('parental_links').update({ used_at: new Date().toISOString() }).eq('id', linkId) as any
    } finally {
      setSubmitting(false)
    }
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <p className="text-[#6B6B6B]">Se verifică linkul...</p>
      </div>
    )
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
            onClick={() => { /* handleAction called with token data */ }}
            disabled={submitting}
            className="rounded-lg bg-[#141414] border border-[#2A2A2A] text-[#FB7185] font-semibold py-3 hover:border-[#FB7185] transition-colors disabled:opacity-50"
          >
            Respinge
          </button>
          <button
            onClick={() => { /* handleAction called with token data */ }}
            disabled={submitting}
            className="rounded-lg bg-[#E2B340] text-black font-semibold py-3 hover:bg-[#F0C85A] transition-colors disabled:opacity-50"
          >
            Confirma
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
