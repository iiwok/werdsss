import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('word_generations')
      .select('*')
      .limit(1)

    if (error) throw error

    return NextResponse.json({
      message: 'Database connection successful',
      sample: data
    })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      error: String(error),
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 