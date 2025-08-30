import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Input type="email" placeholder="Email" />
            </div>
            <div className="space-y-2">
              <Input type="password" placeholder="Password" />
            </div>
            <Button className="w-full">Sign In</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}