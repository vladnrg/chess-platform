import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, FileText, ExternalLink, Puzzle } from 'lucide-react'

// Pagina „Resurse" — Legile Șahului direct în platformă (fără PDF separat),
// organizate și lizibile. Sursa oficială (FRȘah) rămâne linkată jos, pentru
// cine vrea textul legal integral.

function Move({ children }: { children: React.ReactNode }) {
  return <span className="font-mono font-semibold text-[#E2B340]">{children}</span>
}

const TOC = [
  { id: 'scop', label: 'Scopul jocului' },
  { id: 'asezare', label: 'Așezarea inițială' },
  { id: 'piese', label: 'Mișcarea pieselor' },
  { id: 'speciale', label: 'Mutări speciale' },
  { id: 'sah-mat', label: 'Șah, șah-mat, pat' },
  { id: 'remiza', label: 'Remiza' },
  { id: 'conduita', label: 'Reguli de conduită' },
  { id: 'ceas', label: 'Timpul (ceasul)' },
  { id: 'ilegale', label: 'Mutări ilegale' },
]

const PIECES = [
  { l: 'R', name: 'Regele', move: 'Un câmp în orice direcție. Nu intră niciodată într-un câmp atacat și nu se poate pune singur în șah.' },
  { l: 'D', name: 'Dama', move: 'Oricâte câmpuri pe linii, coloane și diagonale. Cea mai puternică piesă.' },
  { l: 'T', name: 'Tura', move: 'Oricâte câmpuri pe linii și coloane (drept).' },
  { l: 'N', name: 'Nebunul', move: 'Oricâte câmpuri pe diagonale — rămâne mereu pe culoarea de start.' },
  { l: 'C', name: 'Calul', move: 'În „L": două câmpuri într-o direcție + unul perpendicular. Singura piesă care sare peste altele.' },
  { l: 'P', name: 'Pionul', move: 'Un câmp înainte (sau două de la poziția de start). Capturează în diagonală, un câmp înainte.' },
]

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 space-y-3">
      <h2 className="text-xl font-bold text-[#F0F0F0]">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-[#A0A0A0]">{children}</div>
    </section>
  )
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-4 space-y-1.5">
      {title && <p className="text-sm font-semibold text-[#F0F0F0]">{title}</p>}
      <div className="text-sm leading-relaxed text-[#A0A0A0] space-y-1.5">{children}</div>
    </div>
  )
}

export function ResourcesPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-10">
        {/* Header */}
        <div>
          <Link to="/tactics" className="inline-flex items-center gap-1.5 text-sm text-[#6B6B6B] hover:text-[#F0F0F0] transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" /> Înapoi la Cufărul de tactici
          </Link>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(226,179,64,0.12)] text-[#E2B340]">
              <BookOpen className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-3xl font-bold">Resurse</h1>
              <p className="text-[#A0A0A0]">Legile Șahului, direct în platformă — fără PDF-uri de deschis.</p>
            </div>
          </div>
        </div>

        {/* Cuprins */}
        <nav className="rounded-2xl bg-[#141414] border border-[#2A2A2A] p-5">
          <p className="text-xs text-[#6B6B6B] uppercase tracking-wider mb-3">Legile Șahului · cuprins</p>
          <div className="flex flex-wrap gap-2">
            {TOC.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-full border border-[#2A2A2A] px-3 py-1 text-sm text-[#A0A0A0] hover:border-[#E2B340] hover:text-[#E2B340] transition-colors"
              >
                {i + 1}. {s.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="space-y-10">
          <Section id="scop" title="1. Scopul jocului">
            <p>
              Șahul se joacă între doi adversari care mută pe rând piese pe o tablă pătrată. Cel cu
              piesele albe începe. Scopul tău e să ataci regele advers astfel încât să nu mai poată
              scăpa — asta se numește <strong className="text-[#F0F0F0]">șah-mat</strong> și înseamnă
              victoria.
            </p>
            <p>
              Tabla are <strong className="text-[#F0F0F0]">64 de câmpuri</strong> (8×8), alternativ
              deschise și închise. Se așază cu un <strong className="text-[#F0F0F0]">câmp deschis în
              colțul din dreapta-jos</strong> al fiecărui jucător.
            </p>
          </Section>

          <Section id="asezare" title="2. Așezarea inițială">
            <p>Fiecare jucător are 16 piese: 1 rege, 1 damă, 2 ture, 2 nebuni, 2 cai și 8 pioni.</p>
            <ul className="space-y-1 pl-1">
              <li>• Turele în colțuri, apoi caii lângă ele, apoi nebunii.</li>
              <li>• Dama pe culoarea ei: <strong className="text-[#F0F0F0]">dama albă pe câmp alb, dama neagră pe câmp negru</strong>.</li>
              <li>• Regele lângă damă. Pionii pe tot rândul din față.</li>
            </ul>
            <Card title="Regula de aur la așezare">
              <p><strong className="text-[#F0F0F0]">Câmp alb în dreapta-jos</strong> și <strong className="text-[#F0F0F0]">dama pe culoarea ei</strong>. Dacă astea două sunt corecte, ai așezat tabla bine.</p>
            </Card>
          </Section>

          <Section id="piese" title="3. Mișcarea pieselor">
            <p>Nicio piesă — în afară de cal — nu poate sări peste altele. Ca să <strong className="text-[#F0F0F0]">capturezi</strong>, te muți pe câmpul piesei adverse și o scoți de pe tablă.</p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {PIECES.map(p => (
                <div key={p.l} className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-4 flex gap-3">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[rgba(226,179,64,0.12)] font-mono font-bold text-[#E2B340]">{p.l}</span>
                  <div>
                    <p className="text-sm font-semibold text-[#F0F0F0]">{p.name}</p>
                    <p className="text-xs text-[#A0A0A0] mt-0.5 leading-relaxed">{p.move}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="speciale" title="4. Mutări speciale">
            <Card title="Rocada">
              <p>
                O mutare care implică <strong className="text-[#F0F0F0]">regele și o tură</strong> deodată: regele se mută două câmpuri spre tură, iar tura sare de partea cealaltă a lui. E singura mutare în care miști două piese odată și e cel mai bun mod de a-ți pune regele la adăpost.
              </p>
              <p className="text-[#6B6B6B]">
                Condiții: nici regele, nici tura să nu se fi mișcat; câmpurile dintre ele libere; regele să nu fie în șah și să nu treacă prin/pe un câmp atacat. <Move>0-0</Move> = rocada mică (flancul regelui), <Move>0-0-0</Move> = rocada mare (flancul damei).
              </p>
            </Card>
            <Card title="En passant (captura în trecere)">
              <p>
                Dacă un pion advers avansează două câmpuri și ajunge exact lângă pionul tău, poți să-l capturezi „în trecere", ca și cum ar fi avansat doar un câmp. Se poate <strong className="text-[#F0F0F0]">doar imediat</strong>, la mutarea următoare — după aceea, dreptul se pierde.
              </p>
            </Card>
            <Card title="Promovarea">
              <p>
                Când pionul tău ajunge pe ultimul rând, îl transformi în <strong className="text-[#F0F0F0]">damă, tură, nebun sau cal</strong> (de regulă damă — cea mai puternică). Poți avea astfel mai multe dame pe tablă.
              </p>
            </Card>
          </Section>

          <Section id="sah-mat" title="5. Șah, șah-mat, pat">
            <Card title="Șah">
              <p>Regele e atacat. Ești obligat să scapi imediat, în unul din trei feluri: muți regele, blochezi atacul cu altă piesă, sau capturezi piesa care dă șah. Nu poți ignora șahul.</p>
            </Card>
            <Card title="Șah-mat — victoria">
              <p>Regele e în șah și nu are nicio scăpare legală. Partida se termină pe loc; cel care dă mat câștigă.</p>
            </Card>
            <Card title="Pat (stalemate) — remiză">
              <p>Jucătorul la mutare <strong className="text-[#F0F0F0]">nu</strong> e în șah, dar nu are nicio mutare legală. Partida e <strong className="text-[#F0F0F0]">remiză</strong>. Capcană clasică: dacă ai avantaj mare, ai grijă să nu-l lași pe adversar complet fără mutări.</p>
            </Card>
          </Section>

          <Section id="remiza" title="6. Remiza (½–½)">
            <p>Partida se termină egal în oricare din situațiile:</p>
            <ul className="space-y-1.5 pl-1">
              <li>• <strong className="text-[#F0F0F0]">Pat</strong> — jucătorul la mutare nu e în șah, dar nu are mutări.</li>
              <li>• <strong className="text-[#F0F0F0]">Prin acord</strong> — ambii jucători sunt de acord cu remiza.</li>
              <li>• <strong className="text-[#F0F0F0]">Material insuficient</strong> — niciunul nu mai poate da mat (ex. rege contra rege, sau rege și nebun contra rege).</li>
              <li>• <strong className="text-[#F0F0F0]">Regula celor 50 de mutări</strong> — 50 de mutări consecutive fără nicio captură și fără nicio mutare de pion.</li>
              <li>• <strong className="text-[#F0F0F0]">Triplă repetiție</strong> — aceeași poziție apare de trei ori, cu același jucător la mutare.</li>
            </ul>
          </Section>

          <Section id="conduita" title="7. Reguli de conduită (fair play)">
            <Card title="Piesă atinsă — piesă mutată">
              <p>Dacă atingi o piesă de-a ta, trebuie s-o muți (dacă are o mutare legală). Dacă atingi o piesă adversă, trebuie s-o capturezi, dacă poți. Mutarea devine definitivă când ai dat drumul piesei.</p>
            </Card>
            <Card title="Aranjez (j'adoube)">
              <p>Dacă vrei doar să centrezi o piesă pe câmpul ei, spui <strong className="text-[#F0F0F0]">„aranjez"</strong> înainte s-o atingi — atunci nu ești obligat s-o muți.</p>
            </Card>
            <Card title="O singură mână">
              <p>Muți și apeși ceasul cu <strong className="text-[#F0F0F0]">aceeași mână</strong>. La rocadă atingi întâi regele.</p>
            </Card>
          </Section>

          <Section id="ceas" title="8. Timpul de gândire (ceasul)">
            <p>La partidele cu ceas, fiecare jucător are un timp alocat. Când muți, apeși ceasul și pornește timpul adversarului. Dacă îți expiră timpul („cade steagul") și adversarul mai poate da mat, pierzi.</p>
            <div className="grid gap-2.5 sm:grid-cols-3">
              <Card title="Clasic"><p>Timp lung (ex. 90 min + increment). Gândire profundă.</p></Card>
              <Card title="Rapid"><p>Între 10 și 60 de minute de fiecare.</p></Card>
              <Card title="Blitz"><p>Sub 10 minute (ex. 3+2 sau 5+0). Rapid și intens.</p></Card>
            </div>
          </Section>

          <Section id="ilegale" title="9. Mutări ilegale">
            <p>
              O mutare ilegală (ex. îți lași regele în șah) trebuie corectată — poziția se reface. În
              partidele oficiale, prima ilegalitate aduce de obicei timp bonus adversarului; a doua
              poate pierde partida (la rapid și blitz). Ține minte: <strong className="text-[#F0F0F0]">regele
              nu se capturează niciodată</strong> — dai șah-mat, nu iei regele de pe tablă.
            </p>
          </Section>
        </div>

        {/* Sursă oficială + alte resurse */}
        <div className="space-y-4 border-t border-[#2A2A2A] pt-8">
          <h2 className="text-lg font-semibold text-[#F0F0F0]">Sursa oficială & alte resurse</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <a
              href="https://frsah.ro/wp-content/uploads/2023/02/Legile-sahului-2023.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 rounded-xl bg-[#141414] border border-[#2A2A2A] p-4 hover:border-[#E2B340] transition-colors"
            >
              <FileText className="h-5 w-5 text-[#E2B340] flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#F0F0F0] group-hover:text-[#E2B340] transition-colors">Textul legal complet (PDF)</p>
                <p className="text-xs text-[#6B6B6B] mt-1">Legile Șahului FIDE 2023 — traducerea oficială FRȘah.</p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-[#6B6B6B] flex-shrink-0 mt-0.5 group-hover:text-[#E2B340] transition-colors" />
            </a>
            <Link
              to="/resurse/notatie"
              className="group flex items-start gap-3 rounded-xl bg-[#141414] border border-[#2A2A2A] p-4 hover:border-[#E2B340] transition-colors"
            >
              <BookOpen className="h-5 w-5 text-[#E2B340] flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#F0F0F0] group-hover:text-[#E2B340] transition-colors">Ghid de notație algebrică</p>
                <p className="text-xs text-[#6B6B6B] mt-1">Cum se citesc și se scriu mutările.</p>
              </div>
            </Link>
            <Link
              to="/puzzles"
              className="group flex items-start gap-3 rounded-xl bg-[#141414] border border-[#2A2A2A] p-4 hover:border-[#E2B340] transition-colors"
            >
              <Puzzle className="h-5 w-5 text-[#E2B340] flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#F0F0F0] group-hover:text-[#E2B340] transition-colors">Antrenament de tactici</p>
                <p className="text-xs text-[#6B6B6B] mt-1">Exersează pe nivelul tău, în platformă.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
