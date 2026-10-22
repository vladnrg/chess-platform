/**
 * Regulile de scris pentru conţinutul cursurilor, într-un singur loc.
 *
 * Le folosesc `terminologie.mjs` (pe baza reală) şi verificarea flotei de
 * cursuri (`flota-cursuri/unelte/verifica.mjs`, pe fişierele de lucru), ca o
 * regulă schimbată aici să ajungă la amândouă. O copie s-ar învechi în tăcere.
 */

/** Ce nu se scrie, şi ce se scrie în loc. */
export const INTERZISE = [
  {
    ce: /\b[Tt]urn(ul|ului|uri|urile|urilor)?\b/g,
    gresit: 'turn / turnul / turnuri',
    corect: 'tură / tura / ture (piesa e la feminin)',
  },
  {
    // Mutarea care se iveşte ACUM pe tablă se scrie la prezent şi fără „tocmai".
    // „Negrul tocmai a mutat regele de pe a8 pe b7" pune între elev şi tablă o
    // mutare terminată şi dusă, când de fapt el se uită la ea cum se face; iar
    // „tocmai" e un cuvânt în plus care spune ce se vede oricum. Rămâne „negrul
    // mută regele de pe a8 pe b7". Utilizatorul, pe 2026-08-27: „elimină
    // cuvântul «tocmai» din construcţii… pentru ce se iveşte acum pe tablă,
    // scrie verbul la prezent, fără «tocmai»".
    //
    // Regula se agaţă de „tocmai" urmat de un verb de mutare, la orice timp —
    // nu de perfectul compus în sine: „albul a împins trei pioni" povesteşte
    // cum s-a ajuns la poziţie, iar acolo trecutul e chiar forma potrivită.
    // Din cele 41 de perechi găsite când regula prindea orice perfect compus,
    // 38 erau istorie scrisă corect. Nici „tocmai" singur nu e interzis:
    // „tocmai de aceea" sau „tocmai fiindcă" n-au nicio treabă cu mutările.
    //
    // Capătul de cuvânt e scris cu o privire înainte, nu cu `\b`: în JavaScript
    // `\b` se uită doar la litere ASCII, iar „ă" nu e una — deci „mută\b" nu se
    // potriveşte niciodată, şi exact aşa a scăpat neprins „albul tocmai mută
    // nebunul pe d3" la prima trecere. Verbele româneşti se termină prea des în
    // ă, ş, ţ ca să meargă altfel.
    ce: /\btocmai\s+(([şșs]i-)?(a|au)\s+)?(mută|mutăm|împinge|impinge|joacă|capturează|ia|iau|promovează|avansează|retrage|sare|mutat|împins|impins|jucat|capturat|luat|promovat|avansat|retras|sărit|sarit)(?![A-Za-zĂÂÎŞŢȘȚăâîşţșț])/gi,
    gresit: '„tocmai" lipit de o mutare: tocmai mută / tocmai a mutat / tocmai împinge…',
    corect: 'doar verbul, la prezent: mută / împinge / ia',
  },
]
