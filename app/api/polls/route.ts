import { NextResponse } from 'next/server'
import { getPolls } from '@/lib/actions'

export async function GET() {
  try {
    const result = await getPolls()
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch polls' },
        { status: 500 }
      )
    }

    return NextResponse.json({ polls: result.polls })
  } catch (error) {
    console.error('Error in polls API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
