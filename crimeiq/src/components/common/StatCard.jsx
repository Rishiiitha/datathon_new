import React from 'react'

export default function StatCard({ icon, label, value, color = '#38bdf8', trend, loading }) {
  if (loading) return <div className="card stat-card skeleton" style={{ height: 100 }} />
  return (
    <div className="card stat-card fade-in" style={{ borderTop: `2px solid ${color}` }}>
      <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            {label}
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {value ?? '—'}
          </div>
          {trend != null && (
            <div style={{ fontSize: '0.75rem', color: trend >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', marginTop: 2 }}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
            </div>
          )}
        </div>
        <span style={{ fontSize: '1.75rem', opacity: 0.7 }}>{icon}</span>
      </div>
    </div>
  )
}
