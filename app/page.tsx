'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'

export default function HomePage() {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h1 className="text-5xl font-bold tracking-tight font-aeonik">
          Create and Share Polls with Ease
        </h1>
        
        <p className="text-xl text-muted-foreground">
          Alx Polly makes it simple to create polls, gather opinions, and make decisions together.
          Start creating your poll today and get instant feedback from your audience.
        </p>

        <div className="flex justify-center gap-4 pt-4">
          {user ? (
            <Link href="/polls/create">
              <Button size="lg">Create Your First Poll</Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="lg">Sign In to Create Poll</Button>
            </Link>
          )}
          <Link href="/polls">
            <Button variant="outline" size="lg">Browse Polls</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 pt-16">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold font-aeonik">Easy to Create</h3>
            <p className="text-muted-foreground">Create polls in seconds with our intuitive interface</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold font-aeonik">Real-time Results</h3>
            <p className="text-muted-foreground">Watch votes come in and update instantly</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold font-aeonik">Share Anywhere</h3>
            <p className="text-muted-foreground">Share your polls easily across any platform</p>
          </div>
        </div>
      </div>
    </div>
  )
}
