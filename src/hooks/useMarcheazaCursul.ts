import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

/**
 * Însemnează că ai trecut pe la un curs, ca Bârlogul să ştie unde ai rămas.
 *
 * `update`, nu `upsert`: dacă nu există rând de progres, nu se creează niciunul.
 * Altfel simpla răsfoire a catalogului ţi-ar umple pagina de start cu cursuri pe
 * care nu le-ai început niciodată.
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
      .update({ last_activity_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .then(undefined, () => {})
  }, [user, courseId])
}
