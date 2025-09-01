'use server'

import { supabase } from './supabase'
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
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        title,
        description,
        created_by: createdBy,
        is_active: true
      })
      .select()
      .single()

    if (pollError) throw pollError

    // Insert poll options
    const pollOptions = options.map(option => ({
      poll_id: poll.id,
      text: option.text,
      votes: 0
    }))

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(pollOptions)

    if (optionsError) throw optionsError

    return { success: true, pollId: poll.id }
  } catch (error) {
    console.error('Error creating poll:', error)
    return { success: false, error: 'Failed to create poll' }
  }
}