'use server';

import { supabase } from './supabase';
import { supabaseAdmin } from './supabase-admin';
import { Poll, PollOption } from '@/types';

// Types
interface PollBaseData {
  title: string;
  description?: string;
  options: { text: string }[];
}

interface CreatePollData extends PollBaseData {
  createdBy: string;
}

interface UpdatePollData extends PollBaseData {
  pollId: string;
  userId: string;
}

interface SubmitVoteData {
  pollId: string;
  optionId: string;
  userId: string | null;
}

interface DeletePollData {
  pollId: string;
  userId: string;
}

// Common error handler
const handleError = (operation: string, error: unknown, defaultMessage: string) => {
  const errorMessage = error instanceof Error ? error.message : defaultMessage;
  console.error(`Error ${operation}:`, error);
  return { success: false, error: errorMessage };
};

// Common poll selection query
const POLL_SELECT_QUERY = `
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
`;

/**
 * Check if a user owns a specific poll
 */
async function checkPollOwnership(pollId: string, userId: string) {
  const { data: poll, error } = await supabaseAdmin
    .from('polls')
    .select('created_by')
    .eq('id', pollId)
    .single();

  if (error || !poll) {
    throw new Error('Poll not found');
  }

  if (poll.created_by !== userId) {
    throw new Error('You do not have permission to modify this poll');
  }
}

/**
 * Create a new poll with the provided options
 */
export async function createPoll(data: CreatePollData) {
  const { title, description, options, createdBy } = data;

  try {
    const { data: poll, error: pollError } = await supabaseAdmin
      .from('polls')
      .insert({
        title,
        description,
        created_by: createdBy,
        is_active: true,
      })
      .select('id')
      .single();

    if (pollError) throw pollError;

    const pollOptions = options.map((option) => ({
      poll_id: poll.id,
      text: option.text,
      votes: 0,
    }));

    const { error: optionsError } = await supabaseAdmin
      .from('poll_options')
      .insert(pollOptions);

    if (optionsError) throw optionsError;

    return { success: true, pollId: poll.id };
  } catch (error) {
    return handleError('creating poll', error, 'Failed to create poll');
  }
}

/**
 * Retrieve all active polls with their options
 */
export async function getPolls() {
  try {
    const { data: polls, error } = await supabase
      .from('polls')
      .select(POLL_SELECT_QUERY)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, polls: polls || [] };
  } catch (error) {
    return handleError('fetching polls', error, 'Failed to fetch polls');
  }
}

/**
 * Get a single poll by ID with its options
 */
export async function getPollById(pollId: string) {
  try {
    const { data: poll, error } = await supabase
      .from('polls')
      .select(POLL_SELECT_QUERY)
      .eq('id', pollId)
      .eq('is_active', true)
      .single();

    if (error) throw new Error('Poll not found');
    return { success: true, poll };
  } catch (error) {
    return handleError('fetching poll', error, 'Failed to fetch poll');
  }
}

/**
 * Submit a vote for a poll option
 */
export async function submitVote(data: SubmitVoteData) {
  const { pollId, optionId, userId } = data;

  try {
    if (userId) {
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', userId)
        .single();

      if (existingVote) {
        throw new Error('You have already voted on this poll');
      }
    }

    await supabaseAdmin.from('votes').insert({
      poll_id: pollId,
      option_id: optionId,
      user_id: userId,
    });

    const { error: incrementError } = await supabaseAdmin.rpc(
      'increment_vote',
      { option_id: optionId }
    );

    if (incrementError) throw incrementError;
    return { success: true };
  } catch (error) {
    return handleError('submitting vote', error, 'Failed to submit vote');
  }
}

/**
 * Update an existing poll and its options
 */
export async function updatePoll(data: UpdatePollData) {
  const { pollId, title, description, options, userId } = data;

  try {
    await checkPollOwnership(pollId, userId);

    const { error: pollError } = await supabaseAdmin
      .from('polls')
      .update({
        title,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pollId);

    if (pollError) throw pollError;

    await supabaseAdmin
      .from('poll_options')
      .delete()
      .eq('poll_id', pollId);

    const pollOptions = options.map((option) => ({
      poll_id: pollId,
      text: option.text,
      votes: 0,
    }));

    const { error: optionsError } = await supabaseAdmin
      .from('poll_options')
      .insert(pollOptions);

    if (optionsError) throw optionsError;
    return { success: true };
  } catch (error) {
    return handleError('updating poll', error, 'Failed to update poll');
  }
}

/**
 * Soft delete a poll by setting is_active to false
 */
export async function deletePoll(data: DeletePollData) {
  const { pollId, userId } = data;

  try {
    await checkPollOwnership(pollId, userId);

    const { error: deleteError } = await supabaseAdmin
      .from('polls')
      .update({ is_active: false })
      .eq('id', pollId);

    if (deleteError) throw deleteError;
    return { success: true };
  } catch (error) {
    return handleError('deleting poll', error, 'Failed to delete poll');
  }
}