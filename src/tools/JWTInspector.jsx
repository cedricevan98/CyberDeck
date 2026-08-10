import { useState } from 'react'

/**
 * Decode a base64url-encoded JWT segment into a JSON object.
 * Returns null if the segment is invalid.
 */
function decodeSegment(seg) {
  try {
    const padded = seg.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), '=')))
  } catch {
    return null
  }
}

function fmt(obj) {
  return JSON.stringify(obj, null, 2)
}

const SAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkNlZHJpYyBFdmFuIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ' +
  '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

export default function JWTInspector() {
  const [token, setToken] = useState('')
  const [copied, setCopied] = useState('')

  const trimmed = token.trim()
  const parts   = trimmed.split('.')
  const isValid = parts.length === 3

  const header  = isValid ? decodeSegment(parts[0]) : null
  const payload = isValid ? decodeSegment(parts[1]) : null
  const sig     = isValid ? parts[2] : null

  const now     = Math.floor(Date.now() / 1000)
  const expired = payload?.exp !== undefined && payload.exp < now
  const notYet  = payload?.nbf !== undefined && payload.nbf > now

  function copy(text, key) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 1500)
  }

  function loadSample() {
    setToken(SAMPLE)
  }

  return (
    <div className="tool">
      <h2>🔑 JWT Inspector</h2>
      <p className="desc">
        Decode header, payload &amp; signature. Check expiry and inspect all claims.
        Signature <em>verification</em> requires the secret key and is not performed here.
      </p>

      <div className="field">
        <label>JWT Token</label>
        <textarea
          rows={5}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          value={token}
          onChange={e => setToken(e.target.value)}
          spellCheck={false}
        />
      </div>

      <div className="btn-row">
        <button className="btn" onClick={loadSample}>Load sample</button>
        <button className="btn" onClick={() => setToken('')}>Clear</button>
      </div>

      {trimmed && !isValid && (
        <p className="error">⚠ Invalid JWT — expected 3 dot-separated Base64url segments</p>
      )}

      {isValid && header && payload && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Status row */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {expired && <span className="badge badge-red">✗ EXPIRED</span>}
            {!expired && !notYet && <span className="badge badge-green">✓ VALID (not expired)</span>}
            {notYet  && <span className="badge badge-yellow">⏳ NOT YET VALID</span>}
            {payload.alg && <span className="badge badge-blue">alg: {header.alg}</span>}
            {payload.iat && (
              <span className="badge badge-blue">
                Issued {new Date(payload.iat * 1000).toLocaleString()}
              </span>
            )}
            {payload.exp && (
              <span className={`badge ${expired ? 'badge-red' : 'badge-blue'}`}>
                Expires {new Date(payload.exp * 1000).toLocaleString()}
              </span>
            )}
          </div>

          {/* Header + Payload side by side */}
          <div className="grid-2">
            <div>
              <div className="section-label">Header</div>
              <div className="output-box" style={{ color: 'var(--purple)', minHeight: '80px' }}>
                <button className="btn btn-sm copy-btn" onClick={() => copy(fmt(header), 'h')}>
                  {copied === 'h' ? '✓' : 'Copy'}
                </button>
                {fmt(header)}
              </div>
            </div>
            <div>
              <div className="section-label">Payload</div>
              <div className="output-box" style={{ color: 'var(--green)', minHeight: '80px' }}>
                <button className="btn btn-sm copy-btn" onClick={() => copy(fmt(payload), 'p')}>
                  {copied === 'p' ? '✓' : 'Copy'}
                </button>
                {fmt(payload)}
              </div>
            </div>
          </div>

          {/* Signature */}
          <div>
            <div className="section-label">Signature (Base64url — not verified)</div>
            <div className="output-box" style={{ color: 'var(--red)', letterSpacing: '0.03em', fontSize: '0.78rem' }}>
              <button className="btn btn-sm copy-btn" onClick={() => copy(sig, 's')}>
                {copied === 's' ? '✓' : 'Copy'}
              </button>
              {sig}
            </div>
          </div>

          {/* Claims table */}
          <div>
            <div className="section-label">All Claims</div>
            <div className="kv-table">
              {Object.entries(payload).map(([k, v]) => {
                const isTime = ['iat', 'exp', 'nbf'].includes(k) && typeof v === 'number'
                return (
                  <div className="kv-row" key={k}>
                    <span className="kv-key">{k}</span>
                    <span className="kv-val" style={{ maxWidth: '65%', textAlign: 'right', wordBreak: 'break-all' }}>
                      {isTime
                        ? `${v} (${new Date(v * 1000).toLocaleString()})`
                        : typeof v === 'object' ? JSON.stringify(v) : String(v)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {!trimmed && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.5rem' }}>
          Supports HS256 / RS256 / ES256 and variants. Paste a JWT above or click &ldquo;Load sample&rdquo;.
        </p>
      )}
    </div>
  )
}
