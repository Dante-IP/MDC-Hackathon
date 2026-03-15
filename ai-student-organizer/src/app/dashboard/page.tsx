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

  useEffect(() => { if (status === 'unauthenticated') router.push('/') }, [status, router])
  useEffect(() => { if (session) loadCachedEmails() }, [session])

  async function loadCachedEmails() {
    setLoading(true)
    try {
      const res = await fetch('/api/emails')
      const data = await res.json()
      if (data.emails) { setEmails(data.emails); setLastFetched(data.lastFetched) }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function fetchAndCategorize() {
    setFetching(true); setError(null); setProgress('Connecting to Gmail...')
    try {
      setProgress('Fetching & categorizing with AI...')
      const res = await fetch('/api/emails', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch emails')
      setEmails(data.emails || []); setLastFetched(Date.now()); setProgress('')
    } catch (e: any) { setError(e.message); setProgress('') }
    finally { setFetching(false) }
  }

  const countByCategory = (cat: EmailCategory) => emails.filter((e) => e.category === cat).length
  const totalEmails = emails.length

  if (status === 'loading' || loading) {
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
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderRadius: 'var(--radius)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, boxShadow: '0 4px 16px var(--accent-glow)' }}>✉</div>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>InboxIQ</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>AI Gmail Organizer</div>
          </div>
        </div>

        {/* Smart Labels */}
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-dim)', padding: '0 4px' }}>Smart Labels</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {CATEGORIES.map((cat) => {
            const count = countByCategory(cat)
            return (
              <Link key={cat} href={`/category/${encodeURIComponent(cat)}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', color: 'var(--text-muted)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid transparent', transition: 'all 0.18s ease' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16, width: 20, textAlign: 'center' as const }}>{CATEGORY_META[cat].icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{cat}</span>
                </span>
                <span style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{count}</span>
              </Link>
            )
          })}
        </nav>

        {/* About */}
        <div style={{ padding: 16, borderRadius: 'var(--radius)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', marginBottom: 10 }}>About</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>University students miss internships, research, and campus resources because important emails get buried. InboxIQ surfaces what matters most.</p>
        </div>

        {/* Actions */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={fetchAndCategorize} disabled={fetching}
            style={{ width: '100%', border: 'none', background: 'linear-gradient(135deg, var(--accent), #c2185b)', color: 'white', padding: '11px 16px', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 700, cursor: fetching ? 'not-allowed' : 'pointer', opacity: fetching ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 20px var(--accent-glow)' }}>
            {fetching
              ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />{progress || 'Working…'}</>
              : <>{totalEmails > 0 ? '↻ Re-sync' : '✦ Fetch & Categorize'}</>}
          </button>
          <button onClick={() => signOut({ callbackUrl: '/' })}
            style={{ width: '100%', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', padding: '10px 16px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1200 }}>
        {/* Hero */}
        <section style={{ padding: '36px 40px', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 12px', borderRadius: 999, background: 'rgba(230,63,107,0.12)', border: '1px solid rgba(230,63,107,0.25)', color: 'var(--accent)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 16 }}>Hackathon MVP</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 42, fontWeight: 800, lineHeight: 1.08, color: 'var(--text)', maxWidth: 700 }}>Organize your inbox instantly</h2>
          <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.75, maxWidth: 600 }}>
            {totalEmails > 0
              ? `${totalEmails} emails sorted across ${CATEGORIES.length} smart labels. Click a category to explore.`
              : 'AI groups emails into useful labels — then helps you decide what deserves attention first.'}
          </p>

          {totalEmails > 0 && (
            <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {[
                { n: totalEmails, l: 'Emails scanned' },
                { n: CATEGORIES.length, l: 'Smart labels' },
                { n: emails.filter(e => e.category !== 'Other').length, l: 'Opportunities found' },
              ].map((s) => (
                <div key={s.l} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, textAlign: 'center' as const }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 36, fontWeight: 800, color: 'var(--blue)', lineHeight: 1 }}>{s.n}</div>
                  <div style={{ marginTop: 6, color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, letterSpacing: '0.04em' }}>{s.l}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {error && (
          <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 'var(--radius)', padding: '14px 18px', color: '#fca5a5', fontSize: 14 }}>⚠️ {error}</div>
        )}

        {totalEmails === 0 && !fetching && (
          <section style={{ padding: '60px 40px', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px dashed var(--border)', textAlign: 'center' as const }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>No emails loaded yet</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 400, margin: '0 auto' }}>Click "Fetch & Categorize" to connect your Gmail and let AI sort everything.</p>
          </section>
        )}

        {totalEmails > 0 && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Dashboard</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>Click a category to view emails, AI summaries, and a synthesis bar with citations.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(280px,1fr))', gap: 20 }}>
              {CATEGORIES.map((cat) => {
                const meta = CATEGORY_META[cat]
                const count = countByCategory(cat)
                const topEmail = emails.find((e) => e.category === cat)
                return (
                  <Link key={cat} href={`/category/${encodeURIComponent(cat)}`}
                    style={{ textDecoration: 'none', color: 'inherit', display: 'block', padding: '22px 24px', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)', transition: 'all 0.18s ease', position: 'relative', overflow: 'hidden' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{meta.icon}</div>
                      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 999, padding: '6px 12px', fontSize: 12, fontWeight: 600 }}>{count} email{count !== 1 ? 's' : ''}</div>
                    </div>
                    <h4 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: '16px 0 8px' }}>{cat}</h4>
                    <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>{meta.description}</p>
                    {topEmail && (
                      <div style={{ marginTop: 16, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 14 }}>
                        <div style={{ fontSize: 10, textTransform: 'uppercase' as const, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: 6 }}>Top pick</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{topEmail.subject}</div>
                        <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-muted)' }}>{topEmail.sender.split('<')[0].trim()}</div>
                      </div>
                    )}
                    <div style={{ marginTop: 14, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>
                      {topEmail?.summary || meta.description}
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}

        {lastFetched && (
          <p style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center' as const }}>Last synced: {new Date(lastFetched).toLocaleString()}</p>
        )}
      </main>
    </div>
  )
}