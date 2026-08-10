import { useState } from 'react'

const MODES = ['Base64', 'URL', 'Hex', 'HTML Entities']

function encode(text, mode) {
  try {
    if (mode === 'Base64') {
      return btoa(unescape(encodeURIComponent(text)))
    }
    if (mode === 'URL') {
      return encodeURIComponent(text)
    }
    if (mode === 'Hex') {
      return Array.from(new TextEncoder().encode(text))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' ')
    }
    if (mode === 'HTML Entities') {
      return text.replace(/[&<>"'`]/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;',
        '"': '&quot;', "'": '&#39;', '`': '&#96;',
      }[c]))
    }
  } catch {
    return '⚠ Encoding error'
  }
}

function decode(text, mode) {
  try {
    if (mode === 'Base64') {
      return decodeURIComponent(escape(atob(text.trim())))
    }
    if (mode === 'URL') {
      return decodeURIComponent(text)
    }
    if (mode === 'Hex') {
      const bytes = text.trim().split(/\s+/).map(h => parseInt(h, 16))
      if (bytes.some(isNaN)) return '⚠ Invalid hex — use space-separated bytes (e.g. 48 65 6c 6c 6f)'
      return new TextDecoder().decode(new Uint8Array(bytes))
    }
    if (mode === 'HTML Entities') {
      const el = document.createElement('textarea')
      el.innerHTML = text
      return el.value
    }
  } catch {
    return '⚠ Decoding error — check that the input matches the selected format'
  }
}

export default function EncoderDecoder() {
  const [mode, setMode] = useState('Base64')
  const [direction, setDirection] = useState('encode')
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)

  const output = input
    ? (direction === 'encode' ? encode(input, mode) : decode(input, mode))
    : ''

  function copy() {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function swap() {
    setInput(output)
    setDirection(d => (d === 'encode' ? 'decode' : 'encode'))
  }

  function clear() {
    setInput('')
  }

  return (
    <div className="tool">
      <h2>🔐 Encoder / Decoder</h2>
      <p className="desc">
        Convert text between Base64, URL encoding, Hex, and HTML entities.
        Bidirectional — encode or decode in one click.
      </p>

      {/* Mode selector */}
      <div className="btn-row">
        {MODES.map(m => (
          <button
            key={m}
            className={`btn ${mode === m ? 'tab-active' : ''}`}
            onClick={() => { setMode(m); setInput('') }}
          >
            {m}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
          <button
            className={`btn ${direction === 'encode' ? 'btn-primary' : ''}`}
            onClick={() => setDirection('encode')}
          >
            Encode →
          </button>
          <button
            className={`btn ${direction === 'decode' ? 'btn-primary' : ''}`}
            onClick={() => setDirection('decode')}
          >
            ← Decode
          </button>
        </div>
      </div>

      <div className="field">
        <label>Input — {direction === 'encode' ? 'plain text' : `${mode} encoded`}</label>
        <textarea
          rows={5}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={
            direction === 'encode'
              ? `Enter text to ${mode}-encode…`
              : `Paste ${mode}-encoded text to decode…`
          }
          spellCheck={false}
        />
      </div>

      <div className="btn-row">
        <button className="btn" onClick={clear} disabled={!input}>Clear</button>
      </div>

      {output && (
        <>
          <div className="field">
            <label>
              Output — {mode} {direction === 'encode' ? 'encoded' : 'decoded'}
            </label>
            <div className="output-box" style={{ color: 'var(--green)' }}>
              <button className="btn btn-sm copy-btn" onClick={copy}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
              {output}
            </div>
          </div>

          {!output.startsWith('⚠') && (
            <button className="btn" onClick={swap}>
              ⇅ Swap — use output as input ({direction === 'encode' ? 'switch to decode' : 'switch to encode'})
            </button>
          )}
        </>
      )}

      {mode === 'Hex' && direction === 'decode' && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.75rem' }}>
          💡 Hex input format: space-separated bytes — e.g. <code>48 65 6c 6c 6f</code>
        </p>
      )}
    </div>
  )
}
