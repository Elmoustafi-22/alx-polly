'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { useEffect, useState } from 'react'
import { deletePoll } from '@/lib/actions'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Poll {
  id: string
  title: string
  description?: string
  created_by: string
  poll_options: Array<{
    id: string
    votes: number
  }>
}

/**
 * Component for displaying and managing polls in the application.
 * 
 * This page shows a list of active polls, allows authenticated users to create new polls,
 * and provides poll owners with options to edit or delete their polls.
 * 
 * @component
 * @example
 * ```tsx
 * <PollsPage />
 * ```
 * 
 * @returns A React component that displays the polls page with loading states,
 * empty state messaging, and a grid of poll cards when polls are available.
 */
/**
 * @component PollsPage
 * @description Main page component for displaying and managing polls
 * 
 * This component handles:
 * - Fetching and displaying all available polls
 * - Allowing authenticated users to create new polls
 * - Providing poll owners with edit and delete capabilities
 * - Displaying appropriate loading states and empty states
 * 
 * @returns {JSX.Element} Rendered polls page with appropriate UI based on authentication
 * and data loading states
 */

/**
 * @function handleDeletePoll
 * @description Handles the deletion of a poll by the authorized owner
 * @param {string} pollId - The unique identifier of the poll to delete
 * 
 * This function:
 * 1. Validates that a user is logged in
 * 2. Sets a loading state for the specific poll being deleted
 * 3. Calls the delete API and updates the UI accordingly
 * 4. Handles any errors during the deletion process
 * 5. Resets the loading state when complete
 */
export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingPollId, setDeletingPollId] = useState<string | null>(null)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    async function fetchPolls() {
      try {
        const response = await fetch('/api/polls')
        if (response.ok) {
          const data = await response.json()
          setPolls(data.polls || [])
        }
      } catch (error) {
        console.error('Error fetching polls:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPolls()
  }, [])

  const handleDeletePoll = async (pollId: string) => {
    if (!user?.id) return
    
    setDeletingPollId(pollId)
    try {
      const result = await deletePoll({ pollId, userId: user.id })
      if (result.success) {
        // Remove the deleted poll from the list
        setPolls(polls.filter(poll => poll.id !== pollId))
      } else {
        console.error('Failed to delete poll:', result.error)
      }
    } catch (error) {
      console.error('Error deleting poll:', error)
    } finally {
      setDeletingPollId(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">
            {authLoading ? 'Loading...' : 'Loading polls...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-aeonik">Active Polls</h1>
        {user ? (
          <Link href="/polls/create">
        <Button className='font-aeonik'>Create New Poll</Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button className='font-aeonik'>Sign In to Create Poll</Button>
          </Link>
        )}
      </div>
      
      {polls.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">No polls yet</h3>
          <p className="text-muted-foreground mb-4">Be the first to create a poll!</p>
          {user ? (
            <Link href="/polls/create">
              <Button>Create Your First Poll</Button>
            </Link>
            ) : (
            <Link href="/login">
              <Button>Sign In to Create Poll</Button>
            </Link>
          )}
        </div>
      ) : (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {polls.map((poll) => {
            const totalVotes = poll.poll_options?.reduce((sum, option) => sum + option.votes, 0) || 0
            const isOwner = user?.id === poll.created_by
            
            return (
          <Card key={poll.id}>
            <CardHeader>
                  <CardTitle className="font-aeonik">{poll.title}</CardTitle>
                  <CardDescription>
                    {totalVotes} votes • {poll.poll_options?.length || 0} options
                    {isOwner && <span className="ml-2 text-blue-600">• Your poll</span>}
                  </CardDescription>
            </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/polls/${poll.id}`}>
              <Button variant="outline" className="w-full">Vote Now</Button>
                  </Link>
                  
                  {isOwner && (
                    <div className="flex gap-2">
                      <Link href={`/polls/${poll.id}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Edit
                        </Button>
                      </Link>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            disabled={deletingPollId === poll.id}
                          >
                            {deletingPollId === poll.id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Poll</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{poll.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePoll(poll.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
            </CardContent>
          </Card>
            )
          })}
      </div>
      )}
    </div>
  )
}