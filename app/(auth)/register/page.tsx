import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>Enter your details to create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Input type="text" placeholder="Username" />
            </div>
            <div className="space-y-2">
              <Input type="email" placeholder="Email" />
            </div>
            <div className="space-y-2">
              <Input type="password" placeholder="Password" />
            </div>
            <div className="space-y-2">
              <Input type="password" placeholder="Confirm Password" />
            </div>
            <Button className="w-full">Sign Up</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}