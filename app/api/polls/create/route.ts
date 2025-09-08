
import { supabase } from '@/lib/supabase/client'
import { CreatePollInput } from '@/types/polls'
import { NextResponse } from 'next/server'

function isValidSession(session: any): session is { user: { id: string } } {
  return session !== null && typeof session.user?.id === 'string'
}

export async function POST(req: Request) {
  const data: CreatePollInput = await req.json()
  const { title, description, options } = data

  try {
    const { data: session } = await supabase.auth.getSession()
    if (!isValidSession(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        title,
        description,
        created_by: session.user.id,
        is_active: true
      })
      .select()
      .single()

    if (pollError) throw pollError

    const pollOptions = options.map(option => ({
      poll_id: poll.id,
      text: option.text,
      votes: 0
    }))

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(pollOptions)

    if (optionsError) throw optionsError

    return NextResponse.json({ success: true, pollId: poll.id })
  } catch (error) {
    console.error('Error creating poll:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create poll' },
      { status: 500 }
    )
  }
}
