'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getPollById } from '@/lib/actions'
import { notFound } from 'next/navigation'
import { PollVoteForm } from '@/components/poll-vote-form'
import { useAuth } from '@/contexts/auth-context'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface PollPageProps {
  params: {
    id: string
  }
}

export default function PollPage({ params }: PollPageProps) {
  const [poll, setPoll] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    async function fetchPoll() {
      try {
        const result = await getPollById(params.id)
        if (result.success) {
          setPoll(result.poll)
        } else {
          setError(true)
        }
      } catch (err) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchPoll()
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading poll...</p>
        </div>
      </div>
    )
  }

  if (error || !poll) {
    notFound()
  }

  const totalVotes = poll.poll_options?.reduce((sum: number, option: any) => sum + option.votes, 0) || 0
  const isOwner = user?.id === poll.created_by

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-2xl font-aeonik">{poll.title}</CardTitle>
                {poll.description && (
                  <CardDescription className="text-base">{poll.description}</CardDescription>
                )}
                <div className="text-sm text-muted-foreground">
                  {totalVotes} total votes • {poll.poll_options?.length || 0} options
                  {isOwner && <span className="ml-2 text-blue-600">• Your poll</span>}
                </div>
              </div>
              {isOwner && (
                <Link href={`/polls/${poll.id}/edit`}>
                  <Button variant="outline" size="sm">
                    Edit Poll
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <PollVoteForm poll={poll} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
