import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Navigation() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-xl font-bold">Alx Polly</Link>
          <div className="hidden md:flex space-x-4">
            <Link href="/polls">Active Polls</Link>
            <Link href="/polls/create">Create Poll</Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/register">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}