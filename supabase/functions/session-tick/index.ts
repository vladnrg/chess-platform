import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  const authHeader = req.headers.get('authorization')
  if (!authHeader) return new Response('Unauthorized', { status: 401 })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { sessionId } = await req.json() as { sessionId: string }

  const { data: session } = await supabase
    .from('child_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session) return new Response('Not found', { status: 404 })

  const now = new Date()
  const expiresAt = new Date(session.expires_at)
  const minsLeft = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / 60000))

  await supabase
    .from('child_sessions')
    .update({ last_seen_at: now.toISOString() })
    .eq('id', sessionId)

  return new Response(
    JSON.stringify({ minsLeft, expired: now >= expiresAt }),
    { headers: { ...CORS, 'Content-Type': 'application/json' } },
  )
})
