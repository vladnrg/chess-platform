import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

/**
 * Însemnează că ai trecut pe la un curs, ca Bârlogul să ştie unde ai rămas.
 *
 * `upsert`, nu `update`: dacă nu există rând de progres, se creează unul gol.
 * Multă vreme a fost invers, de teamă că răsfoirea catalogului ar umple pagina
 * de start cu cursuri neîncepute — dar frica era pusă în locul greşit. Hook-ul
 * nu stă pe catalog, stă pe pagina unui curs anume: ca să ajungi aici, ai
 * deschis chiar cursul acela.
 *
 * Iar preţul celeilalte variante se vedea: cine intra pe „Sistemul Colle" şi
 * citea cuprinsul fără să deschidă o variantă nu lăsa nicio urmă, aşa că
 * Bârlogul îi arăta mai departe un curs terminat de săptămâna trecută. Pagina
 * de start răspunde la „ce făceam?", iar răspunsul e cursul pe care l-ai
 * deschis ultima dată, nu ultimul în care ai apucat să termini ceva.
 *
 * Rândul creat aici e gol: fără lecţii parcurse, fără XP. Nu spune „ai făcut",
 * spune „ai fost pe-aici".
 *
 * Erorile se înghit intenţionat. E o însemnare, nu o acţiune a utilizatorului —
 * dacă pică, cel mai rău lucru care se întâmplă e că pe pagina de start apare în
 * faţă un curs puţin mai vechi. Nu merită un mesaj de eroare peste ecran.
 */
export function useMarcheazaCursul(courseId: string | undefined) {
  const { user } = useAuth()

  useEffect(() => {
    if (!user || !courseId) return
    void supabase
      .from('user_course_progress')
      .upsert({
        user_id: user.id,
        course_id: courseId,
        last_activity_at: new Date().toISOString(),
      })
      .then(undefined, () => {})
  }, [user, courseId])
}
