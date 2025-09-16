'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { createPoll } from '@/lib/actions'
import { AuthGuard } from '@/components/auth-guard'

export default function CreatePollPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

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
          throw new Error('You must be logged in to create a poll')
        }

        const result = await createPoll({
          title: title.trim(),
          description: description.trim() || undefined,
          options: validOptions.map(text => ({ text })),
          createdBy: user.id
        })

        if (!result.success) {
          throw new Error(result.error)
        }

        setSuccess(true)
        setTimeout(() => {
          router.push(`/polls/${result.pollId}`)
        }, 1500)
    } catch (err) {
      setError('Failed to create poll. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto">
          <Card className="max-w-2xl mx-auto bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl text-white">
            <CardHeader>
              <CardTitle className='font-aeonik text-2xl text-white'>Create New Poll</CardTitle>
              <CardDescription className="text-slate-400">Fill in the details for your new poll</CardDescription>
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
                    Poll created successfully! Redirecting to your poll...
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

                <div className="pt-4">
                  <Button className="w-full font-aeonik bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-3" type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Poll'}
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
