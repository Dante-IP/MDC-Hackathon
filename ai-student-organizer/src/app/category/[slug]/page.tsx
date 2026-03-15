'use client'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { CategorizedEmail, EmailCategory, CATEGORIES, CATEGORY_META } from '@/lib/types'
import Link from 'next/link'

interface ChatMessage { role: 'user' | 'assistant'; content: string }

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
  const [panelVisible, setPanelVisible] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (status === 'unauthenticated') router.push('/') }, [status, router])
  useEffect(() => { if (session) loadEmails() }, [session])
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages])

  async function loadEmails() {
    try {
      const res = await fetch('/api/emails')
      const data = await res.json()
      setEmails((data.emails || []).filter((e: CategorizedEmail) => e.category === category))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function sendChat(e: React.FormEvent) {
    e.preventDefault()
    if (!chatInput.trim() || chatLoading) return
    const question = chatInput.trim()
    setChatInput('')
    setChatMessages((prev) => [...prev, { role: 'user', content: question }])
    setChatLoading(true)
    setPanelVisible(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, category }),
      })
      const data = await res.json()
      setChatMessages((prev) => [...prev, { role: 'assistant', content: data.answer || data.error || 'No response.' }])
    } catch {
      setChatMessages((prev) => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setChatLoading(false)
      inputRef.current?.focus()
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ width: 28, height: 28, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'grid', gridTemplateColumns: '280px 1fr' }}>

      {/* Sidebar */}
      <aside style={{ position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: 20, borderRight: '1px solid var(--border)', background: 'rgba(8,11,18,0.7)', backdropFilter: 'blur(20px)' }}>
        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', width: 'fit-content', transition: 'all 0.2s' }}>
          ← Dashboard
        </Link>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, borderRadius: 'var(--radius)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, boxShadow: '0 4px 16px var(--accent-glow)' }}>{meta.icon}</div>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{category}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.4 }}>{meta.description}</div>
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-dim)', padding: '0 4px' }}>Other Labels</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {CATEGORIES.map((cat) => (
            <Link key={cat} href={`/category/${encodeURIComponent(cat)}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: `1px solid ${cat === category ? 'var(--border-hover)' : 'transparent'}`, background: cat === category ? 'var(--surface-3)' : 'transparent', color: cat === category ? 'var(--text)' : 'var(--text-muted)', transition: 'all 0.18s ease' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16, width: 20, textAlign: 'center' as const }}>{CATEGORY_META[cat].icon}</span>
                <span style={{ fontSize: 14, fontWeight: cat === category ? 600 : 500 }}>{cat}</span>
              </span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main — scrollable, padded for floating bar */}
      <main style={{ padding: 32, paddingBottom: 120, display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1200 }}>
        {/* Hero */}
        <section style={{ padding: '28px 32px', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'inline-flex', padding: '5px 12px', borderRadius: 999, background: 'rgba(230,63,107,0.12)', border: '1px solid rgba(230,63,107,0.25)', color: 'var(--accent)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 16 }}>Category View</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 800, lineHeight: 1.08, color: 'var(--text)' }}>{category} Inbox</h2>
          <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.75 }}>
            {emails.length} email{emails.length !== 1 ? 's' : ''} sorted. Click any to open the full message.
          </p>
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Emails</h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>Click to open the full message.</p>
        </div>

        {emails.length === 0 ? (
          <div style={{ padding: '60px 40px', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px dashed var(--border)', textAlign: 'center' as const }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{meta.icon}</div>
            <p style={{ color: 'var(--text-muted)' }}>No emails in this category yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {emails.map((email) => (
              <Link key={email.id} href={`/email/${email.id}`}
                style={{ textDecoration: 'none', color: 'inherit', display: 'block', padding: '20px 24px', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)', transition: 'all 0.18s ease' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{email.sender.split('<')[0].trim()}</div>
                    <div style={{ marginTop: 3, color: 'var(--text-muted)', fontSize: 12 }}>{email.sender.match(/<(.+)>/)?.[1] || ''}</div>
                  </div>
                  <div style={{ color: 'var(--text-dim)', fontSize: 12, whiteSpace: 'nowrap' as const }}>{new Date(email.date).toLocaleDateString()}</div>
                </div>
                <div style={{ marginTop: 14, fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, lineHeight: 1.3, color: 'var(--text)' }}>{email.subject}</div>
                <div style={{ marginTop: 8, color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 14 }}>{email.summary}</div>
                <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', gap: 10, color: 'var(--text-dim)', fontSize: 13 }}>
                  <span>{new Date(email.date).toLocaleDateString()}</span>
                  <span style={{ color: 'var(--blue)', fontWeight: 600 }}>Open original →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Floating chat */}
      <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', width: 'min(680px, calc(100vw - 48px))', display: 'flex', flexDirection: 'column', gap: 10, zIndex: 200, pointerEvents: 'none' }}>

        {/* Response panel */}
        {panelVisible && (
          <div style={{ pointerEvents: 'all', background: 'rgba(14,20,32,0.96)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, backdropFilter: 'blur(24px)', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--accent)' }}>✦ AI Response</span>
              <button onClick={() => { setPanelVisible(false); setChatMessages([]) }}
                style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div style={{ padding: '16px 18px 18px', maxHeight: 300, overflowY: 'auto' }}>
              {chatLoading && (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '8px 0' }}>
                  {[0, 0.2, 0.4].map((d, i) => (
                    <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'block', animation: `chatdot 1.2s ${d}s ease-in-out infinite` }} />
                  ))}
                </div>
              )}
              {chatMessages.filter(m => m.role === 'assistant').slice(-1).map((msg, i) => (
                <p key={i} style={{ fontSize: 14, color: '#c8d0e8', lineHeight: 1.75, whiteSpace: 'pre-line' as const, margin: 0 }}>{msg.content}</p>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}

        {/* Search bar */}
        <form onSubmit={sendChat}
          style={{ pointerEvents: 'all', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(20,26,40,0.92)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: '12px 16px', backdropFilter: 'blur(24px)', boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}>
          <span style={{ fontSize: 14, color: 'var(--accent)', flexShrink: 0 }}>✦</span>
          <input
            ref={inputRef}
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={`Ask anything about your ${category} emails…`}
            disabled={chatLoading}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}
          />
          <button type="submit" disabled={!chatInput.trim() || chatLoading}
            style={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', border: 'none', background: chatInput.trim() && !chatLoading ? 'var(--accent)' : 'var(--surface-3)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: chatInput.trim() && !chatLoading ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3L13 8L8 13M3 8H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}