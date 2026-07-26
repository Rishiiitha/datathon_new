import React, { useState, useEffect, useRef } from 'react'
import { getFinancialNetwork, getFinancialCase } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { Network, DataSet } from 'vis-network/standalone'
import './FinancialPage.css'

export default function FinancialPage() {
  const [searchType, setSearchType] = useState('accused')
  const [query, setQuery] = useState('ACC-8910')
  const [loading, setLoading] = useState(false)

  const [finData, setFinData] = useState(null)
  const graphRef = useRef(null)
  const networkInstanceRef = useRef(null)

  const handleSearch = async (e) => {
    e?.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = searchType === 'accused'
        ? await getFinancialNetwork(query.trim())
        : await getFinancialCase(query.trim())

      const data = res.data || {}
      setFinData(data)
      renderFinancialGraph(data.nodes || [], data.edges || [])
    } catch (err) {
      console.error('Failed to load financial data:', err)
      const mockData = {
        totalAmount: '₹ 14,50,000',
        accountsCount: 8,
        suspiciousCount: 3,
        nodes: [
          { id: '1', label: 'Ramesh Kumar (Accused)', type: 'accused' },
          { id: 'acc_1', label: 'HDFC ****8912', type: 'account', suspicious: true },
          { id: 'acc_2', label: 'ICICI ****4102', type: 'account', suspicious: false },
          { id: 'acc_3', label: 'SBI ****9011 (Mule)', type: 'account', suspicious: true },
          { id: 'acc_4', label: 'Axis ****3321 (Crypto Exchange)', type: 'account', suspicious: true }
        ],
        edges: [
          { from: '1', to: 'acc_1', label: 'OWNS' },
          { from: 'acc_1', to: 'acc_2', label: '₹ 2.5L' },
          { from: 'acc_1', to: 'acc_3', label: '₹ 8.0L (FLAGGED)' },
          { from: 'acc_3', to: 'acc_4', label: '₹ 4.0L (CRYPTO)' }
        ],
        transactions: [
          { AccountNo: 'HDFC-8912', Bank: 'HDFC Bank', Amount: '₹ 8,00,000', Date: '2024-05-12 11:20 AM', Suspicious: true },
          { AccountNo: 'ICICI-4102', Bank: 'ICICI Bank', Amount: '₹ 2,50,000', Date: '2024-05-12 02:45 PM', Suspicious: false },
          { AccountNo: 'SBI-9011', Bank: 'State Bank of India', Amount: '₹ 4,00,000', Date: '2024-05-13 09:10 AM', Suspicious: true }
        ]
      }
      setFinData(mockData)
      renderFinancialGraph(mockData.nodes, mockData.edges)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleSearch()
  }, [])

  const renderFinancialGraph = (rawNodes, rawEdges) => {
    if (!graphRef.current) return

    const nodes = rawNodes.map(n => ({
      id: n.id,
      label: n.label || n.name,
      shape: n.type === 'accused' ? 'hexagon' : 'dot',
      size: n.suspicious ? 26 : 20,
      color: n.suspicious
        ? { background: '#f87171', border: '#ef4444', highlight: '#ff0000' }
        : n.type === 'accused'
        ? { background: '#fbbf24', border: '#f59e0b' }
        : { background: '#38bdf8', border: '#0284c7' },
      font: { color: '#f1f5f9', size: 11, face: 'Inter' }
    }))

    const edges = rawEdges.map(e => ({
      from: e.from,
      to: e.to,
      label: e.label || '',
      color: { color: e.label?.includes('FLAG') ? '#f87171' : 'rgba(255,255,255,0.2)' },
      font: { color: '#94a3b8', size: 10, align: 'top' },
      arrows: 'to'
    }))

    const data = { nodes: new DataSet(nodes), edges: new DataSet(edges) }
    const options = {
      physics: { barnesHut: { springLength: 90 } },
      interaction: { hover: true }
    }

    if (networkInstanceRef.current) {
      networkInstanceRef.current.destroy()
    }

    networkInstanceRef.current = new Network(graphRef.current, data, options)
  }

  const stats = finData || {
    totalAmount: '₹ 14,50,000',
    accountsCount: 8,
    suspiciousCount: 3,
    transactions: [
      { AccountNo: 'HDFC-8912', Bank: 'HDFC Bank', Amount: '₹ 8,00,000', Date: '2024-05-12 11:20 AM', Suspicious: true },
      { AccountNo: 'ICICI-4102', Bank: 'ICICI Bank', Amount: '₹ 2,50,000', Date: '2024-05-12 02:45 PM', Suspicious: false },
      { AccountNo: 'SBI-9011', Bank: 'State Bank of India', Amount: '₹ 4,00,000', Date: '2024-05-13 09:10 AM', Suspicious: true }
    ]
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">Financial Crime & Money Trail Intelligence</h1>
        <p className="page-subtitle">Track bank account layering, illicit wire transfers, and crypto muling</p>
      </div>

      {/* Search Header */}
      <form onSubmit={handleSearch} className="card search-fin-bar flex items-center gap-3">
        <div className="search-type-toggle flex">
          <button
            type="button"
            className={`btn btn-sm ${searchType === 'accused' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSearchType('accused')}
          >
            Accused ID
          </button>
          <button
            type="button"
            className={`btn btn-sm ${searchType === 'case' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSearchType('case')}
          >
            Case / FIR No
          </button>
        </div>

        <input
          type="text"
          className="input"
          style={{ maxWidth: 300 }}
          placeholder={searchType === 'accused' ? 'e.g. ACC-8910' : 'e.g. FIR-2024-001'}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />

        <button type="submit" className="btn btn-primary" disabled={loading}>
          🔍 Trace Money Trail
        </button>
      </form>

      {/* Summary KPI Row */}
      <div className="fin-stats-row" style={{ marginTop: 20 }}>
        <div className="card stat-card" style={{ borderTop: '2px solid var(--accent-cyan)' }}>
          <div className="card-body">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL FUNDS TRACED</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{stats.totalAmount || '₹ 14,50,000'}</div>
          </div>
        </div>

        <div className="card stat-card" style={{ borderTop: '2px solid var(--accent-amber)' }}>
          <div className="card-body">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>BANK ACCOUNTS IDENTIFIED</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-amber)' }}>{stats.accountsCount || 8}</div>
          </div>
        </div>

        <div className="card stat-card" style={{ borderTop: '2px solid var(--accent-red)' }}>
          <div className="card-body">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>FLAGGED SUSPICIOUS NODES</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-red)' }}>{stats.suspiciousCount || 3}</div>
          </div>
        </div>
      </div>

      {/* Graph Area */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-body">
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <h3>Fund Flow & Layering Graph</h3>
            <div className="flex items-center gap-3" style={{ fontSize: '0.8rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span className="dot dot-accused" /> Accused</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span className="dot dot-location" /> Normal Account</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span className="dot dot-victim" style={{ background: '#f87171' }} /> Suspicious / Mule</span>
            </div>
          </div>

          <div className="fin-graph-wrapper">
            {loading && (
              <div className="graph-loader">
                <LoadingSpinner size={40} />
              </div>
            )}
            <div ref={graphRef} className="fin-vis-container" />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-body">
          <h3>Recent Wire Transfers & Bank Transactions</h3>
          <div className="table-container" style={{ marginTop: 12, border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ACCOUNT NO.</th>
                  <th>BANK NAME</th>
                  <th>AMOUNT</th>
                  <th>TIMESTAMP</th>
                  <th>RISK FLAG</th>
                </tr>
              </thead>
              <tbody>
                {(stats.transactions || []).map((tx, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{tx.AccountNo}</td>
                    <td>{tx.Bank}</td>
                    <td style={{ fontWeight: 700 }}>{tx.Amount}</td>
                    <td>{tx.Date}</td>
                    <td>
                      <span className={`badge ${tx.Suspicious ? 'badge-red' : 'badge-green'}`}>
                        {tx.Suspicious ? '🚨 FLAGGED MULE' : 'NORMAL'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
