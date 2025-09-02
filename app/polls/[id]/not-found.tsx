import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-aeonik">Poll Not Found</CardTitle>
            <CardDescription>
              The poll you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/polls">
              <Button className="w-full">Browse All Polls</Button>
            </Link>
            <Link href="/polls/create">
              <Button variant="outline" className="w-full">Create New Poll</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
