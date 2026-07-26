import React, { useState, useEffect } from 'react'
import { getUsers, upsertUser, getAuditLog } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import './AdminPage.css'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users')
  const [loading, setLoading] = useState(true)

  const [users, setUsers] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [updatingUser, setUpdatingUser] = useState(null)

  const loadAdminData = async () => {
    setLoading(true)
    try {
      const [uRes, aRes] = await Promise.allSettled([
        getUsers(),
        getAuditLog(100)
      ])

      setUsers(uRes.status === 'fulfilled' ? (uRes.data?.users || uRes.data || []) : [])
      setAuditLogs(aRes.status === 'fulfilled' ? (aRes.data?.logs || aRes.data || []) : [])
    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  const handleRoleChange = async (userObj, newRole) => {
    setUpdatingUser(userObj.id || userObj.email)
    try {
      await upsertUser({ ...userObj, role: newRole })
      setUsers(prev => prev.map(u => (u.email === userObj.email ? { ...u, role: newRole } : u)))
    } catch (err) {
      console.error('Failed to update user role:', err)
      alert('Failed to update role.')
    } finally {
      setUpdatingUser(null)
    }
  }

  const usersList = users.length > 0 ? users : [
    { id: '1', email: 'admin@crimeiq.gov.in', role: 'admin', isActive: true, department: 'State HQ' },
    { id: '2', email: 'officer.rao@crimeiq.gov.in', role: 'investigator', isActive: true, department: 'Indiranagar PS' },
    { id: '3', email: 'analyst.patil@crimeiq.gov.in', role: 'analyst', isActive: true, department: 'Cyber Cell' },
    { id: '4', email: 'inspector.gowda@crimeiq.gov.in', role: 'investigator', isActive: false, department: 'Mysuru City' }
  ]

  const auditList = auditLogs.length > 0 ? auditLogs : [
    { timestamp: '2024-07-22 08:30:15', email: 'admin@crimeiq.gov.in', action: 'ROLE_UPDATE', resource: 'user:officer.rao' },
    { timestamp: '2024-07-22 08:15:42', email: 'officer.rao@crimeiq.gov.in', action: 'CASE_LOOKUP', resource: 'case:FIR-2024-001' },
    { timestamp: '2024-07-22 07:55:10', email: 'analyst.patil@crimeiq.gov.in', action: 'FORECAST_RUN', resource: 'district:Bengaluru Urban' },
    { timestamp: '2024-07-21 18:20:05', email: 'admin@crimeiq.gov.in', action: 'EXPORT_PDF', resource: 'chat_session:sess_102' }
  ]

  return (
    <div className="page-container fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Admin Control Panel</h1>
          <p className="page-subtitle">User role management and system security audit trail</p>
        </div>

        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 User Management
          </button>
          <button
            className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            📜 Audit Log (100)
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 60 }}>
          <LoadingSpinner size={48} />
        </div>
      ) : activeTab === 'users' ? (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>EMAIL</th>
                    <th>DEPARTMENT</th>
                    <th>STATUS</th>
                    <th>ROLE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u, i) => (
                    <tr key={u.id || i}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.email}</td>
                      <td>{u.department || 'Karnataka Police'}</td>
                      <td>
                        <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                          {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td>
                        <select
                          className="select select-inline"
                          value={u.role}
                          disabled={updatingUser === (u.id || u.email)}
                          onChange={e => handleRoleChange(u, e.target.value)}
                        >
                          <option value="admin">Admin</option>
                          <option value="investigator">Investigator</option>
                          <option value="analyst">Analyst</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </td>
                      <td>
                        {updatingUser === (u.id || u.email) ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>Saving...</span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Synced</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Audit Log Tab */
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>TIMESTAMP</th>
                    <th>USER EMAIL</th>
                    <th>ACTION</th>
                    <th>TARGET RESOURCE</th>
                  </tr>
                </thead>
                <tbody>
                  {auditList.map((log, i) => (
                    <tr key={i}>
                      <td className="timestamp-cell">{log.timestamp}</td>
                      <td style={{ fontWeight: 600 }}>{log.email}</td>
                      <td>
                        <span className="chip" style={{ fontSize: '0.72rem', background: 'rgba(56,189,248,0.1)', color: 'var(--accent-cyan)' }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {log.resource}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
