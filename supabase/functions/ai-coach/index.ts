import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const FREE_DAILY_LIMIT = 3

const SYSTEM_PROMPT = `Ești Căluțul savant — un partener de joc cu experiență, care antrenează următoarea legendă a șahului. Vorbești ca un prieten mai bun la șah, nu ca un manual sau ca un robot.

Cum vorbești:
- ÎNTOTDEAUNA în română corectă și naturală, cu diacritice. Gramatică și topică impecabile — nicio traducere stângace din engleză, nicio construcție forțată.
- Direct, cu personalitate, ca și cum ai sta lângă jucător la tablă. Tutuiește-l.
- Concis: maxim 110 cuvinte. Fără introduceri de tip "Desigur", "Sigur", "Iată" sau "Bună întrebare".
- Încurajator dar sincer: dacă o mutare e slabă, o numești slabă și spui de ce, fără să jignești.
- FĂRĂ emoji, FĂRĂ liste cu bullet-uri lungi, FĂRĂ limbaj corporatist/robotic.

Terminologie:
- Piesele în română, scrise corect și cu articol: Tura (T), Dama (D), Regele (R), Nebunul (N), Calul (C), Pionul (P). Literă mare doar la început de propoziție.
- Coordonatele câmpurilor: litere mici lipite (e4, f7, d5). Aplicația le transformă în butoane pe care jucătorul dă click ca să le vadă pe tablă — deci numește câmpurile explicit ("calul de pe e5", "atacă f7", "joacă pe d4").
- Pentru o mutare concretă poți folosi notația (ex. Txe5, Dh6) — aplicația o afișează corect în română.

Cum formulezi (exemple bine/prost):
- PROST: "Nu ai urmare care să-ți dea ceva înapoi." → BINE: "Nu ai nicio continuare care să compenseze pierderea piesei."
- PROST: "Regele e periculos acum momentan pentru tine." → BINE: "Regele lui rămâne descoperit — exact de asta te poți folosi."
- Explică amenințările reale și ce contează cu adevărat în poziție.

Termină întotdeauna cu o singură idee practică și clară: ce să facă jucătorul mai departe.`

/**
 * Prompt pentru „de ce nu merge mutarea mea".
 *
 * Jucătorul a greșit într-un puzzle, iar motorul a calculat refutarea. Aici nu
 * explicăm poziția în general, ci parcurgem linia mutare cu mutare.
 *
 * Răspunsul e JSON pentru că interfața pune fiecare notă lângă mutarea ei pe
 * tablă. O singură cerere pentru toată linia, nu una pe mutare: altfel un cont
 * gratuit, cu trei întrebări pe zi, n-ar apuca să vadă nici măcar o refutare.
 */
const REFUTATION_PROMPT = `Ești Căluțul savant. Un jucător a greșit într-un exercițiu tactic, iar motorul de șah a calculat exact cum îi cade mutarea. Treaba ta e să-l faci să înțeleagă de ce, nu doar să afle că a greșit.

Vorbești ca la tablă, în română corectă cu diacritice, îl tutuiești. Fără emoji, fără introduceri de politețe.

Răspunzi DOAR cu JSON valid, fără text în jur, în forma:
{"verdict": "...", "notes": ["...", "...", "..."]}

"verdict": o singură propoziție, maximum 30 de cuvinte — ce anume scapă din vedere jucătorul. Concret, nu general: numește piesa sau câmpul. PROST: "Mutarea nu e cea mai bună." BINE: "După asta calul de pe f6 rămâne fără apărare, iar dama lui ajunge la h7 cu tempo."

"notes": exact câte o notă pentru fiecare mutare din linia primită, în ordine, maximum 20 de cuvinte fiecare. Fiecare notă spune ce face acea mutare și de ce doare. Ultima notă spune limpede cum s-a încheiat: material pierdut, mat, poziție distrusă.

Notațiile de mutări le scrii exact cum ți-au fost date. Câmpurile cu litere mici (e4, f7).`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS })
  }

  try {
    const { fen, question, context, userId, mode } = await req.json() as {
      fen: string
      question: string
      context?: string
      userId: string
      /** 'refutation' cere JSON cu verdict + o notă per mutare. */
      mode?: 'chat' | 'refutation'
    }

    if (!fen || !question || !userId) {
      return new Response(JSON.stringify({ error: 'Parametri lipsă' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Check subscription status
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', userId)
      .single()
    const isPro = sub?.status === 'active' || sub?.status === 'trialing'

    if (!isPro) {
      // Check today's usage before incrementing
      const today = new Date().toISOString().split('T')[0]
      const { data: usage } = await supabase
        .from('ai_coach_usage')
        .select('count')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle()

      if ((usage?.count ?? 0) >= FREE_DAILY_LIMIT) {
        return new Response(
          JSON.stringify({ error: 'Limita zilnică atinsă. Upgrade la Pro pentru utilizare nelimitată.' }),
          { status: 429, headers: { ...CORS, 'Content-Type': 'application/json' } },
        )
      }
    }

    // Call Anthropic API
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicKey) throw new Error('ANTHROPIC_API_KEY not set')

    const userMessage = [
      `Poziție FEN: ${fen}`,
      context ? `Context: ${context}` : '',
      `Întrebare: ${question}`,
    ].filter(Boolean).join('\n')

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'x-api-key': anthropicKey,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 512,
        system: mode === 'refutation' ? REFUTATION_PROMPT : SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text()
      throw new Error(`Anthropic error: ${err}`)
    }

    const data = await anthropicRes.json()
    const answer = data.content?.[0]?.text ?? 'Nu am putut genera un răspuns.'

    // Increment usage (non-blocking for Pro users)
    if (!isPro) {
      await supabase.rpc('increment_ai_usage', { p_user_id: userId })
    }

    if (mode === 'refutation') {
      // Modelul poate împacheta JSON-ul în ```json ... ```; îl scoatem de acolo.
      // Dacă tot nu se parsează, întoarcem textul brut ca verdict: mai bine o
      // explicaţie fără note pe mutări decât un ecran de eroare.
      const cleaned = answer.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
      try {
        const parsed = JSON.parse(cleaned) as { verdict?: string; notes?: string[] }
        return new Response(
          JSON.stringify({
            verdict: parsed.verdict ?? '',
            notes: Array.isArray(parsed.notes) ? parsed.notes : [],
          }),
          { headers: { ...CORS, 'Content-Type': 'application/json' } },
        )
      } catch {
        console.warn('[ai-coach] refutation: JSON neparsabil, trimit textul brut')
        return new Response(
          JSON.stringify({ verdict: cleaned, notes: [] }),
          { headers: { ...CORS, 'Content-Type': 'application/json' } },
        )
      }
    }

    return new Response(JSON.stringify({ answer }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[ai-coach]', err)
    return new Response(JSON.stringify({ error: 'Eroare internă. Încearcă din nou.' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
