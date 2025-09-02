import { 
  createPoll, 
  getPolls, 
  getPollById, 
  submitVote, 
  updatePoll, 
  deletePoll 
} from '@/lib/actions'

// Mock the Supabase clients
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}))

jest.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: jest.fn()
  }
}))

import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

const mockSupabase = supabase as any
const mockSupabaseAdmin = supabaseAdmin as any

// Helper function to create mock chain
const createMockChain = (returnValue: any) => {
  const mockEq = jest.fn().mockReturnValue({
    order: jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue(returnValue)
    }),
    eq: jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue(returnValue)
    })
  })

  return {
    select: jest.fn().mockReturnValue({
      eq: mockEq
    }),
    insert: jest.fn().mockResolvedValue(returnValue),
    update: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue(returnValue)
    }),
    delete: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue(returnValue)
    }),
    rpc: jest.fn().mockResolvedValue(returnValue)
  }
}

describe('Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createPoll', () => {
    const mockPollData = {
      title: 'Test Poll',
      description: 'Test Description',
      options: [{ text: 'Option 1' }, { text: 'Option 2' }],
      createdBy: 'user123'
    }

    it('should create a poll successfully', async () => {
      const mockPoll = { id: 'poll123', title: 'Test Poll' }

      // Mock poll creation
      mockSupabaseAdmin.from.mockReturnValueOnce(createMockChain({ data: mockPoll, error: null }))

      // Mock options creation
      mockSupabaseAdmin.from.mockReturnValueOnce(createMockChain({ error: null }))

      const result = await createPoll(mockPollData)

      expect(result.success).toBe(true)
      expect(result.pollId).toBe('poll123')
    })

    it('should handle poll creation error', async () => {
      mockSupabaseAdmin.from.mockReturnValueOnce(createMockChain({ 
        data: null, 
        error: { message: 'Database error' } 
      }))

      const result = await createPoll(mockPollData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to create poll')
    })

    it('should handle options creation error', async () => {
      const mockPoll = { id: 'poll123', title: 'Test Poll' }

      // Mock successful poll creation
      mockSupabaseAdmin.from.mockReturnValueOnce(createMockChain({ data: mockPoll, error: null }))

      // Mock failed options creation
      mockSupabaseAdmin.from.mockReturnValueOnce(createMockChain({ 
        error: { message: 'Options error' } 
      }))

      const result = await createPoll(mockPollData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to create poll options')
    })
  })

  describe('getPolls', () => {
    it('should fetch polls successfully', async () => {
      const mockPolls = [
        {
          id: 'poll1',
          title: 'Poll 1',
          poll_options: [{ id: 'opt1', text: 'Option 1', votes: 5 }]
        }
      ]

      mockSupabase.from.mockReturnValueOnce(createMockChain({ data: mockPolls, error: null }))

      const result = await getPolls()

      expect(result.success).toBe(true)
      expect(result.polls).toEqual(mockPolls)
    })

    it('should handle fetch error', async () => {
      mockSupabase.from.mockReturnValueOnce(createMockChain({ 
        data: null, 
        error: { message: 'Fetch error' } 
      }))

      const result = await getPolls()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to fetch polls')
    })

    it('should return empty array when no polls', async () => {
      mockSupabase.from.mockReturnValueOnce(createMockChain({ data: [], error: null }))

      const result = await getPolls()

      expect(result.success).toBe(true)
      expect(result.polls).toEqual([])
    })
  })

  describe('getPollById', () => {
    it('should fetch a specific poll successfully', async () => {
      const mockPoll = {
        id: 'poll123',
        title: 'Test Poll',
        poll_options: [{ id: 'opt1', text: 'Option 1', votes: 3 }]
      }

      mockSupabase.from.mockReturnValueOnce(createMockChain({ data: mockPoll, error: null }))

      const result = await getPollById('poll123')

      expect(result.success).toBe(true)
      expect(result.poll).toEqual(mockPoll)
    })

    it('should handle poll not found', async () => {
      mockSupabase.from.mockReturnValueOnce(createMockChain({ 
        data: null, 
        error: { message: 'Poll not found' } 
      }))

      const result = await getPollById('nonexistent')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Poll not found')
    })
  })

  describe('submitVote', () => {
    const mockVoteData = {
      pollId: 'poll123',
      optionId: 'opt1',
      userId: 'user123'
    }

    it('should submit vote successfully', async () => {
      // Mock no existing vote
      mockSupabase.from.mockReturnValueOnce(createMockChain({ data: null, error: null }))

      // Mock vote insertion
      mockSupabaseAdmin.from.mockReturnValueOnce(createMockChain({ error: null }))

      // Mock vote increment
      mockSupabaseAdmin.rpc = jest.fn().mockResolvedValue({ error: null })

      const result = await submitVote(mockVoteData)

      expect(result.success).toBe(true)
    })

    it('should prevent duplicate voting', async () => {
      mockSupabase.from.mockReturnValueOnce(createMockChain({ 
        data: { id: 'vote123' }, 
        error: null 
      }))

      const result = await submitVote(mockVoteData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('You have already voted on this poll')
    })

    it('should handle vote insertion error', async () => {
      // Mock no existing vote
      mockSupabase.from.mockReturnValueOnce(createMockChain({ data: null, error: null }))

      // Mock failed vote insertion
      mockSupabaseAdmin.from.mockReturnValueOnce(createMockChain({ 
        error: { message: 'Insert error' } 
      }))

      const result = await submitVote(mockVoteData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to submit vote')
    })

    it('should handle vote increment error', async () => {
      // Mock no existing vote
      mockSupabase.from.mockReturnValueOnce(createMockChain({ data: null, error: null }))

      // Mock successful vote insertion
      mockSupabaseAdmin.from.mockReturnValueOnce(createMockChain({ error: null }))

      // Mock failed vote increment
      mockSupabaseAdmin.rpc = jest.fn().mockResolvedValue({ 
        error: { message: 'Increment error' } 
      })

      const result = await submitVote(mockVoteData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to update vote count')
    })
  })

  describe('updatePoll', () => {
    const mockUpdateData = {
      pollId: 'poll123',
      title: 'Updated Poll',
      description: 'Updated Description',
      options: [{ text: 'New Option 1' }, { text: 'New Option 2' }],
      userId: 'user123'
    }

    it('should update poll successfully', async () => {
      // Mock poll ownership check
      mockSupabaseAdmin.from.mockReturnValueOnce(createMockChain({ 
        data: { created_by: 'user123' }, 
        error: null 
      }))

      // Mock poll update
      mockSupabaseAdmin.from.mockReturnValueOnce(createMockChain({ error: null }))

      // Mock options deletion
      mockSupabaseAdmin.from.mockReturnValueOnce(createMockChain({ error: null }))

      // Mock new options insertion
      mockSupabaseAdmin.from.mockReturnValueOnce(createMockChain({ error: null }))

      const result = await updatePoll(mockUpdateData)

      expect(result.success).toBe(true)
    })

    it('should prevent updating non-owned poll', async () => {
      mockSupabaseAdmin.from.mockReturnValueOnce(createMockChain({ 
        data: { created_by: 'otheruser' }, 
        error: null 
      }))

      const result = await updatePoll(mockUpdateData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('You can only edit your own polls')
    })

    it('should handle poll not found', async () => {
      mockSupabaseAdmin.from.mockReturnValueOnce(createMockChain({ 
        data: null, 
        error: { message: 'Not found' } 
      }))

      const result = await updatePoll(mockUpdateData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Poll not found')
    })
  })

  describe('deletePoll', () => {
    const mockDeleteData = {
      pollId: 'poll123',
      userId: 'user123'
    }

    it('should delete poll successfully', async () => {
      // Mock poll ownership check
      mockSupabaseAdmin.from.mockReturnValueOnce(createMockChain({ 
        data: { created_by: 'user123' }, 
        error: null 
      }))

      // Mock poll deletion (soft delete)
      mockSupabaseAdmin.from.mockReturnValueOnce(createMockChain({ error: null }))

      const result = await deletePoll(mockDeleteData)

      expect(result.success).toBe(true)
    })

    it('should prevent deleting non-owned poll', async () => {
      mockSupabaseAdmin.from.mockReturnValueOnce(createMockChain({ 
        data: { created_by: 'otheruser' }, 
        error: null 
      }))

      const result = await deletePoll(mockDeleteData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('You can only delete your own polls')
    })

    it('should handle poll not found', async () => {
      mockSupabaseAdmin.from.mockReturnValueOnce(createMockChain({ 
        data: null, 
        error: { message: 'Not found' } 
      }))

      const result = await deletePoll(mockDeleteData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Poll not found')
    })
  })
})
