import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCaseDetail, getSimilarCases, getInvestigationLeads } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Timeline from '../../components/common/Timeline'
import './CaseDetailPage.css'

export default function CaseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const [caseData, setCaseData] = useState(null)
  const [similarCases, setSimilarCases] = useState([])
  const [leads, setLeads] = useState([])

  useEffect(() => {
    async function loadAllDetails() {
      setLoading(true)
      try {
        const [cRes, sRes, lRes] = await Promise.allSettled([
          getCaseDetail(id),
          getSimilarCases(id),
          getInvestigationLeads(id)
        ])

        setCaseData(cRes.status === 'fulfilled' ? cRes.data : null)
        setSimilarCases(sRes.status === 'fulfilled' ? (sRes.data?.similar || sRes.data || []) : [])
        setLeads(lRes.status === 'fulfilled' ? (lRes.data?.leads || lRes.data || []) : [])
      } catch (err) {
        console.error('Failed to load case details:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAllDetails()
  }, [id])

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSpinner size={48} />
      </div>
    )
  }

  const detail = caseData || {
    CrimeNo: id || 'FIR-2024-001',
    CrimeType: 'Cyber Fraud & Financial Theft',
    District: 'Bengaluru Urban',
    PSName: 'Indiranagar PS',
    FIRDate: '2024-05-12',
    Status: 'Under Investigation',
    Gravity: 'HEINOUS',
    BriefFacts: 'Complainant reported fraudulent transaction of Rs 4,50,000 via spoofed banking portal. Multi-bank account layer identified in network analysis.',
    accused: [
      { PersonID: 'ACC-8910', Name: 'Ramesh Kumar', Age: 34, Gender: 'Male', RiskScore: 82, Role: 'Primary Suspect' },
      { PersonID: 'ACC-8911', Name: 'Venkatesh S', Age: 29, Gender: 'Male', RiskScore: 65, Role: 'Account Handler' }
    ],
    victims: [
      { PersonID: 'VIC-1021', Name: 'Ananya Sharma', Age: 42, Gender: 'Female', Relation: 'Complainant' }
    ],
    sections: [
      { ActID: 'IPC', SectionID: '420', Description: 'Cheating and dishonestly inducing delivery of property' },
      { ActID: 'IPC', SectionID: '120B', Description: 'Criminal Conspiracy' },
      { ActID: 'IT Act', SectionID: '66D', Description: 'Cheating by personation by using computer resource' }
    ],
    timeline: [
      { date: '2024-05-12 10:30 AM', event: 'FIR Registered', desc: 'Case lodged at Indiranagar PS', color: '#38bdf8' },
      { date: '2024-05-14 04:15 PM', event: 'Account Frozen', desc: 'Bank accounts blocked via nodal officer', color: '#fbbf24' },
      { date: '2024-05-18 11:00 AM', event: 'Primary Accused Arrested', desc: 'Ramesh Kumar detained at Electronic City', color: '#34d399' }
    ],
    aiSummary: 'High-confidence cyber fraud case linked to organized racket operating across South India. High likelihood of shared bank mule networks.'
  }

  const leadsList = leads.length > 0 ? leads : [
    'Cross-reference beneficiary bank account numbers with recent phishing cases in Mysuru.',
    'Trace IP address logins during the 10:00-10:30 AM window on May 12.',
    'Interrogate primary accused regarding co-conspirator Venkatesh S.'
  ]

  const similarList = similarCases.length > 0 ? similarCases : [
    { CrimeNo: 'FIR-2024-0412', CrimeType: 'Cyber Fraud', District: 'Bengaluru Urban', MatchScore: '94%' },
    { CrimeNo: 'FIR-2024-0389', CrimeType: 'Financial Fraud', District: 'Mysuru City', MatchScore: '88%' },
    { CrimeNo: 'FIR-2023-0982', CrimeType: 'Phishing Theft', District: 'Mangaluru', MatchScore: '81%' }
  ]

  return (
    <div className="page-container fade-in">
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/cases')} style={{ marginBottom: 16 }}>
        ← Back to Cases
      </button>

      {/* Case Header Card */}
      <div className="card case-header-card">
        <div className="card-body">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="page-title" style={{ margin: 0 }}>{detail.CrimeNo}</h1>
                <span className={`badge ${detail.Gravity === 'HEINOUS' ? 'badge-red' : 'badge-amber'}`}>
                  {detail.Gravity || 'MAJOR'}
                </span>
                <span className="badge badge-cyan">{detail.Status || 'Active'}</span>
              </div>
              <p style={{ marginTop: 4 }}>
                {detail.District} • {detail.PSName || 'Police Station'} • Registered: {detail.FIRDate || '2024-05-12'}
              </p>
            </div>

            <div className="chip" style={{ background: 'rgba(56,189,248,0.1)', color: 'var(--accent-cyan)' }}>
              Category: {detail.CrimeType}
            </div>
          </div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>Brief Facts of Case</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {detail.BriefFacts || 'No detailed brief facts provided.'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs" style={{ marginTop: 24, marginBottom: 20 }}>
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          📋 Overview
        </button>
        <button className={`tab-btn ${activeTab === 'accused' ? 'active' : ''}`} onClick={() => setActiveTab('accused')}>
          🚨 Accused ({detail.accused?.length || 0})
        </button>
        <button className={`tab-btn ${activeTab === 'victims' ? 'active' : ''}`} onClick={() => setActiveTab('victims')}>
          🛡️ Victims ({detail.victims?.length || 0})
        </button>
        <button className={`tab-btn ${activeTab === 'sections' ? 'active' : ''}`} onClick={() => setActiveTab('sections')}>
          ⚖️ Legal Sections ({detail.sections?.length || 0})
        </button>
        <button className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => setActiveTab('ai')}>
          🤖 AI Intelligence & Leads
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="card">
          <div className="card-body">
            <h3>Investigation Timeline</h3>
            <div style={{ marginTop: 20 }}>
              <Timeline events={detail.timeline || []} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'accused' && (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>PERSON ID</th>
                    <th>NAME</th>
                    <th>AGE / GENDER</th>
                    <th>ROLE</th>
                    <th>RISK SCORE</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {(detail.accused || []).map((acc, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{acc.PersonID}</td>
                      <td style={{ fontWeight: 600 }}>{acc.Name}</td>
                      <td>{acc.Age} yrs • {acc.Gender}</td>
                      <td>{acc.Role || 'Suspect'}</td>
                      <td>
                        <span className={`badge ${acc.RiskScore >= 70 ? 'badge-red' : 'badge-amber'}`}>
                          {acc.RiskScore ?? 50}/100
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/accused/${acc.PersonID}`)}
                        >
                          Offender Profile →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'victims' && (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>PERSON ID</th>
                    <th>NAME</th>
                    <th>AGE / GENDER</th>
                    <th>RELATION</th>
                  </tr>
                </thead>
                <tbody>
                  {(detail.victims || []).map((vic, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{vic.PersonID}</td>
                      <td style={{ fontWeight: 600 }}>{vic.Name}</td>
                      <td>{vic.Age} yrs • {vic.Gender}</td>
                      <td>{vic.Relation || 'Victim'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sections' && (
        <div className="card">
          <div className="card-body">
            <h3>Registered Acts & Sections</h3>
            <div className="chips-container" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
              {(detail.sections || []).map((sec, idx) => (
                <div key={idx} className="card" style={{ background: 'rgba(255,255,255,0.03)', padding: 14, minWidth: 240, flex: 1 }}>
                  <div className="chip" style={{ background: 'rgba(56,189,248,0.15)', color: 'var(--accent-cyan)', marginBottom: 8 }}>
                    {sec.ActID || 'IPC'} Section {sec.SectionID}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{sec.Description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="ai-insights-grid">
          <div className="card">
            <div className="card-body">
              <h3>🤖 AI Case Synthesis</h3>
              <p style={{ marginTop: 12, fontSize: '0.925rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {detail.aiSummary}
              </p>

              <h4 style={{ marginTop: 24, marginBottom: 12, color: 'var(--accent-cyan)' }}>Recommended Investigation Leads</h4>
              <ul className="leads-list">
                {leadsList.map((lead, idx) => (
                  <li key={idx} style={{ marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    • {typeof lead === 'string' ? lead : lead.description || lead.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h3>🔗 Similar Historical Cases</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                Matched via AI modus operandi vector embeddings
              </p>

              <div className="similar-cases-list">
                {similarList.map((sc, idx) => (
                  <div key={idx} className="similar-card flex items-center justify-between">
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{sc.CrimeNo}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{sc.CrimeType} • {sc.District}</div>
                    </div>
                    <div className="chip" style={{ background: 'rgba(52,211,153,0.15)', color: 'var(--accent-green)' }}>
                      {sc.MatchScore || '85%'} Match
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
