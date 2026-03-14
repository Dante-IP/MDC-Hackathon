import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { fetchEmails } from '@/lib/gmail'
import { categorizeEmails } from '@/lib/ai'
import { setEmails, getEmails, getLastFetched } from '@/lib/store'

// GET /api/emails — return cached emails for the session user
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user?.email || session.user?.id || 'unknown'
  const emails = getEmails(userId)
  const lastFetched = getLastFetched(userId)

  return NextResponse.json({ emails, lastFetched })
}

// POST /api/emails — fetch from Gmail + categorize with AI
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user?.email || session.user?.id || 'unknown'

  try {
    // 1. Fetch emails from Gmail
    const rawEmails = await fetchEmails(session.accessToken, 100)

    if (rawEmails.length === 0) {
      return NextResponse.json({ emails: [], message: 'No emails found' })
    }

    // 2. Categorize with AI
    const categorized = await categorizeEmails(rawEmails)

    // 3. Store in memory
    setEmails(userId, categorized)

    return NextResponse.json({ emails: categorized, count: categorized.length })
  } catch (err: any) {
    console.error('Email fetch error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to fetch emails' },
      { status: 500 }
    )
  }
}
