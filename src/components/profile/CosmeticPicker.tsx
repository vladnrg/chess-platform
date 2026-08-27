import { Lock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useMyCosmetics, useCosmeticCatalog, useEquipCosmetic } from '@/hooks/useEvents'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import {
  COSMETIC_RARITY_COLORS, COSMETIC_RARITY_LABELS, DEFAULT_BOARD,
  type BadgePayload, type BoardPayload, type Cosmetic, type CosmeticKind,
} from '@/types'

/** Pătrăţelele de previzualizare a unei teme de tablă. */
function BoardSwatch({ colors }: { colors: BoardPayload }) {
  return (
    <span className="grid h-6 w-6 flex-shrink-0 grid-cols-2 overflow-hidden rounded">
      <span style={{ backgroundColor: colors.light }} />
      <span style={{ backgroundColor: colors.dark }} />
      <span style={{ backgroundColor: colors.dark }} />
      <span style={{ backgroundColor: colors.light }} />
    </span>
  )
}

function preview(cosmetic: Cosmetic) {
  if (cosmetic.kind === 'badge') {
    const p = cosmetic.payload as BadgePayload
    return <span className="text-base leading-none">{p.emoji}</span>
  }
  const p = cosmetic.payload as BoardPayload
  return <BoardSwatch colors={p} />
}

interface PickerProps {
  kind: CosmeticKind
  title: string
  hint: string
  /** Eticheta opţiunii „niciunul". */
  emptyLabel: string
}

function Picker({ kind, title, hint, emptyLabel }: PickerProps) {
  const { profile } = useAuth()
  const { data: owned = [] } = useMyCosmetics()
  const { data: catalog = [] } = useCosmeticCatalog()
  const equip = useEquipCosmetic()

  if (!profile) return null

  const equipped = kind === 'badge' ? profile.equipped_badge : profile.equipped_board
  const ownedIds = new Set(owned.map(c => c.id))
  const items = catalog.filter(c => c.kind === kind)

  return (
    <Card className="p-5">
      <h2 className="font-display text-base font-semibold text-[#F0F0F0]">{title}</h2>
      <p className="mb-4 mt-1 text-sm text-[#6B6B6B]">{hint}</p>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => equip.mutate({ id: null, kind })}
          disabled={equip.isPending}
          className={cn(
            'flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
            equipped === null
              ? 'bg-[#2A2A2A] text-[#F0F0F0]'
              : 'border border-[#2A2A2A] text-[#6B6B6B] hover:text-[#A0A0A0]'
          )}
        >
          {kind === 'board' && <BoardSwatch colors={DEFAULT_BOARD} />}
          {emptyLabel}
        </button>

        {items.map(cosmetic => {
          const locked = !ownedIds.has(cosmetic.id)
          const active = equipped === cosmetic.id
          const color = COSMETIC_RARITY_COLORS[cosmetic.rarity]

          return (
            <button
              key={cosmetic.id}
              onClick={() => !locked && equip.mutate({ id: cosmetic.id, kind })}
              disabled={equip.isPending || locked}
              className={cn(
                'flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                locked
                  ? 'cursor-not-allowed border border-[#1C1C1C] text-[#3A3A3A]'
                  : active
                    ? 'text-[#0A0A0A]'
                    : 'border text-[#A0A0A0] hover:text-[#F0F0F0]'
              )}
              style={
                locked ? undefined
                  : active
                    ? { backgroundColor: color }
                    : { borderColor: `${color}55` }
              }
            >
              {locked ? <Lock className="h-3 w-3" /> : preview(cosmetic)}
              {cosmetic.name}
              {locked && (
                <span className="text-xs">· {COSMETIC_RARITY_LABELS[cosmetic.rarity]}</span>
              )}
            </button>
          )
        })}
      </div>

      {items.length > 0 && ownedIds.size === 0 && (
        <p className="mt-4 text-xs text-[#6B6B6B]">
          Toate se câștigă la evenimente. Vezi ce e deschis acum în secțiunea Evenimente.
        </p>
      )}
    </Card>
  )
}

/**
 * Alegerea insignei şi a temei de tablă.
 *
 * Cele necâştigate se văd, cu numele lor — la fel ca la titluri: un premiu
 * invizibil nu motivează pe nimeni. Verificarea proprietăţii e în baza de date
 * (`equip_cosmetic`), nu aici.
 */
export function CosmeticPicker() {
  return (
    <div className="space-y-6">
      <Picker
        kind="badge"
        title="Insigna ta"
        hint="Apare lângă numele tău, alături de titlu."
        emptyLabel="Fără insignă"
      />
      <Picker
        kind="board"
        title="Tabla ta"
        hint="Culorile se aplică peste tot unde joci — puzzle-uri, lecții, partide."
        emptyLabel="Clasică"
      />
    </div>
  )
}
