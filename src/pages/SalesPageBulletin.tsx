import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LEAGUES } from '@/types'
import heroImg from '@/assets/marketing/hero.jpg'
import problemImg from '@/assets/marketing/problem.jpg'
import parentsImg from '@/assets/marketing/parents.jpg'

// ————————————————————————————————————————————————————————————————
// CleanChess — Pagina de vânzare, VERSIUNEA B: "Buletin de antrenament".
// Unghi editorial / brutalist: colțuri drepte, borduri hairline, grilă
// tipografică vizibilă, kickere monospace, tabel de prețuri, final invertit.
// Deliberat diferit de estetica soft/rotunjită. Rămâne pe brand (dark + auriu).
// ————————————————————————————————————————————————————————————————

const MONO = 'font-[ui-monospace,SFMono-Regular,Menlo,Consolas,monospace]'
const GOLD = '#E2B340'
const TEAL = '#2DD4BF'

function Kicker({ n, label, color = GOLD }: { n: string; label: string; color?: string }) {
  return (
    <div className={`${MONO} mb-7 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em]`}>
      <span style={{ color }}>{n}</span>
      <span className="text-[#3A3A3A]">—</span>
      <span className="text-[#8A8A8A]">{label}</span>
    </div>
  )
}

function Plate({
  src, alt, caption, className = '', ratio = 'aspect-[4/3]',
}: { src: string; alt: string; caption: string; className?: string; ratio?: string }) {
  return (
    <figure className={className}>
      <div className={`relative overflow-hidden border border-[#2A2A2A] ${ratio}`}>
        <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover grayscale contrast-125" />
        <div className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ backgroundColor: GOLD, opacity: 0.28 }} />
        <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(10,10,10,0.55), rgba(10,10,10,0) 55%)' }} />
      </div>
      <figcaption className={`${MONO} mt-2.5 text-[10px] uppercase tracking-[0.18em] text-[#6B6B6B]`}>{caption}</figcaption>
    </figure>
  )
}

// Buton pătrat, plat (fără rotunjire, fără glow)
function SquareCTA({ to, children, invert = false }: { to: string; children: ReactNode; invert?: boolean }) {
  return (
    <Link
      to={to}
      className={`${MONO} group inline-flex items-center gap-3 border px-7 py-4 text-sm font-semibold uppercase tracking-[0.14em] transition-colors ${
        invert
          ? 'border-black bg-black text-[#E2B340] hover:bg-[#141414]'
          : 'border-[#E2B340] bg-[#E2B340] text-black hover:bg-transparent hover:text-[#E2B340]'
      }`}
    >
      {children}
      <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
    </Link>
  )
}

const STEPS = [
  {
    n: '01',
    title: 'Afli exact unde ești',
    desc: 'Faci testul de plasament pe tablă reală. În câteva minute, CleanChess îți dă un ELO estimat, îți citește stilul de joc (ofensiv, defensiv, pragmatic sau echilibrat) și te așază în prima ligă. De aici știi negru pe alb de unde pornești.',
  },
  {
    n: '02',
    title: 'Te antrenezi cu Maestrul Pursânge lângă tine',
    desc: 'Parcurgi openings-urile direct pe tablă, rezolvi tactici și puzzle-uri potrivite nivelului tău. Ori de câte ori te blochezi, îl întrebi pe Maestrul Pursânge și îți explică poziția pe loc, în română. Nimic memorat pe de rost, totul înțeles.',
  },
  {
    n: '03',
    title: 'Urci prin ligi și rămâi consecvent',
    desc: 'Fiecare lecție, puzzle și opening îți aduce XP și te ridică prin ligi, de la Inițiat spre Legendar. Săptămânal primești înapoi poziții din ce ai învățat, ca să nu uiți. Cât de sus ajungi depinde doar de cât de des revii pe tablă.',
  },
]

const BENEFITS = [
  { k: 'a', title: 'Înțelegi pozițiile, nu le toci', desc: 'Fiindcă fiecare greșeală vine cu o explicație pe loc, începi să recunoști tiparele. În partide reale nu mai rămâi blocat când adversarul iese din teorie, pentru că ai învățat idei, nu doar mutări.' },
  { k: 'b', title: 'Vezi cu ochii tăi că te faci mai bun', desc: 'ELO-ul estimat, statisticile pe tactici și liga în care ești îți arată progresul clar, săptămână de săptămână. Când vezi că urci, revii cu drag pe tablă.' },
  { k: 'c', title: 'Îți rămâne în cap', desc: 'Reminderul săptămânal îți readuce poziții din openings-urile parcurse. Le rezolvi, iei puncte în plus și îți antrenezi memoria fără să simți că repeți. Ce ai învățat luna trecută încă e acolo.' },
  { k: 'd', title: 'Antrenament pe măsura ta', desc: 'CleanChess îți citește nivelul și stilul, apoi îți dă exact cursurile și puzzle-urile potrivite. Nu pierzi timp cu ce e prea ușor sau prea greu pentru tine.' },
]

const PARENTS = [
  { title: 'Tu aprobi contul', desc: 'Când copilul se înscrie, tu primești un email și confirmi. Fără acordul tău, contul nu se activează. Nimic nu pornește pe la spatele tău.' },
  { title: 'Timp cu măsură, nu la nesfârșit', desc: 'Sesiunile sunt de câte 60 de minute, urmate de pauze care cresc progresiv. Copilul nu poate sta lipit de ecran ore în șir, nici dacă vrea. Iar timpul se numără pe cont, nu pe dispozitiv, deci nu poate ocoli regula trecând pe alt telefon.' },
  { title: 'Vezi ce face, în fiecare săptămână', desc: 'Primești un raport săptămânal pe email: cât a lucrat, ce a învățat, câte puzzle-uri a rezolvat, în ce ligă e. Progresul lui, negru pe alb, fără să fii nevoit să te loghezi.' },
  { title: 'Plata rămâne la tine', desc: 'Un cont de copil nu poate accesa pagina de plată. Dacă vrea Pro, primești tu un link și decizi tu. Fără cumpărături-surpriză.' },
]

const PLANS = [
  { key: 'free', name: 'Free', price: '€0', period: '', href: '/register', cta: 'Intru gratis', highlight: false },
  { key: 'monthly', name: 'Pro Lunar', price: '€9.99', period: '/lună', href: '/register?plan=monthly', cta: 'Vreau Pro', highlight: true },
  { key: 'annual', name: 'Pro Anual', price: '€98', period: '/an', href: '/register?plan=annual', cta: 'Cel mai bun preț', highlight: false },
]

// Matrice de capabilități (rânduri = feature, valori pe plan)
const MATRIX: { label: string; free: string; monthly: string; annual: string }[] = [
  { label: 'Test de plasament + profilul stilului', free: '●', monthly: '●', annual: '●' },
  { label: 'Cursuri de openings', free: '3', monthly: '20+', annual: '20+' },
  { label: 'Puzzle-uri', free: '10 / zi', monthly: 'nelimitate', annual: 'nelimitate' },
  { label: 'Filtre pe temă și nivel', free: '—', monthly: '●', annual: '●' },
  { label: 'Sistemul de ligi și streak', free: '●', monthly: '●', annual: '●' },
  { label: 'Maestrul Pursânge (antrenor AI)', free: 'curs gratuit', monthly: 'peste tot', annual: 'peste tot' },
  { label: 'Statistici avansate + puncte slabe', free: '—', monthly: '●', annual: '●' },
  { label: 'Reminderul săptămânal de memorie', free: '—', monthly: '●', annual: '●' },
  { label: 'Recomandări personalizate', free: '—', monthly: '●', annual: '●' },
  { label: 'Suport prioritar', free: '—', monthly: '—', annual: '●' },
  { label: 'Garanția de 30 de zile', free: '—', monthly: '●', annual: '●' },
]

const FAQ = [
  { q: 'De ce aș plăti, dacă chess.com și lichess sunt gratuite?', a: 'Pentru că acolo ești pe cont propriu, în engleză, cu milioane de puzzle-uri și niciun fir clar. CleanChess îți dă un drum: știi de unde pornești, ce urmezi și de ce, cu explicații în română pe fiecare poziție. Plătești pentru claritate și pentru un antrenor care îți răspunde, nu pentru volum.' },
  { q: 'Pot juca partide live cu alți jucători?', a: 'Deocamdată nu direct în platformă. CleanChess e făcut pentru antrenament: openings, tactici, puzzle-uri și explicații. Pentru partide live rămâi pe chess.com sau lichess. Aici vii ca să te faci mai bun, apoi câștigi acolo.' },
  { q: 'E pentru nivelul meu?', a: 'Dacă ești între început și nivel intermediar-avansat și vrei să crești, da, exact pentru tine e construit. Dacă ești deja la nivel de Maestru FIDE sau peste, CleanChess o să ți se pară prea ușor. Ne concentrăm pe viitoarele staruri, nu pe jucătorii care sunt deja sus.' },
  { q: 'Chiar e totul în română?', a: 'Da. Cursuri, explicații, antrenorul Maestrul Pursânge, tot. Fără momente în care un termen în engleză te lasă blocat.' },
  { q: 'Pot renunța oricând?', a: 'Da. Anulezi când vrei, fără penalizări. Iar în primele 30 de zile ai garanția: dacă nu te-a ajutat, îți dăm banii înapoi.' },
  { q: 'Antrenorul AI chiar ajută sau e doar un gadget?', a: 'Îl întrebi despre poziția exactă din fața ta și îți răspunde despre ea, nu cu o teorie generală. Îl folosești când te blochezi, cum ai întreba un antrenor care stă lângă tine. Încearcă-l gratis în primele cursuri și vezi singur.' },
]

export function SalesPageBulletin() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0]">
      {/* ——— Bandă de cap (masthead) ——— */}
      <div className={`${MONO} border-b border-[#2A2A2A] px-6 py-2 text-[10px] uppercase tracking-[0.25em] text-[#6B6B6B]`}>
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span>CleanChess — Buletin de antrenament</span>
          <span className="hidden sm:inline">Ediția 2026 · În română</span>
        </div>
      </div>

      {/* ——— Nav ——— */}
      <nav className="border-b border-[#2A2A2A] px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center border border-[#E2B340] bg-[#E2B340]">
              <span className="font-black text-black">♟</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-[#F0F0F0]">CleanChess</span>
          </Link>
          <div className={`${MONO} flex items-center gap-6 text-xs uppercase tracking-[0.14em]`}>
            <Link to="/login" className="hidden text-[#8A8A8A] transition-colors hover:text-[#F0F0F0] sm:inline">Conectare</Link>
            <Link to="/register" className="border border-[#3A3A3A] px-4 py-2 text-[#F0F0F0] transition-colors hover:border-[#E2B340] hover:text-[#E2B340]">
              Începe gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Coloana-pagină cu borduri laterale */}
      <main className="mx-auto max-w-5xl border-x border-[#2A2A2A]">

        {/* ——— 01. Hero ——— */}
        <section className="border-b border-[#2A2A2A] px-6 py-16 md:py-20">
          <Kicker n="01" label="Șah, în română" />
          <div className="grid gap-10 md:grid-cols-[1.35fr_0.65fr] md:gap-12">
            <div>
              <h1 className="text-4xl font-bold leading-[1.02] tracking-tight text-[#F0F0F0] md:text-[64px]">
                Șah serios, în română,<br />
                cu un antrenor care îți<br />
                explică <span className="bg-[#E2B340] px-2 text-black">fiecare mutare</span>.
              </h1>
              <div className={`${MONO} mt-8 flex flex-wrap gap-x-4 gap-y-1 text-xs tracking-wider text-[#5A5A5A]`}>
                <span>1. e4 e5</span><span>2. Nf3 Nc6</span><span>3. Bb5 a6</span><span>4. Ba4 Nf6</span><span>5. O-O</span>
              </div>
            </div>
            <div className="flex flex-col justify-between border-t border-[#2A2A2A] pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
              <p className="text-[15px] leading-relaxed text-[#A0A0A0]">
                Rezolvi openings și tactici direct pe tablă, iar Maestrul Pursânge îți spune pe loc de ce o
                mutare ține sau cade. Așa înveți din propriile greșeli cât încă ții minte poziția.
              </p>
              <div className="mt-8">
                <SquareCTA to="/register">Află-ți nivelul gratis</SquareCTA>
                <p className={`${MONO} mt-4 text-[11px] uppercase tracking-[0.18em] text-[#5A5A5A]`}>Fără card · 5 minute</p>
              </div>
            </div>
          </div>
          <p className="mt-12 max-w-3xl border-t border-[#2A2A2A] pt-6 text-[15px] leading-relaxed text-[#8A8A8A]">
            Ai încercat probabil chess.com sau lichess. Sunt uriașe, sunt în engleză și te lasă singur în
            fața tablei. CleanChess e construit altfel: totul în română, fiecare poziție vine cu o explicație,
            iar progresul tău se vede clar, de la testul de plasament până la liga în care ajungi. Primul pas
            e să afli exact unde ești acum.
          </p>
        </section>

        {/* ——— 02. Problema ——— */}
        <section className="border-b border-[#2A2A2A] px-6 py-16 md:py-20">
          <Kicker n="02" label="Problema" />
          <div className="grid gap-10 md:grid-cols-[0.62fr_0.38fr] md:gap-12">
            <div>
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#F0F0F0] md:text-5xl">
                Rezolvi sute de puzzle-uri și tot nu simți că te faci mai bun?
              </h2>
              <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-[#A0A0A0]">
                <p>
                  <span className="float-left mr-3 mt-1 text-6xl font-bold leading-[0.75] text-[#E2B340]">S</span>
                  e întâmplă mai des decât crezi. Faci puzzle după puzzle, pierzi, aplicația îți arată mutarea
                  corectă și treci mai departe. Dar nimeni nu îți spune{' '}
                  <strong className="font-semibold text-[#F0F0F0]">de ce</strong> era corectă. Așa că data
                  viitoare, în aceeași poziție, greșești la fel.
                </p>
                <p>
                  La openings e și mai rău. Memorezi zece mutări dintr-un video, iar la prima abatere a
                  adversarului rămâi blocat, fiindcă ai învățat mutări, nu idei. Și totul se întâmplă în
                  engleză, într-o limbă în care unui copil de 10 ani îi scapă exact nuanța care contează.
                </p>
              </div>
              <div className="mt-8 border-l-2 border-[#E2B340] bg-[#101010] p-5">
                <p className="text-lg font-semibold leading-snug text-[#F0F0F0]">
                  CleanChess pornește de la partea care lipsește:{' '}
                  <span className="text-[#E2B340]">explicația, pe loc, în română, chiar pe poziția din fața ta.</span>
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#8A8A8A]">
                  Îl întrebi pe Maestrul Pursânge „de ce nu merge mutarea asta?" și îți răspunde despre poziția ta
                  concretă, nu despre o teorie generală. Exersezi openings-urile activ pe tablă, cu abaterile lor
                  cu tot, până le înțelegi logica. Și fiindcă o dată pe săptămână primești înapoi 3 poziții din ce
                  ai învățat, îți rămâne în cap, nu îți scapă până luni.
                </p>
              </div>
            </div>
            <Plate
              src={problemImg}
              alt="Rege alb lângă un rege negru căzut"
              caption="Fig. 1 — Poziția în care greșești a doua oară."
              ratio="aspect-[3/4]"
              className="md:pt-2"
            />
          </div>
        </section>

        {/* ——— 03. Cum funcționează (registru) ——— */}
        <section className="border-b border-[#2A2A2A] px-6 py-16 md:py-20">
          <Kicker n="03" label="Cum funcționează" />
          <h2 className="mb-10 text-3xl font-bold tracking-tight text-[#F0F0F0] md:text-5xl">Trei pași până începi să urci</h2>
          <div className="border-t border-[#2A2A2A]">
            {STEPS.map((s) => (
              <div key={s.n} className="grid gap-4 border-b border-[#2A2A2A] py-8 md:grid-cols-[auto_1fr] md:gap-10">
                <div className={`${MONO} text-5xl font-bold text-[#E2B340] md:text-6xl md:w-32`}>{s.n}</div>
                <div className="max-w-2xl">
                  <h3 className="mb-2 text-xl font-semibold text-[#F0F0F0]">{s.title}</h3>
                  <p className="text-[15px] leading-relaxed text-[#A0A0A0]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Ligi — ca un registru orizontal */}
          <div className="mt-10">
            <p className={`${MONO} mb-3 text-[11px] uppercase tracking-[0.2em] text-[#6B6B6B]`}>
              Urci prin ligi · Inițiat → Legendar
            </p>
            <div className="grid grid-cols-2 border-l border-t border-[#2A2A2A] sm:grid-cols-4 lg:grid-cols-7">
              {LEAGUES.map((l) => (
                <div key={l.name} className="border-b border-r border-[#2A2A2A] p-3">
                  <div className="mb-2 h-1 w-6" style={{ backgroundColor: l.color }} />
                  <div className={`${MONO} text-[11px] uppercase tracking-wider`} style={{ color: l.color }}>{l.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <SquareCTA to="/register">Începe cu testul de plasament</SquareCTA>
          </div>
        </section>

        {/* ——— 04. Ce se schimbă (matrice) ——— */}
        <section className="border-b border-[#2A2A2A] px-6 py-16 md:py-20">
          <Kicker n="04" label="Rezultatul" />
          <h2 className="mb-10 text-3xl font-bold tracking-tight text-[#F0F0F0] md:text-5xl">
            Ce se schimbă, de fapt, după câteva săptămâni
          </h2>
          <div className="grid border-l border-t border-[#2A2A2A] sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <div key={b.k} className="border-b border-r border-[#2A2A2A] p-7">
                <div className={`${MONO} mb-4 text-sm text-[#E2B340]`}>{b.k}.</div>
                <h3 className="mb-2 text-lg font-semibold text-[#F0F0F0]">{b.title}</h3>
                <p className="text-sm leading-relaxed text-[#A0A0A0]">{b.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-[#8A8A8A]">
            Iar dincolo de ELO, șahul te învață lucruri care rămân: să ai răbdare, să gândești înainte de a muta
            și să găsești soluții acolo unde alții văd doar o poziție grea.
          </p>
        </section>

        {/* ——— 05. Părinți ——— */}
        <section className="border-b border-[#2A2A2A] px-6 py-16 md:py-20">
          <Kicker n="05" label="Pentru părinți" color={TEAL} />
          <div className="grid gap-10 md:grid-cols-[0.42fr_0.58fr] md:gap-12">
            <div>
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#F0F0F0] md:text-[40px]">
                Ești părinte? Îl poți lăsa aici fără grijă
              </h2>
              <p className="mt-6 text-[15px] leading-relaxed text-[#A0A0A0]">
                CleanChess e gândit din start pentru copii, nu adaptat din fugă. Fără reclame dubioase, fără
                necunoscuți care dau mesaje, fără capcane de timp nesfârșit. Doar șah, într-un spațiu în română
                pe care îl controlezi.
              </p>
              <Plate
                src={parentsImg}
                alt="Un părinte și un copil jucând șah"
                caption="Fig. 2 — Un spațiu pe care îl controlezi."
                ratio="aspect-[16/10]"
                className="mt-8"
              />
            </div>
            <div className="border-t border-[#2A2A2A]">
              {PARENTS.map((p, i) => (
                <div key={p.title} className="grid grid-cols-[auto_1fr] gap-5 border-b border-[#2A2A2A] py-6">
                  <div className={`${MONO} text-sm`} style={{ color: TEAL }}>{String(i + 1).padStart(2, '0')}</div>
                  <div>
                    <h3 className="mb-1.5 font-semibold text-[#F0F0F0]">{p.title}</h3>
                    <p className="text-sm leading-relaxed text-[#A0A0A0]">{p.desc}</p>
                  </div>
                </div>
              ))}
              <p className="pt-6 text-sm leading-relaxed text-[#8A8A8A]">
                Lasă-l să înceapă cu testul de plasament gratuit. Vezi împreună unde e acum, apoi decideți dacă
                merge mai departe.
              </p>
            </div>
          </div>
        </section>

        {/* ——— 06. Prețuri (tabel) ——— */}
        <section className="border-b border-[#2A2A2A] px-6 py-16 md:py-20">
          <Kicker n="06" label="Prețuri" />
          <h2 className="text-3xl font-bold tracking-tight text-[#F0F0F0] md:text-5xl">
            Începe gratis. Treci la Pro când vrei mai mult.
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] text-[#8A8A8A]">
            Testul de plasament și primele cursuri sunt gratuite, fără card. Plătești doar dacă vrei tot ce are
            CleanChess de oferit.
          </p>

          <div className="mt-10 overflow-x-auto">
            <table className={`${MONO} w-full min-w-[640px] border-collapse text-sm`}>
              <thead>
                <tr>
                  <th className="w-2/5 border border-[#2A2A2A] bg-[#0C0C0C] p-4 text-left align-bottom">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-[#6B6B6B]">Plan</span>
                  </th>
                  {PLANS.map((p) => (
                    <th
                      key={p.key}
                      className="border border-[#2A2A2A] p-4 text-left align-bottom"
                      style={p.highlight ? { borderTop: `3px solid ${GOLD}`, background: 'rgba(226,179,64,0.05)' } : undefined}
                    >
                      {p.highlight && <div className="mb-2 inline-block bg-[#E2B340] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">Ales</div>}
                      <div className="text-[11px] uppercase tracking-[0.16em] text-[#A0A0A0]">{p.name}</div>
                      <div className="mt-1 font-sans text-2xl font-bold text-[#F0F0F0]">
                        {p.price}<span className="text-sm font-normal text-[#6B6B6B]">{p.period}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATRIX.map((row) => (
                  <tr key={row.label}>
                    <td className="border border-[#2A2A2A] p-3 font-sans text-[13px] text-[#A0A0A0]">{row.label}</td>
                    {(['free', 'monthly', 'annual'] as const).map((k) => {
                      const v = row[k]
                      const dot = v === '●'
                      const dash = v === '—'
                      return (
                        <td
                          key={k}
                          className="border border-[#2A2A2A] p-3"
                          style={k === 'monthly' ? { background: 'rgba(226,179,64,0.05)' } : undefined}
                        >
                          {dot ? <span style={{ color: GOLD }}>●</span>
                            : dash ? <span className="text-[#3A3A3A]">—</span>
                              : <span className="font-sans text-[13px] text-[#F0F0F0]">{v}</span>}
                        </td>
                      )
                    })}
                  </tr>
                ))}
                <tr>
                  <td className="border border-[#2A2A2A] p-3" />
                  {PLANS.map((p) => (
                    <td key={p.key} className="border border-[#2A2A2A] p-3" style={p.highlight ? { background: 'rgba(226,179,64,0.05)' } : undefined}>
                      <Link
                        to={p.href}
                        className={`inline-flex w-full items-center justify-center border px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                          p.highlight
                            ? 'border-[#E2B340] bg-[#E2B340] text-black hover:bg-transparent hover:text-[#E2B340]'
                            : 'border-[#3A3A3A] text-[#F0F0F0] hover:border-[#E2B340] hover:text-[#E2B340]'
                        }`}
                      >
                        {p.cta}
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className={`${MONO} mt-6 text-[11px] uppercase tracking-[0.14em] text-[#5A5A5A]`}>
            Preț de fază de început · rămâne așa pentru primii membri
          </p>
        </section>

        {/* ——— 07. Garanția (ștampilă) ——— */}
        <section className="border-b border-[#2A2A2A] px-6 py-16 md:py-20">
          <Kicker n="07" label="Garanția" />
          <div className="grid gap-8 md:grid-cols-[auto_1fr] md:gap-12">
            <div className="flex items-center justify-center border-2 border-[#E2B340] p-8 md:w-64">
              <div className="text-center">
                <div className="text-6xl font-bold leading-none text-[#E2B340]">30</div>
                <div className={`${MONO} mt-2 text-[11px] uppercase tracking-[0.2em] text-[#A0A0A0]`}>zile · risc zero</div>
              </div>
            </div>
            <div className="max-w-2xl space-y-4 text-[15px] leading-relaxed text-[#A0A0A0]">
              <h2 className="text-3xl font-bold tracking-tight text-[#F0F0F0]">Riscul e la noi, nu la tine</h2>
              <p>Încearcă CleanChess Pro 30 de zile. Dacă în tot acest timp simți că nu te-a ajutat cu nimic, ne scrii și îți dăm banii înapoi. Fără formulare complicate, fără să te punem să explici de zece ori.</p>
              <p>Noi credem că, dacă intri și îți faci partea, o să vezi diferența în felul în care gândești pozițiile. Dar dacă nu se întâmplă, nu vrem banii tăi. Simplu.</p>
              <p className="text-[#8A8A8A]">Iar până să ajungi acolo, ai oricum partea gratuită: testul de plasament și primele cursuri nu te costă nimic și nu cer card.</p>
            </div>
          </div>
        </section>

        {/* ——— 08. FAQ ——— */}
        <section className="px-6 py-16 md:py-20">
          <Kicker n="08" label="Întrebări frecvente" />
          <h2 className="mb-10 text-3xl font-bold tracking-tight text-[#F0F0F0] md:text-5xl">Întrebări pe care probabil ți le pui</h2>
          <div className="border-t border-[#2A2A2A]">
            {FAQ.map((item, i) => {
              const open = openFaq === i
              return (
                <div key={item.q} className="border-b border-[#2A2A2A]">
                  <button onClick={() => setOpenFaq(open ? null : i)} className="flex w-full items-center justify-between gap-4 py-5 text-left" aria-expanded={open}>
                    <span className="flex items-center gap-4">
                      <span className={`${MONO} text-xs text-[#5A5A5A]`}>{String(i + 1).padStart(2, '0')}</span>
                      <span className="font-semibold text-[#F0F0F0]">{item.q}</span>
                    </span>
                    <span className={`${MONO} text-xl leading-none text-[#E2B340]`}>{open ? '−' : '+'}</span>
                  </button>
                  <div className="grid transition-all duration-300 ease-out" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
                    <div className="overflow-hidden">
                      <p className="pb-6 pl-9 text-sm leading-relaxed text-[#A0A0A0]">{item.a}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      {/* ——— 09. Final invertit (bloc auriu) ——— */}
      <section className="bg-[#E2B340] px-6 py-20 text-black">
        <div className="mx-auto max-w-5xl">
          <div className={`${MONO} mb-8 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-black/60`}>
            <span>09</span><span>—</span><span>Prima mutare</span>
          </div>
          <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-end">
            <h2 className="text-4xl font-bold leading-[1.02] tracking-tight md:text-6xl">
              Prima ta mutare pe CleanChess e gratis.
            </h2>
            <div>
              <p className="text-[15px] leading-relaxed text-black/75">
                Fă testul de plasament, află-ți nivelul și stilul, încearcă primele cursuri cu Maestrul Pursânge
                lângă tine. Totul gratuit, fără card. Dacă îți place, mergi mai departe. Dacă nu, ai pierdut cinci
                minute și ai aflat cât de bun ești.
              </p>
              <div className="mt-8">
                <SquareCTA to="/register" invert>Află-ți nivelul gratis</SquareCTA>
                <p className={`${MONO} mt-4 text-[11px] uppercase tracking-[0.18em] text-black/55`}>
                  Fără card · fără abonament ascuns · doar tu și tabla
                </p>
              </div>
            </div>
          </div>
          <img src={heroImg} alt="" aria-hidden className="mt-14 hidden h-40 w-full border border-black/20 object-cover object-center grayscale md:block" style={{ filter: 'grayscale(1) contrast(1.1)' }} />
        </div>
      </section>

      {/* ——— Footer ——— */}
      <footer className={`${MONO} border-t border-[#2A2A2A] px-6 py-8 text-[11px] uppercase tracking-[0.16em] text-[#5A5A5A]`}>
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span>© 2026 CleanChess</span>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-[#A0A0A0]">Termeni</Link>
            <Link to="/privacy" className="hover:text-[#A0A0A0]">Confidențialitate</Link>
            <Link to="/pricing" className="hover:text-[#A0A0A0]">Prețuri</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
