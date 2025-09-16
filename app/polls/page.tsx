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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto"></div>
          <p className="mt-2 text-slate-300">
            {authLoading ? 'Loading...' : 'Loading polls...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-aeonik text-white">Active Polls</h1>
          <Link href={user ? "/polls/create" : "/login"}>
            <Button className='font-aeonik bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg'>
              {user ? 'Create New Poll' : 'Sign In to Create Poll'}
            </Button>
          </Link>
        </div>
        
        {polls.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl">
            <h3 className="text-xl font-semibold mb-2 text-white">No polls yet</h3>
            <p className="text-slate-400 mb-4">Be the first to create a poll!</p>
            <Link href={user ? "/polls/create" : "/login"}>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                {user ? 'Create Your First Poll' : 'Sign In to Create Poll'}
              </Button>
            </Link>
          </div>
        ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {polls.map((poll) => {
              const totalVotes = poll.poll_options?.reduce((sum, option) => sum + option.votes, 0) || 0
              const isOwner = user?.id === poll.created_by
              
              return (
            <Card key={poll.id} className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl text-white">
              <CardHeader>
                    <CardTitle className="font-aeonik text-white">{poll.title}</CardTitle>
                    <CardDescription className="text-slate-400">
                      {totalVotes} votes • {poll.poll_options?.length || 0} options
                      {isOwner && <span className="ml-2 text-indigo-400">• Your poll</span>}
                    </CardDescription>
              </CardHeader>
                  <CardContent className="space-y-3">
                    <Link href={`/polls/${poll.id}`}>
                <Button variant="outline" className="w-full border-indigo-400 text-indigo-200 hover:bg-indigo-900/30 hover:text-white rounded-lg">Vote Now</Button>
                    </Link>
                    
                    {isOwner && (
                      <div className="flex gap-2">
                        <Link href={`/polls/${poll.id}/edit`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg">
                            Edit
                          </Button>
                        </Link>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              disabled={deletingPollId === poll.id}
                              className="bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 rounded-lg"
                            >
                              {deletingPollId === poll.id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Poll</AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-400">
                                Are you sure you want to delete "{poll.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-transparent border-slate-600 hover:bg-slate-700 text-slate-300 rounded-lg">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeletePoll(poll.id)}
                                className="bg-red-600 text-white hover:bg-red-700 rounded-lg"
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
    </div>
  )
}
