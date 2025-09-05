'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

/**
 * LoginPage Component
 * 
 * This component provides a login page for user authentication.
 * 
 * Authentication Flow:
 * 1. User enters email and password in the form
 * 2. Client-side validation ensures valid email format and input length
 * 3. Credentials are sent to the authentication service via the signIn method
 * 4. Upon successful authentication, user is redirected to the polls page
 * 5. On failure, a generic error message is displayed for security
 * 
 * Security Features:
 * - Input validation to prevent malformed data
 * - Length restrictions to prevent DOS attacks
 * - Generic error messages to prevent user enumeration
 * - Error logging for troubleshooting
 * 
 * @returns A React component that renders a login form with email and password fields
 */
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Basic validation
    if (!email || !email.includes('@') || !password) {
      setError('Please enter a valid email and password')
      setIsLoading(false)
      return
    }

    // Prevent login attempts with overly long inputs to prevent DOS attacks
    if (email.length > 100 || password.length > 100) {
      setError('Input exceeds maximum allowed length')
      setIsLoading(false)
      return
    }

    try {
      await signIn(email, password)
      router.push('/polls')
    } catch (error: any) {
      // Generic error message to prevent user enumeration
      setError('Invalid email or password')
      console.error('Login error:', error.message || 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className='font-aeonik'>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button className="w-full font-aeonik" type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}