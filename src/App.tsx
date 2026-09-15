import { useState, useEffect, useRef, type KeyboardEvent, type ChangeEvent } from 'react'

type Theme  = 'dark' | 'light' | 'system'
type View   = 'auth-email' | 'auth-otp' | 'chat' | 'settings'
type SettingsSection = 'account' | 'appearance' | 'language' | 'ai' | 'personality' | 'chat' | 'privacy'
type Personality     = 'serious' | 'friendly' | 'funny' | 'formal' | 'concise' | 'detailed' | 'technical' | 'custom'
type AIMode          = 'general' | 'code' | 'research' | 'creative' | 'reasoning'
type Message         = { id: string; role: 'user' | 'assistant'; content: string; pending?: boolean }

// ── Icons ──────────────────────────────────────────────────────────────────────
const I = {
  Plus:         () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 2v11M2 7.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  Send:         () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M13 2L6.5 8.5M13 2L9 13 6.5 8.5 2 5.5 13 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Settings:     () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="2.2" stroke="currentColor" strokeWidth="1.4"/><path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M3 3l1 1M11 11l1 1M3 12l1-1M11 4l1-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Menu:         () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 4h11M2 7.5h11M2 11h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  ChevLeft:     () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M9.5 3.5L5.5 7.5L9.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ChevDown:     () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Sun:          () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="2.8" stroke="currentColor" strokeWidth="1.4"/><path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M2.93 2.93l1.06 1.06M11.01 11.01l1.06 1.06M2.93 12.07l1.06-1.06M11.01 3.99l1.06-1.06" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Moon:         () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M12.5 9.5A5.5 5.5 0 015.5 2.5a5.5 5.5 0 100 10 5.5 5.5 0 007-3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  Monitor:      () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="2" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 13h5M7.5 11v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Mic:          () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="4.5" y="1" width="6" height="8" rx="3" stroke="currentColor" strokeWidth="1.4"/><path d="M2 8a5.5 5.5 0 0011 0M7.5 13.5v1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Clip:         () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M13 7L7.5 12.5a4 4 0 01-5.66-5.66L7.5 1.17a2.5 2.5 0 013.54 3.54L5.38 10.37a1 1 0 01-1.41-1.41L9.5 3.43" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Check:        () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5L5 9.5L11 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Mail:         () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="3" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M1 4.5l6.5 4.5L14 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ArrowRight:   () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 7.5h9M8.5 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  User:         () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="5" r="2.8" stroke="currentColor" strokeWidth="1.4"/><path d="M2 13.5c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Globe:        () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.4"/><path d="M7.5 2c-1.5 1.8-2 3.6-2 5.5s.5 3.7 2 5.5M7.5 2c1.5 1.8 2 3.6 2 5.5s-.5 3.7-2 5.5M2 7.5h11" stroke="currentColor" strokeWidth="1.4"/></svg>,
  Brain:        () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 13.5C7.5 13.5 2 11 2 6.5a3.5 3.5 0 017.5-.5 3.5 3.5 0 017.5.5c0 4.5-5.5 7-7.5 7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M7.5 6V3.5M5 7H3M10 7h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Lock:         () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="2.5" y="6.5" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M4.5 6.5V4.5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Msg:          () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M13 1.5H2a1 1 0 00-1 1v8a1 1 0 001 1h3l2.5 2.5L10 11.5h3a1 1 0 001-1v-8a1 1 0 00-1-1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  History:      () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 4V7.5L10 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M1.5 7.5a6 6 0 1012 0 6 6 0 00-12 0z" stroke="currentColor" strokeWidth="1.4"/></svg>,
}

// ── Wordmark ───────────────────────────────────────────────────────────────────
function Logo({ size = 16 }: { size?: number }) {
  return (
    <span style={{ fontSize: size, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1 }}>
      <span style={{ color: 'var(--accent)' }}>X</span>
      <span style={{ color: 'var(--text)' }}>OVA AI</span>
    </span>
  )
}

// ── Toggle switch ──────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <div className="toggle-track" />
      <div className="toggle-thumb" />
    </label>
  )
}

// ── OTP Screen ─────────────────────────────────────────────────────────────────
function OTPScreen({ email, onBack, onVerified }: { email: string; onBack: () => void; onVerified: () => void }) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resent, setResent] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null))

  useEffect(() => {
    refs[0].current?.focus()
    const id = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 0), 1000)
    return () => clearInterval(id)
  }, [])

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[i] = digit
    setOtp(next)
    setError('')
    if (digit && i < 5) refs[i + 1].current?.focus()
  }

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      refs[i - 1].current?.focus()
    }
    if (e.key === 'ArrowLeft' && i > 0) refs[i - 1].current?.focus()
    if (e.key === 'ArrowRight' && i < 5) refs[i + 1].current?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('')
    const next = ['', '', '', '', '', '']
    digits.forEach((d, i) => { next[i] = d })
    setOtp(next)
    refs[Math.min(digits.length, 5)].current?.focus()
  }

  const verify = () => {
    const code = otp.join('')
    if (code.length < 6) { setError('Please enter all 6 digits.'); return }
    setLoading(true)
    setTimeout(() => { setLoading(false); onVerified() }, 1200)
  }

  const resend = () => {
    if (countdown > 0) return
    setResent(true)
    setCountdown(30)
    setOtp(['', '', '', '', '', ''])
    refs[0].current?.focus()
    setTimeout(() => setResent(false), 3000)
  }

  const filled = otp.filter(Boolean).length

  return (
    <div className="auth-bg t">
      <div className="auth-grid" />
      <div className="auth-glow" />
      <div className="auth-card t">
        <div className="auth-logo">
          <div className="auth-wordmark"><span className="ax">X</span>OVA AI</div>
          <div className="auth-tagline">Verify your identity</div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--accent-dim)', border: '1px solid rgba(124,111,245,0.25)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent2)', marginBottom: 14 }}>
            <I.Mail />
          </div>
          <h2 className="auth-heading" style={{ textAlign: 'center' }}>Check your email</h2>
          <p className="auth-sub" style={{ textAlign: 'center', margin: '6px 0 0' }}>
            We sent a 6-digit code to<br />
            <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{email}</strong>
          </p>
        </div>

        <div className="otp-row" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={refs[i]}
              className={`otp-cell ${digit ? 'filled' : ''} ${error ? 'error' : ''}`}
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={digit}
              placeholder="·"
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              autoComplete="one-time-code"
            />
          ))}
        </div>

        {error && (
          <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--destructive)', marginTop: -16, marginBottom: 14 }}>
            {error}
          </div>
        )}

        {resent && (
          <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--success)', marginTop: -12, marginBottom: 14 }}>
            Code resent successfully.
          </div>
        )}

        <button className="btn btn-primary btn-full" onClick={verify} disabled={loading || filled < 6}>
          {loading ? <span className="spinner" /> : 'Verify & Continue'}
        </button>

        <div className="auth-footer-text">
          {countdown > 0
            ? <>Resend code in <span style={{ color: 'var(--text2)', fontVariantNumeric: 'tabular-nums' }}>{countdown}s</span></>
            : <>Didn&apos;t get it? <span className="auth-link" onClick={resend}>Resend code</span></>
          }
          <br />
          <span className="auth-link" onClick={onBack} style={{ marginTop: 6, display: 'inline-block' }}>
            ← Use a different email
          </span>
        </div>
      </div>
      <div className="page-footer">by Begad</div>
    </div>
  )
}

// ── Email Screen ───────────────────────────────────────────────────────────────
function EmailScreen({ onNext, theme, toggleTheme }: { onNext: (email: string) => void; theme: Theme; toggleTheme: () => void }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const isDark = theme !== 'light'

  const submit = () => {
    const e = email.trim()
    if (!e) { setError('Email is required.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { setError('Enter a valid email address.'); return }
    setError('')
    setLoading(true)
    setTimeout(() => { setLoading(false); onNext(e) }, 900)
  }

  return (
    <div className="auth-bg t">
      <div className="auth-grid" />
      <div className="auth-glow" />

      <button className="btn-icon t" style={{ position: 'absolute', top: 18, right: 18 }} onClick={toggleTheme} aria-label="Toggle theme">
        {isDark ? <I.Sun /> : <I.Moon />}
      </button>

      <div className="auth-card t">
        <div className="auth-logo">
          <div className="auth-wordmark"><span className="ax">X</span>OVA AI</div>
          <div className="auth-tagline">Your intelligent companion</div>
        </div>

        <h2 className="auth-heading">Welcome</h2>
        <p className="auth-sub">Enter your email to sign in or create an account.</p>

        <div className="field">
          <label className="field-label">Email address</label>
          <input
            className={`field-input ${error ? 'error' : ''}`}
            type="email"
            placeholder="you@example.com"
            value={email}
            autoFocus
            onChange={e => { setEmail(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
          {error && <div className="field-error">{error}</div>}
        </div>

        <button className="btn btn-primary btn-full" onClick={submit} disabled={loading}>
          {loading ? <span className="spinner" /> : <><span>Continue</span><I.ArrowRight /></>}
        </button>

        <div className="divider">or</div>

        <button className="btn btn-surface btn-full" style={{ gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M15.68 8.18c0-.57-.05-1.12-.14-1.64H8v3.1h4.3a3.67 3.67 0 01-1.59 2.41v2h2.57c1.5-1.38 2.4-3.42 2.4-5.87z" fill="#4285F4"/>
            <path d="M8 16c2.16 0 3.97-.72 5.28-1.94l-2.57-2a4.85 4.85 0 01-7.24-2.55H.84v2.07A8 8 0 008 16z" fill="#34A853"/>
            <path d="M3.47 9.51A4.82 4.82 0 013.22 8c0-.52.09-1.03.25-1.51V4.42H.84A8 8 0 000 8c0 1.3.31 2.52.84 3.58l2.63-2.07z" fill="#FBBC05"/>
            <path d="M8 3.18c1.22 0 2.31.42 3.17 1.24l2.37-2.37A8 8 0 00.84 4.42l2.63 2.07A4.77 4.77 0 018 3.18z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-footer-text">
          By continuing, you agree to our{' '}
          <a href="#" className="auth-link">Terms</a> and{' '}
          <a href="#" className="auth-link">Privacy Policy</a>.
        </div>
      </div>
      <div className="page-footer">by Begad</div>
    </div>
  )
}

// ── Settings content ───────────────────────────────────────────────────────────
function SettingsContent({ section, theme, setTheme, personality, setPersonality, aiMode, setAIMode }: {
  section: SettingsSection
  theme: Theme; setTheme: (t: Theme) => void
  personality: Personality; setPersonality: (p: Personality) => void
  aiMode: AIMode; setAIMode: (m: AIMode) => void
}) {
  const [tg, setTg] = useState({ stream: true, md: true, sound: false, suggest: true, history: true, analytics: false, errors: true })
  const tog = (k: keyof typeof tg) => setTg(p => ({ ...p, [k]: !p[k] }))

  const personalities: { id: Personality; name: string; desc: string }[] = [
    { id: 'friendly',  name: 'Friendly',  desc: 'Warm and approachable' },
    { id: 'serious',   name: 'Serious',   desc: 'Professional tone' },
    { id: 'funny',     name: 'Funny',     desc: 'Light and playful' },
    { id: 'formal',    name: 'Formal',    desc: 'Structured language' },
    { id: 'concise',   name: 'Concise',   desc: 'Short answers' },
    { id: 'detailed',  name: 'Detailed',  desc: 'In-depth responses' },
    { id: 'technical', name: 'Technical', desc: 'Precise and exact' },
    { id: 'custom',    name: 'Custom',    desc: 'Define your own style' },
  ]

  const modes: { id: AIMode; icon: string; name: string; desc: string }[] = [
    { id: 'general',   icon: '✦', name: 'General',   desc: 'All-purpose assistant' },
    { id: 'code',      icon: '⌥', name: 'Code',      desc: 'Programming & debugging' },
    { id: 'research',  icon: '⊕', name: 'Research',  desc: 'Deep analysis & sources' },
    { id: 'creative',  icon: '◎', name: 'Creative',  desc: 'Writing & ideation' },
    { id: 'reasoning', icon: '◈', name: 'Reasoning', desc: 'Step-by-step logic' },
  ]

  if (section === 'account') return (
    <div>
      <h2 className="s-title">Account</h2>
      <p className="s-desc">Manage your profile information.</p>
      <div className="s-field">
        <label className="s-label">Display Name</label>
        <input className="s-input" type="text" placeholder="Your name" />
      </div>
      <div className="s-field">
        <label className="s-label">Email Address</label>
        <input className="s-input" type="email" placeholder="you@example.com" />
      </div>
      <div className="s-divider" />
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-primary" style={{ fontSize: 13, padding: '9px 18px' }}>Save Changes</button>
        <button className="btn btn-ghost" style={{ fontSize: 13, color: 'var(--destructive)' }}>Delete Account</button>
      </div>
    </div>
  )

  if (section === 'appearance') return (
    <div>
      <h2 className="s-title">Appearance</h2>
      <p className="s-desc">Choose how XOVA AI looks for you.</p>
      <div className="s-field">
        <label className="s-label" style={{ marginBottom: 10 }}>Theme</label>
        <div className="theme-cards">
          {([
            { id: 'dark' as Theme, label: 'Dark', type: 'dark' },
            { id: 'light' as Theme, label: 'Light', type: 'light' },
            { id: 'system' as Theme, label: 'System', type: 'split' },
          ]).map(opt => (
            <div key={opt.id} className={`theme-card ${theme === opt.id ? 'selected' : ''}`} onClick={() => setTheme(opt.id)}>
              <div className="tc-preview">
                {opt.type === 'split' ? (
                  <><div className="tc-dark" style={{ flex: 1 }}><div className="tc-bar d1" /><div className="tc-bar d2" /></div>
                  <div className="tc-light" style={{ flex: 1 }}><div className="tc-bar l1" /><div className="tc-bar l2" /></div></>
                ) : opt.type === 'dark' ? (
                  <div className="tc-dark" style={{ flex: 1 }}><div className="tc-bar d1" /><div className="tc-bar d2" /></div>
                ) : (
                  <div className="tc-light" style={{ flex: 1 }}><div className="tc-bar l1" /><div className="tc-bar l2" /></div>
                )}
              </div>
              <div className="tc-label">{opt.label}{theme === opt.id && <I.Check />}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (section === 'language') return (
    <div>
      <h2 className="s-title">Language</h2>
      <p className="s-desc">Set your preferred language and region.</p>
      <div className="s-field">
        <label className="s-label">Interface Language</label>
        <select className="s-select">
          <option>English (US)</option><option>English (UK)</option>
          <option>Arabic</option><option>French</option>
          <option>German</option><option>Spanish</option>
          <option>Japanese</option><option>Chinese (Simplified)</option>
        </select>
      </div>
      <div className="s-field">
        <label className="s-label">AI Response Language</label>
        <select className="s-select">
          <option>Same as interface</option><option>English</option>
          <option>Arabic</option><option>French</option><option>German</option>
        </select>
      </div>
    </div>
  )

  if (section === 'ai') return (
    <div>
      <h2 className="s-title">AI Modes</h2>
      <p className="s-desc">Select the mode that best fits your current task.</p>
      <div className="mode-grid">
        {modes.map(m => (
          <div key={m.id} className={`mode-card ${aiMode === m.id ? 'selected' : ''}`} onClick={() => setAIMode(m.id)}>
            <div className="mode-icon">{m.icon}</div>
            <div className="mode-name">{m.name}</div>
            <div className="mode-desc">{m.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )

  if (section === 'personality') return (
    <div>
      <h2 className="s-title">AI Personality</h2>
      <p className="s-desc">Choose how XOVA AI communicates with you.</p>
      <div className="p-grid">
        {personalities.map(p => (
          <div key={p.id} className={`p-chip ${personality === p.id ? 'selected' : ''}`} onClick={() => setPersonality(p.id)}>
            <div className="p-chip-name">{p.name}</div>
            <div className="p-chip-desc">{p.desc}</div>
          </div>
        ))}
      </div>
      {personality === 'custom' && (
        <div style={{ marginTop: 20 }}>
          <label className="s-label" style={{ marginBottom: 8, display: 'block' }}>Custom instructions</label>
          <textarea className="s-input" style={{ resize: 'vertical', minHeight: 88, maxWidth: '100%', width: '100%', fontFamily: 'Inter,sans-serif', lineHeight: 1.55 }} placeholder="Describe how you want XOVA AI to respond…" />
        </div>
      )}
    </div>
  )

  if (section === 'chat') return (
    <div>
      <h2 className="s-title">Chat Preferences</h2>
      <p className="s-desc">Customize how the chat interface behaves.</p>
      <div>
        {([
          { k: 'stream' as const, name: 'Streaming responses', desc: 'Show AI responses as they generate' },
          { k: 'md' as const, name: 'Markdown rendering', desc: 'Format with headers, lists, and code' },
          { k: 'sound' as const, name: 'Sound notifications', desc: 'Play a sound when a response is ready' },
          { k: 'suggest' as const, name: 'Prompt suggestions', desc: 'Show helpful follow-up prompts' },
          { k: 'history' as const, name: 'Save chat history', desc: 'Store conversations locally' },
        ]).map(row => (
          <div key={row.k} className="toggle-row">
            <div className="toggle-info">
              <div className="toggle-name">{row.name}</div>
              <div className="toggle-desc">{row.desc}</div>
            </div>
            <Toggle checked={tg[row.k]} onChange={() => tog(row.k)} />
          </div>
        ))}
      </div>
    </div>
  )

  if (section === 'privacy') return (
    <div>
      <h2 className="s-title">Privacy</h2>
      <p className="s-desc">Control how your data is handled.</p>
      <div>
        <div className="toggle-row">
          <div className="toggle-info">
            <div className="toggle-name">Usage analytics</div>
            <div className="toggle-desc">Help improve XOVA AI with anonymous data</div>
          </div>
          <Toggle checked={tg.analytics} onChange={() => tog('analytics')} />
        </div>
        <div className="toggle-row">
          <div className="toggle-info">
            <div className="toggle-name">Error reports</div>
            <div className="toggle-desc">Automatically send crash reports</div>
          </div>
          <Toggle checked={tg.errors} onChange={() => tog('errors')} />
        </div>
      </div>
      <div className="s-divider" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-surface" style={{ fontSize: 13, width: 'fit-content' }}>Export My Data</button>
        <button className="btn btn-ghost" style={{ fontSize: 13, color: 'var(--destructive)', width: 'fit-content' }}>Clear All Chat History</button>
      </div>
    </div>
  )

  return null
}

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView]           = useState<View>('auth-email')
  const [authEmail, setAuthEmail] = useState('')
  const [theme, setTheme]         = useState<Theme>('dark')
  const [resolved, setResolved]   = useState<'dark' | 'light'>('dark')
  const [sbOpen, setSbOpen]       = useState(true)
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('appearance')
  const [personality, setPersonality]         = useState<Personality>('friendly')
  const [aiMode, setAIMode]       = useState<AIMode>('general')
  const [messages, setMessages]   = useState<Message[]>([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [modeDrop, setModeDrop]   = useState(false)
  const taRef   = useRef<HTMLTextAreaElement>(null)
  const endRef  = useRef<HTMLDivElement>(null)

  // System theme
  useEffect(() => {
    if (theme !== 'system') { setResolved(theme); return }
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setResolved(mq.matches ? 'dark' : 'light')
    const h = (e: MediaQueryListEvent) => setResolved(e.matches ? 'dark' : 'light')
    mq.addEventListener('change', h); return () => mq.removeEventListener('change', h)
  }, [theme])

  useEffect(() => {
    document.documentElement.classList.toggle('light', resolved === 'light')
  }, [resolved])

  const isDark       = resolved === 'dark'
  const toggleTheme  = () => setTheme(isDark ? 'light' : 'dark')
  const modeLabels: Record<AIMode, string> = { general: 'General', code: 'Code', research: 'Research', creative: 'Creative', reasoning: 'Reasoning' }

  const sendMsg = () => {
    const text = input.trim()
    if (!text || loading) return
    const uid = Date.now().toString()
    const aid = (Date.now() + 1).toString()
    setMessages(prev => [...prev,
      { id: uid, role: 'user', content: text },
      { id: aid, role: 'assistant', content: '', pending: true },
    ])
    setInput('')
    setLoading(true)
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.pending
        ? { ...m, content: "I'm XOVA AI. Connect a real AI backend to activate me.", pending: false }
        : m))
      setLoading(false)
    }, 1400)
  }

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg() }
  }

  useEffect(() => {
    const ta = taRef.current; if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'
  }, [input])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const settingsNav: { id: SettingsSection; label: string; icon: keyof typeof I }[] = [
    { id: 'account',     label: 'Account',     icon: 'User'     },
    { id: 'appearance',  label: 'Appearance',  icon: 'Sun'      },
    { id: 'language',    label: 'Language',    icon: 'Globe'    },
    { id: 'ai',          label: 'AI Modes',    icon: 'Brain'    },
    { id: 'personality', label: 'Personality', icon: 'Msg'      },
    { id: 'chat',        label: 'Chat',        icon: 'Settings' },
    { id: 'privacy',     label: 'Privacy',     icon: 'Lock'     },
  ]

  // ── AUTH: EMAIL ──────────────────────────────────────────────────────────────
  if (view === 'auth-email') return (
    <EmailScreen
      onNext={email => { setAuthEmail(email); setView('auth-otp') }}
      theme={theme}
      toggleTheme={toggleTheme}
    />
  )

  // ── AUTH: OTP ────────────────────────────────────────────────────────────────
  if (view === 'auth-otp') return (
    <OTPScreen
      email={authEmail}
      onBack={() => setView('auth-email')}
      onVerified={() => setView('chat')}
    />
  )

  // ── SETTINGS ─────────────────────────────────────────────────────────────────
  if (view === 'settings') return (
    <div className="settings-screen t">
      <div className="settings-sidebar t">
        <div className="settings-sidebar-hdr">
          <button className="btn-icon t" onClick={() => setView('chat')} aria-label="Back to chat"><I.ChevLeft /></button>
          <span className="settings-hdr-title">Settings</span>
        </div>
        <nav className="settings-nav">
          {settingsNav.map(item => {
            const Icon = I[item.icon]
            return (
              <button key={item.id} className={`settings-nav-item ${settingsSection === item.id ? 'active' : ''}`} onClick={() => setSettingsSection(item.id)}>
                <Icon />{item.label}
              </button>
            )
          })}
        </nav>
      </div>
      <div className="settings-content">
        <SettingsContent
          section={settingsSection}
          theme={theme} setTheme={setTheme}
          personality={personality} setPersonality={setPersonality}
          aiMode={aiMode} setAIMode={setAIMode}
        />
      </div>
      <div style={{ position: 'absolute', bottom: 16, right: 20, fontSize: 11, color: 'var(--text3)' }}>by Begad</div>
    </div>
  )

  // ── CHAT ─────────────────────────────────────────────────────────────────────
  const isMobile = window.innerWidth <= 700

  return (
    <div className="chat-layout t">
      {/* Sidebar overlay */}
      <div className={`sb-overlay ${sbOpen && isMobile ? 'visible' : ''}`} onClick={() => setSbOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar t ${!sbOpen ? 'collapsed' : ''} ${sbOpen && isMobile ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Logo size={16} />
          <button className="btn-icon t" onClick={() => setSbOpen(false)} aria-label="Collapse sidebar"><I.ChevLeft /></button>
        </div>
        <div className="sidebar-body">
          <button className="new-chat-btn" onClick={() => { setMessages([]); setInput('') }}>
            <I.Plus />New Chat
          </button>
          <div className="sidebar-sec-label" style={{ marginTop: 18 }}>History</div>
          <div className="history-empty">No conversations yet</div>
        </div>
        <div className="sidebar-footer">
          <button className="sidebar-item" onClick={() => setView('settings')}><I.Settings />Settings</button>
        </div>
      </aside>

      {/* Main */}
      <main className="chat-main">
        {/* Header */}
        <header className="chat-header">
          <button className="btn-icon t" onClick={() => setSbOpen(s => !s)} aria-label="Toggle sidebar"><I.Menu /></button>
          <div className="chat-header-mid">
            <div className="mode-selector">
              <button className="mode-trigger" onClick={() => setModeDrop(o => !o)}>
                {modeLabels[aiMode]}<I.ChevDown />
              </button>
              {modeDrop && (
                <div className="mode-dropdown">
                  {(['general', 'code', 'research', 'creative', 'reasoning'] as AIMode[]).map(m => (
                    <button key={m} className={`mode-opt ${aiMode === m ? 'active' : ''}`} onClick={() => { setAIMode(m); setModeDrop(false) }}>
                      {aiMode === m && <I.Check />}{modeLabels[m]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn-icon t" onClick={toggleTheme} aria-label="Toggle theme">{isDark ? <I.Sun /> : <I.Moon />}</button>
            <button className="btn-icon t" onClick={() => { setMessages([]); setInput('') }} title="New chat"><I.Plus /></button>
          </div>
        </header>

        {/* Messages / empty */}
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✦</div>
            <div className="empty-title"><span style={{ color: 'var(--accent)' }}>X</span>OVA AI</div>
            <p className="empty-hint">What can I help you with?</p>
          </div>
        ) : (
          <div className="msgs-area">
            <div className="msgs-inner">
              {messages.map(msg => (
                <div key={msg.id} className={`msg-row ${msg.role}`}>
                  <div className={`msg-av ${msg.role === 'assistant' ? 'ai' : 'user'}`}>
                    {msg.role === 'assistant' ? '✦' : 'U'}
                  </div>
                  <div className={`msg-bubble ${msg.role === 'assistant' ? 'ai' : 'user'}`}>
                    {msg.pending
                      ? <div className="typing"><div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" /></div>
                      : msg.content}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
          </div>
        )}

        {/* Input */}
        <div className="input-area">
          <div className="input-box" onClick={() => taRef.current?.focus()}>
            <textarea
              ref={taRef}
              className="input-ta"
              placeholder="Message XOVA AI…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              rows={1}
            />
            <div className="input-bar">
              <div className="input-bar-l">
                <button className="btn-icon t" aria-label="Attach"><I.Clip /></button>
                <button className="btn-icon t" aria-label="Voice"><I.Mic /></button>
                <span className="input-hint-text">Shift+Enter for new line</span>
              </div>
              <div className="input-bar-r">
                <button className="send-btn" onClick={sendMsg} disabled={!input.trim() || loading} aria-label="Send">
                  <I.Send />
                </button>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 9, fontSize: 11, color: 'var(--text3)' }}>by Begad</div>
        </div>
      </main>

      {/* Close mode dropdown on outside click */}
      {modeDrop && <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setModeDrop(false)} />}
    </div>
  )
}
