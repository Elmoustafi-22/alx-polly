'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '../supabase/client'
import { Database } from '../supabase/types'
import { Session } from '@supabase/supabase-js'
import { CreatePollInput, VoteInput } from '@/types/polls'

function isValidSession(session: Session | null): session is Session {
  return session !== null && typeof session.user?.id === 'string'
}

export async function createPoll(data: CreatePollInput) {
  const { title, description, options } = data

  try {
    const { data: session } = await supabase.auth.getSession()
    if (!isValidSession(session)) {
      throw new Error('Unauthorized')
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

    revalidatePath('/polls')
    return { success: true, pollId: poll.id }
  } catch (error) {
    console.error('Error creating poll:', error)
    return { success: false, error: 'Failed to create poll' }
  }
}

export async function votePoll({ pollId, optionId }: VoteInput) {
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
        return { success: false, error: 'You have already voted on this poll' }
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

    revalidatePath(`/polls/${pollId}`)
    return { success: true }
  } catch (error) {
    console.error('Error voting:', error)
    return { success: false, error: 'Failed to submit vote' }
  }
}

export async function getPoll(id: string) {
  try {
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select(`
        *,
        options:poll_options(*)
      `)
      .eq('id', id)
      .single()

    if (pollError) throw pollError
    return { success: true, poll }
  } catch (error) {
    console.error('Error fetching poll:', error)
    return { success: false, error: 'Failed to fetch poll' }
  }
}