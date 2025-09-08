import { supabase } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select(
        `
        *,
        options:poll_options(*)
      `
      )
      .eq('id', id)
      .single()

    if (pollError) throw pollError

    return NextResponse.json({ success: true, poll })
  } catch (error) {
    console.error('Error fetching poll:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch poll' },
      { status: 500 }
    )
  }
}
