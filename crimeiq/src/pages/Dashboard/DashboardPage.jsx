import React, { useState, useEffect } from 'react'
import { getAnalyticsSummary, getCrimeTrends, getCrimeByType } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import StatCard from '../../components/common/StatCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import './DashboardPage.css'

const CATEGORY_COLORS = ['#38bdf8', '#fbbf24', '#f87171', '#34d399', '#a78bfa', '#fb923c']

const DEFAULT_DASHBOARD_DATA = {
  summary: {
    totalFirs: '12,480',
    activeCases: '3,120',
    arrestsMade: '8,940',
    heinousCrimes: '450',
    chargesheetRate: '74.5%',
    pendingCases: '1,860'
  },
  last7Days: [
    { date: 'Mon', count: 42 },
    { date: 'Tue', count: 58 },
    { date: 'Wed', count: 35 },
    { date: 'Thu', count: 64 },
    { date: 'Fri', count: 48 },
    { date: 'Sat', count: 72 },
    { date: 'Sun', count: 39 }
  ],
  crimeTypes: [
    { name: 'Theft & Burglary', value: 4200 },
    { name: 'Assault & Hurt', value: 3100 },
    { name: 'Cybercrime & Fraud', value: 2400 },
    { name: 'NDPS & Narcotics', value: 1500 },
    { name: 'Heinous Homicide', value: 1250 }
  ],
  recentCases: [
    { id: 'CR-2024-001', crime: 'Homicide / Burglary', station: 'Bengaluru Central', date: '2024-03-15', status: 'Under Investigation' },
    { id: 'CR-2024-004', crime: 'Commercial Theft', station: 'Koramangala Station', date: '2024-04-10', status: 'Under Investigation' },
    { id: 'FIR-2024-101', crime: 'Cheating & Fraud', station: 'Lashkar PS Mysuru', date: '2024-05-01', status: 'Charge Sheeted' }
  ]
}

export default function DashboardPage() {
  const { role, user } = useAuthStore()
  const [data, setData] = useState(DEFAULT_DASHBOARD_DATA)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const [summaryRes, trendsRes, typeRes] = await Promise.allSettled([
          getAnalyticsSummary(),
          getCrimeTrends(),
          getCrimeByType()
        ])

        const summary = summaryRes.status === 'fulfilled' ? summaryRes.value?.data : {}
        const trends = trendsRes.status === 'fulfilled' ? trendsRes.value?.data?.trends : []
        const crimeTypes = typeRes.status === 'fulfilled' ? typeRes.value?.data?.crimeTypes : []

        if (summary || trends || crimeTypes) {
          setData(prev => ({
            summary: summary?.totalFIRs ? {
              totalFirs: summary.totalFIRs,
              activeCases: summary.activeCases,
              arrestsMade: summary.arrests,
              heinousCrimes: summary.heinousCrimes,
              chargesheetRate: `${summary.chargesheetRate}%`,
              pendingCases: summary.pendingCases
            } : prev.summary,
            last7Days: summary?.last7Days || (Array.isArray(trends) && trends.length > 0 ? trends.slice(-7) : prev.last7Days),
            crimeTypes: crimeTypes && crimeTypes.length > 0 ? crimeTypes : prev.crimeTypes,
            recentCases: prev.recentCases
          }))
        }
      } catch (err) {
        console.error('Failed to update dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const kpis = [
    { label: 'Total FIRs', value: data.summary.totalFirs, icon: '📁', color: '#38bdf8', trend: 5.2 },
    { label: 'Active Cases', value: data.summary.activeCases, icon: '⚡', color: '#fbbf24', trend: -2.1 },
    { label: 'Arrests Made', value: data.summary.arrestsMade, icon: '👮', color: '#34d399', trend: 8.4 },
    { label: 'Heinous Crimes', value: data.summary.heinousCrimes, icon: '🚨', color: '#f87171', trend: -4.3 },
    { label: 'Chargesheet Rate', value: data.summary.chargesheetRate, icon: '📜', color: '#a78bfa', trend: 3.1 },
    { label: 'Pending Cases', value: data.summary.pendingCases, icon: '⏳', color: '#fb923c', trend: -1.5 }
  ]

  return (
    <div className="dashboard-container fade-in">
      <header className="dashboard-header">
        <div>
          <h1>Karnataka Police Crime Intelligence</h1>
          <p className="subtitle">Welcome back, {user?.email || 'Officer'} • Role: <strong style={{ color: 'var(--accent-cyan)' }}>{(role || 'investigator').toUpperCase()}</strong></p>
        </div>
        <div className="date-badge">
          📅 {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </header>

      <section className="kpi-grid">
        {kpis.map((kpi, idx) => (
          <StatCard key={idx} {...kpi} />
        ))}
      </section>

      <div className="charts-grid">
        <div className="card chart-card">
          <div className="card-header">
            <h3>Recent Crime Trend (7 Days)</h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip contentStyle={{ background: '#0f172a', borderColor: 'var(--border)', borderRadius: 8 }} />
                <Bar dataKey="count" fill="var(--accent-cyan)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card">
          <div className="card-header">
            <h3>Crime Category Breakdown</h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data.crimeTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.crimeTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', borderColor: 'var(--border)', borderRadius: 8 }} />
                <Legend formatter={(val) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
