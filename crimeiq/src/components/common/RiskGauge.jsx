import React from 'react'

export default function RiskGauge({ score = 0, size = 120 }) {
  const r = (size - 20) / 2, cx = size / 2, cy = size / 2
  const circ = 2 * Math.PI * r
  const pct = Math.min(100, Math.max(0, score)) / 100
  const dash = circ * pct
  const color = score >= 70 ? '#f87171' : score >= 40 ? '#fbbf24' : '#34d399'
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={10} />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dasharray 0.6s ease, stroke 0.3s' }}
        />
        <text
          x={cx}
          y={cy + 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize={size < 100 ? 16 : 22}
          fontWeight={800}
        >
          {score}
        </text>
        <text x={cx} y={cy + 20} textAnchor="middle" fill="var(--text-muted)" fontSize={10}>
          / 100
        </text>
      </svg>
      <div style={{ fontSize: '0.75rem', color, fontWeight: 700, marginTop: 4 }}>
        {score >= 70 ? 'HIGH RISK' : score >= 40 ? 'MEDIUM RISK' : 'LOW RISK'}
      </div>
    </div>
  )
}
