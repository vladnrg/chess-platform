import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { getLeagueConfig } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import type { PlayingStyle } from '@/types'
import { PLAYING_STYLE_LABELS } from '@/types'

export function ProfilePage() {
  const { profile, fetchProfile, user } = useAuth()
  const [username, setUsername] = useState(profile?.username ?? '')
  const [city, setCity] = useState(profile?.city ?? '')
  const [county, setCounty] = useState(profile?.county ?? '')
  const [lichessUsername, setLichessUsername] = useState(profile?.lichess_username ?? '')
  const leagueConfig = profile ? getLeagueConfig(profile.current_league) : null

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!user) return
      const { error } = await supabase
        .from('profiles')
        .update({ username, city: city || null, county: county || null, lichess_username: lichessUsername || null })
        .eq('id', user.id)
      if (error) throw error
      await fetchProfile(user.id)
    },
    onSuccess: () => toast.success('Profil actualizat!'),
    onError: () => toast.error('Eroare la actualizare.'),
  })

  if (!profile || !leagueConfig) return null

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-[#F0F0F0]">Profil</h1>

      {/* Avatar + ligă */}
      <Card>
        <CardContent className="flex items-center gap-5 p-5">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white"
            style={{ backgroundColor: `${leagueConfig.color}30`, border: `3px solid ${leagueConfig.color}` }}
          >
            {profile.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-[#F0F0F0]">{profile.username}</p>
            <p className="text-sm font-semibold" style={{ color: leagueConfig.color }}>{leagueConfig.label}</p>
            <p className="text-xs text-[#6B6B6B]">{profile.xp} XP · Elo ~{profile.estimated_elo}</p>
          </div>
        </CardContent>
      </Card>

      {/* Editare */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <h2 className="font-semibold text-[#F0F0F0]">Informații cont</h2>
          <Input
            label="Nume utilizator"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Oraș"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="ex: Cluj-Napoca"
            />
            <Input
              label="Județ"
              value={county}
              onChange={e => setCounty(e.target.value)}
              placeholder="ex: Cluj"
            />
          </div>
          <Input
            label="Username Lichess (opțional)"
            value={lichessUsername}
            onChange={e => setLichessUsername(e.target.value)}
            placeholder="ex: MagnusCarlsen"
          />
          <div>
            <p className="text-sm text-[#A0A0A0] mb-1">Stil de joc detectat</p>
            <p className="font-semibold text-[#E2B340]">
              {profile.playing_style ? PLAYING_STYLE_LABELS[profile.playing_style as PlayingStyle] : 'Necunoscut'}
            </p>
          </div>
          <Button onClick={() => updateMutation.mutate()} loading={updateMutation.isPending}>
            Salvează modificările
          </Button>
        </CardContent>
      </Card>

      {/* Stats rapide */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <h2 className="font-semibold text-[#F0F0F0]">Statistici cont</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Streak', value: `${profile.streak_days} zile` },
              { label: 'Rating puzzle', value: profile.puzzle_rating != null ? `${profile.puzzle_rating}` : 'Neplasat' },
              { label: 'Liga curentă', value: leagueConfig.label },
              { label: 'XP total', value: profile.xp.toLocaleString('ro-RO') },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg bg-[#141414] p-3">
                <p className="text-xs text-[#6B6B6B]">{label}</p>
                <p className="font-semibold text-[#F0F0F0]">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
