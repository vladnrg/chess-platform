import { useState } from 'react'
import { Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { levelFromXp } from '@/lib/levels'
import { TITLES } from '@/lib/unlocks'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

/**
 * Alegerea titlului afişat lângă nume.
 *
 * Titlurile blocate se văd, dar cu nivelul cerut — un obiectiv vizibil e mai
 * motivant decât o listă goală.
 *
 * Verificarea reală se face în baza de date (`set_title`): dacă ar fi doar aici,
 * oricine şi-ar putea pune „Legendă" trimițând altă cerere.
 */
export function TitlePicker() {
  const { user, profile, fetchProfile } = useAuth()
  const [saving, setSaving] = useState(false)

  if (!profile) return null
  const level = levelFromXp(profile.xp)

  async function choose(title: string | null) {
    if (saving || !user) return
    setSaving(true)
    const { error } = await supabase.rpc('set_title', { p_title: title })
    setSaving(false)

    if (error) return toast.error('Titlul nu a putut fi salvat.')
    await fetchProfile(user.id)
    toast.success(title ? `Acum ești „${title}".` : 'Titlul a fost scos.')
  }

  return (
    <Card className="p-5">
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="font-display text-base font-semibold text-[#F0F0F0]">Titlul tău</h2>
        <span className="text-xs text-[#6B6B6B]">nivelul {level}</span>
      </div>
      <p className="mb-4 text-sm text-[#6B6B6B]">
        Apare lângă numele tău în clasament și în partide.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => choose(null)}
          disabled={saving}
          className={cn(
            'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
            profile.title === null
              ? 'bg-[#2A2A2A] text-[#F0F0F0]'
              : 'border border-[#2A2A2A] text-[#6B6B6B] hover:text-[#A0A0A0]'
          )}
        >
          Fără titlu
        </button>

        {TITLES.map(({ level: required, label }) => {
          const locked = level < required
          const active = profile.title === label

          return (
            <button
              key={label}
              onClick={() => !locked && choose(label)}
              disabled={saving || locked}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                locked
                  ? 'cursor-not-allowed border border-[#1C1C1C] text-[#3A3A3A]'
                  : active
                    ? 'bg-[#E2B340] text-black'
                    : 'border border-[#2A2A2A] text-[#A0A0A0] hover:border-[#3A3A3A] hover:text-[#F0F0F0]'
              )}
            >
              {locked && <Lock className="h-3 w-3" />}
              {label}
              {locked && <span className="text-xs">· {required}</span>}
            </button>
          )
        })}
      </div>
    </Card>
  )
}
