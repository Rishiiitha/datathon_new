import React, { useState, useEffect } from 'react'
import {
  getCrimeTrends,
  getCrimeByType,
  getCrimeByDistrict,
  getCrimeByGravity,
  getTopSections,
  getHeatmapData
} from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import './AnalyticsPage.css'

const COLOR_PALETTE = ['#38bdf8', '#fbbf24', '#f87171', '#34d399', '#a78bfa', '#fb923c', '#ec4899', '#6366f1']

export default function AnalyticsPage() {
  const [district, setDistrict] = useState('All')
  const [year, setYear] = useState('2024')
  const [activeTab, setActiveTab] = useState('charts')
  const [loading, setLoading] = useState(true)

  const [trendsData, setTrendsData] = useState([])
  const [typeData, setTypeData] = useState([])
  const [districtData, setDistrictData] = useState([])
  const [sectionsData, setSectionsData] = useState([])
  const [heatmapData, setHeatmapData] = useState([])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const params = { district: district === 'All' ? undefined : district, year }
      const [tRes, tpRes, dRes, sRes, hRes] = await Promise.allSettled([
        getCrimeTrends(params),
        getCrimeByType(),
        getCrimeByDistrict(),
        getTopSections(),
        getHeatmapData()
      ])

      setTrendsData(tRes.status === 'fulfilled' ? tRes.data : [])
      setTypeData(tpRes.status === 'fulfilled' ? tpRes.data : [])
      setDistrictData(dRes.status === 'fulfilled' ? dRes.data : [])
      setSectionsData(sRes.status === 'fulfilled' ? sRes.data : [])
      setHeatmapData(hRes.status === 'fulfilled' ? hRes.data : [])
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const displayTrends = trendsData.length > 0 ? trendsData : [
    { month: 'Jan', count: 120 }, { month: 'Feb', count: 145 },
    { month: 'Mar', count: 130 }, { month: 'Apr', count: 160 },
    { month: 'May', count: 175 }, { month: 'Jun', count: 190 },
    { month: 'Jul', count: 210 }, { month: 'Aug', count: 185 },
    { month: 'Sep', count: 165 }, { month: 'Oct', count: 150 },
    { month: 'Nov', count: 140 }, { month: 'Dec', count: 155 }
  ]

  const displayTypes = typeData.length > 0 ? typeData : [
    { name: 'Theft/Burglary', value: 420 },
    { name: 'Assault/Homicide', value: 280 },
    { name: 'Cyber Crime', value: 310 },
    { name: 'Narcotics', value: 190 },
    { name: 'Financial Fraud', value: 240 }
  ]

  const displayDistricts = districtData.length > 0 ? districtData : [
    { district: 'Bengaluru Urban', count: 850 },
    { district: 'Mysuru City', count: 420 },
    { district: 'Mangaluru', count: 310 },
    { district: 'Belagavi', count: 280 },
    { district: 'Hubballi', count: 240 }
  ]

  const displaySections = sectionsData.length > 0 ? sectionsData : [
    { section: 'IPC 379 (Theft)', count: 450 },
    { section: 'IPC 302 (Murder)', count: 120 },
    { section: 'IPC 420 (Cheating)', count: 380 },
    { section: 'IPC 354 (Assault)', count: 290 },
    { section: 'IT Act 66D', count: 310 }
  ]

  const displayHeatmap = (heatmapData.length > 0 ? heatmapData : [
    { districtName: 'Bengaluru Urban', crimeCount: 3420 },
    { districtName: 'Mysuru City', crimeCount: 1890 },
    { districtName: 'Mangaluru', crimeCount: 1450 },
    { districtName: 'Belagavi', crimeCount: 1210 },
    { districtName: 'Hubballi-Dharwad', crimeCount: 980 },
    { districtName: 'Kalaburagi', crimeCount: 840 },
    { districtName: 'Shivamogga', crimeCount: 650 },
    { districtName: 'Tumakuru', crimeCount: 520 }
  ]).sort((a, b) => b.crimeCount - a.crimeCount)

  const maxHeatmapCount = Math.max(...displayHeatmap.map(h => h.crimeCount), 1)

  return (
    <div className="page-container fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Crime Analytics & Spatial Data</h1>
          <p className="page-subtitle">Historical patterns, act-section distributions, and regional intensity</p>
        </div>
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'charts' ? 'active' : ''}`}
            onClick={() => setActiveTab('charts')}
          >
            📊 Charts View
          </button>
          <button
            className={`tab-btn ${activeTab === 'heatmap' ? 'active' : ''}`}
            onClick={() => setActiveTab('heatmap')}
          >
            🔥 Regional Heatmap
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card filter-bar flex items-center gap-4">
        <div className="filter-item">
          <label>District:</label>
          <select className="select" value={district} onChange={e => setDistrict(e.target.value)}>
            <option value="All">All Districts</option>
            <option value="Bengaluru Urban">Bengaluru Urban</option>
            <option value="Mysuru City">Mysuru City</option>
            <option value="Mangaluru">Mangaluru</option>
            <option value="Belagavi">Belagavi</option>
            <option value="Hubballi">Hubballi</option>
          </select>
        </div>

        <div className="filter-item">
          <label>Year:</label>
          <select className="select" value={year} onChange={e => setYear(e.target.value)}>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={fetchAnalytics} disabled={loading}>
          Apply Filters
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 40 }}>
          <LoadingSpinner size={40} />
        </div>
      ) : activeTab === 'charts' ? (
        <div className="analytics-charts-grid">
          {/* Monthly Trend */}
          <div className="card chart-card">
            <div className="card-body">
              <h3>Monthly Crime Trend</h3>
              <div style={{ width: '100%', height: 260, marginTop: 16 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={displayTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#0d1224', borderColor: 'var(--border)', borderRadius: 8, color: '#f1f5f9' }} />
                    <Line type="monotone" dataKey="count" stroke="#38bdf8" strokeWidth={3} dot={{ fill: '#38bdf8', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Pie Chart Crime Types */}
          <div className="card chart-card">
            <div className="card-body">
              <h3>Crime Classification Breakdown</h3>
              <div style={{ width: '100%', height: 260, marginTop: 16 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={displayTypes} dataKey="value" cx="50%" cy="50%" outerRadius={85} label>
                      {displayTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0d1224', borderColor: 'var(--border)', borderRadius: 8, color: '#f1f5f9' }} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bar Chart Horizontal - Top Districts */}
          <div className="card chart-card">
            <div className="card-body">
              <h3>Top Districts by Crime Volume</h3>
              <div style={{ width: '100%', height: 260, marginTop: 16 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayDistricts} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis dataKey="district" type="category" stroke="var(--text-muted)" fontSize={12} width={100} />
                    <Tooltip contentStyle={{ background: '#0d1224', borderColor: 'var(--border)', borderRadius: 8, color: '#f1f5f9' }} />
                    <Bar dataKey="count" fill="#fbbf24" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bar Chart Top Sections */}
          <div className="card chart-card">
            <div className="card-body">
              <h3>Top Registered Legal Sections</h3>
              <div style={{ width: '100%', height: 260, marginTop: 16 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displaySections}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="section" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#0d1224', borderColor: 'var(--border)', borderRadius: 8, color: '#f1f5f9' }} />
                    <Bar dataKey="count" fill="#34d399" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Heatmap Tab */
        <div className="card heatmap-card fade-in">
          <div className="card-body">
            <h3>Regional District Intensity Heatmap</h3>
            <p className="page-subtitle" style={{ marginBottom: 20 }}>
              Sorted by total criminal cases registered
            </p>

            <div className="heatmap-list">
              {displayHeatmap.map((item, idx) => {
                const pct = Math.round((item.crimeCount / maxHeatmapCount) * 100)
                const intensityColor = pct > 75 ? '#f87171' : pct > 45 ? '#fbbf24' : '#38bdf8'
                return (
                  <div key={idx} className="heatmap-row">
                    <div className="heatmap-district-info">
                      <span className="district-name">{item.districtName}</span>
                      <span className="crime-count">{item.crimeCount} FIRs</span>
                    </div>
                    <div className="intensity-bar-bg">
                      <div
                        className="intensity-bar-fill"
                        style={{ width: `${pct}%`, background: intensityColor }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
