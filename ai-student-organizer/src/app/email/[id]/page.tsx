'use client'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CategorizedEmail, CATEGORY_META } from '@/lib/types'
import Link from 'next/link'

export default function EmailDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const emailId = params.id as string

  const [email, setEmail] = useState<CategorizedEmail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    if (session) loadEmail()
  }, [session])

  async function loadEmail() {
    try {
      const res = await fetch('/api/emails')
      const data = await res.json()
      const found = (data.emails || []).find((e: CategorizedEmail) => e.id === emailId)
      setEmail(found || null)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted mb-4">Email not found.</p>
          <Link href="/dashboard" className="text-accent hover:underline text-sm">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  const meta = CATEGORY_META[email.category]

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="border-b border-ink/8 bg-paper/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link
            href={`/category/${encodeURIComponent(email.category)}`}
            className="text-muted hover:text-ink transition-colors text-sm"
          >
            ← {email.category}
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Category Badge */}
        <div className="mb-6 animate-fade-up">
          <span
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${meta.bg} ${meta.color} border ${meta.border} font-medium`}
          >
            {meta.icon} {email.category}
          </span>
        </div>

        {/* Email Header */}
        <div className="mb-8 animate-fade-up" style={{ animationDelay: '60ms', animationFillMode: 'both' }}>
          <h1 className="font-display text-3xl font-bold text-ink leading-tight mb-4">
            {email.subject}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-ink/70">From:</span>
              <span>{email.sender}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-ink/70">Date:</span>
              <span>{new Date(email.date).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* AI Summary Card */}
        <div
          className={`p-5 rounded-2xl border ${meta.border} ${meta.bg} mb-8 animate-fade-up`}
          style={{ animationDelay: '120ms', animationFillMode: 'both' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">✨</span>
            <span className={`text-xs font-semibold uppercase tracking-wide ${meta.color}`}>
              AI Summary
            </span>
          </div>
          <p className="text-sm text-ink/80 leading-relaxed">{email.summary}</p>
        </div>

        {/* Full Email Body */}
        <div
          className="animate-fade-up"
          style={{ animationDelay: '180ms', animationFillMode: 'both' }}
        >
          <h2 className="font-display text-lg font-semibold text-ink mb-4">
            Full Email
          </h2>
          <div className="bg-paper-warm border border-ink/8 rounded-2xl p-6">
            {email.body ? (
              <pre className="font-body text-sm text-ink/80 leading-relaxed whitespace-pre-wrap break-words">
                {email.body}
              </pre>
            ) : (
              <div>
                <p className="text-sm text-ink/80 leading-relaxed mb-4">{email.snippet}</p>
                <p className="text-xs text-muted italic">
                  (Full email body not available — showing snippet)
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
