import React, { useState } from 'react'

export default function EvidenceTrail({ sql, citedIds = [] }) {
  const [open, setOpen] = useState(false)
  if (!sql && citedIds.length === 0) return null
  return (
    <div style={{ marginTop: 8 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
      >
        {open ? '▼' : '▶'} Evidence Trail ({citedIds.length} records)
      </button>
      {open && (
        <div style={{ marginTop: 8, padding: '10px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 8, border: '1px solid var(--border)' }}>
          {sql && (
            <>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>SQL Query</div>
              <code style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all', display: 'block', marginBottom: 8 }}>{sql}</code>
            </>
          )}
          {citedIds.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {citedIds.map((id, i) => (
                <span key={i} className="chip" style={{ fontSize: '0.7rem' }}>{id}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
