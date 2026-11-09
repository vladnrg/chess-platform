import { Component, type ErrorInfo, type ReactNode } from 'react'

/**
 * Plasa de siguranţă a aplicaţiei: dacă o pagină cade, apare un mesaj, nu negru.
 *
 * Fără ea, orice eroare la desenare — sau un fişier de pagină care nu se mai
 * poate aduce după o publicare — lăsa ecranul complet negru, fără niciun semn
 * că ceva s-a întâmplat sau ce poţi face. Rămâne componentă de clasă fiindcă
 * React prinde erorile de desenare doar aşa.
 */
export class EroarePagina extends Component<{ children: ReactNode }, { eroare: boolean }> {
  state = { eroare: false }

  static getDerivedStateFromError() {
    return { eroare: true }
  }

  componentDidCatch(eroare: Error, info: ErrorInfo) {
    console.error('Pagina a căzut', eroare, info.componentStack)
  }

  render() {
    if (!this.state.eroare) return this.props.children
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-4">
        <div className="max-w-sm space-y-4 text-center">
          <p className="text-4xl">♟</p>
          <h1 className="text-xl font-bold text-[#F0F0F0]">Pagina nu s-a putut încărca</h1>
          <p className="text-sm text-[#A0A0A0]">
            Cel mai des se întâmplă când site-ul a primit o versiune nouă cât îl aveai deschis.
            Reîncărcarea rezolvă problema.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-[#E2B340] px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#F0C85A]"
          >
            Reîncarcă pagina
          </button>
        </div>
      </div>
    )
  }
}
