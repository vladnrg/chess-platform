import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const FREE_DAILY_LIMIT = 3

const SYSTEM_PROMPT = `Ești un antrenor de șah experimentat și prietenos care explică concepte în română.

Regulile tale:
- Răspunzi ÎNTOTDEAUNA în română cu diacritice corecte
- Ești concis: maxim 150 de cuvinte per răspuns
- Ești prietenos și încurajator, nu critic
- Oferi sfaturi practice și concrete, nu teorii abstracte
- Când explici o poziție, menționezi coordonatele exacte (ex: "calul de pe e5", "tura de pe h1")
- Folosești terminologia românească: Tură (T), Damă (D), Rege (R), Nebun (N), Cal (C), Pion
- Când analizezi o poziție FEN, explici ce se vede pe tablă și care sunt amenințările principale
- La final, oferi EXACT O SINGURĂ recomandare practică de ce să facă jucătorul`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS })
  }

  try {
    const { fen, question, context, userId } = await req.json() as {
      fen: string
      question: string
      context?: string
      userId: string
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
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: SYSTEM_PROMPT,
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
