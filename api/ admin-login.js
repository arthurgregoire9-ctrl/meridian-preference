import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { password } = req.body

  if (!password) {
    return res.status(400).json({ error: 'Password required' })
  }

  try {
    const { data, error } = await supabase
      .from('admins')
      .select('id, agency')
      .eq('password', password)
      .single()

    if (error || !data) {
      return res.status(401).json({ error: 'Incorrect password' })
    }

    return res.status(200).json({ admin: data })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}