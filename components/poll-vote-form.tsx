'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/auth-context'
import { submitVote } from '@/lib/actions'
import { useRouter } from 'next/navigation'

interface PollOption {
  id: string
  text: string
  votes: number
}

interface Poll {
  id: string
  title: string
  description?: string
  poll_options: PollOption[]
}

interface PollVoteFormProps {
  poll: Poll
}

export function PollVoteForm({ poll }: PollVoteFormProps) {
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [isVoting, setIsVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const router = useRouter()

  const totalVotes = poll.poll_options.reduce((sum, option) => sum + option.votes, 0)

  const handleVote = async () => {
    if (!selectedOption) {
      setError('Please select an option')
      return
    }

    setIsVoting(true)
    setError('')

    try {
      const result = await submitVote({
        pollId: poll.id,
        optionId: selectedOption,
        userId: user?.id || null
      })

      if (result.success) {
        setHasVoted(true)
        // Refresh the page to show updated results
        router.refresh()
      } else {
        setError(result.error || 'Failed to submit vote')
      }
    } catch (err) {
      setError('Failed to submit vote. Please try again.')
    } finally {
      setIsVoting(false)
    }
  }

  const getPercentage = (votes: number) => {
    if (totalVotes === 0) return 0
    return Math.round((votes / totalVotes) * 100)
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      {!hasVoted ? (
        <div className="space-y-4">
          <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
            {poll.poll_options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="text-base cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <Button 
            onClick={handleVote} 
            disabled={isVoting || !selectedOption}
            className="w-full font-aeonik"
          >
            {isVoting ? 'Submitting...' : 'Submit Vote'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Results</h3>
          {poll.poll_options.map((option) => {
            const percentage = getPercentage(option.votes)
            return (
              <div key={option.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{option.text}</span>
                  <span className="font-medium">{option.votes} votes ({percentage}%)</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
          <div className="pt-4 text-center text-sm text-muted-foreground">
            Total votes: {totalVotes}
          </div>
        </div>
      )}
    </div>
  )
}
