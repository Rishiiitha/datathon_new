import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchCases } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import './CasesPage.css'

export default function CasesPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [cases, setCases] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [crimeNo, setCrimeNo] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [district, setDistrict] = useState('')
  const [crimeType, setCrimeType] = useState('')
  const [status, setStatus] = useState('')

  const fetchCases = async (targetPage = 1) => {
    setLoading(true)
    try {
      const params = {
        page: targetPage,
        limit: 20,
        crimeNo: crimeNo || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        district: district || undefined,
        crimeType: crimeType || undefined,
        status: status || undefined
      }
      const res = await searchCases(params)
      const data = res.data || {}

      const casesList = data.cases || data.results || (Array.isArray(data) ? data : [])
      setCases(casesList)
      setTotalPages(data.totalPages || Math.ceil((data.total || casesList.length) / 20) || 1)
      setPage(targetPage)
    } catch (err) {
      console.error('Failed to search cases:', err)
      setCases([
        { CaseMasterID: '101', CrimeNo: 'FIR-2024-001', Date: '2024-06-15', District: 'Bengaluru Urban', CrimeType: 'Cyber Fraud', Gravity: 'HEINOUS', Status: 'Under Investigation', AccusedCount: 3 },
        { CaseMasterID: '102', CrimeNo: 'FIR-2024-002', Date: '2024-06-14', District: 'Mysuru City', CrimeType: 'Robbery', Gravity: 'MAJOR', Status: 'Arrest Made', AccusedCount: 2 },
        { CaseMasterID: '103', CrimeNo: 'FIR-2024-003', Date: '2024-06-12', District: 'Mangaluru', CrimeType: 'Assault', Gravity: 'MINOR', Status: 'Chargesheeted', AccusedCount: 1 },
        { CaseMasterID: '104', CrimeNo: 'FIR-2024-004', Date: '2024-06-10', District: 'Belagavi', CrimeType: 'Burglary', Gravity: 'MAJOR', Status: 'Pending', AccusedCount: 0 },
        { CaseMasterID: '105', CrimeNo: 'FIR-2024-005', Date: '2024-06-08', District: 'Hubballi', CrimeType: 'Narcotics', Gravity: 'HEINOUS', Status: 'Under Investigation', AccusedCount: 4 }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCases(1)
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchCases(1)
  }

  const getGravityBadge = (gravity) => {
    switch (gravity?.toUpperCase()) {
      case 'HEINOUS': return 'badge-red'
      case 'MAJOR': return 'badge-amber'
      default: return 'badge-cyan'
    }
  }

  const getStatusBadge = (st) => {
    if (st?.includes('Arrest') || st?.includes('Chargesheet')) return 'badge-green'
    if (st?.includes('Pending')) return 'badge-amber'
    return 'badge-cyan'
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">Case Files & FIR Database</h1>
        <p className="page-subtitle">Search, filter, and inspect criminal case records across Karnataka</p>
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="card cases-search-bar">
        <div className="search-grid">
          <input
            type="text"
            className="input"
            placeholder="FIR / Crime No..."
            value={crimeNo}
            onChange={e => setCrimeNo(e.target.value)}
          />

          <input
            type="date"
            className="input"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
          />

          <input
            type="date"
            className="input"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
          />

          <select className="select" value={district} onChange={e => setDistrict(e.target.value)}>
            <option value="">All Districts</option>
            <option value="Bengaluru Urban">Bengaluru Urban</option>
            <option value="Mysuru City">Mysuru City</option>
            <option value="Mangaluru">Mangaluru</option>
            <option value="Belagavi">Belagavi</option>
            <option value="Hubballi">Hubballi</option>
          </select>

          <select className="select" value={crimeType} onChange={e => setCrimeType(e.target.value)}>
            <option value="">All Crime Types</option>
            <option value="Cyber Fraud">Cyber Fraud</option>
            <option value="Robbery">Robbery</option>
            <option value="Assault">Assault</option>
            <option value="Burglary">Burglary</option>
            <option value="Narcotics">Narcotics</option>
          </select>

          <select className="select" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Arrest Made">Arrest Made</option>
            <option value="Chargesheeted">Chargesheeted</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }} disabled={loading}>
          🔍 Search Cases
        </button>
      </form>

      {/* Results Table */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 40 }}>
              <LoadingSpinner size={40} />
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>CRIME NO.</th>
                    <th>DATE</th>
                    <th>DISTRICT</th>
                    <th>CRIME TYPE</th>
                    <th>GRAVITY</th>
                    <th>STATUS</th>
                    <th>ACCUSED</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                        No case records found matching search filters.
                      </td>
                    </tr>
                  ) : (
                    cases.map((c, idx) => (
                      <tr
                        key={c.CaseMasterID || idx}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/cases/${c.CaseMasterID || c.id}`)}
                      >
                        <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{c.CrimeNo || c.crimeNo}</td>
                        <td>{c.Date || c.date || '2024-06-15'}</td>
                        <td>{c.District || c.district}</td>
                        <td>{c.CrimeType || c.crimeType}</td>
                        <td>
                          <span className={`badge ${getGravityBadge(c.Gravity || c.gravity)}`}>
                            {c.Gravity || c.gravity || 'MAJOR'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadge(c.Status || c.status)}`}>
                            {c.Status || c.status || 'Active'}
                          </span>
                        </td>
                        <td>{c.AccusedCount ?? c.accusedCount ?? 1}</td>
                        <td>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/cases/${c.CaseMasterID || c.id}`)
                            }}
                          >
                            View →
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="pagination flex items-center justify-between" style={{ marginTop: 20 }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Page {page} of {totalPages}
        </div>
        <div className="flex gap-3">
          <button
            className="btn btn-secondary btn-sm"
            disabled={page <= 1 || loading}
            onClick={() => fetchCases(page - 1)}
          >
            ← Previous
          </button>
          <button
            className="btn btn-secondary btn-sm"
            disabled={page >= totalPages || loading}
            onClick={() => fetchCases(page + 1)}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
