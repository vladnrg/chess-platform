import { useState } from 'react'

import { tacticVisual } from '@/lib/tactic-visuals'

/**
 * Plăcuţa desenată a unei tactici, cu iconiţa ca rezervă.
 *
 * Toate categoriile au acum imaginea lor în `public/tactics/tipuri/<id>.png`.
 * Iconiţa lucide rămâne totuşi ca rezervă: `onError` acoperă cazul unui fişier
 * care nu ajunge în build sau al unei categorii adăugate fără plăcuţă — nu
 * rămâne niciodată un pătrat gol.
 */
export function TacticTile({ id, size, iconSize }: {
  id: string
  /** clase pentru pătratul plăcuţei, ex. `h-24 w-24` */
  size: string
  /** clase pentru iconiţa de rezervă, ex. `h-8 w-8` */
  iconSize: string
}) {
  const { icon: Icon, color } = tacticVisual(id)
  const [areImagine, setAreImagine] = useState(true)

  if (!areImagine) {
    return (
      <span
        className={`flex ${size} items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110`}
        style={{ backgroundColor: `${color}1A`, color, boxShadow: `0 8px 26px ${color}22` }}
      >
        <Icon className={iconSize} strokeWidth={2} />
      </span>
    )
  }

  return (
    <img
      src={`/tactics/tipuri/${id}.png`}
      alt=""
      loading="lazy"
      onError={() => setAreImagine(false)}
      className={`${size} object-contain transition-transform duration-200 group-hover:scale-110`}
    />
  )
}
