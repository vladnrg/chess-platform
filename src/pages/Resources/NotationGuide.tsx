import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

// Ghid de notație algebrică — resursă gratuită, în română. Folosește inițialele
// românești ale pieselor (R/D/T/N/C), consistent cu restul platformei.

function Move({ children }: { children: React.ReactNode }) {
  return <span className="font-mono font-semibold text-[#E2B340]">{children}</span>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold text-[#F0F0F0]">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-[#A0A0A0]">{children}</div>
    </section>
  )
}

const PIECES = [
  { l: 'R', name: 'Rege' },
  { l: 'D', name: 'Damă' },
  { l: 'T', name: 'Tură' },
  { l: 'N', name: 'Nebun' },
  { l: 'C', name: 'Cal' },
]

export function NotationGuide() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <Link to="/tactics" className="inline-flex items-center gap-1.5 text-sm text-[#6B6B6B] hover:text-[#F0F0F0] transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" /> Înapoi la Cufărul de tactici
          </Link>
          <h1 className="text-3xl font-bold">Ghid de notație algebrică</h1>
          <p className="mt-2 text-[#A0A0A0] leading-relaxed">
            Notația algebrică e limbajul universal prin care se scriu și se citesc mutările la șah.
            O înveți în câteva minute și după poți nota orice partidă, citi orice carte de șah și
            urmări analize.
          </p>
        </div>

        <Section title="Tabla: coordonatele">
          <p>
            Fiecare câmp are o adresă: o <strong className="text-[#F0F0F0]">literă</strong> (coloana,
            de la <Move>a</Move> la <Move>h</Move>) și o <strong className="text-[#F0F0F0]">cifră</strong>{' '}
            (rândul, de la <Move>1</Move> la <Move>8</Move>, dinspre Alb spre Negru). Colțul din
            stânga-jos al Albului e <Move>a1</Move>, iar cel din dreapta-sus <Move>h8</Move>.
          </p>
        </Section>

        <Section title="Piesele și literele lor">
          <ul className="space-y-1">
            {PIECES.map(p => (
              <li key={p.l} className="flex items-center gap-2">
                <Move>{p.l}</Move> <span>= {p.name}</span>
              </li>
            ))}
            <li className="flex items-center gap-2">
              <span className="font-mono font-semibold text-[#6B6B6B]">—</span>
              <span>Pionul <strong className="text-[#F0F0F0]">nu are literă</strong>: se scrie doar câmpul.</span>
            </li>
          </ul>
          <p className="text-xs text-[#6B6B6B]">
            (În notația internațională literele sunt K, Q, R, B, N; noi folosim inițialele românești.)
          </p>
        </Section>

        <Section title="Cum scrii o mutare">
          <p>Litera piesei + câmpul unde ajunge:</p>
          <ul className="space-y-1">
            <li><Move>Cf3</Move> — calul merge pe f3.</li>
            <li><Move>e4</Move> — pionul merge pe e4 (fără literă, e pion).</li>
            <li><Move>Dh5</Move> — dama pe h5.</li>
          </ul>
        </Section>

        <Section title="Capturi">
          <p>Pui un <Move>x</Move> înainte de câmpul de sosire:</p>
          <ul className="space-y-1">
            <li><Move>Cxe5</Move> — calul capturează pe e5.</li>
            <li><Move>exd5</Move> — la pioni pui coloana de plecare: pionul de pe „e" ia pe d5.</li>
          </ul>
        </Section>

        <Section title="Semne speciale">
          <ul className="space-y-1">
            <li><Move>+</Move> — șah (ex. <Move>Dh5+</Move>).</li>
            <li><Move>#</Move> — mat (ex. <Move>Df7#</Move>).</li>
            <li><Move>0-0</Move> — rocada mică (flancul regelui).</li>
            <li><Move>0-0-0</Move> — rocada mare (flancul damei).</li>
            <li><Move>e8=D</Move> — promovare: pionul ajunge pe rândul 8 și devine damă.</li>
            <li><Move>e.p.</Move> — captură „en passant" (opțional).</li>
          </ul>
        </Section>

        <Section title="Dezambiguizare (când două piese pot ajunge pe același câmp)">
          <p>Adaugi coloana sau rândul piesei care mută:</p>
          <ul className="space-y-1">
            <li><Move>Cbd2</Move> — calul de pe coloana „b" merge pe d2 (celălalt cal ar putea și el).</li>
            <li><Move>T1e2</Move> — tura de pe rândul 1 merge pe e2.</li>
          </ul>
        </Section>

        <Section title="Rezultatul partidei">
          <ul className="space-y-1">
            <li><Move>1-0</Move> — a câștigat Albul.</li>
            <li><Move>0-1</Move> — a câștigat Negrul.</li>
            <li><Move>½-½</Move> — remiză.</li>
          </ul>
        </Section>

        <Section title="Exemplu: primele mutări">
          <p className="rounded-lg bg-[#141414] border border-[#2A2A2A] p-4">
            <Move>1. e4 e5 2. Cf3 Cc6 3. Nb5</Move>
          </p>
          <p>
            Asta e deschiderea spaniolă (Ruy López): pion pe e4, răspuns e5; cal pe f3, cal pe c6;
            nebun pe b5. Acum poți citi orice partidă notată așa.
          </p>
        </Section>

        <div className="pt-4">
          <Link to="/puzzles" className="inline-flex items-center gap-2 rounded-xl bg-[#E2B340] text-black font-semibold px-5 py-2.5 hover:bg-[#F0C85A] transition-colors">
            Exersează notația pe puzzle-uri →
          </Link>
        </div>
      </div>
    </div>
  )
}
