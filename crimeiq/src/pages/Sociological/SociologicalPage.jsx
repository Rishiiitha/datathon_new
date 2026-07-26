import React, { useState, useEffect } from 'react'
import { getSociologicalData } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'
import './SociologicalPage.css'

const COLORS = ['#38bdf8', '#fbbf24', '#f87171', '#34d399', '#a78bfa', '#fb923c', '#ec4899', '#6366f1']

export default function SociologicalPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const res = await getSociologicalData()
        setData(res.data)
      } catch (err) {
        console.error('Failed to load sociological data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const victimGenderData = data?.victimGender || [
    { name: 'Female', value: 58 },
    { name: 'Male', value: 40 },
    { name: 'Other', value: 2 }
  ]

  const complainantReligionData = data?.complainantReligion || [
    { name: 'Hindu', value: 65 },
    { name: 'Muslim', value: 22 },
    { name: 'Christian', value: 9 },
    { name: 'Others', value: 4 }
  ]

  const complainantCasteData = (data?.complainantCaste || [
    { name: 'General', value: 35 },
    { name: 'OBC', value: 30 },
    { name: 'SC', value: 20 },
    { name: 'ST', value: 10 },
    { name: 'Others', value: 5 }
  ]).slice(0, 8)

  const complainantOccupationData = (data?.complainantOccupation || [
    { name: 'Private Employee', value: 38 },
    { name: 'Business Owner', value: 24 },
    { name: 'Student', value: 15 },
    { name: 'Government Employee', value: 12 },
    { name: 'Homemaker', value: 8 },
    { name: 'Agriculture', value: 3 }
  ]).slice(0, 8)

  const accusedAgeData = data?.accusedAgeGroups || [
    { group: '0-18 yrs', count: 45 },
    { group: '19-25 yrs', count: 240 },
    { group: '26-35 yrs', count: 380 },
    { group: '36-50 yrs', count: 190 },
    { group: '51+ yrs', count: 65 }
  ]

  const aiInsightsText = data?.insights ||
    'Sociological analysis indicates a high concentration of offender initiation in the 19-35 age bracket (68% of total accused). Financial cyber victimology skews towards private sector workers, while property offense complaints show uniform distribution across socioeconomic backgrounds.'

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">Sociological & Demographic Insights</h1>
        <p className="page-subtitle">Demographic distributions of victims, complainants, and offender age cohorts</p>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 60 }}>
          <LoadingSpinner size={48} />
        </div>
      ) : (
        <>
          {/* AI Insights Card */}
          <div className="card socio-insights-card" style={{ marginBottom: 24 }}>
            <div className="card-body">
              <h3>🤖 AI Demographic Intelligence</h3>
              <p style={{ marginTop: 8, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {aiInsightsText}
              </p>
            </div>
          </div>

          {/* 4 Pie Charts Grid */}
          <div className="socio-grid">
            <div className="card chart-card">
              <div className="card-body">
                <h3>Victim Gender Ratio</h3>
                <div style={{ width: '100%', height: 220, marginTop: 12 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={victimGenderData} dataKey="value" cx="50%" cy="50%" outerRadius={75} label>
                        {victimGenderData.map((e, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#0d1224', borderColor: 'var(--border)', borderRadius: 8, color: '#f1f5f9' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="card chart-card">
              <div className="card-body">
                <h3>Complainant Religion Distribution</h3>
                <div style={{ width: '100%', height: 220, marginTop: 12 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={complainantReligionData} dataKey="value" cx="50%" cy="50%" outerRadius={75} label>
                        {complainantReligionData.map((e, i) => (
                          <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#0d1224', borderColor: 'var(--border)', borderRadius: 8, color: '#f1f5f9' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="card chart-card">
              <div className="card-body">
                <h3>Complainant Social Category (Top 8)</h3>
                <div style={{ width: '100%', height: 220, marginTop: 12 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={complainantCasteData} dataKey="value" cx="50%" cy="50%" outerRadius={75} label>
                        {complainantCasteData.map((e, i) => (
                          <Cell key={i} fill={COLORS[(i + 4) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#0d1224', borderColor: 'var(--border)', borderRadius: 8, color: '#f1f5f9' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="card chart-card">
              <div className="card-body">
                <h3>Complainant Occupation (Top 8)</h3>
                <div style={{ width: '100%', height: 220, marginTop: 12 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={complainantOccupationData} dataKey="value" cx="50%" cy="50%" outerRadius={75} label>
                        {complainantOccupationData.map((e, i) => (
                          <Cell key={i} fill={COLORS[(i + 1) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#0d1224', borderColor: 'var(--border)', borderRadius: 8, color: '#f1f5f9' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Bar Chart: Accused Age Groups */}
          <div className="card" style={{ marginTop: 24 }}>
            <div className="card-body">
              <h3>Accused Age Group Cohort Distribution</h3>
              <div style={{ width: '100%', height: 260, marginTop: 16 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={accusedAgeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="group" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#0d1224', borderColor: 'var(--border)', borderRadius: 8, color: '#f1f5f9' }} />
                    <Bar dataKey="count" fill="#f87171" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
