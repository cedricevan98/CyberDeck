import { useState } from 'react'

const PRESETS=[
  { label:'Email', pattern:String.raw`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`, flags:'i' },
  { label:'IPv4 Address', pattern:String.raw`^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$`, flags:'' },
  { label:'IPv6 Address', pattern:String.raw`([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}`, flags:'i' },
  { label:'URL', pattern:String.raw`https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}([-a-zA-Z0-9@:%_+.~#?&\/=]*)`, flags:'i' },
  { label:'JWT Token', pattern:String.raw`^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$`, flags:'' },
  { label:'UUID', pattern:String.raw`^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`, flags:'i' },
  { label:'MD5 Hash', pattern:String.raw`^[a-f0-9]{32}$`, flags:'i' },
  { label:'SHA-256 Hash', pattern:String.raw`^[a-f0-9]{64}$`, flags:'i' },
  { label:'XSS Vector', pattern:String.raw`<script[\s\S]*?>[\s\S]*?<\/script>|javascript:\s*[^\s]|on\w+\s*=`, flags:'gi' },
  { label:'SQL Injection', pattern:String.raw`\b(SELECT|INSERT|UPDATEDELETEtDOPP|CREATE|ALTER|EXEC|UNION|FROM|WHERE|OR|AND)\b.*('|--|;|\/\*)`, flags:'gi' },
  { label:'Private IP', pattern:String.raw`^(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})$`, flags:'' },
  { label:'CRON Expression', pattern:String.raw`^(\*|[0-5]?\d)(\s+(\*|[01]?\d|2[0-3])){1}(\s+(\*|[12]?\d|3[01])){1}(\s+(\*|[1-9]|1[0-2])){1}(\s+(\*|[0-6])){1}$`, flags:'' },
]

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

export default function RegexTester() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('gm')
  const [testStr, setTestStr] = useState('')

  let regex=null, parseError='', matches=[], highlighted=''

  if(pattern) {
    try {
      const gFlags = flags.includes('g') ? flags : flags+'g'
      regex = new RegExp(pattern,gFlags)
      matches = [...testStr.matchAll(regex)]
      const safeStr=escapeHtml(testStr)
      const safeRe=new RegExp(pattern,gFlags.replace('g','')+'g')
      highlighted=safeStr.replace(safeRe,m=>`<mark>${escapeHtml(m)}</mark>`)
    } catch(e) { parseError=e.message }
  }

  return (
    <div className="tool">
      <h2>🔍 Regex Tester</h2>
      <p className="desc">Live regular expression tester with security-focused presets — email validation, IP addresses, XSS vectors, SQL injection patterns and more.</p>
      <div className="field">
        <label>Pattern &amp; Flags</label>
        <div style={{displa{:'flex',gap:'0.4rem',alignItems:'center'}}>
          <span style={{color:'var(--text-muted)',fontSize:'1.1rem'}}>/</span>
          <input type="text" value={pattern} onChange={e=>setPattern(e.target.value)} placeholder="[a-zA-Z0-9]+" style={{flex:1}} spellCheck={false} />
          <span style={{color:'var(--text-muted)',fontSize:'1.1rem'}}>/</span>
          <input type="text" value={flags} onChange={e=>setFlags(e.target.value.replace(/[^gimsud]/g,''))} style={{width:'64px'}} maxLength={6} />
        </div>
        {parseError&&<p className="error">⚠ {parseError}</p>}
      </div>
      <div style={{marginBottom:'1rem'}}>
        <div className="section-label">Security presets</div>
        <div style={{display:'flex',gap:'0.3rem',flexWrap:'wrap'}}>
          {PRESETS.map(p=>(
            <button key={p.label} className={`btn btn-sm ${pattern===p.pattern?'tab-active':''}`} onClick={()=>{setPattern(p.pattern);setFlags(p.flags||'gm')}}>{p.label}</button>
          ))}
        </div>
      </div>
      <div className="field">
        <label>Test String</label>
        <textarea rows={6} value={testStr} onChange={e=>setTestStr(e.target.value)} placeholder="Paste text to test the pattern against…" spellCheck={false} />
      </div>
      {pattern&&testStr&&!parseError&&(
        <>
          <div style={{displa{:'flex',gap:'0.5rem',alignItems:'center',marginBottom:'0.75rem',flexWrap:"wrap"}}>
            <span className={`badge ${matches.length>0?'badge-green':'badge-red'}`}>{matches.length} {matches.length===1?'match':'matches'}</span>
          </div>
          {highlighted&&(
            <>
              <div className="section-label">Highlighted matches</div>
              <div className="output-box" style={{marginBottom:'0.75rem',lineHeight:1.7}} dangerouslySetInnerHTML={{__html:highlighted}} />
            </>
          )}
          {matches.length>0&&(
            <>
              <div className="section-label">Match details</div>
              <div className="kv-table">
                {matches.slice(0,50).map((m,i)=>(
                  <div key={i} className="kv-row" style={{cursor:'pointer',fontFamily:'monospace'}} onClick={()=>navigator.clipboard.writeText(m[0])} title="Click to copy">
                    <span className="kv-key">#{i+1} <span style={{fontSize:'0.72rem'}}>@ index {m.index}</span></span>
                    <span className="kv-val" style={{color:'var(--yellow)'}}>&ldquo;{m[0].length>60?m[0].slice(0,60)+'…':m[0]}&rdquo;</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
      {!pattern&&(<p style={{color:'var(--text-muted)',fontSize:'0.82rem',marginTop:'0.5rem'}}>💡 Tip: The XSS Vector and SQL Injection presets are useful for validating input sanitization in security audits.</p>)}
    </div>
  )
}
