import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PollsPage() {
  const dummyPolls = [
    { id: 1, title: 'Favorite Programming Language', votes: 150 },
    { id: 2, title: 'Best Frontend Framework', votes: 120 },
    { id: 3, title: 'Most Used Database', votes: 200 },
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Active Polls</h1>
        <Button>Create New Poll</Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dummyPolls.map((poll) => (
          <Card key={poll.id}>
            <CardHeader>
              <CardTitle>{poll.title}</CardTitle>
              <CardDescription>{poll.votes} votes</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Vote Now</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}