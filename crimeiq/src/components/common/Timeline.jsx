import React from 'react'
import './Timeline.css'

export default function Timeline({ events = [] }) {
  if (!events || !events.length) return <div className="empty-state"><p>No timeline events</p></div>
  return (
    <div className="timeline">
      {events.map((ev, i) => (
        <div key={i} className="timeline-item">
          <div className="timeline-dot" style={{ background: ev.color || 'var(--accent-cyan)' }} />
          <div className="timeline-line" style={{ display: i === events.length - 1 ? 'none' : 'block' }} />
          <div className="timeline-content">
            <div className="timeline-date">{ev.date}</div>
            <div className="timeline-event">{ev.event}</div>
            {ev.desc && <div className="timeline-desc">{ev.desc}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}
