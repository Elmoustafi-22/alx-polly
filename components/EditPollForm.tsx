'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { updatePoll } from '@/lib/actions'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'

type EditPollFormProps = {
  pollId: string
  initialTitle: string
  initialDescription?: string
  initialOptions: string[]
  onSuccess?: () => void
}

export default function EditPollForm({
  pollId,
  initialTitle,
  initialDescription,
  initialOptions,
  onSuccess,
}: EditPollFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription || '')
  const [options, setOptions] = useState<string[]>(
    initialOptions.length >= 2 ? initialOptions : ['', '']
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { user } = useAuth()
  const router = useRouter()

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
    setSuccess('')

    if (!title.trim()) {
      setError('Please enter a poll question')
      return
    }

    const validOptions = options.map(o => o.trim()).filter(Boolean)
    if (validOptions.length < 2) {
      setError('Please provide at least two options')
      return
    }

    try {
      if (!user?.id) {
        throw new Error('You must be logged in to edit a poll')
      }

      setIsLoading(true)
      const result = await updatePoll({
        pollId,
        title: title.trim(),
        description: description.trim() || undefined,
        options: validOptions.map(text => ({ text })),
        userId: user.id,
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to update poll')
      }

      setSuccess('Poll updated successfully')
      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/polls/${pollId}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update poll')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md">
          {success}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Poll Question</label>
        <Input
          placeholder="What is your question?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          placeholder="Add some context to your question (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium">Options</label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                required
              />
              {options.length > 2 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeOption(index)}
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
          className="w-full"
          onClick={addOption}
        >
          + Add Another Option
        </Button>
      </div>

      <div className="pt-4 flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/polls/${pollId}`)}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button className="flex-1 font-aeonik" type="submit" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update Poll'}
        </Button>
      </div>
    </form>
  )
}
