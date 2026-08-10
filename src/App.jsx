import { useState } from 'react'
import JWTInspector from './tools/JWTInspector'
import HashGenerator from './tools/HashGenerator'
import EncoderDecoder from './tools/EncoderDecoder'
import PasswordAnalyzer from './tools/PasswordAnalyzer'
import CIDRCalculator from './tools/CIDRCalculator'
import RegexTester from './tools/RegexTester'

const TOOLS = [
  { id: 'jwt',      label: '🔑 JWT Inspector',     component: JWTInspector,    desc: 'Decode & inspect JSON Web Tokens'        },
  { id: 'hash',     label: '#️⃣ Hash Generator',    component: HashGenerator,   desc: 'SHA-1 / SHA-256 / SHA-384 / SHA-512'     },
  { id: 'encode',   label: '🔐 Encoder/Decoder',   component: EncoderDecoder,  desc: 'Base64 · URL · Hex · HTML Entities'      },
  { id: 'password', label: '🛡️ Password Analyzer', component: PasswordAnalyzer,desc: 'Entropy, crack time & charset coverage'  },
  { id: 'cidr',     label: '🌐 CIDR Calculator',   component: CIDRCalculator,  desc: 'Subnet, netmask & host range'            },
  { id: 'regex',    label: '🔍 Regex Tester',      component: RegexTester,     desc: 'Live match with OWASP security presets'  },
]

export default function App() {
  const [active, setActive] = useState('jwt')
  const ActiveTool = TOOLS.find(t => t.id === active).component

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
          <span className="logo">⚡ CyberDeck</span>
          <span className="tagline">Security Engineer's Toolkit</span>
        </div>
        <div className="header-right">
          <span className="privacy-badge">🔒 100% client-side</span>
          <a
            href="https://github.com/cedricevan98/CyberDeck"
            target="_blank"
            rel="noopener noreferrer"
            className="gh-link"
          >
            ★ GitHub
          </a>
        </div>
      </header>

      <nav className="tab-bar" role="tablist">
        {TOOLS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            className={`tab ${active === t.id ? 'tab-active' : ''}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="tool-panel" role="tabpanel">
        <ActiveTool />
      </main>

      <footer className="app-footer">
        Built by{' '}
        <a href="https://github.com/cedricevan98" target="_blank" rel="noopener noreferrer">
          Cedric Evan
        </a>{' '}
        · All processing happens in your browser · No data ever leaves your device
      </footer>
    </div>
  )
}
