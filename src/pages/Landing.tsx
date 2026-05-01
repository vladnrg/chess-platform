import { Link } from 'react-router-dom'
import { CheckCircle2, ChevronRight, BarChart2, BookOpen, Puzzle, Trophy, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LEAGUES } from '@/types'

const FEATURES = [
  {
    icon: BookOpen,
    title: '20+ cursuri de openings',
    desc: 'London, Sicilian, Caro-Kann și altele — fiecare curs e construit pas cu pas, ca să nu te pierzi niciodată.',
  },
  {
    icon: Puzzle,
    title: 'Puzzle-uri zilnice',
    desc: 'Mii de tactici reale din partide adevărate. Cu cât rezolvi mai multe, cu atât ochiul tău de jucător devine mai ascuțit.',
  },
  {
    icon: BarChart2,
    title: 'Statistici vizuale',
    desc: 'Vezi exact la ce tactici câștigi și unde mai ai de lucru. Progresul tău, în cifre clare.',
  },
  {
    icon: Trophy,
    title: 'Sistem de ligi',
    desc: 'Urcă de la Cherestea până la Diamant câștigând XP. Cu cât ești mai activ, cu atât urci mai repede.',
  },
  {
    icon: Shield,
    title: 'Adaptat stilului tău',
    desc: 'Joci ofensiv? Defensiv? Pragmatic? Îți recomandăm cursurile care se potrivesc exact cum gândești pe tablă.',
  },
]

const PRICING = [
  {
    name: 'Free',
    price: '0',
    period: '',
    description: 'Ideal ca să vezi cum funcționează',
    features: ['3 cursuri complete', '10 puzzle-uri/zi', 'Evaluare nivel', 'Dashboard personal'],
    cta: 'Intru acum — gratis',
    href: '/register',
    highlight: false,
  },
  {
    name: 'Pro Lunar',
    price: '9.99',
    period: '/lună',
    description: 'Tot ce ai nevoie, fără nicio limită',
    features: ['Toate cursurile (20+)', 'Puzzle-uri nelimitate', 'Statistici avansate', 'Recomandări personalizate', 'Refund după 60 zile'],
    cta: 'Vreau Pro',
    href: '/register?plan=monthly',
    highlight: true,
  },
  {
    name: 'Pro Anual',
    price: '79.99',
    period: '/an',
    description: 'Câștigi 2 luni față de planul lunar',
    features: ['Tot din Pro Lunar', 'Economisești ~2 luni', 'Suport prioritar', 'Refund după 60 zile'],
    cta: 'Cel mai bun preț',
    href: '/register?plan=annual',
    highlight: false,
  },
]

const LEAGUE_GROUPS = [
  {
    label: 'Primele trepte',
    leagues: ['cherestea', 'tinichea', 'bronz'],
    emojis: { cherestea: '🪵', tinichea: '🔩', bronz: '🥉' } as Record<string, string>,
  },
  {
    label: 'Zona de mijloc',
    leagues: ['argint', 'aur', 'smarald'],
    emojis: { argint: '🥈', aur: '🥇', smarald: '💚' } as Record<string, string>,
  },
  {
    label: 'Elita',
    leagues: ['diamant'],
    emojis: { diamant: '💎' } as Record<string, string>,
  },
]

export function Landing() {
  const leagueByName = Object.fromEntries(LEAGUES.map(l => [l.name, l]))

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Nav */}
      <nav className="border-b border-[#1e1e1e] px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8a84b]">
              <span className="text-black font-black">♟</span>
            </div>
            <span className="font-bold text-[#f0f0f0] text-lg">ChessUp</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-[#a0a0a0] hover:text-[#f0f0f0] transition-colors">
              Conectare
            </Link>
            <Link to="/register">
              <Button size="sm">Fă prima mutare</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <Link to="/register" className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(200,168,75,0.3)] bg-[rgba(200,168,75,0.08)] px-4 py-1.5 text-sm text-[#c8a84b] hover:bg-[rgba(200,168,75,0.14)] transition-colors">
            <span>Fă prima mutare</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold text-[#f0f0f0] leading-tight mb-6">
            Mulți doar joacă șah.<br />
            Alții fac din șah o artă.<br />
            <span className="text-[#c8a84b]">Arată-ți măiestria în universul celor 64 de pătrate.</span>
          </h1>
          <p className="text-lg text-[#a0a0a0] mb-10 max-w-xl mx-auto">
            De la prima mutare până la finalul care decide totul — avem rețeta clară pentru orice nivel ai acum.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="xl">Pornesc acum — fără card</Button>
            </Link>
            <Link to="/courses">
              <Button size="xl" variant="secondary">Dă-mi un preview</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Ligi */}
      <section className="px-6 py-14 bg-[#0a0a0a]">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm text-[#666] mb-2 uppercase tracking-widest">Sistemul de ligi</p>
          <p className="text-[#a0a0a0] text-sm mb-8">Toată lumea începe din același loc. Cât de sus ajungi depinde doar de tine.</p>

          <div className="flex flex-col sm:flex-row items-start justify-center gap-6">
            {LEAGUE_GROUPS.map((group) => (
              <div key={group.label} className="flex-1 min-w-[160px]">
                <p className="text-xs text-[#555] uppercase tracking-wider mb-3">{group.label}</p>
                <div className="space-y-2">
                  {group.leagues.map((name) => {
                    const league = leagueByName[name]
                    const emoji = (group.emojis as Record<string, string>)[name]
                    return (
                      <div
                        key={name}
                        className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 border"
                        style={{
                          borderColor: `${league.color}40`,
                          backgroundColor: `${league.color}12`,
                        }}
                      >
                        <span className="text-xl">{emoji}</span>
                        <span className="text-sm font-semibold" style={{ color: league.color }}>
                          {league.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-[#f0f0f0] mb-3">Tot ce ai nevoie să urci în clasament</h2>
            <p className="text-[#a0a0a0]">Exact ce contează, pus cap la cap — ca să progresi de fiecare dată când deschizi aplicația.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-5 hover:border-[#3a3a3a] transition-colors">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(200,168,75,0.12)]">
                  <Icon className="h-5 w-5 text-[#c8a84b]" />
                </div>
                <h3 className="font-semibold text-[#f0f0f0] mb-1">{title}</h3>
                <p className="text-sm text-[#a0a0a0]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20 bg-[#0a0a0a]">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-[#f0f0f0] mb-3">Alege ritmul tău</h2>
            <p className="text-[#a0a0a0]">Dacă după 60 de zile nu simți că ai progresat, îți dăm banii înapoi — simplu.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {PRICING.map(plan => (
              <div
                key={plan.name}
                className={`rounded-xl border p-6 flex flex-col ${
                  plan.highlight
                    ? 'bg-[rgba(200,168,75,0.06)] border-[rgba(200,168,75,0.4)]'
                    : 'bg-[#1a1a1a] border-[#2a2a2a]'
                }`}
              >
                {plan.highlight && (
                  <div className="mb-4 inline-flex w-fit rounded-full bg-[#c8a84b] px-3 py-0.5 text-xs font-bold text-black">
                    CEL MAI ALES
                  </div>
                )}
                <div className="mb-1 text-sm font-medium text-[#a0a0a0]">{plan.name}</div>
                <div className="mb-1 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[#f0f0f0]">${plan.price}</span>
                  <span className="text-[#666]">{plan.period}</span>
                </div>
                <p className="mb-6 text-sm text-[#666]">{plan.description}</p>
                <ul className="mb-6 flex-1 space-y-2.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-[#4ade80] mt-0.5 flex-shrink-0" />
                      <span className="text-[#a0a0a0]">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to={plan.href}>
                  <Button
                    variant={plan.highlight ? 'primary' : 'secondary'}
                    className="w-full"
                    size="md"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e1e1e] px-6 py-8 text-center text-sm text-[#666]">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2026 ChessUp. Toate drepturile rezervate.</span>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-[#a0a0a0]">Termeni</Link>
            <Link to="/privacy" className="hover:text-[#a0a0a0]">Confidențialitate</Link>
            <Link to="/pricing" className="hover:text-[#a0a0a0]">Prețuri</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
