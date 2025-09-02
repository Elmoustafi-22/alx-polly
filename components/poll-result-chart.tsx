'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart3, PieChart, TrendingUp, Users, Award } from 'lucide-react'

interface PollOption {
  id: string
  text: string
  votes: number
}

interface Poll {
  id: string
  title: string
  description?: string
  poll_options: PollOption[]
}

interface PollResultChartProps {
  poll: Poll
  hasVoted: boolean
  onVoteAgain?: () => void
}

export function PollResultChart({ poll, hasVoted, onVoteAgain }: PollResultChartProps) {
  const [viewMode, setViewMode] = useState<'bar' | 'pie'>('bar')
  
  const totalVotes = poll.poll_options.reduce((sum, option) => sum + option.votes, 0)
  const sortedOptions = [...poll.poll_options].sort((a, b) => b.votes - a.votes)
  const winningOption = sortedOptions[0]
  const isTie = sortedOptions.length > 1 && sortedOptions[0].votes === sortedOptions[1].votes

  const getPercentage = (votes: number) => {
    if (totalVotes === 0) return 0
    return Math.round((votes / totalVotes) * 100)
  }

  const getBarWidth = (votes: number) => {
    if (totalVotes === 0) return 0
    return Math.max((votes / totalVotes) * 100, 5) // Minimum 5% width for visibility
  }

  const getVoteColor = (index: number, votes: number) => {
    if (votes === 0) return 'bg-gray-200'
    
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-red-500'
    ]
    return colors[index % colors.length]
  }

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `${index + 1}.`
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-lg font-semibold">
          <BarChart3 className="h-5 w-5" />
          Poll Results
        </div>
        {hasVoted && (
          <Badge variant="secondary" className="text-sm">
            ✓ You have voted
          </Badge>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex flex-col items-center space-y-1">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div className="text-2xl font-bold">{totalVotes}</div>
              <div className="text-xs text-muted-foreground">Total Votes</div>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex flex-col items-center space-y-1">
              <Award className="h-5 w-5 text-muted-foreground" />
              <div className="text-2xl font-bold">{poll.poll_options.length}</div>
              <div className="text-xs text-muted-foreground">Options</div>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex flex-col items-center space-y-1">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <div className="text-2xl font-bold">
                {winningOption ? getPercentage(winningOption.votes) : 0}%
              </div>
              <div className="text-xs text-muted-foreground">Leading</div>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex flex-col items-center space-y-1">
              <div className="text-2xl">🎯</div>
              <div className="text-lg font-bold">
                {isTie ? 'Tie' : 'Winner'}
              </div>
              <div className="text-xs text-muted-foreground">
                {isTie ? 'Multiple' : 'Single'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-center">
        <div className="flex bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === 'bar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('bar')}
            className="text-xs"
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Bar Chart
          </Button>
          <Button
            variant={viewMode === 'pie' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('pie')}
            className="text-xs"
          >
            <PieChart className="h-4 w-4 mr-1" />
            Progress Bars
          </Button>
        </div>
      </div>

      {/* Results Display */}
      <div className="space-y-4">
        {sortedOptions.map((option, index) => {
          const percentage = getPercentage(option.votes)
          const isLeading = index === 0 && !isTie
          const isTied = isTie && option.votes === winningOption?.votes
          
          return (
            <Card key={option.id} className={`transition-all duration-200 ${
              isLeading ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-lg">{getRankIcon(index)}</div>
                    <div className="flex-1">
                      <div className="font-medium">{option.text}</div>
                      <div className="text-sm text-muted-foreground">
                        {option.votes} vote{option.votes !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{percentage}%</div>
                    {isLeading && <Badge variant="default" className="text-xs">🥇 Leading</Badge>}
                    {isTied && <Badge variant="secondary" className="text-xs">🤝 Tied</Badge>}
                  </div>
                </div>

                {viewMode === 'bar' ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>{percentage}%</span>
                      <span>100%</span>
                    </div>
                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getVoteColor(index, option.votes)} transition-all duration-500 ease-out`}
                        style={{ width: `${getBarWidth(option.votes)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <Progress value={percentage} className="h-3" />
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Summary */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <div className="text-lg font-semibold">Summary</div>
            <div className="text-sm text-muted-foreground">
              {totalVotes === 0 ? (
                "No votes yet. Be the first to vote!"
              ) : isTie ? (
                `It's a tie! Multiple options have ${winningOption?.votes} votes.`
              ) : (
                `"${winningOption?.text}" is leading with ${getPercentage(winningOption?.votes || 0)}% of the votes.`
              )}
            </div>
            {totalVotes > 0 && (
              <div className="text-xs text-muted-foreground">
                Poll has received {totalVotes} vote{totalVotes !== 1 ? 's' : ''} so far.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vote Again Button */}
      {hasVoted && onVoteAgain && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={onVoteAgain}
            className="font-aeonik"
          >
            Vote Again
          </Button>
        </div>
      )}
    </div>
  )
}
