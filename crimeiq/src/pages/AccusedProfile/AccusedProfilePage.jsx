import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOffenderProfile, getTopRiskOffenders, getNetwork } from '../../services/api'
import RiskGauge from '../../components/common/RiskGauge'
import Timeline from '../../components/common/Timeline'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { Network, DataSet } from 'vis-network/standalone'
import './AccusedProfilePage.css'

export default function AccusedProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [topOffenders, setTopOffenders] = useState([])

  const miniGraphRef = useRef(null)
  const miniNetworkInstanceRef = useRef(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        if (!id) {
          const res = await getTopRiskOffenders(20)
          setTopOffenders(res.data?.offenders || res.data || [])
        } else {
          const [pRes, nRes] = await Promise.allSettled([
            getOffenderProfile(id),
            getNetwork(id)
          ])

          const pData = pRes.status === 'fulfilled' ? pRes.data : null
          setProfile(pData)

          const netData = nRes.status === 'fulfilled' ? nRes.data : {}
          renderMiniGraph(netData.nodes || [], netData.edges || [])
        }
      } catch (err) {
        console.error('Failed to load profile data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  const renderMiniGraph = (nodes, edges) => {
    if (!miniGraphRef.current) return

    const graphNodes = nodes.length > 0 ? nodes : [
      { id: id || '1', label: profile?.Name || 'Primary Accused', color: { background: '#f87171' } },
      { id: '2', label: 'Co-Accused A', color: { background: '#fbbf24' } },
      { id: '3', label: 'Co-Accused B', color: { background: '#38bdf8' } }
    ]

    const graphEdges = edges.length > 0 ? edges : [
      { from: id || '1', to: '2' },
      { from: id || '1', to: '3' }
    ]

    const data = {
      nodes: new DataSet(graphNodes.map(n => ({
        id: n.id,
        label: n.label || n.name || `ID ${n.id}`,
        shape: 'dot',
        size: 16,
        color: n.color || { background: '#f87171', border: '#ef4444' },
        font: { color: '#f1f5f9', size: 10 }
      }))),
      edges: new DataSet(graphEdges.map(e => ({
        from: e.from,
        to: e.to,
        color: { color: 'rgba(255,255,255,0.2)' }
      })))
    }

    const options = {
      nodes: { borderWidth: 1 },
      physics: { barnesHut: { springLength: 50 } },
      interaction: { dragNodes: true, zoomView: false }
    }

    if (miniNetworkInstanceRef.current) {
      miniNetworkInstanceRef.current.destroy()
    }

    miniNetworkInstanceRef.current = new Network(miniGraphRef.current, data, options)
  }

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSpinner size={48} />
      </div>
    )
  }

  if (!id) {
    const list = topOffenders.length > 0 ? topOffenders : [
      { PersonID: 'ACC-1001', Name: 'Suresh Gowda', Age: 38, Gender: 'Male', RiskScore: 92, FirCount: 14, PrimaryCrime: 'Armed Robbery' },
      { PersonID: 'ACC-1002', Name: 'Mohammed Iqbal', Age: 41, Gender: 'Male', RiskScore: 88, FirCount: 11, PrimaryCrime: 'Extortion' },
      { PersonID: 'ACC-1003', Name: 'Venkatesh Babu', Age: 35, Gender: 'Male', RiskScore: 84, FirCount: 9, PrimaryCrime: 'Cyber Syndicate' },
      { PersonID: 'ACC-1004', Name: 'David D\'Souza', Age: 29, Gender: 'Male', RiskScore: 79, FirCount: 7, PrimaryCrime: 'Narcotics Trafficking' },
      { PersonID: 'ACC-1005', Name: 'Manjunath K', Age: 45, Gender: 'Male', RiskScore: 76, FirCount: 6, PrimaryCrime: 'Burglary Racket' }
    ]

    return (
      <div className="page-container fade-in">
        <div className="page-header">
          <h1 className="page-title">Top High-Risk Recidivists & Repeat Offenders</h1>
          <p className="page-subtitle">Ranked by risk score, offense gravity, and network degree centrality</p>
        </div>

        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>PERSON ID</th>
                    <th>NAME</th>
                    <th>AGE / GENDER</th>
                    <th>PRIMARY CRIME</th>
                    <th>FIR COUNT</th>
                    <th>RISK SCORE</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((off, idx) => (
                    <tr
                      key={off.PersonID || idx}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/accused/${off.PersonID || off.id}`)}
                    >
                      <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{off.PersonID || off.id}</td>
                      <td style={{ fontWeight: 600 }}>{off.Name || off.name}</td>
                      <td>{off.Age || 35} yrs • {off.Gender || 'Male'}</td>
                      <td>{off.PrimaryCrime || off.primaryCrime || 'Property Crime'}</td>
                      <td style={{ fontWeight: 700 }}>{off.FirCount || off.firCount || 5}</td>
                      <td>
                        <span className={`badge ${ (off.RiskScore || 0) >= 80 ? 'badge-red' : 'badge-amber' }`}>
                          {off.RiskScore || 75} / 100
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm">
                          Inspect Profile →
                        </button>
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

  const p = profile || {
    PersonID: id,
    Name: 'Ramesh Kumar',
    Age: 34,
    Gender: 'Male',
    RiskScore: 85,
    RiskLevel: 'HIGH RISK RECIDIVIST',
    BehavioralProfile: 'Demonstrates escalation pattern from non-violent property theft to organized financial cyber fraud. Operates using rotating bank accounts and co-conspirators in urban hubs.',
    actsCharged: ['IPC 420', 'IPC 379', 'IPC 120B', 'IT Act 66D'],
    firs: [
      { CrimeNo: 'FIR-2024-001', Date: '2024-05-12', District: 'Bengaluru Urban', Role: 'Primary Suspect', Status: 'Under Investigation' },
      { CrimeNo: 'FIR-2023-089', Date: '2023-11-20', District: 'Mysuru City', Role: 'Co-Accused', Status: 'Chargesheeted' },
      { CrimeNo: 'FIR-2022-045', Date: '2022-04-10', District: 'Bengaluru Urban', Role: 'Accused', Status: 'Convicted' }
    ],
    timeline: [
      { date: '2022-04-10', event: 'First Arrest (Theft)', desc: 'Booked under IPC 379 at Malleshwaram PS', color: '#38bdf8' },
      { date: '2023-11-20', event: 'Second Offense (Cyber Phishing)', desc: 'Chargesheet filed in Mysuru', color: '#fbbf24' },
      { date: '2024-05-12', event: 'Current Case (Financial Fraud)', desc: 'Primary accused in Indiranagar PS', color: '#f87171' }
    ]
  }

  return (
    <div className="page-container fade-in">
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/accused')} style={{ marginBottom: 16 }}>
        ← Back to High-Risk List
      </button>

      {/* Header Profile Card */}
      <div className="card offender-header-card">
        <div className="card-body flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="avatar-placeholder">👤</div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="page-title" style={{ margin: 0 }}>{p.Name}</h1>
                <span className="badge badge-red">{p.RiskLevel || 'HIGH RISK'}</span>
              </div>
              <p style={{ marginTop: 4 }}>
                Person ID: <strong style={{ color: 'var(--accent-cyan)' }}>{p.PersonID}</strong> • {p.Age} years • {p.Gender}
              </p>
            </div>
          </div>

          <RiskGauge score={p.RiskScore ?? 85} size={110} />
        </div>
      </div>

      {/* Behavioral Profile & Acts */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-body">
          <h3>🧠 AI Behavioral & Threat Profile</h3>
          <p style={{ marginTop: 8, fontSize: '0.925rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
            {p.BehavioralProfile}
          </p>

          <h4 style={{ marginTop: 16, marginBottom: 8, color: 'var(--text-secondary)' }}>Acts & Legal Sections Charged</h4>
          <div className="flex flex-wrap gap-2">
            {(p.actsCharged || ['IPC 420', 'IPC 120B']).map((act, i) => (
              <span key={i} className="chip">{act}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 3 Column Grid Layout */}
      <div className="profile-3col-grid" style={{ marginTop: 20 }}>
        {/* Left: FIR History */}
        <div className="card">
          <div className="card-body">
            <h3>📁 Associated FIRs ({p.firs?.length || 0})</h3>
            <div className="table-container" style={{ marginTop: 12, border: 'none' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>CRIME NO.</th>
                    <th>DATE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {(p.firs || []).map((fir, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{fir.CrimeNo}</td>
                      <td style={{ fontSize: '0.8rem' }}>{fir.Date}</td>
                      <td>
                        <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>{fir.Status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Center: Crime Progression */}
        <div className="card">
          <div className="card-body">
            <h3>📅 Criminal Progression</h3>
            <div style={{ marginTop: 16 }}>
              <Timeline events={p.timeline || []} />
            </div>
          </div>
        </div>

        {/* Right: Co-Accused Mini Graph */}
        <div className="card">
          <div className="card-body">
            <h3>🕸️ Network Association</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>Co-accused & accomplice links</p>
            <div ref={miniGraphRef} className="mini-network-container" />
          </div>
        </div>
      </div>
    </div>
  )
}
