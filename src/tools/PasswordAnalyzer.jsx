import { useState } from 'react'

const CHAR_SETS = [
  { re: /[a-z]/,           pool: 26,  label: 'a–z (lowercase)' },
  { re: /[A-Z]/,           pool: 26,  label: 'A–Z (uppercase)' },
  { re: /[0-9]/,           pool: 10,  label: '0–9 (digits)'    },
  { re: /[!@#$%^&*()\-_=+[[]{};:'",.<>/?\\|`~]/, pool: 32, label: 'Special chars' },
  { re: /[^\x00-\x7F]/,   pool: 128, label: 'Extended Unicode' },
]

function analyzePassword(pw) {
  let pool = 0
  const active = []
  for (const cs of CHAR_SETS) {
    if (cs.re.test(pw)) {
      pool += cs.pool
      active.push(cs.label)
    }
  }
  const entropy = pool > 0 ? pw.length * Math.log2(pool) : 0
  return { pool, active, entropy }
}

function crackTime(entropy) {
  // Assume 100 billion guesses/sec (high-end GPU cluster)
  const guesses = Math.pow(2, entropy)
  const secs    = guesses / 1e11
  if (secs < 0.001)       return 'Instant'
  if (secs < 1)           return `${(secs * 1000).toFixed(0)} milliseconds`
  if (secs < 60)          return `${secs.toFixed(1)} seconds`
  if (secs < 3600)        return `${(secs / 60).toFixed(0)} minutes`
  if (secs < 86400)       return `${(secs / 3600).toFixed(0)} hours`
  if (secs < 2592000)     return `${(secs / 86400).toFixed(0)} days`
  if (secs < 31536000)    return `${(secs / 2592000).toFixed(0)} months`
  if (secs < 3.15e9)      return `${(secs / 31536000).toFixed(0)} years`
  if (secs < 3.15e12)     return `$y(secs / 3.15e9).toFixed(1)}K years`
  if (secs < 3.15e15)     return `$y(secs / 3.15e12).toFixed(1)}M years`
  return                         `${(secs / 3.15e15).toFixed(1)}B years`
}

function strengthLevel(entropy) {
  if (entropy <  28) return { label: 'Very Weak', pct:  8, color: '#f85149' }
  if (entropy <  40) return { label: 'Weak',      pct: 25, color: '#f0883e' }
  if (entropy <  60) return { label: 'Fair',      pct: 50, color: '#d29922' }
  if (entropy <  80) return { label: 'Strong',    pct: 75, color: '#3fb950' }
  return                    { label: 'Very Strong',pct:100, color: '#58a6ff' }
}

const COMMON_PASSWORDS = new Set([
  'password','password1','123456','qwerty','admin','letmein',
  'welcome','monkey','dragon','master','hello','shadow',
])

export default function PasswordAnalyzer() {
  const [pw, setPw]       = useState('')
  const [show, setShow]   = useState(false)

  const { pool, active, entropy } = analyzePassword(pw)
  const s   = pw ? strengthLevel(entropy)  : null
  const ct  = pw ? crackTime(entropy)      : ''
  const common = COMMON_PASSWORDS.has(pw.toLowerCase())

  const checks = pw ? [
    { ok: pw.length >= 12,           msg: pw.length >= 12 ? `✓ Length ≥ 12 (${pw.length})` : `✗ Too short — use ≥ 12 chars (${pw.length} now)` },
    { ok: /[A-Z]/.test(pw),          msg: /[A-Z]/.test(pw) ? '✓ Contains uppercase' : '✗ Add uppercase letters (A–Z)' },
    { ok: /[a-z]/.test(pw),          msg: /[a-z]/.test(pw) ? '✓ Contains lowercase' : '✗ Add lowercase letters (a–z)' },
    { ok: /[0-9]/.test(pw),          msg: /[0-9]/.test(pw) ? '✓ Contains digits' : '✗ Add digits (0–9)' },
    { ok: /[!@#$%^&*]/.test(pw),     msg: /[!@#$%^&*]/.test(pw) ? '✓ Contains special chars' : '✗ Add special chars (!@#$%^&*)' },
    { ok: !common,                   msg: !common ? '✓ Not a common password' : '✗ Common password — change immediately!' },
  ] : []

  return (
    <div className="tool">
      <h2>🛡️ Password Strength Analyzer</h2>
      <p className="desc">
        Calculate password entropy and estimate crack time based on character pool size.
        Your password is never transmitted — analysis runs 100% in your browser.
      </p>

      <div className="field">
        <label>Password</label>
        <div style={{ position: 'relative' }}>
          <input
            type={show ? 'text' : 'password'}
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="Enter a password to analyze…"
            style={{ paddingRight: '4.5rem' }}
            autoComplete="off"
          />
          <button
            className="btn btn-sm"
            onClick={() => setShow(s => !s)}
            style={{ position: 'absolute', right: '0.45rem', top: '50%', transform: 'translateY(-50%)' }}
          >
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {pw && s && (
        <>
          {/* Strength bar */}
          <div className="strength-bar">
            <div className="strength-fill" style={{ width: `${s.pct}%`, background: s.color }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span
              className="badge"
              style={{
                background: `${s.color}18`,
                color: s.color,
                border: `1px solid ${s.color}40`,
                fontSize: '0.85rem',
              }}
            >
              {s.label}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              {entropy.toFixed(1)} bits entropy · pool {pool} chars
            </span>
          </div>

          {/* Stats */}
          <div className="kv-table" style={{ marginBottom: '1rem' }}>
            <div className="kv-row">
              <span className="kv-key">Length</span>
              <span className="kv-val" style={{ color: pw.length >= 12 ? 'var(--green)' : 'var(--red)' }}>
                {pw.length} characters
              </span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Character pool</span>
              <span className="kv-val">{pool} unique chars possible per position</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Entropy</span>
              <span className="kv-val">{entropy.toFixed(2)} bits</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Combinations</span>
              <span className="kv-val">2^{entropy.toFixed(0)}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Est. crack time</span>
              <span className="kv-val" style={{ color: entropy < 60 ? 'var(--red)' : 'var(--green)' }}>
                {ct}{' '}
                <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>@ 100B guesses/sec</span>
              </span>
            </div>
          </div>

          {/* Character sets */}
          <div className="section-label">Character sets used</div>
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {CHAR_SETS.map(cs => (
              <span key={cs.label} className={`tag ${cs.re.test(pw) ? 'tag-on' : 'tag-off'}`}>
                {cs.re.test(pw) ? '✓' : '✗'} {cs.label}
              </span>
            ))}
          </div>

          {/* Checklist */}
          <div className="section-label">Security checklist</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.82rem' }}>
            {checks.map((c, i) => (
              <span key={i} style={{ color: c.ok ? 'var(--green)' : 'var(--red)' }}>
                {c.msg}
              </span>
            ))}
          </div>
        </>
      )}

      {!pw && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.5rem' }}>
          Entropy formula: <code>H = L × log₂(N)</code> where L = length, N = character pool size.
          NIST SP 800-63B recommends ≥ 64 bits of entropy for high-security passwords.
        </p>
      )}
    </div>
  )
}
