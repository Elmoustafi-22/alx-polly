'use server'

import { supabase } from './supabase'
import { supabaseAdmin } from './supabase-admin'
import { Poll, PollOption } from '@/types'

type CreatePollData = {
  title: string
  description?: string
  options: { text: string }[]
  createdBy: string
}

export async function createPoll(data: CreatePollData) {
  const { title, description, options, createdBy } = data

  try {
    // Start a Supabase transaction
    const { data: poll, error: pollError } = await supabaseAdmin
      .from('polls')
      .insert({
        title,
        description,
        created_by: createdBy,
        is_active: true
      })
      .select()
      .single()

    if (pollError) {
      console.error('Error creating poll:', pollError)
      throw new Error('Failed to create poll')
    }

    // Insert poll options
    const pollOptions = options.map(option => ({
      poll_id: poll.id,
      text: option.text,
      votes: 0
    }))

    const { error: optionsError } = await supabaseAdmin
      .from('poll_options')
      .insert(pollOptions)

    if (optionsError) {
      console.error('Error creating poll options:', optionsError)
      throw new Error('Failed to create poll options')
    }

    return { success: true, pollId: poll.id }
  } catch (error) {
    console.error('Error creating poll:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create poll' }
  }
}

export async function getPolls() {
  try {
    const { data: polls, error } = await supabase
      .from('polls')
      .select(`
        id,
        title,
        description,
        created_at,
        created_by,
        is_active,
        poll_options (
          id,
          text,
          votes
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching polls:', error)
      throw new Error('Failed to fetch polls')
    }

    return { success: true, polls: polls || [] }
  } catch (error) {
    console.error('Error fetching polls:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch polls' }
  }
}

export async function getPollById(pollId: string) {
  try {
    const { data: poll, error } = await supabase
      .from('polls')
      .select(`
        id,
        title,
        description,
        created_at,
        is_active,
        poll_options (
          id,
          text,
          votes
        )
      `)
      .eq('id', pollId)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching poll:', error)
      throw new Error('Poll not found')
    }

    return { success: true, poll }
  } catch (error) {
    console.error('Error fetching poll:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch poll' }
  }
}

type SubmitVoteData = {
  pollId: string
  optionId: string
  userId: string | null
}

export async function submitVote(data: SubmitVoteData) {
  const { pollId, optionId, userId } = data

  try {
    // Check if user has already voted on this poll
    if (userId) {
      const { data: existingVote, error: checkError } = await supabase
        .from('votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', userId)
        .single()

      if (existingVote) {
        throw new Error('You have already voted on this poll')
      }
    }

    // Insert the vote
    const { error: voteError } = await supabaseAdmin
      .from('votes')
      .insert({
        poll_id: pollId,
        option_id: optionId,
        user_id: userId
      })

    if (voteError) {
      console.error('Error submitting vote:', voteError)
      throw new Error('Failed to submit vote')
    }

    // Increment the vote count for the selected option
    const { error: incrementError } = await supabaseAdmin
      .rpc('increment_vote', { option_id: optionId })

    if (incrementError) {
      console.error('Error incrementing vote count:', incrementError)
      throw new Error('Failed to update vote count')
    }

    return { success: true }
  } catch (error) {
    console.error('Error submitting vote:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to submit vote' }
  }
}

type UpdatePollData = {
  pollId: string
  title: string
  description?: string
  options: { text: string }[]
  userId: string
}

export async function updatePoll(data: UpdatePollData) {
  const { pollId, title, description, options, userId } = data

  try {
    // Check if user owns the poll
    const { data: poll, error: checkError } = await supabaseAdmin
      .from('polls')
      .select('created_by')
      .eq('id', pollId)
      .single()

    if (checkError || !poll) {
      throw new Error('Poll not found')
    }

    if (poll.created_by !== userId) {
      throw new Error('You can only edit your own polls')
    }

    // Update poll
    const { error: pollError } = await supabaseAdmin
      .from('polls')
      .update({
        title,
        description,
        updated_at: new Date().toISOString()
      })
      .eq('id', pollId)

    if (pollError) {
      console.error('Error updating poll:', pollError)
      throw new Error('Failed to update poll')
    }

    // Delete existing options and recreate them
    const { error: deleteError } = await supabaseAdmin
      .from('poll_options')
      .delete()
      .eq('poll_id', pollId)

    if (deleteError) {
      console.error('Error deleting old options:', deleteError)
      throw new Error('Failed to update poll options')
    }

    // Insert new options
    const pollOptions = options.map(option => ({
      poll_id: pollId,
      text: option.text,
      votes: 0
    }))

    const { error: optionsError } = await supabaseAdmin
      .from('poll_options')
      .insert(pollOptions)

    if (optionsError) {
      console.error('Error creating new options:', optionsError)
      throw new Error('Failed to update poll options')
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating poll:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update poll' }
  }
}

type DeletePollData = {
  pollId: string
  userId: string
}

export async function deletePoll(data: DeletePollData) {
  const { pollId, userId } = data

  try {
    // Check if user owns the poll
    const { data: poll, error: checkError } = await supabaseAdmin
      .from('polls')
      .select('created_by')
      .eq('id', pollId)
      .single()

    if (checkError || !poll) {
      throw new Error('Poll not found')
    }

    if (poll.created_by !== userId) {
      throw new Error('You can only delete your own polls')
    }

    // Soft delete by setting is_active to false
    const { error: deleteError } = await supabaseAdmin
      .from('polls')
      .update({ is_active: false })
      .eq('id', pollId)

    if (deleteError) {
      console.error('Error deleting poll:', deleteError)
      throw new Error('Failed to delete poll')
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting poll:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete poll' }
  }
}