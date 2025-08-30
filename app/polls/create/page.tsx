import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function CreatePollPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Poll</CardTitle>
          <CardDescription>Fill in the details for your new poll</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Poll Question</label>
              <Input placeholder="What is your question?" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea placeholder="Add some context to your question (optional)" />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Options</label>
              <div className="space-y-2">
                <Input placeholder="Option 1" />
                <Input placeholder="Option 2" />
                <Input placeholder="Option 3" />
              </div>
              <Button type="button" variant="outline" className="w-full">+ Add Another Option</Button>
            </div>

            <div className="pt-4">
              <Button className="w-full">Create Poll</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}