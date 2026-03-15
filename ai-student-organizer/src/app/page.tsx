'use client'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) router.push('/dashboard')
  }, [session, router])

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ width: 28, height: 28, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 48px', background: 'rgba(8,11,18,0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✉</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>InboxIQ</span>
        </div>
        <div style={{ display: 'flex', gap: 32 }}>
          {['How it works', 'Features'].map((l) => (
            <a key={l} href="#how" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: 14, fontWeight: 500 }}>{l}</a>
          ))}
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 999, padding: '6px 16px 6px 6px', marginBottom: 32 }}>
          <span style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, borderRadius: 999, padding: '4px 10px' }}>AI-Powered</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Built for university students →</span>
        </div>

        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(52px, 8vw, 88px)', fontWeight: 800, lineHeight: 1.0, color: 'var(--text)', marginBottom: 24, letterSpacing: '-0.02em' }}>
          Never miss an<br />
          <span style={{ background: 'linear-gradient(135deg, #e63f6b 0%, #ff8c42 50%, #e63f6b 100%)', backgroundSize: '200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'shimmer 4s linear infinite' }}>
            important email
          </span><br />
          again.
        </h1>

        <p style={{ fontSize: 18, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 520, marginBottom: 40 }}>
          InboxIQ connects to your Gmail, uses AI to sort every email into smart categories, and lets you ask questions across your entire inbox.
        </p>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 52, flexWrap: 'wrap' as const }}>
          <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--text)', color: '#080b12', border: 'none', fontSize: 15, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', padding: '14px 24px', borderRadius: 12, cursor: 'pointer', boxShadow: '0 4px 24px rgba(240,244,255,0.15)', transition: 'all 0.2s ease' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Connect Gmail
          </button>
          <a href="#how" style={{ display: 'inline-flex', alignItems: 'center', background: 'transparent', color: 'var(--text-muted)', textDecoration: 'none', fontSize: 15, fontWeight: 500, padding: '14px 20px', borderRadius: 12, border: '1px solid var(--border)' }}>
            See how it works
          </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 28, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 36px' }}>
          {[{ n: '7', l: 'Smart labels' }, { n: 'AI', l: 'Categorization' }, { n: 'Free', l: 'to use' }].map((s, i) => (
            <>
              {i > 0 && <div key={`div-${i}`} style={{ width: 1, height: 40, background: 'var(--border)' }} />}
              <div key={s.n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--blue)' }}>{s.n}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{s.l}</span>
              </div>
            </>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '100px 24px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--accent)', marginBottom: 14 }}>How it works</div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(30px,4vw,46px)', fontWeight: 800, color: 'var(--text)', marginBottom: 52, letterSpacing: '-0.02em' }}>Three steps to inbox clarity</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {[
            { num: '01', icon: '🔐', title: 'Connect Gmail', desc: 'Sign in with your Google account. InboxIQ reads your emails securely using the official Gmail API — read-only access, no sending.' },
            { num: '02', icon: '🤖', title: 'AI organizes everything', desc: 'Gemini reads each email and sorts it into Career, Research, Opportunities, Events, and more — with a summary for each.' },
            { num: '03', icon: '💬', title: 'Chat with your inbox', desc: 'Ask questions like "Which deadline is most urgent?" or "Summarize my career emails." AI answers using your actual emails.' },
          ].map((step) => (
            <div key={step.num} style={{ background: 'rgba(14,20,32,0.8)', border: '1px solid var(--border)', borderRadius: 20, padding: 28 }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, color: 'rgba(230,63,107,0.5)', letterSpacing: '0.06em', marginBottom: 16 }}>{step.num}</div>
              <div style={{ fontSize: 28, marginBottom: 14 }}>{step.icon}</div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>{step.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--accent)', marginBottom: 14 }}>Features</div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(30px,4vw,46px)', fontWeight: 800, color: 'var(--text)', marginBottom: 52, letterSpacing: '-0.02em' }}>Everything students need</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[
            { icon: '📂', title: 'Smart categorization', desc: 'AI groups emails into 7 categories by understanding content and intent — not just keywords.', wide: true },
            { icon: '📝', title: 'AI summaries', desc: 'Each email gets a one-sentence summary so you can scan a full category in seconds.', wide: false },
            { icon: '💬', title: 'Chat synthesis', desc: 'Ask questions about your inbox. AI answers using your actual emails as context.', wide: false },
            { icon: '🔗', title: 'Cited answers', desc: 'Every AI response links back to the exact emails it used — full transparency.', wide: false },
            { icon: '🔒', title: 'Read-only Gmail access', desc: 'InboxIQ never sends emails or modifies your inbox. Uses Google\'s official OAuth with read-only scope.', wide: true },
          ].map((f) => (
            <div key={f.title} style={{ background: 'rgba(14,20,32,0.8)', border: '1px solid var(--border)', borderRadius: 20, padding: 28, gridColumn: f.wide ? 'span 2' : 'span 1' }}>
              <div style={{ fontSize: 26, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '80px 24px 100px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>Stop missing what matters.</h2>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 32 }}>Connect your Gmail and let AI do the sorting.</p>
        <button
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--text)', color: '#080b12', border: 'none', fontSize: 16, fontWeight: 700, padding: '16px 28px', borderRadius: 12, cursor: 'pointer' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Connect Gmail — it's free
        </button>
      </section>

      <footer style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: 24, borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--text-dim)' }}>
        © 2026 InboxIQ · Hackathon Project · Read-only Gmail access
      </footer>
    </div>
  )
}