import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import {
  serieXp, FERESTRE, FEREASTRA_INITIALA, TITLURI,
  type Fereastra, type RandJurnal,
} from '@/lib/xp-istoric'
import { formatXp } from '@/lib/utils'

/**
 * Cât XP ai strâns, în timp.
 *
 * Patru priviri asupra aceloraşi date — ultimele 7, 14, 30 de zile şi tot
 * istoricul — schimbate cu săgeţile de lângă titlu. Se deschide pe 30 de zile:
 * o săptămână e prea scurtă ca să arate un tipar, iar tot istoricul e prea lung
 * ca să spună ceva despre ziua de azi.
 *
 * Săgeţile merg în cerc. Sunt patru opţiuni, nu douăzeci — cine trece de ultima
 * vrea prima, nu un buton care nu mai face nimic.
 */
export function GraficXp({ jurnal, xpTotal }: { jurnal: RandJurnal[]; xpTotal: number }) {
  const [fereastra, setFereastra] = useState<Fereastra>(FEREASTRA_INITIALA)

  const serie = useMemo(() => serieXp(jurnal, fereastra, xpTotal), [jurnal, fereastra, xpTotal])

  const muta = (pas: number) => setFereastra(acum => {
    const i = FERESTRE.indexOf(acum)
    return FERESTRE[(i + pas + FERESTRE.length) % FERESTRE.length]
  })

  // Fără vârf, recharts desenează axa de la 0 la 0 şi linia iese lipită de jos.
  const maxim = Math.max(...serie.puncte.map(p => p.xp), 1)

  return (
    <div className="rounded-2xl border border-[#2A2A2A] bg-[#141414] p-4">
      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={() => muta(-1)}
          aria-label="Perioada anterioară"
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[#2A2A2A] bg-[#1C1C1C] text-[#A0A0A0] transition-colors hover:border-[#3A3A3A] hover:text-[#F0F0F0]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-semibold text-[#F0F0F0]">{TITLURI[fereastra]}</p>
          <p className="text-xs text-[#E2B340]">
            {serie.cumulativ ? formatXp(serie.totalFereastra) : `+${formatXp(serie.totalFereastra)}`} XP
          </p>
        </div>

        <button
          onClick={() => muta(1)}
          aria-label="Perioada următoare"
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[#2A2A2A] bg-[#1C1C1C] text-[#A0A0A0] transition-colors hover:border-[#3A3A3A] hover:text-[#F0F0F0]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={serie.puncte} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
          <XAxis
            dataKey="eticheta"
            tick={{ fill: '#6B6B6B', fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: '#2A2A2A' }}
            // Cu 30 de zile, fiecare zi scrisă ajunge un şir de cifre lipite.
            interval="preserveStartEnd"
            minTickGap={14}
          />
          <YAxis
            tick={{ fill: '#6B6B6B', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={44}
            domain={[0, Math.ceil(maxim * 1.15)]}
            tickFormatter={v => formatXp(Number(v))}
          />
          <Tooltip
            contentStyle={{
              background: '#1A1A1A', border: '1px solid #2A2A2A',
              borderRadius: 12, fontSize: 12,
            }}
            labelStyle={{ color: '#A0A0A0' }}
            labelFormatter={(_, incarcatura) => incarcatura?.[0]?.payload?.numeIntreg ?? ''}
            formatter={valoare => [
              `${formatXp(Number(valoare ?? 0))} XP`,
              serie.cumulativ ? 'Total la ziua aceea' : 'Câştigat',
            ]}
          />
          <Line
            type="monotone"
            dataKey="xp"
            stroke="#E2B340"
            strokeWidth={2}
            // Cu 30 de puncte, bulinele se ating între ele şi acoperă linia.
            dot={serie.puncte.length <= 14 ? { fill: '#E2B340', r: 3 } : false}
            activeDot={{ r: 4 }}
            // Fără animaţia de desenare. Pe un grafic de patru centimetri nu se
            // vede ca o intrare, ci ca o casetă care întârzie să se umple — iar
            // la fiecare săgeată ar lua-o de la capăt.
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
