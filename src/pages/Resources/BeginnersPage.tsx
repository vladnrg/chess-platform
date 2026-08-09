import { Link } from 'react-router-dom'
import { ScrollText, PenLine, Target, FileText, ChevronRight, ExternalLink, type LucideIcon } from 'lucide-react'
import { PDF_RESOURCES } from '@/data/famousGames'

// Pagina „Pentru începători" — hub cu resursele de bază (regulile, notația,
// antrenament), mutate din secțiunea de pe pagina de tactici.

const ICONS: Record<string, LucideIcon> = {
  'fide-rules': ScrollText,
  'chess-notation-guide': PenLine,
  'tactics-workbook': Target,
}

export function BeginnersPage() {
  return (
    <div className="space-y-6">
      {/* Fără titlu: numele paginii se vede în bara de sus. Rămâne doar
          propoziţia care chiar spune ceva nou. */}
      <p className="max-w-2xl text-sm text-[#6B6B6B]">
        Tot ce-ți trebuie ca să pornești la drum: regulile jocului, notația mutărilor și antrenament
        pe nivelul tău — gratuit și direct în platformă, fără PDF-uri de deschis.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PDF_RESOURCES.map(res => {
          const Icon = ICONS[res.id] ?? FileText
          const cls = 'group flex items-start gap-4 rounded-2xl bg-[#141414] border border-[#2A2A2A] p-5 hover:border-[#E2B340] hover:-translate-y-0.5 transition-all'
          const inner = (
            <>
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[rgba(226,179,64,0.12)] text-[#E2B340]">
                <Icon className="h-6 w-6" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-[#F0F0F0] group-hover:text-[#E2B340] transition-colors">{res.title}</p>
                  <span className="text-[10px] text-[#6B6B6B] border border-[#2A2A2A] rounded px-1">{res.language}</span>
                </div>
                <p className="text-sm text-[#6B6B6B] mt-1 leading-relaxed">{res.description}</p>
              </div>
              {res.internal
                ? <ChevronRight className="h-4 w-4 text-[#6B6B6B] flex-shrink-0 mt-1 group-hover:text-[#E2B340] transition-colors" />
                : <ExternalLink className="h-4 w-4 text-[#6B6B6B] flex-shrink-0 mt-1 group-hover:text-[#E2B340] transition-colors" />}
            </>
          )
          return res.internal
            ? <Link key={res.id} to={res.url} className={cls}>{inner}</Link>
            : <a key={res.id} href={res.url} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
        })}
      </div>
    </div>
  )
}
