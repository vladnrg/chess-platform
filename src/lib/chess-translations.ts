// Full opening name replacements (checked first, longest match wins)
const FULL_NAME_MAP: [string, string][] = [
  ["Queen's Pawn Game", 'Jocul Damei'],
  ["King's Pawn Game", 'Jocul Regelui'],
  ["Italian Game", 'Jocul Italian'],
  ["Vienna Game", 'Jocul Vienez'],
  ["Four Knights Game", 'Jocul celor Patru Cai'],
  ["Three Knights Opening", 'Deschiderea cu Trei Cai'],
  ["Ruy Lopez", 'Ruy Lopez'],
  ["Spanish Game", 'Jocul Spaniol'],
  ["Sicilian Defense", 'Apărarea Siciliană'],
  ["French Defense", 'Apărarea Franceză'],
  ["Caro-Kann Defense", 'Apărarea Caro-Kann'],
  ["Scandinavian Defense", 'Apărarea Scandinavă'],
  ["Pirc Defense", 'Apărarea Pirc'],
  ["Modern Defense", 'Apărarea Modernă'],
  ["King's Indian Defense", "Apărarea Indiană a Regelui"],
  ["Queen's Indian Defense", "Apărarea Indiană a Damei"],
  ["Nimzo-Indian Defense", 'Apărarea Nimzo-Indiană'],
  ["Bogo-Indian Defense", 'Apărarea Bogo-Indiană'],
  ["Dutch Defense", 'Apărarea Olandeză'],
  ["Slav Defense", 'Apărarea Slavă'],
  ["Semi-Slav Defense", 'Apărarea Semi-Slavă'],
  ["Grunfeld Defense", 'Apărarea Grünfeld'],
  ["Grünfeld Defense", 'Apărarea Grünfeld'],
  ["Benoni Defense", 'Apărarea Benoni'],
  ["King's Gambit", "Gambitul Regelui"],
  ["Queen's Gambit", "Gambitul Damei"],
  ["Englund Gambit", 'Gambitul Englund'],
  ["Budapest Gambit", 'Gambitul Budapesta'],
  ["Albin Countergambit", 'Contra-Gambitul Albin'],
  ["Latvian Gambit", 'Gambitul Leton'],
  ["From's Gambit", "Gambitul From"],
  ["Bird's Opening", 'Deschiderea Bird'],
  ["English Opening", 'Deschiderea Engleză'],
  ["Bishop's Opening", 'Deschiderea Nebunului'],
  ["Reti Opening", 'Deschiderea Réti'],
  ["Réti Opening", 'Deschiderea Réti'],
  ["Catalan Opening", 'Deschiderea Catalană'],
  ["London System", 'Sistemul Londra'],
  ["Rapport-Jobava System", 'Sistemul Rapport-Jobava'],
  ["Torre Attack", 'Atacul Torre'],
  ["Trompowsky Attack", 'Atacul Trompowsky'],
  ["King's Indian Attack", "Atacul Indian al Regelui"],
  ["Colle System", 'Sistemul Colle'],
  ["Zukertort Opening", 'Deschiderea Zukertort'],
  ["Nimzowitsch-Larsen Attack", 'Atacul Nimzowitsch-Larsen'],
  ["Alekhine Defense", 'Apărarea Alekhine'],
  ["Owen Defense", 'Apărarea Owen'],
  ["St. George Defense", 'Apărarea Sf. George'],
  ["Hippo Defense", 'Apărarea Hippo'],
]

// Subtype / variation word replacements
const SUBTYPE_MAP: [RegExp, string][] = [
  [/\bMain Line\b/gi, 'Linia Principală'],
  [/\bClassical Variation\b/gi, 'Varianta Clasică'],
  [/\bClassical\b/gi, 'Clasică'],
  [/\bModern Variation\b/gi, 'Varianta Modernă'],
  [/\bAdvance Variation\b/gi, 'Varianta Avansului'],
  [/\bAdvance\b/gi, 'Avansul'],
  [/\bExchange Variation\b/gi, 'Varianta Schimbului'],
  [/\bExchange\b/gi, 'Schimbul'],
  [/\bDeclined\b/gi, 'Respins'],
  [/\bAccepted\b/gi, 'Acceptat'],
  [/\bSymmetrical Variation\b/gi, 'Varianta Simetrică'],
  [/\bSymmetrical\b/gi, 'Simetrică'],
  [/\bCounterattack\b/gi, 'Contraatac'],
  [/\bEndgame\b/gi, 'Final'],
  [/\bOpening\b/gi, 'Deschidere'],
  [/\bVariation\b/gi, 'Varianta'],
  [/\bAttack\b/gi, 'Atac'],
  [/\bDefense\b/gi, 'Apărare'],
  [/\bGameplan\b/gi, 'Plan de Joc'],
  [/\bSystem\b/gi, 'Sistem'],
  [/\bGambit\b/gi, 'Gambit'],
  [/\bReversed\b/gi, 'Inversat'],
  [/\bFour Knights\b/gi, 'Patru Cai'],
  [/\bTwo Knights\b/gi, 'Doi Cai'],
  [/\bThree Knights\b/gi, 'Trei Cai'],
  [/\bDragon\b/gi, 'Dragon'],
  [/\bNajdorf\b/gi, 'Najdorf'],
  [/\bScheveningen\b/gi, 'Scheveningen'],
  [/\bParis\b/gi, 'Paris'],
  [/\bItalian\b/gi, 'Italiană'],
  [/\bSteinitz\b/gi, 'Steinitz'],
  [/\bOpen\b/gi, 'Deschisă'],
  [/\bClosed\b/gi, 'Închisă'],
  [/\bHalfopen\b/gi, 'Semi-Deschisă'],
  [/\bSemi-open\b/gi, 'Semi-Deschisă'],
  [/\bAccelerated\b/gi, 'Accelerată'],
  [/\bHungarian\b/gi, 'Maghiară'],
  [/\bScotch\b/gi, 'Scoțiană'],
  [/\bPetrov\b/gi, 'Petrov'],
  [/\bPhilidor\b/gi, 'Philidor'],
]

export function translateOpeningName(name: string): string {
  let result = name

  // 1. Replace full opening names (sorted by length desc for greedy match)
  for (const [en, ro] of FULL_NAME_MAP) {
    if (result.toLowerCase().startsWith(en.toLowerCase())) {
      result = ro + result.slice(en.length)
      break
    }
  }

  // 2. Replace subtype terms
  for (const [pattern, ro] of SUBTYPE_MAP) {
    result = result.replace(pattern, ro)
  }

  return result
}
