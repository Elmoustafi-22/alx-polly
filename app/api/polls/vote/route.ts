import { supabase } from '@/lib/supabase/client'
import { VoteInput } from '@/types/polls'
import { NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/types'

function isValidSession(session: any): session is { user: { id: string } } {
  return session !== null && typeof session.user?.id === 'string'
}

export async function POST(req: Request) {
  const { pollId, optionId }: VoteInput = await req.json()

  try {
    const { data } = await supabase.auth.getSession()
    const { session } = data

    // Check if user has already voted
    if (isValidSession(session)) {
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', session.user.id)
        .single()

      if (existingVote) {
        return NextResponse.json(
          { success: false, error: 'You have already voted on this poll' },
          { status: 400 }
        )
      }
    }

    const { error: voteError } = await supabase
      .from('votes')
      .insert({
        poll_id: pollId,
        option_id: optionId,
        user_id: isValidSession(session) ? session.user.id : null
      } as Database['public']['Tables']['votes']['Insert'])

    if (voteError) throw voteError

    // Increment the vote count
    const { error: updateError } = await supabase.rpc('increment_vote', {
      option_id: optionId
    })

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error voting:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit vote' },
      { status: 500 }
    )
  }
}
