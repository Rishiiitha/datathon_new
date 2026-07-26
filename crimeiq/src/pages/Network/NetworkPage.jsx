import React, { useState, useEffect, useRef } from 'react'
import { searchAccused, getNetwork } from '../../services/api'
import { Network, DataSet } from 'vis-network/standalone'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import './NetworkPage.css'

export default function NetworkPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedAccused, setSelectedAccused] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [loadingGraph, setLoadingGraph] = useState(false)

  const graphContainerRef = useRef(null)
  const networkInstanceRef = useRef(null)

  useEffect(() => {
    // Auto-load sample offenders on page open
    handleSearch(null, 'Ramesh')
  }, [])

  const handleSearch = async (e, defaultTerm) => {
    e?.preventDefault()
    const term = defaultTerm !== undefined ? defaultTerm : searchTerm
    setIsSearching(true)
    try {
      const res = await searchAccused(term)
      const list = res.data?.accused || res.data || []
      setSearchResults(list)
      if (list.length > 0 && !selectedAccused) {
        loadGraph(list[0])
      }
    } catch (err) {
      console.error('Failed to search accused:', err)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="network-layout fade-in">
      {/* Left Sidebar: Search */}
      <div className="network-sidebar">
        <div className="sidebar-title">Search Accused</div>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            className="input"
            placeholder="Search Ramesh, Suresh, ACC-8821..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={isSearching}>
            Search
          </button>
        </form>

        <div style={{ marginTop: 10, marginBottom: 10 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>Suggested Offender Searches:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['Ramesh Kumar', 'Suresh Gowda', 'ACC-8821', 'ACC-503'].map(term => (
              <span
                key={term}
                style={{
                  fontSize: '0.72rem',
                  padding: '3px 8px',
                  borderRadius: 12,
                  background: 'rgba(56,189,248,0.12)',
                  color: 'var(--accent-cyan)',
                  border: '1px solid rgba(56,189,248,0.25)',
                  cursor: 'pointer'
                }}
                onClick={() => { setSearchTerm(term); handleSearch(null, term); }}
              >
                {term}
              </span>
            ))}
          </div>
        </div>

        <div className="results-label">Offender Results</div>
        <div className="results-list">
          {isSearching ? (
            <LoadingSpinner size={24} />
          ) : searchResults.length === 0 ? (
            <div className="empty-results">No offenders found. Click suggestions above.</div>
          ) : (
            searchResults.map((res, i) => (
              <div
                key={i}
                className={`result-item ${selectedAccused?.PersonID === res.PersonID ? 'selected' : ''}`}
                onClick={() => loadGraph(res)}
              >
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{res.Name || res.name || `Person ${res.PersonID}`}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ID: {res.PersonID || res.id} • FIRs: {res.FirCount || res.firCount || 1}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="network-main">
        <div className="network-header">
          <div>
            <h2>Criminal Association Graph</h2>
            <p style={{ fontSize: '0.8rem' }}>Visualizing relationships between accused, victims, locations, and officers</p>
          </div>

          <div className="network-legend">
            <span className="legend-item"><span className="dot dot-accused" /> Accused</span>
            <span className="legend-item"><span className="dot dot-victim" /> Victim</span>
            <span className="legend-item"><span className="dot dot-location" /> Location</span>
            <span className="legend-item"><span className="dot dot-officer" /> Officer</span>
          </div>
        </div>

        <div className="graph-wrapper">
          {loadingGraph && (
            <div className="graph-loader">
              <LoadingSpinner size={40} />
              <p>Constructing network graph...</p>
            </div>
          )}
          {!selectedAccused && !loadingGraph && (
            <div className="graph-empty">
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🕸️</div>
              <h3>No Network Loaded</h3>
              <p>Search and select an accused offender from the left panel to map their criminal ecosystem.</p>
            </div>
          )}
          <div ref={graphContainerRef} className="vis-graph-container" />
        </div>
      </div>

      {/* Right Detail Panel */}
      <div className="network-detail-panel">
        <div className="panel-title">Node Intelligence</div>
        {selectedNode ? (
          <div className="node-details">
            <div className="card node-card">
              <div className="card-body">
                <div className="node-type-badge" style={{ background: getNodeColor(selectedNode.type).background }}>
                  {(selectedNode.type || 'NODE').toUpperCase()}
                </div>
                <h3 style={{ marginTop: 8, marginBottom: 4 }}>{selectedNode.label || selectedNode.name}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {selectedNode.id}</div>
              </div>
            </div>

            <div className="detail-stat">
              <span className="label">Associated FIRs</span>
              <span className="val">{selectedNode.firCount ?? '3'}</span>
            </div>
            <div className="detail-stat">
              <span className="label">Risk Score</span>
              <span className="val" style={{ color: (selectedNode.riskScore || 0) >= 70 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                {selectedNode.riskScore ?? '45'}/100
              </span>
            </div>

            <div className="detail-stat">
              <span className="label">Network Degree</span>
              <span className="val">Proportional Size</span>
            </div>
          </div>
        ) : (
          <div className="context-empty">
            <p>Click on any node in the graph to view detailed entity intelligence.</p>
          </div>
        )}
      </div>
    </div>
  )
}
