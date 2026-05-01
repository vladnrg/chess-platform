import { useState } from 'react'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

export function RestrictedPricing() {
  const { user, profile } = useAuth()
  const [email, setEmail] = useState((profile as any)?.parental_email ?? '')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function sendPaymentLink() {
    if (!user || !email.includes('@')) return
    setSending(true)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-parental-payment-link`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ userId: user.id, parentalEmail: email }),
        }
      )
      if (!res.ok) throw new Error('Eroare')
      await supabase.from('profiles').update({ parental_email: email }).eq('id', user.id) as any
      setSent(true)
      toast.success('Link trimis părintelui!')
    } catch {
      toast.error('Eroare la trimiterea emailului.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-5xl">📧</div>
          <h1 className="text-2xl font-bold text-[#f0f0f0]">Email trimis!</h1>
          <p className="text-[#a0a0a0] text-sm">
            Am trimis un link de plată la adresa <span className="text-[#c8a84b]">{email}</span>.
            Părintele/tutorele poate activa Pro-ul pentru tine.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-[#1a1a1a] border border-[#2a2a2a] p-5">
              <Lock className="h-8 w-8 text-[#c8a84b]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#f0f0f0] mb-2">Plata pentru părinți</h1>
          <p className="text-[#a0a0a0] text-sm">
            Deoarece ai sub 14 ani, plata se face prin intermediul unui părinte sau tutore.
            Trimitem un link securizat direct la email-ul lor.
          </p>
        </div>

        <div className="rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-5 space-y-4 text-left">
          <div>
            <label className="text-xs text-[#666] block mb-1.5">Email părinte / tutore</label>
            <Input
              type="email"
              placeholder="parinte@exemplu.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={sendPaymentLink}
            loading={sending}
            disabled={!email.includes('@')}
          >
            Trimite link de plată
          </Button>
        </div>

        <p className="text-xs text-[#666]">
          Linkul expiră în 48h. Părintele poate plăti cu orice card, fără a-și crea un cont.
        </p>
      </div>
    </div>
  )
}
