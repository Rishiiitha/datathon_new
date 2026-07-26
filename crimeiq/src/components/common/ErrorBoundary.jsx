import React from 'react'

export default class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }
  static getDerivedStateFromError(error) { return { hasError: true, error } }
  componentDidCatch(error, info) { console.error('ErrorBoundary:', error, info) }
  render() {
    if (this.state.hasError) return (
      <div className="page-container">
        <div className="card" style={{ maxWidth:500, margin:'60px auto' }}>
          <div className="card-body" style={{ textAlign:'center', padding:40 }}>
            <div style={{ fontSize:'3rem', marginBottom:16 }}>⚠️</div>
            <h3 style={{ marginBottom:8 }}>Something went wrong</h3>
            <p style={{ marginBottom:20 }}>{this.state.error?.message}</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload Page</button>
          </div>
        </div>
      </div>
    )
    return this.props.children
  }
}
