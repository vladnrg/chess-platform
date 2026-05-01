import { ExternalLink, FileText } from 'lucide-react'
import { TacticCard } from '@/components/tactics/TacticCard'
import { FamousGameCard } from '@/components/tactics/FamousGameCard'
import { TACTICS, TACTIC_SECTION_LABELS, type TacticSection } from '@/data/tactics'
import { FAMOUS_GAMES, PDF_RESOURCES } from '@/data/famousGames'

const SECTIONS: TacticSection[] = ['basic', 'advanced', 'mate']

export function TacticsChestPage() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <div>
        <h1 className="text-2xl font-bold text-[#f0f0f0]">Cufărul cu Tactici</h1>
        <p className="text-[#666] text-sm mt-1 max-w-xl">
          Învață modelele tactice fundamentale. Fiecare card include o poziție ilustrativă și
          un link direct la puzzle-uri pe acea temă. Studiezi, apoi exersezi.
        </p>
      </div>

      {/* Tactic sections */}
      {SECTIONS.map(section => {
        const sectionTactics = TACTICS.filter(t => t.section === section)
        return (
          <section key={section}>
            <h2 className="text-lg font-semibold text-[#f0f0f0] mb-4">
              {TACTIC_SECTION_LABELS[section]}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sectionTactics.map(tactic => (
                <TacticCard key={tactic.id} tactic={tactic} />
              ))}
            </div>
          </section>
        )
      })}

      {/* Famous games */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[#f0f0f0]">Partide Celebre</h2>
          <p className="text-sm text-[#666] mt-0.5">
            Partide care au intrat în istoria șahului. Fiecare are o lecție tactică sau strategică majoră.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {FAMOUS_GAMES.map(game => (
            <FamousGameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      {/* PDF resources */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[#f0f0f0]">Resurse & PDF-uri</h2>
          <p className="text-sm text-[#666] mt-0.5">
            Materiale gratuite pentru studiu offline.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PDF_RESOURCES.map(res => (
            <a
              key={res.id}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-4 hover:border-[#c8a84b] transition-colors"
            >
              <FileText className="h-5 w-5 text-[#c8a84b] flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[#f0f0f0] group-hover:text-[#c8a84b] transition-colors">
                    {res.title}
                  </p>
                  <span className="text-xs text-[#555] border border-[#2a2a2a] rounded px-1">
                    {res.language}
                  </span>
                </div>
                <p className="text-xs text-[#666] mt-1 leading-relaxed">{res.description}</p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-[#555] flex-shrink-0 mt-0.5 group-hover:text-[#c8a84b] transition-colors" />
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
