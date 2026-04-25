import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { token, password } = req.body

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password required' })
  }

  try {
    const { data: yacht } = await supabase
      .from('yachts')
      .select('id, name, crew_password, crew_token')
      .eq('crew_token', token)
      .single()

    if (!yacht) {
      return res.status(404).json({ error: 'Yacht not found' })
    }

    const expectedPassword = yacht.crew_password || 'crew2026'
    if (password !== expectedPassword) {
      return res.status(401).json({ error: 'Incorrect password' })
    }

    // On retourne uniquement les infos non sensibles
    return res.status(200).json({
      yacht: { id: yacht.id, name: yacht.name, crew_token: yacht.crew_token }
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}