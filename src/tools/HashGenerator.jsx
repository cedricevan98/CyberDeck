import { useState } from 'react'

async function digest(text, algo) {
  const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const ALGOS = [
  { id: 'SHA-1',   label: 'SHA-1',   warn: true  },
  { id: 'SHA-256', label: 'SHA-256', warn: false },
  { id: 'SHA-384', label: 'SHA-384', warn: false },
  { id: 'SHA-512', label: 'SHA-512', warn: false },
]

export default function HashGenerator() {
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState({})
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState('')

  async function generate() {
    if (!input.trim()) return
    setLoading(true)
    const results = {}
    await Promise.all(
      ALGOS.map(async a => {
        results[a.id] = await digest(input, a.id)
      })
    )
    setHashes(results)
    setLoading(false)
  }

  function copy(val, key) {
    navigator.clipboard.writeText(val)
    setCopied(key)
    setTimeout(() => setCopied(''), 1500)
  }

  function clear() {
    setInput('')
    setHashes({})
    setCopied('')
  }

  const colors = {
    'SHA-1':   'var(--yellow)',
    'SHA-256': 'var(--green)',
    'SHA-384': 'var(--green)',
    'SHA-512': 'var(--accent)',
  }

  const hasOutput = Object.keys(hashes).length > 0

  return (
    <div className="tool">
      <h2>#️⃣ Hash Generator</h2>
      <p className="desc">
        Generate cryptographic hashes using the browser&apos;s native Web Crypto API.
        Zero dependencies — no third-party crypto libraries.
      </p>

      <div className="field">
        <label>Input Text</label>
        <textarea
          rows={4}
          placeholder="Enter any text, password, or data to hash..."
          value={input}
          onChange={e => { setInput(e.target.value); setHashes({}) }}
          spellCheck={false}
        />
        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.3rem' }}>
          {input.length} chars · {new TextEncoder().encode(input).length} bytes
        </div>
      </div>

      <div className="btn-row">
        <button
          className="btn btn-primary"
          onClick={generate}
          disabled={loading || !input.trim()}
        >
          {loading ? 'Hashing…' : 'Generate Hashes'}
        </button>
        <button className="btn" onClick={clear} disabled={!input && !hasOutput}>
          Clear
        </button>
      </div>

      {hasOutput && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {ALGOS.map(a => (
            <div key={a.id}>
              <div
                className="section-label"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {a.label}
                {a.warn && (
                  <span className="badge badge-yellow">⚠ Deprecated — do not use for security</span>
                )}
              </div>
              <div
                className="output-box"
                style={{ color: colors[a.id], fontSize: '0.78rem', letterSpacing: '0.04em' }}
              >
                <button
                  className="btn btn-sm copy-btn"
                  onClick={() => copy(hashes[a.id], a.id)}
                >
                  {copied === a.id ? '✓ Copied' : 'Copy'}
                </button>
                {hashes[a.id]}
              </div>
            </div>
          ))}

          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.25rem' }}>
            ℹ SHA-256 is the industry standard for general-purpose hashing.
            Use SHA-512 for high-security applications.
          </div>
        </div>
      )}
    </div>
  )
}
