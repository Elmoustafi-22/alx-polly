'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'

export default function HomePage() {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto"></div>
            <p className="text-slate-300">Loading...</p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-5xl font-bold tracking-tight font-aeonik text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">
            Create and Share Polls with Ease
          </h1>
          
          <p className="text-xl text-slate-300">
            Alx Polly makes it simple to create polls, gather opinions, and make decisions together.
            Start creating your poll today and get instant feedback from your audience.
          </p>

          <div className="flex justify-center gap-4 pt-6">
            {user ? (
              <Link href="/polls/create">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 px-6 py-2.5">Create Your First Poll</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 px-6 py-2.5">Sign In to Create Poll</Button>
              </Link>
            )}
            <Link href="/polls">
              <Button variant="outline" size="lg" className="border-indigo-400 text-indigo-200 hover:bg-indigo-900/30 hover:text-white px-6 py-2.5">Browse Polls</Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 pt-20">
            <div className="space-y-4 p-6 rounded-xl bg-slate-800/50 backdrop-blur-sm">
              <h3 className="text-xl font-semibold font-aeonik text-indigo-200">Easy to Create</h3>
              <p className="text-slate-300">Create polls in seconds with our intuitive interface</p>
            </div>
            <div className="space-y-4 p-6 rounded-xl bg-slate-800/50 backdrop-blur-sm">
              <h3 className="text-xl font-semibold font-aeonik text-indigo-200">Real-time Results</h3>
              <p className="text-slate-300">Watch votes come in and update instantly</p>
            </div>
            <div className="space-y-4 p-6 rounded-xl bg-slate-800/50 backdrop-blur-sm">
              <h3 className="text-xl font-semibold font-aeonik text-indigo-200">Share Anywhere</h3>
              <p className="text-slate-300">Share your polls easily across any platform</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
