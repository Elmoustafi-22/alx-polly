export interface User {
  id: string
  username: string
  email: string
  createdAt: Date
}

export interface Poll {
  id: string
  title: string
  description?: string
  options: PollOption[]
  createdBy: string
  createdAt: Date
  endsAt?: Date
  isActive: boolean
}

export interface PollOption {
  id: string
  text: string
  votes: number
}

export interface Vote {
  id: string
  pollId: string
  optionId: string
  userId: string
  createdAt: Date
}

// Database-shaped types used in server actions/pages working with Supabase results
export interface DbPollWithOptions {
  id: string
  title: string
  description?: string | null
  created_by: string
  created_at?: string
  is_active?: boolean
  poll_options: Array<{
    id: string
    text: string
    votes: number
  }>
}