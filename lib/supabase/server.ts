import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

// Función para crear cliente de Supabase con valores por defecto
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ 
    cookies: () => cookieStore,
    supabaseUrl,
    supabaseKey
  })
}