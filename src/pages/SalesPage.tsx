import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckCircle2, ChevronDown, ChevronRight, ShieldCheck, Clock, Mail,
  CreditCard, Lightbulb, TrendingUp, RotateCcw, Target, ShieldHalf,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MascotEnPassant } from '@/components/ui/MascotEnPassant'
import { LEAGUES } from '@/types'
import { CinematicImage } from '@/components/marketing/CinematicImage'
import heroImg from '@/assets/marketing/hero.jpg'
import problemImg from '@/assets/marketing/problem.jpg'
import parentsImg from '@/assets/marketing/parents.jpg'

// Animație subtilă de reveal-on-scroll (în spiritul `pop-in` din index.css)
const reveal = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-70px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
}

const STEPS = [
  {
    n: '1',
    title: 'Afli exact unde ești',
    desc: 'Faci testul de plasament pe tablă reală. În câteva minute, CleanChess îți dă un ELO estimat, îți citește stilul de joc (ofensiv, defensiv, pragmatic sau echilibrat) și te așază în prima ligă. De aici știi negru pe alb de unde pornești.',
  },
  {
    n: '2',
    title: 'Te antrenezi cu Maestrul Pursânge lângă tine',
    desc: 'Parcurgi openings-urile direct pe tablă, rezolvi tactici și puzzle-uri potrivite nivelului tău. Ori de câte ori te blochezi, îl întrebi pe Maestrul Pursânge și îți explică poziția pe loc, în română. Nimic memorat pe de rost, totul înțeles.',
  },
  {
    n: '3',
    title: 'Urci prin ligi și rămâi consecvent',
    desc: 'Fiecare lecție, puzzle și opening îți aduce XP și te ridică prin ligi, de la Inițiat spre Legendar. Săptămânal primești înapoi poziții din ce ai învățat, ca să nu uiți. Cât de sus ajungi depinde doar de cât de des revii pe tablă.',
  },
]

const BENEFITS = [
  {
    icon: Lightbulb,
    title: 'Înțelegi pozițiile, nu le toci',
    desc: 'Fiindcă fiecare greșeală vine cu o explicație pe loc, începi să recunoști tiparele. În partide reale nu mai rămâi blocat când adversarul iese din teorie, pentru că ai învățat idei, nu doar mutări.',
  },
  {
    icon: TrendingUp,
    title: 'Vezi cu ochii tăi că te faci mai bun',
    desc: 'ELO-ul estimat, statisticile pe tactici și liga în care ești îți arată progresul clar, săptămână de săptămână. Când vezi că urci, revii cu drag pe tablă.',
  },
  {
    icon: RotateCcw,
    title: 'Îți rămâne în cap',
    desc: 'Reminderul săptămânal îți readuce poziții din openings-urile parcurse. Le rezolvi, iei puncte în plus și îți antrenezi memoria fără să simți că repeți. Ce ai învățat luna trecută încă e acolo.',
  },
  {
    icon: Target,
    title: 'Antrenament pe măsura ta',
    desc: 'CleanChess îți citește nivelul și stilul, apoi îți dă exact cursurile și puzzle-urile potrivite. Nu pierzi timp cu ce e prea ușor sau prea greu pentru tine.',
  },
]

const PARENTS = [
  {
    icon: ShieldCheck,
    title: 'Tu aprobi contul',
    desc: 'Când copilul se înscrie, tu primești un email și confirmi. Fără acordul tău, contul nu se activează. Nimic nu pornește pe la spatele tău.',
  },
  {
    icon: Clock,
    title: 'Timp cu măsură, nu la nesfârșit',
    desc: 'Sesiunile sunt de câte 60 de minute, urmate de pauze care cresc progresiv. Copilul nu poate sta lipit de ecran ore în șir, nici dacă vrea. Iar timpul se numără pe cont, nu pe dispozitiv, deci nu poate ocoli regula trecând pe alt telefon.',
  },
  {
    icon: Mail,
    title: 'Vezi ce face, în fiecare săptămână',
    desc: 'Primești un raport săptămânal pe email: cât a lucrat, ce a învățat, câte puzzle-uri a rezolvat, în ce ligă e. Progresul lui, negru pe alb, fără să fii nevoit să te loghezi.',
  },
  {
    icon: CreditCard,
    title: 'Plata rămâne la tine',
    desc: 'Un cont de copil nu poate accesa pagina de plată. Dacă vrea Pro, primești tu un link și decizi tu. Fără cumpărături-surpriză.',
  },
]

const PRICING = [
  {
    name: 'Free',
    price: '€0',
    period: '',
    tagline: 'Ca să vezi cum funcționează',
    features: [
      'Test de plasament + profilul stilului tău',
      '3 cursuri complete de openings',
      '10 puzzle-uri pe zi',
      'Sistemul de ligi și streak-ul',
      'Maestrul Pursânge pe pozițiile din cursurile gratuite',
    ],
    cta: 'Intru acum, gratis',
    href: '/register',
    highlight: false,
  },
  {
    name: 'Pro Lunar',
    price: '€9.99',
    period: '/lună',
    tagline: 'Tot CleanChess, fără limite',
    features: [
      'Toate cele 20+ de cursuri de openings',
      'Puzzle-uri nelimitate, cu filtre pe temă și nivel',
      'Statistici avansate și puncte slabe identificate',
      'Reminderul săptămânal de memorie',
      'Recomandări personalizate pe nivelul și stilul tău',
    ],
    cta: 'Vreau Pro',
    href: '/register?plan=monthly',
    highlight: true,
  },
  {
    name: 'Pro Anual',
    price: '€98',
    period: '/an',
    tagline: 'Cel mai bun preț, economisești cam 2 luni',
    features: [
      'Tot ce e în Pro Lunar',
      'Aproape 2 luni gratuite față de plata lunară',
      'Suport prioritar',
      'Garanția de 30 de zile',
    ],
    cta: 'Cel mai bun preț',
    href: '/register?plan=annual',
    highlight: false,
  },
]

const FAQ = [
  {
    q: 'De ce aș plăti, dacă chess.com și lichess sunt gratuite?',
    a: 'Pentru că acolo ești pe cont propriu, în engleză, cu milioane de puzzle-uri și niciun fir clar. CleanChess îți dă un drum: știi de unde pornești, ce urmezi și de ce, cu explicații în română pe fiecare poziție. Plătești pentru claritate și pentru un antrenor care îți răspunde, nu pentru volum.',
  },
  {
    q: 'Pot juca partide live cu alți jucători?',
    a: 'Deocamdată nu direct în platformă. CleanChess e făcut pentru antrenament: openings, tactici, puzzle-uri și explicații. Pentru partide live rămâi pe chess.com sau lichess. Aici vii ca să te faci mai bun, apoi câștigi acolo.',
  },
  {
    q: 'E pentru nivelul meu?',
    a: 'Dacă ești între început și nivel intermediar-avansat și vrei să crești, da, exact pentru tine e construit. Dacă ești deja la nivel de Maestru FIDE sau peste, CleanChess o să ți se pară prea ușor. Ne concentrăm pe viitoarele staruri, nu pe jucătorii care sunt deja sus.',
  },
  {
    q: 'Chiar e totul în română?',
    a: 'Da. Cursuri, explicații, antrenorul Maestrul Pursânge, tot. Fără momente în care un termen în engleză te lasă blocat.',
  },
  {
    q: 'Pot renunța oricând?',
    a: 'Da. Anulezi când vrei, fără penalizări. Iar în primele 30 de zile ai garanția: dacă nu te-a ajutat, îți dăm banii înapoi.',
  },
  {
    q: 'Antrenorul AI chiar ajută sau e doar un gadget?',
    a: 'Îl întrebi despre poziția exactă din fața ta și îți răspunde despre ea, nu cu o teorie generală. Îl folosești când te blochezi, cum ai întreba un antrenor care stă lângă tine. Încearcă-l gratis în primele cursuri și vezi singur.',
  },
]

export function SalesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0]">
      {/* ——— Nav ——— */}
      <nav className="sticky top-0 z-30 border-b border-[#141414] bg-[rgba(10,10,10,0.72)] px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E2B340]">
              <span className="font-black text-black">♟</span>
            </div>
            <span className="text-lg font-bold text-[#F0F0F0]">CleanChess</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-[#A0A0A0] transition-colors hover:text-[#F0F0F0]">
              Conectare
            </Link>
            <Link to="/register">
              <Button size="sm">Începe gratis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ——— 1. Hero ——— */}
      <section className="relative isolate overflow-hidden">
        <CinematicImage
          src={heroImg}
          alt="Rege și pion de șah auriu, luminați dramatic pe un fundal întunecat"
          overlay="hero"
          priority
          objectPosition="60% center"
          className="absolute inset-0 -z-10 h-full w-full"
        />
        <div className="mx-auto flex min-h-[88vh] max-w-6xl items-center px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <Link
              to="/register"
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(226,179,64,0.3)] bg-[rgba(226,179,64,0.08)] px-4 py-1.5 text-sm text-[#E2B340] backdrop-blur-sm transition-colors hover:bg-[rgba(226,179,64,0.14)]"
            >
              <span>Test de plasament gratuit</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
            <h1 className="mb-6 text-4xl font-bold leading-[1.08] text-[#F0F0F0] md:text-6xl">
              Șah serios, în română, cu un antrenor care îți explică{' '}
              <span className="text-[#E2B340]">fiecare mutare.</span>
            </h1>
            <p className="mb-5 max-w-xl text-lg text-[#C7C7C7]">
              Rezolvi openings și tactici direct pe tablă, iar Maestrul Pursânge îți spune pe loc de ce o
              mutare ține sau cade. Așa înveți din propriile greșeli cât încă ții minte poziția.
            </p>
            <p className="mb-9 max-w-xl text-[15px] leading-relaxed text-[#A0A0A0]">
              Ai încercat probabil chess.com sau lichess. Sunt uriașe, sunt în engleză și te lasă singur
              în fața tablei. CleanChess e construit altfel: totul în română, fiecare poziție vine cu o
              explicație, iar progresul tău se vede clar, de la testul de plasament până la liga în care
              ajungi. Primul pas e să afli exact unde ești acum.
            </p>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link to="/register">
                <Button size="xl">Află-ți nivelul gratis, în 5 minute</Button>
              </Link>
              <span className="text-sm text-[#6B6B6B]">Fără card · 5 minute</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ——— 2. Problema reală ——— */}
      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div {...reveal}>
            <h2 className="mb-6 text-3xl font-bold text-[#F0F0F0] md:text-4xl">
              Rezolvi sute de puzzle-uri și tot nu simți că te faci mai bun?
            </h2>
            <div className="space-y-5 text-[15px] leading-relaxed text-[#A0A0A0]">
              <p>
                Se întâmplă mai des decât crezi. Faci puzzle după puzzle, pierzi, aplicația îți arată
                mutarea corectă și treci mai departe. Dar nimeni nu îți spune{' '}
                <strong className="font-semibold text-[#F0F0F0]">de ce</strong> era corectă. Așa că data
                viitoare, în aceeași poziție, greșești la fel.
              </p>
              <p>
                La openings e și mai rău. Memorezi zece mutări dintr-un video, iar la prima abatere a
                adversarului rămâi blocat, fiindcă ai învățat mutări, nu idei. Și totul se întâmplă în
                engleză, într-o limbă în care unui copil de 10 ani îi scapă exact nuanța care contează.
              </p>
              <p className="border-l-2 border-[#E2B340] pl-4 text-[#F0F0F0]">
                CleanChess pornește de la partea care lipsește:{' '}
                <strong className="font-semibold text-[#E2B340]">
                  explicația, pe loc, în română, chiar pe poziția din fața ta.
                </strong>
              </p>
              <p className="flex items-start gap-3">
                <MascotEnPassant mood="thinking" size={40} animated className="mt-0.5 flex-shrink-0" />
                <span>
                  Îl întrebi pe Maestrul Pursânge „de ce nu merge mutarea asta?" și îți răspunde despre
                  poziția ta concretă, nu despre o teorie generală. Exersezi openings-urile activ pe
                  tablă, cu abaterile lor cu tot, până le înțelegi logica. Și fiindcă o dată pe săptămână
                  primești înapoi 3 poziții din ce ai învățat, îți rămâne în cap, nu îți scapă până luni.
                </span>
              </p>
            </div>
          </motion.div>

          <motion.div {...reveal}>
            <CinematicImage
              src={problemImg}
              alt="Rege alb în picioare lângă un rege negru căzut — momentul deciziei"
              overlay="frame"
              className="aspect-[4/5] w-full rounded-2xl border border-[#2A2A2A] shadow-[var(--shadow-card)]"
            />
          </motion.div>
        </div>
      </section>

      {/* ——— 3. Cum funcționează, în 3 pași ——— */}
      <section className="border-y border-[#141414] bg-[#0C0C0C] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div {...reveal} className="mb-14 text-center">
            <p className="mb-2 text-xs uppercase tracking-widest text-[#6B6B6B]">Cum funcționează</p>
            <h2 className="text-3xl font-bold text-[#F0F0F0] md:text-4xl">Trei pași până începi să urci</h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <motion.div
                key={step.n}
                {...reveal}
                className="relative rounded-2xl border border-[#2A2A2A] bg-[#141414] p-7"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(226,179,64,0.12)] text-xl font-bold text-[#E2B340]">
                  {step.n}
                </div>
                <h3 className="mb-2 font-semibold text-[#F0F0F0]">{step.title}</h3>
                <p className="text-sm leading-relaxed text-[#A0A0A0]">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Banda de ligi — Inițiat → Legendar (etichete reale din cod) */}
          <motion.div {...reveal} className="mt-12">
            <p className="mb-4 text-center text-xs uppercase tracking-widest text-[#6B6B6B]">
              Urci prin ligi, de la Inițiat spre Legendar
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {LEAGUES.map((league, i) => (
                <div key={league.name} className="flex items-center gap-2">
                  <span
                    className="rounded-full border px-3 py-1 text-xs font-semibold"
                    style={{ borderColor: `${league.color}55`, backgroundColor: `${league.color}14`, color: league.color }}
                  >
                    {league.label}
                  </span>
                  {i < LEAGUES.length - 1 && <ChevronRight className="h-3 w-3 text-[#3A3A3A]" />}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...reveal} className="mt-12 text-center">
            <Link to="/register">
              <Button size="xl">Începe cu testul de plasament, gratis</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ——— 4. Ce se schimbă după câteva săptămâni ——— */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div {...reveal} className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-[#F0F0F0] md:text-4xl">
              Ce se schimbă, de fapt, după câteva săptămâni
            </h2>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-2">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                {...reveal}
                className="rounded-2xl border border-[#2A2A2A] bg-[#141414] p-7 transition-colors hover:border-[#3A3A3A]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(226,179,64,0.12)]">
                  <Icon className="h-5 w-5 text-[#E2B340]" />
                </div>
                <h3 className="mb-2 font-semibold text-[#F0F0F0]">{title}</h3>
                <p className="text-sm leading-relaxed text-[#A0A0A0]">{desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.p {...reveal} className="mx-auto mt-10 max-w-2xl text-center text-[15px] leading-relaxed text-[#A0A0A0]">
            Iar dincolo de ELO, șahul te învață lucruri care rămân: să ai răbdare, să gândești înainte de
            a muta și să găsești soluții acolo unde alții văd doar o poziție grea.
          </motion.p>
        </div>
      </section>

      {/* ——— 5. Reasigurare pentru părinți ——— */}
      <section className="border-y border-[#141414] bg-[#0C0C0C] px-6 py-24">
        <div className="mx-auto grid max-w-6xl items-start gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <motion.div {...reveal} className="lg:sticky lg:top-28">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(45,212,191,0.3)] bg-[rgba(45,212,191,0.08)] px-4 py-1.5 text-sm text-[#2DD4BF]">
              <ShieldHalf className="h-3.5 w-3.5" />
              <span>Pentru părinți</span>
            </div>
            <h2 className="mb-5 text-3xl font-bold text-[#F0F0F0] md:text-4xl">
              Ești părinte? Îl poți lăsa aici fără grijă
            </h2>
            <p className="mb-7 text-[15px] leading-relaxed text-[#A0A0A0]">
              CleanChess e gândit din start pentru copii, nu adaptat din fugă. Fără reclame dubioase, fără
              necunoscuți care dau mesaje, fără capcane de timp nesfârșit. Doar șah, într-un spațiu în
              română pe care îl controlezi.
            </p>
            <CinematicImage
              src={parentsImg}
              alt="Un părinte și un copil jucând șah lângă o fereastră, într-o zi de iarnă"
              overlay="frame"
              objectPosition="center 35%"
              className="aspect-[16/10] w-full rounded-2xl border border-[#2A2A2A] shadow-[var(--shadow-card)]"
            />
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2">
            {PARENTS.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                {...reveal}
                className="rounded-2xl border border-[#2A2A2A] bg-[#141414] p-6"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(45,212,191,0.12)]">
                  <Icon className="h-5 w-5 text-[#2DD4BF]" />
                </div>
                <h3 className="mb-2 font-semibold text-[#F0F0F0]">{title}</h3>
                <p className="text-sm leading-relaxed text-[#A0A0A0]">{desc}</p>
              </motion.div>
            ))}
            <motion.p {...reveal} className="text-[15px] leading-relaxed text-[#A0A0A0] sm:col-span-2">
              Lasă-l să înceapă cu testul de plasament gratuit. Vezi împreună unde e acum, apoi decideți
              dacă merge mai departe.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ——— 6. Prețuri ——— */}
      <section id="pricing" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div {...reveal} className="mb-4 text-center">
            <h2 className="text-3xl font-bold text-[#F0F0F0] md:text-4xl">
              Începe gratis. Treci la Pro când simți că vrei mai mult.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] text-[#A0A0A0]">
              Testul de plasament și primele cursuri sunt gratuite, fără card. Plătești doar dacă vrei tot
              ce are CleanChess de oferit.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PRICING.map((plan) => (
              <motion.div
                key={plan.name}
                {...reveal}
                className={`flex flex-col rounded-2xl border p-7 ${
                  plan.highlight
                    ? 'border-[rgba(226,179,64,0.45)] bg-[rgba(226,179,64,0.06)] shadow-[var(--shadow-glow-gold)]'
                    : 'border-[#2A2A2A] bg-[#141414]'
                }`}
              >
                {plan.highlight && (
                  <div className="mb-4 inline-flex w-fit rounded-full bg-[#E2B340] px-3 py-0.5 text-xs font-bold text-black">
                    CEL MAI ALES
                  </div>
                )}
                <div className="mb-1 text-sm font-medium text-[#A0A0A0]">{plan.name}</div>
                <div className="mb-1 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[#F0F0F0]">{plan.price}</span>
                  <span className="text-[#6B6B6B]">{plan.period}</span>
                </div>
                <p className="mb-6 text-sm text-[#6B6B6B]">{plan.tagline}</p>
                <ul className="mb-7 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#4ade80]" />
                      <span className="text-[#A0A0A0]">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to={plan.href}>
                  <Button variant={plan.highlight ? 'primary' : 'secondary'} size="md" className="w-full">
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.p {...reveal} className="mx-auto mt-8 max-w-2xl text-center text-sm text-[#6B6B6B]">
            Acesta e prețul de fază de început. Rămâne așa pentru primii membri; pe măsură ce comunitatea
            crește, prețul va crește și el.
          </motion.p>
        </div>
      </section>

      {/* ——— 7. Garanția ——— */}
      <section className="px-6 pb-24">
        <motion.div
          {...reveal}
          className="mx-auto max-w-3xl rounded-3xl border border-[rgba(226,179,64,0.35)] bg-[rgba(226,179,64,0.05)] p-10 text-center shadow-[var(--shadow-glow-gold)]"
        >
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(226,179,64,0.14)]">
            <ShieldCheck className="h-7 w-7 text-[#E2B340]" />
          </div>
          <h2 className="mb-4 text-3xl font-bold text-[#F0F0F0]">Riscul e la noi, nu la tine</h2>
          <div className="mx-auto max-w-xl space-y-4 text-[15px] leading-relaxed text-[#A0A0A0]">
            <p>
              Încearcă CleanChess Pro 30 de zile. Dacă în tot acest timp simți că nu te-a ajutat cu nimic, ne
              scrii și îți dăm banii înapoi. Fără formulare complicate, fără să te punem să explici de zece
              ori.
            </p>
            <p>
              Noi credem că, dacă intri și îți faci partea, o să vezi diferența în felul în care gândești
              pozițiile. Dar dacă nu se întâmplă, nu vrem banii tăi. Simplu.
            </p>
            <p>
              Iar până să ajungi acolo, ai oricum partea gratuită: testul de plasament și primele cursuri nu
              te costă nimic și nu cer card.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ——— 8. Întrebări frecvente ——— */}
      <section className="border-t border-[#141414] bg-[#0C0C0C] px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <motion.h2 {...reveal} className="mb-12 text-center text-3xl font-bold text-[#F0F0F0] md:text-4xl">
            Întrebări pe care probabil ți le pui
          </motion.h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => {
              const open = openFaq === i
              return (
                <motion.div
                  key={item.q}
                  {...reveal}
                  className="overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#141414]"
                >
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    aria-expanded={open}
                  >
                    <span className="font-semibold text-[#F0F0F0]">{item.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 flex-shrink-0 text-[#E2B340] transition-transform duration-300 ${
                        open ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className="grid transition-all duration-300 ease-out"
                    style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-6 text-sm leading-relaxed text-[#A0A0A0]">{item.a}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ——— 9. Recapitulare & CTA final ——— */}
      <section className="relative isolate overflow-hidden">
        <CinematicImage
          src={heroImg}
          alt="Piese de șah aurii pe tabla întunecată"
          overlay="hero"
          objectPosition="40% center"
          className="absolute inset-0 -z-10 h-full w-full"
        />
        <div className="mx-auto max-w-3xl px-6 py-28 text-center">
          <motion.div {...reveal}>
            <h2 className="mb-6 text-4xl font-bold text-[#F0F0F0] md:text-5xl">
              Prima ta mutare pe CleanChess e <span className="text-[#E2B340]">gratis</span>
            </h2>
            <p className="mx-auto mb-5 max-w-2xl text-[15px] leading-relaxed text-[#C7C7C7]">
              Șah serios, în română, cu un antrenor care îți explică fiecare poziție. Înveți activ pe tablă,
              urci prin ligi de la Inițiat spre Legendar și îți rămâne în cap ce ai învățat. Fără să te
              pierzi într-o platformă uriașă în engleză, cu un drum clar de la unde ești acum până unde vrei
              să ajungi.
            </p>
            <p className="mx-auto mb-9 max-w-2xl text-[15px] leading-relaxed text-[#A0A0A0]">
              Nu trebuie să te decizi acum pentru nimic. Fă testul de plasament, află-ți nivelul și stilul,
              încearcă primele cursuri cu Maestrul Pursânge lângă tine. Totul gratuit, fără card. Dacă îți
              place, mergi mai departe. Dacă nu, ai pierdut cinci minute și ai aflat cât de bun ești.
            </p>
            <Link to="/register">
              <Button size="xl">Află-ți nivelul gratis, în 5 minute</Button>
            </Link>
            <p className="mt-6 text-sm text-[#6B6B6B]">Fără card. Fără abonament ascuns. Doar tu și tabla.</p>
          </motion.div>
        </div>
      </section>

      {/* ——— Footer ——— */}
      <footer className="border-t border-[#141414] px-6 py-8 text-center text-sm text-[#6B6B6B]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span>© 2026 CleanChess. Toate drepturile rezervate.</span>
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
