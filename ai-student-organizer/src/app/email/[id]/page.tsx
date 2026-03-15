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

  useEffect(() => { if (status === 'unauthenticated') router.push('/') }, [status, router])
  useEffect(() => { if (session) loadEmail() }, [session])

  async function loadEmail() {
    try {
      const res = await fetch('/api/emails')
      const data = await res.json()
      setEmail((data.emails || []).find((e: CategorizedEmail) => e.id === emailId) || null)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ width: 28, height: 28, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  if (!email) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 1 }}>
        <p style={{ color: 'var(--text-muted)' }}>Email not found.</p>
        <Link href="/dashboard" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 600 }}>← Back to dashboard</Link>
      </div>
    )
  }

  const meta = CATEGORY_META[email.category]

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'grid', gridTemplateColumns: '280px 1fr' }}>

      {/* Sidebar */}
      <aside style={{ position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: 20, borderRight: '1px solid var(--border)', background: 'rgba(8,11,18,0.7)', backdropFilter: 'blur(20px)' }}>
        <Link href={`/category/${encodeURIComponent(email.category)}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', width: 'fit-content' }}>
          ← {email.category}
        </Link>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, borderRadius: 'var(--radius)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, boxShadow: '0 4px 16px var(--accent-glow)' }}>📩</div>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>Email Detail</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Open the highest-value messages faster.</div>
          </div>
        </div>

        {[
          { label: 'Category', value: `${meta.icon} ${email.category}` },
          { label: 'Received', value: new Date(email.date).toLocaleString() },
        ].map((item) => (
          <div key={item.label} style={{ padding: 16, borderRadius: 'var(--radius)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', marginBottom: 8 }}>{item.label}</div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{item.value}</p>
          </div>
        ))}

        {/* AI Summary */}
        <div style={{ padding: 16, borderRadius: 'var(--radius)', background: 'var(--surface-2)', border: '1px solid rgba(74,140,255,0.18)' }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontWeight: 700, color: 'var(--blue)', marginBottom: 10 }}>✦ AI Summary</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.75, margin: 0 }}>{email.summary}</p>
        </div>
      </aside>

      {/* Main */}
      <main style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1200 }}>
        {/* Hero */}
        <section style={{ padding: '28px 32px', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'inline-flex', padding: '5px 12px', borderRadius: 999, background: 'rgba(230,63,107,0.12)', border: '1px solid rgba(230,63,107,0.25)', color: 'var(--accent)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 16 }}>Original Message</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 800, lineHeight: 1.08, color: 'var(--text)', maxWidth: 700 }}>{email.subject}</h2>
          <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.75 }}>
            From {email.sender.split('<')[0].trim()} · {email.sender.match(/<(.+)>/)?.[1] || ''}
          </p>
        </section>

        {/* Full email */}
        <section style={{ padding: 28, borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 22, paddingBottom: 22, borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{email.sender.split('<')[0].trim()}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{email.sender.match(/<(.+)>/)?.[1] || email.sender}</div>
            </div>
            <div style={{ color: 'var(--text-dim)', fontSize: 12, whiteSpace: 'nowrap' as const, marginTop: 4 }}>{new Date(email.date).toLocaleString()}</div>
          </div>

          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 22, lineHeight: 1.85, color: 'var(--text-muted)', fontSize: 15 }}>
            {email.body ? (
              <pre style={{ fontFamily: 'inherit', margin: 0, whiteSpace: 'pre-wrap' as const, wordBreak: 'break-word' as const }}>{email.body}</pre>
            ) : (
              <>
                <p style={{ margin: 0 }}>{email.snippet}</p>
                <p style={{ marginTop: 12, color: 'var(--text-dim)', fontSize: 13, fontStyle: 'italic' }}>(Full email body not available — showing snippet)</p>
              </>
            )}
          </div>

          <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
            {[email.category, 'Original Email', 'Student Inbox'].map((tag) => (
              <span key={tag} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 500 }}>{tag}</span>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}