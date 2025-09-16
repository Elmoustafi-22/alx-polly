'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { updatePoll, getPollById } from '@/lib/actions'
import { AuthGuard } from '@/components/auth-guard'
import type { DbPollWithOptions } from '@/types'

type Poll = DbPollWithOptions

interface EditPollPageProps {
  params: {
    id: string
  }
}

export default function EditPollPage({ params }: EditPollPageProps) {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    async function fetchPoll() {
      try {
        const result = await getPollById(params.id)
        if (result.success) {
          const pollData = result.poll
          if (pollData.created_by !== user?.id) {
            router.push('/polls')
            return
          }
          setPoll(pollData)
          setTitle(pollData.title)
          setDescription(pollData.description || '')
          setOptions(pollData.poll_options.map(opt => opt.text))
        } else {
          setError('Failed to load poll')
        }
      } catch (error) {
        setError('Failed to load poll')
      } finally {
        setIsFetching(false)
      }
    }

    if (user?.id) {
      fetchPoll()
    }
  }, [params.id, user?.id, router])

  const addOption = () => {
    setOptions([...options, ''])
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const removeOption = (index: number) => {
    if (options.length <= 2) return
    const newOptions = options.filter((_, i) => i !== index)
    setOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!title.trim()) {
      setError('Please enter a poll question')
      setIsLoading(false)
      return
    }

    const validOptions = options.filter(opt => opt.trim())
    if (validOptions.length < 2) {
      setError('Please provide at least two options')
      setIsLoading(false)
      return
    }

    try {
      if (!user?.id) {
        throw new Error('You must be logged in to edit a poll')
      }

      const result = await updatePoll({
        pollId: params.id,
        title: title.trim(),
        description: description.trim() || undefined,
        options: validOptions.map(text => ({ text })),
        userId: user.id
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/polls/${params.id}`)
      }, 1500)
    } catch (err) {
      setError('Failed to update poll. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto"></div>
          <p className="mt-2 text-slate-300">Loading poll...</p>
        </div>
      </div>
    )
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center p-4">
        <div className="text-center bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
          <h3 className="text-xl font-semibold mb-2 text-white">Poll not found</h3>
          <Button onClick={() => router.push('/polls')} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Back to Polls</Button>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto">
          <Card className="max-w-2xl mx-auto bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl text-white">
            <CardHeader>
              <CardTitle className='font-aeonik text-2xl text-white'>Edit Poll</CardTitle>
              <CardDescription className="text-slate-400">Update your poll details</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-500/20 text-red-300 text-sm p-3 rounded-lg">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-500/20 text-green-300 text-sm p-3 rounded-lg">
                    Poll updated successfully! Redirecting...
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Poll Question</label>
                  <Input
                    placeholder="What is your question?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Description</label>
                  <Textarea
                    placeholder="Add some context to your question (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium text-slate-300">Options</label>
                  <div className="space-y-2">
                    {options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          required
                          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {options.length > 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeOption(index)}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-indigo-400 text-indigo-200 hover:bg-indigo-900/30 hover:text-white rounded-lg"
                    onClick={addOption}
                  >
                    + Add Another Option
                  </Button>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.push(`/polls/${params.id}`)}
                    className="flex-1 bg-transparent border-slate-600 hover:bg-slate-700 text-slate-300 rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 font-aeonik bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg" 
                    type="submit" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating...' : 'Update Poll'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}