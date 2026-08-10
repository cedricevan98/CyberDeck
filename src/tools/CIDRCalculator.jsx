import { useState } from 'react'

function ipToInt(ip) {
  const parts = ip.split('.')
  if (parts.length !== 4) throw new Error('Invalid IP address')
  const n = parts.reduce((acc, oct) => {
    const v = parseInt(oct, 10)
    if (isNaN(v) || v < 0 || v > 255) throw new Error('Octet out of range (0–255)')
    return (acc * 256) + v
  }, 0)
  return n >>> 0
}

function intToIp(n) {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>>  8) & 0xff,
     n         & 0xff,
  ].join('.')
}

function intToBinary(n) {
  return (n >>> 0).toString(2).padStart(32, '0').match(/.{8}/g).join('.')
}

function cidrInfo(cidr) {
  const match = cidr.match(/^([^/]+)\/(\d+)$/)
  if (!match) throw new Error('Use CIDR notation: e.g. 192.168.1.0/24')

  const [, ipStr, prefixStr] = match
  const prefix = parseInt(prefixStr, 10)
  if (prefix < 0 || prefix > 32) throw new Error('Prefix must be 0–32')

  const ipInt   = ipToInt(ipStr)
  const mask    = prefix === 0 ? 0 : ((~0) << (32 - prefix)) >>> 0
  const network = (ipInt & mask) >>> 0
  const broadcast = (network | (~mask >>> 0)) >>> 0

  let firstHost, lastHost, usableHosts
  if (prefix === 32) {
    firstHost  = intToIp(network)
    lastHost   = intToIp(network)
    usableHosts = 1
  } else if (prefix === 31) {
    firstHost  = intToIp(network)
    lastHost   = intToIp(broadcast)
    usableHosts = 2
  } else {
    firstHost  = intToIp(network + 1)
    lastHost   = intToIp(broadcast - 1)
    usableHosts = Math.pow(2, 32 - prefix) - 2
  }

  const totalHosts = Math.pow(2, 32 - prefix)

  return {
    inputIp: ipStr,
    networkIp: intToIp(network),
    broadcastIp: intToIp(broadcast),
    netmask: intToIp(mask),
    wildcard: intToIp(~mask >>> 0),
    firstHost,
    lastHost,
    prefix,
    totalHosts,
    usableHosts,
    maskBinary: intToBinary(mask),
    networkBinary: intToBinary(network),
    ipClass: prefix <= 8 ? 'A' : prefix <= 16 ? 'B' : prefix <= 24 ? 'C' : 'D',
    privateRange: isPrivate(network),
  }
}

function isPrivate(ipInt) {
  const a = (ipInt >>> 24) & 0xff
  const b = (ipInt >>> 16) & 0xff
  if (a === 10) return '10.0.0.0/8 (RFC 1918)'
  if (a === 172 && b >= 16 && b <= 31) return '172.16.0.0/12 (RFC 1918)'
  if (a === 192 && b === 168) return '192.168.0.0/16 (RFC 1918)'
  if (a === 127) return 'Loopback (RFC 5735)'
  if (a === 169 && b === 254) return 'Link-local (RFC 3927)'
  return null
}

const EXAMPLES = ['10.0.0.0/8','172.16.0.0/12','192.168.1.0/24','192.168.1.0/26','10.10.10.0/30','203.0.113.0/32']

export default function CIDRCalculator() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')

  function calculate(val) {
    const cidr = (val ?? input).trim()
    setError(''); setResult(null)
    try { setResult(cidrInfo(cdr)) } catch (e) { setError(e.message) }
  }

  function copy(text, key) {
    navigator.clipboard.writeText(text)
    setCopied(key); setTimeout(() => setCopied(''), 1500)
  }

  function loadExample(ex) {
    setInput(ex); setError(''); setResult(null)
    try { setResult(cidrInfo(ex)) } catch (e) { setError(e.message) }
  }

  const rows = result ? [
    ['IP Address', result.inputIp, 'input'],
    ['Network', `${result.networkIp}/${result.prefix}`, 'network'],
    ['Broadcast', result.broadcastIp, 'broadcast'],
    ['Subnet Mask', result.netmask, 'mask'],
    ['Wildcard Mask', result.wildcard, 'wild'],
    ['First Host', result.firstHost, 'first'],
    ['Last Host', result.lastHost, 'last'],
    ['Usable Hosts', result.usableHosts.toLocaleString(), 'uh'],
    ['Total IPs', result.totalHosts.toLocaleString(), 'total'],
    ['IP Class', `Class ${result.ipClass}`, 'class'],
  ] : []

  return (
    <div className="tool">
      <h2>🌐 CIDR Calculator</h2>
      <p className="desc">Calculate subnet network address, broadcast, host range, and netmask from CIDR notation. Essential for firewall rules, VPC design, and network planning.</p>
      <div className="field">
        <label>CIDR Notation</label>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          <input type="text" value={input} placeholder="192.168.1.0/24"
            onChange={e => { setInput(e.target.value); setResult(null); setError('') }}
            onKeyDown={e => e.key === 'Enter' && calculate()}
            style={{ flex:1, fontFamily:'monospace' }} />
          <button className="btn btn-primary" onClick={() => calculate()}>Calculate</button>
        </div>
      </div>
      <div style={{ marginBottom:'1rem' }}>
        <div className="section-label">Quick examples</div>
        <div style={{ display:'flex', gap:'0.35rem', flexWrap:"wrap" }}>
          {EPAMpLES}
        </div>
      </div>
      {error && <p className="error">⚠ {error}</p>}
      {result && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div className="kv-table">
            {rows.map(([k,V,key]) => (
              <div className="kv-row" key={k} style={{cursor:'pointer'}} onClick={()=>copy(V,key)}>
                <span className="kv-key">{k}</span>
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                  <span className="kv-val">{V}</span>
                  <span style={{color:'var(--text-muted)',fontSize:'0.72rem'}}>{copied===key?'✓':'⎘'}</span>
                </div>
              </div>
            ))}
          </div>
          <div><div className="section-label">Subnet mask in binary</div><div className="output-box" style={{color:'var(--accent)',fontSize:'0.78rem'}}>{rsult.maskBinary}</div></div>
          <div><div className="section-label">Network address in binary</div><div className="output-box" style={{color:'var(--purple)',fontSize:'0.78rem'}}>{result.networkBinary}</div></div>
        </div>
      )}
    </div>
  )
}
