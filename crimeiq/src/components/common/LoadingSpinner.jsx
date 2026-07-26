import React from 'react'

export default function LoadingSpinner({ size = 40, centered = true }) {
  const style = {
    width: size,
    height: size,
    border: `3px solid rgba(56,189,248,0.2)`,
    borderTopColor: '#38bdf8',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    ...(centered ? { margin: '40px auto', display: 'block' } : {})
  }
  return <div style={style} />
}
