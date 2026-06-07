// Embleme tematice per deschidere — line-art SVG într-un stil unitar,
// tintabile cu currentColor ca să se integreze în atmosfera site-ului.

interface Props {
  slug: string
  size?: number
  className?: string
  color?: string
}

export function OpeningEmblem({ slug, size = 88, className = '', color = 'currentColor' }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ color }}
      role="img"
      aria-label={slug}
    >
      {renderEmblem(slug)}
    </svg>
  )
}

function renderEmblem(slug: string) {
  switch (slug) {
    // London System — ceaiul de la ora 5
    case 'london-system':
      return (
        <g>
          <path d="M30 26 q2 -4 -1 -7 M37 26 q2 -4 -1 -7" />
          <path d="M18 32 H44 V38 Q44 48 31 48 Q18 48 18 38 Z" />
          <path d="M44 35 Q52 35 51 41 Q50 45 44 45" />
          <ellipse cx="31" cy="51" rx="17" ry="2.5" />
        </g>
      )
    // Italian Game — felie de pizza
    case 'italian-game':
      return (
        <g>
          <path d="M14 20 L50 20 L32 52 Z" />
          <path d="M14 20 Q32 13 50 20" strokeWidth="3.2" />
          <circle cx="26" cy="28" r="2.4" fill={undefined} />
          <circle cx="37" cy="30" r="2.4" />
          <circle cx="31" cy="40" r="2.4" />
        </g>
      )
    // King's Gambit — regele în prim-plan
    case 'kings-gambit':
      return (
        <g>
          <path d="M32 8 V18 M27 12 H37" />
          <path d="M22 30 Q32 22 42 30" />
          <path d="M24 52 L26 38 Q21 33 26 29 L38 29 Q43 33 38 38 L40 52 Z" />
          <path d="M22 52 H42" strokeWidth="3.4" />
        </g>
      )
    // Queen's Gambit — sticlă de whiskey
    case 'queens-gambit':
      return (
        <g>
          <rect x="28" y="8" width="8" height="5" rx="1" />
          <path d="M28 13 V22 Q26 24 26 28 V48 Q26 52 32 52 Q38 52 38 48 V28 Q38 24 36 22 V13" />
          <rect x="27" y="31" width="10" height="11" rx="1" />
        </g>
      )
    // Catalan — bască catalană (barretina)
    case 'catalan-opening':
      return (
        <g>
          <path d="M16 40 Q16 29 32 29 Q48 29 48 40 Q48 43 32 43 Q16 43 16 40 Z" />
          <path d="M40 30 Q47 16 51 18 Q53 19 49 26 Q46 30 41 31" />
          <ellipse cx="32" cy="44" rx="18" ry="2.4" />
        </g>
      )
    // Ruy Lopez — spadă de toreador (estoque)
    case 'ruy-lopez':
      return (
        <g>
          <path d="M20 46 L46 18" strokeWidth="2.8" />
          <path d="M15 41 L25 51" />
          <circle cx="18" cy="48" r="2.2" />
          <path d="M44 16 L48 20" />
        </g>
      )
    // English — joben (top hat)
    case 'english-opening':
      return (
        <g>
          <path d="M24 16 H40 V40 H24 Z" />
          <ellipse cx="32" cy="16" rx="8" ry="2.2" />
          <ellipse cx="32" cy="41" rx="19" ry="3.2" />
          <path d="M24 33 H40" strokeWidth="3.2" />
        </g>
      )
    // King's Indian Attack — covor zburător
    case 'kings-indian-attack':
      return (
        <g>
          <path d="M14 30 Q24 24 34 30 Q44 36 50 30 L50 38 Q44 44 34 38 Q24 32 14 38 Z" />
          <path d="M30 33 L34 35 L32 39 L28 37 Z" />
          <path d="M12 31 V37 M51 31 V37" />
          <path d="M8 32 Q5 34 8 36 M9 28 Q6 30 9 32" />
        </g>
      )
    // Colle System — trusă de scule
    case 'colle-system':
      return (
        <g>
          <rect x="15" y="29" width="34" height="20" rx="2" />
          <path d="M24 29 Q24 20 32 20 Q40 20 40 29" />
          <path d="M15 36 H49" />
          <rect x="29" y="33" width="6" height="6" rx="1" />
        </g>
      )
    // Vienna Game — un vals (note muzicale)
    case 'vienna-game':
      return (
        <g>
          <ellipse cx="22" cy="45" rx="4.5" ry="3.2" />
          <ellipse cx="41" cy="41" rx="4.5" ry="3.2" />
          <path d="M26 45 V22 L45 18 V41" />
          <path d="M26 24 L45 20" strokeWidth="3.2" />
        </g>
      )
    // Sicilian — pălărie de fedora
    case 'sicilian-defense':
      return (
        <g>
          <path d="M21 31 Q21 22 32 22 Q43 22 43 31" />
          <path d="M29 23 Q32 27 35 23" />
          <path d="M13 33 Q32 28 51 33 Q44 38 32 38 Q20 38 13 33 Z" />
        </g>
      )
    // French — croissant
    case 'french-defense':
      return (
        <g>
          <path d="M16 42 Q11 28 25 23 Q31 21 30 27 Q23 30 27 38 Q31 46 44 44 Q49 43 47 49 Q41 51 30 49 Q20 47 16 42 Z" />
          <path d="M24 30 L21 35 M31 34 L28 40 M38 40 L35 45" />
        </g>
      )
    // Caro-Kann — vestă antiglonț
    case 'caro-kann-defense':
      return (
        <g>
          <path d="M22 17 L42 17 L47 24 L40 27 L40 48 L24 48 L24 27 L17 24 Z" />
          <path d="M28 17 Q32 24 36 17" />
          <path d="M24 33 H40 M24 39 H40" />
        </g>
      )
    // King's Indian Defense — bumerang
    case 'kings-indian-defense':
      return (
        <g>
          <path d="M18 22 Q19 18 24 21 L42 43 Q45 48 40 49 Q37 49 35 46 L19 27 Q16 24 18 22 Z" />
          <path d="M46 20 Q50 22 50 27" />
        </g>
      )
    // Nimzo-Indian — bisturiu de chirurg
    case 'nimzo-indian-defense':
      return (
        <g>
          <path d="M16 48 L33 31" strokeWidth="3" />
          <path d="M33 31 L47 20 Q49 19 48 22 L38 36 Z" />
          <path d="M18 46 L20 48" />
        </g>
      )
    // Dutch — lalea din oțel
    case 'dutch-defense':
      return (
        <g>
          <path d="M24 27 L24 31 Q24 41 32 43 Q40 41 40 31 L40 27" />
          <path d="M24 27 Q26 20 28 27 Q30 19 32 27 Q34 19 36 27 Q38 20 40 27" />
          <path d="M32 43 V53" />
          <path d="M32 49 Q24 47 26 41 Q32 43 32 49" />
        </g>
      )
    // Slav — tanc T-34
    case 'slav-defense':
      return (
        <g>
          <path d="M26 28 L41 28 L43 36 L24 36 Z" />
          <path d="M41 31 L55 31" strokeWidth="2.8" />
          <rect x="15" y="36" width="34" height="6" />
          <path d="M14 42 Q14 49 21 49 L43 49 Q50 49 50 42 Z" />
          <circle cx="21" cy="45" r="1.6" /><circle cx="29" cy="45" r="1.6" />
          <circle cx="37" cy="45" r="1.6" /><circle cx="44" cy="45" r="1.6" />
        </g>
      )
    // Pirc — capcană de urși
    case 'pirc-defense':
      return (
        <g>
          <circle cx="32" cy="40" r="4" />
          <path d="M32 36 Q18 36 17 26 L20 29 L22 25 L24 29 L26 25 L28 29 L30 25 L32 29" />
          <path d="M32 36 Q46 36 47 26 L44 29 L42 25 L40 29 L38 25 L36 29 L34 25 L32 29" />
          <path d="M28 43 L24 48 M36 43 L40 48" />
        </g>
      )
    // Scandinavian — coif viking (cu coarne)
    case 'scandinavian-defense':
      return (
        <g>
          <path d="M22 37 Q22 22 32 22 Q42 22 42 37 Z" />
          <path d="M30 30 H34 V42 H30 Z" />
          <path d="M22 33 Q13 31 13 22 Q13 17 18 20" />
          <path d="M42 33 Q51 31 51 22 Q51 17 46 20" />
          <path d="M20 37 H44" strokeWidth="3" />
        </g>
      )
    // Alekhine — momeală de pescuit
    case 'alekhine-defense':
      return (
        <g>
          <circle cx="34" cy="13" r="2.4" />
          <path d="M34 15 V36 Q34 47 24 47 Q18 47 18 40" />
          <path d="M18 40 L16 42 M18 40 L20 42" />
          <ellipse cx="34" cy="27" rx="4.5" ry="8" />
          <path d="M30 24 L26 22 M30 30 L26 32" />
        </g>
      )
    // Codul Șahului — manual cu piese pe copertă
    case 'codul-sahului':
      return (
        <g>
          <rect x="18" y="14" width="28" height="36" rx="2" />
          <path d="M24 14 V50" />
          <path d="M32 22 V18 M30 20 H34" />
          <circle cx="32" cy="28" r="3" />
          <path d="M28 42 L36 42 L34 32 Q32 30 30 32 Z" />
        </g>
      )
    // Mișcarea pieselor — foaie cu piese + săgeți direcții
    case 'piese-in-miscare':
      return (
        <g>
          <path d="M17 13 H42 L47 18 V51 H17 Z" />
          <path d="M42 13 V18 H47" />
          <circle cx="30" cy="30" r="3" />
          <path d="M30 33 L29 39 L31 39 Z" fill={undefined} />
          <path d="M30 26 V20 M28 22 L30 19 L32 22" />
          <path d="M34 30 H40 M38 28 L41 30 L38 32" />
          <path d="M26 30 H20 M22 28 L19 30 L22 32" />
        </g>
      )
    // Fallback — un pion simplu
    default:
      return (
        <g>
          <circle cx="32" cy="22" r="6" />
          <path d="M24 48 L27 32 Q22 30 27 28 L37 28 Q42 30 37 32 L40 48 Z" />
          <path d="M22 48 H42" strokeWidth="3.2" />
        </g>
      )
  }
}
