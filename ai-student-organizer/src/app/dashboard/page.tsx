'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CategorizedEmail, EmailCategory, CATEGORIES, CATEGORY_META } from '@/lib/types'
import Link from 'next/link'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [emails, setEmails] = useState<CategorizedEmail[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [lastFetched, setLastFetched] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    if (session) loadCachedEmails()
  }, [session])

  async function loadCachedEmails() {
    setLoading(true)
    try {
      const res = await fetch('/api/emails')
      const data = await res.json()
      if (data.emails) {
        setEmails(data.emails)
        setLastFetched(data.lastFetched)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function fetchAndCategorize() {
    setFetching(true)
    setError(null)
    setProgress('Connecting to Gmail...')
    try {
      setProgress('Fetching emails...')
      const res = await fetch('/api/emails', { method: 'POST' })
      setProgress('AI is categorizing...')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch emails')
      setEmails(data.emails || [])
      setLastFetched(Date.now())
      setProgress('')
    } catch (e: any) {
      setError(e.message)
      setProgress('')
    } finally {
      setFetching(false)
    }
  }

  const countByCategory = (cat: EmailCategory) =>
    emails.filter((e) => e.category === cat).length

  const totalEmails = emails.length

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted text-sm">Loading your inbox…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Top Nav */}
      <nav className="border-b border-ink/8 bg-paper/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📬</span>
            <span className="font-display font-bold text-lg text-ink">InboxIQ</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted hidden sm:block">
              {session?.user?.email}
            </span>
            <img
              src={session?.user?.image || ''}
              alt="avatar"
              className="w-7 h-7 rounded-full border border-ink/10"
            />
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm text-muted hover:text-ink transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="font-display text-4xl font-bold text-ink mb-1">
              Your Inbox
            </h1>
            <p className="text-muted text-sm">
              {totalEmails > 0
                ? `${totalEmails} emails sorted across ${CATEGORIES.length} categories`
                : 'Connect your Gmail to get started'}
            </p>
            {lastFetched && (
              <p className="text-xs text-muted/70 mt-1">
                Last synced: {new Date(lastFetched).toLocaleString()}
              </p>
            )}
          </div>

          <button
            onClick={fetchAndCategorize}
            disabled={fetching}
            className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-accent/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-accent/25 hover:scale-105 active:scale-95"
          >
            {fetching ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {progress || 'Working…'}
              </>
            ) : (
              <>
                <span>↻</span>
                {totalEmails > 0 ? 'Re-sync Emails' : 'Fetch & Categorize Emails'}
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Empty state */}
        {totalEmails === 0 && !fetching && (
          <div className="text-center py-20 border-2 border-dashed border-ink/10 rounded-2xl">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="font-display text-xl font-semibold text-ink mb-2">
              No emails loaded yet
            </h3>
            <p className="text-muted text-sm mb-6">
              Click "Fetch & Categorize Emails" to connect your Gmail and let AI organize everything.
            </p>
          </div>
        )}

        {/* Category Cards Grid */}
        {totalEmails > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((cat, i) => {
              const meta = CATEGORY_META[cat]
              const count = countByCategory(cat)
              return (
                <Link
                  key={cat}
                  href={`/category/${encodeURIComponent(cat)}`}
                  className={`group relative p-6 rounded-2xl border ${meta.border} ${meta.bg} hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer animate-fade-up`}
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl">{meta.icon}</span>
                    <span
                      className={`text-3xl font-display font-bold ${meta.color}`}
                    >
                      {count}
                    </span>
                  </div>
                  <h3 className={`font-semibold text-base ${meta.color} mb-1`}>{cat}</h3>
                  <p className="text-xs text-muted leading-relaxed">{meta.description}</p>
                  <div className={`mt-4 text-xs font-medium ${meta.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    View all →
                  </div>
                  {count === 0 && (
                    <div className="absolute inset-0 rounded-2xl bg-paper/50 flex items-center justify-center">
                      <span className="text-xs text-muted">No emails</span>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}

        {/* Recent Activity strip */}
        {totalEmails > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-xl font-semibold text-ink mb-4">
              Recent Emails
            </h2>
            <div className="space-y-2">
              {emails.slice(0, 5).map((email) => {
                const meta = CATEGORY_META[email.category]
                return (
                  <Link
                    key={email.id}
                    href={`/email/${email.id}`}
                    className="flex items-center gap-4 p-4 bg-paper-warm border border-ink/6 rounded-xl hover:border-ink/15 hover:shadow-sm transition-all group"
                  >
                    <span className="text-xl shrink-0">{meta.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-ink truncate">
                          {email.subject}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${meta.bg} ${meta.color} border ${meta.border} shrink-0`}>
                          {email.category}
                        </span>
                      </div>
                      <p className="text-xs text-muted truncate">{email.summary}</p>
                    </div>
                    <span className="text-xs text-muted shrink-0 hidden sm:block">
                      {new Date(email.date).toLocaleDateString()}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
