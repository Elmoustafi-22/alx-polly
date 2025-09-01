export interface Poll {
  id: string
  title: string
  description?: string
  created_by: string
  created_at: string
  is_active: boolean
  options: PollOption[]
}

export interface PollOption {
  id: string
  poll_id: string
  text: string
  votes: number
}

export interface Vote {
  id: string
  poll_id: string
  option_id: string
  user_id?: string
  created_at: string
}

export interface CreatePollInput {
  title: string
  description?: string
  options: { text: string }[]
}

export interface VoteInput {
  pollId: string
  optionId: string
}