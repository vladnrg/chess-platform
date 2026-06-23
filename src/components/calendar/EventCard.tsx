import { Calendar, MapPin, Users, ExternalLink } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useTournamentRegistration } from '@/hooks/useCalendar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { Tournament } from '@/types'

const CATEGORY_LABELS: Record<string, string> = {
  online: 'Online',
  over_the_board: 'Fizic',
  workshop: 'Workshop',
}

const CATEGORY_COLORS: Record<string, string> = {
  online: 'accent',
  over_the_board: 'intermediate',
  workshop: 'beginner',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'short',
  })
}

interface EventCardProps {
  tournament: Tournament
}

export function EventCard({ tournament: t }: EventCardProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data: isRegistered } = useTournamentRegistration(t.id, user?.id)

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Trebuie să fii logat')
      const { error } = await supabase
        .from('tournament_participants')
        .insert({ tournament_id: t.id, user_id: user.id })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Te-ai înregistrat cu succes!')
      queryClient.invalidateQueries({ queryKey: ['tournament-registered', t.id] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
    onError: (e: Error) => toast.error(e.message || 'Eroare la înregistrare.'),
  })

  const unregisterMutation = useMutation({
    mutationFn: async () => {
      if (!user) return
      const { error } = await supabase
        .from('tournament_participants')
        .delete()
        .eq('tournament_id', t.id)
        .eq('user_id', user.id)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Înregistrare anulată.')
      queryClient.invalidateQueries({ queryKey: ['tournament-registered', t.id] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })

  const isPast = new Date(t.starts_at) < new Date()
  const categoryLabel = t.category ? CATEGORY_LABELS[t.category] ?? t.category : null
  const categoryVariant = t.category ? (CATEGORY_COLORS[t.category] ?? 'default') : 'default'

  return (
    <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-2">
            {categoryLabel && (
              <Badge variant={categoryVariant as Parameters<typeof Badge>[0]['variant']}>{categoryLabel}</Badge>
            )}
            {t.type === 'external' && (
              <Badge variant="default">Competiție externă</Badge>
            )}
          </div>
          <h3 className="font-semibold text-[#F0F0F0] leading-snug">{t.title}</h3>
          {t.organizer && (
            <p className="text-xs text-[#6B6B6B] mt-0.5">{t.organizer}</p>
          )}
        </div>

        {/* Date block */}
        <div className="flex-shrink-0 rounded-lg bg-[#141414] border border-[#2A2A2A] p-2.5 text-center min-w-[52px]">
          <p className="text-lg font-bold text-[#E2B340] leading-none">
            {new Date(t.starts_at).getDate()}
          </p>
          <p className="text-xs text-[#6B6B6B] uppercase tracking-wide mt-0.5">
            {new Date(t.starts_at).toLocaleDateString('ro-RO', { month: 'short' })}
          </p>
        </div>
      </div>

      {t.description && (
        <p className="text-sm text-[#A0A0A0] leading-relaxed">{t.description}</p>
      )}

      <div className="flex flex-wrap gap-3 text-xs text-[#6B6B6B]">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            {formatDate(t.starts_at)}
            {t.ends_at && ` – ${formatDateShort(t.ends_at)}`}
          </span>
        </div>
        {t.city && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span>{t.city}</span>
          </div>
        )}
        {t.max_participants && (
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>Max {t.max_participants} jucători</span>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mt-auto">
        {t.type === 'external' && t.registration_url ? (
          <a href={t.registration_url} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm" className="w-full gap-2">
              <ExternalLink className="h-3.5 w-3.5" />
              Detalii & Înregistrare
            </Button>
          </a>
        ) : t.type === 'platform' && !isPast ? (
          isRegistered ? (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-[#FB7185]"
              onClick={() => unregisterMutation.mutate()}
              loading={unregisterMutation.isPending}
            >
              Anulează înregistrarea
            </Button>
          ) : (
            <Button
              size="sm"
              className="w-full"
              onClick={() => registerMutation.mutate()}
              loading={registerMutation.isPending}
            >
              Înregistrează-te
            </Button>
          )
        ) : isPast ? (
          <p className="text-center text-xs text-[#6B6B6B]">Eveniment încheiat</p>
        ) : null}
      </div>
    </div>
  )
}
