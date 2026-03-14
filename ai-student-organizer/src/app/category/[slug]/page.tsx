'use client'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { CategorizedEmail, EmailCategory, CATEGORY_META } from '@/lib/types'
import Link from 'next/link'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function CategoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const category = decodeURIComponent(params.slug as string) as EmailCategory
  const meta = CATEGORY_META[category] || CATEGORY_META['Other']

  const [emails, setEmails] = useState<CategorizedEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    if (session) loadEmails()
  }, [session])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  async function loadEmails() {
    try {
      const res = await fetch('/api/emails')
      const data = await res.json()
      const filtered = (data.emails || []).filter(
        (e: CategorizedEmail) => e.category === category
      )
      setEmails(filtered)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function sendChat(e: React.FormEvent) {
    e.preventDefault()
    if (!chatInput.trim() || chatLoading) return

    const question = chatInput.trim()
    setChatInput('')
    setChatMessages((prev) => [...prev, { role: 'user', content: question }])
    setChatLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, category }),
      })
      const data = await res.json()
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer || data.error || 'No response.',
        },
      ])
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong. Please try again.' },
      ])
    } finally {
      setChatLoading(false)
      inputRef.current?.focus()
    }
  }

  const suggestions = [
    'What deadlines are coming up?',
    'Summarize all emails here',
    'Which ones need an application?',
    'Most important ones?',
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen bg-paper flex flex-col overflow-hidden">

      {/* Header */}
      <header className="border-b border-ink/8 bg-paper/90 backdrop-blur-sm z-30 shrink-0">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-muted hover:text-ink transition-colors text-sm"
          >
            ← Dashboard
          </Link>
          <div className="h-4 w-px bg-ink/10" />
          <span className="text-lg">{meta.icon}</span>
          <h1 className={`font-display font-bold text-lg ${meta.color}`}>
            {category}
          </h1>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${meta.bg} ${meta.color} border ${meta.border} font-medium ml-auto`}
          >
            {emails.length} email{emails.length !== 1 ? 's' : ''}
          </span>
        </div>
      </header>

      {/* Scrollable content area — emails + chat output */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 pb-52">

          {/* Email list */}
          {emails.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-ink/10 rounded-2xl">
              <div className="text-4xl mb-3">{meta.icon}</div>
              <p className="text-muted text-sm">No emails in this category yet.</p>
              <Link
                href="/dashboard"
                className="mt-4 inline-block text-sm text-accent hover:underline"
              >
                ← Back to dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {emails.map((email, i) => (
                <Link
                  key={email.id}
                  href={`/email/${email.id}`}
                  className={`block p-5 rounded-xl border ${meta.border} ${meta.bg} hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 animate-fade-up`}
                  style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}
                >
                  <div className="flex items-start justify-between gap-4 mb-1.5">
                    <h3 className="font-semibold text-ink text-sm leading-snug line-clamp-2">
                      {email.subject}
                    </h3>
                    <span className="text-xs text-muted shrink-0">
                      {new Date(email.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted mb-2 truncate">{email.sender}</p>
                  <p className="text-sm text-ink/70 leading-relaxed line-clamp-2">
                    {email.summary}
                  </p>
                </Link>
              ))}
            </div>
          )}

          {/* Chat messages — appear below emails */}
          {chatMessages.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-ink/8" />
                <span className="text-xs text-muted px-2">AI Chat</span>
                <div className="h-px flex-1 bg-ink/8" />
              </div>
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}
                  style={{ animationFillMode: 'both' }}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-accent text-white rounded-br-sm'
                        : `bg-paper border border-ink/10 text-ink rounded-bl-sm shadow-sm`
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-paper border border-ink/10 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center h-4">
                      <div
                        className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      />
                      <div
                        className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <div
                        className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Fixed bottom prompt bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
        {/* Gradient fade */}
        <div className="h-16 bg-gradient-to-t from-paper to-transparent" />

        {/* Prompt area */}
        <div className="bg-paper pb-6 pt-2 pointer-events-auto">
          <div className="max-w-3xl mx-auto px-6">

            {/* Suggestion chips — only before first message */}
            {chatMessages.length === 0 && (
              <div className="flex gap-2 mb-3 flex-wrap justify-center">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setChatInput(s)
                      inputRef.current?.focus()
                    }}
                    className="text-xs px-3 py-1.5 rounded-full bg-paper-warm border border-ink/10 text-muted hover:text-ink hover:border-ink/20 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input bar */}
            <form
              onSubmit={sendChat}
              className="flex items-center gap-3 bg-paper-warm border border-ink/15 rounded-2xl px-4 py-3 shadow-lg shadow-ink/8 focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/10 transition-all"
            >
              <input
                ref={inputRef}
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Ask about your ${category.toLowerCase()} emails…`}
                disabled={chatLoading}
                className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-muted/50 text-ink disabled:opacity-50"
              />
              {chatLoading ? (
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="w-8 h-8 bg-accent text-white rounded-xl flex items-center justify-center hover:bg-accent/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 text-sm font-bold hover:scale-105 active:scale-95"
                >
                  ↑
                </button>
              )}
            </form>

            <p className="text-center text-xs text-muted/40 mt-2">
              AI has context of all {emails.length} emails in this category
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}