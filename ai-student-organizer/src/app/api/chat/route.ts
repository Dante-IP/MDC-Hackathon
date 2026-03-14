import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getEmails } from '@/lib/store'
import { chatWithEmails } from '@/lib/ai'
import { EmailCategory } from '@/lib/types'

// POST /api/chat
// Body: { question: string, category?: string }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user?.email || session.user?.id || 'unknown'
  const { question, category } = await req.json()

  if (!question?.trim()) {
    return NextResponse.json({ error: 'Question is required' }, { status: 400 })
  }

  const allEmails = getEmails(userId)
  if (allEmails.length === 0) {
    return NextResponse.json({
      answer: "I don't have any emails loaded yet. Please fetch your emails first.",
    })
  }

  // Filter to category if provided
  const emails = category
    ? allEmails.filter((e) => e.category === (category as EmailCategory))
    : allEmails

  try {
    const answer = await chatWithEmails(question, emails)
    return NextResponse.json({ answer })
  } catch (err: any) {
    console.error('Chat error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to generate response' },
      { status: 500 }
    )
  }
}
