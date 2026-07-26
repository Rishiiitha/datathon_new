import React, { useState, useEffect } from 'react'
import { getForecast, getHotspots } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import './ForecastingPage.css'

export default function ForecastingPage() {
  const [district, setDistrict] = useState('Bengaluru Urban')
  const [crimeType, setCrimeType] = useState('Cyber Fraud')
  const [days, setDays] = useState('30')
  const [loading, setLoading] = useState(true)

  const [forecastData, setForecastData] = useState([])
  const [hotspotsData, setHotspotsData] = useState([])

  const fetchForecastData = async () => {
    setLoading(true)
    try {
      const [fRes, hRes] = await Promise.allSettled([
        getForecast({ district, crimeType, days }),
        getHotspots()
      ])

      setForecastData(fRes.status === 'fulfilled' ? (fRes.data?.series || fRes.data || []) : [])
      setHotspotsData(hRes.status === 'fulfilled' ? (hRes.data?.hotspots || hRes.data || []) : [])
    } catch (err) {
      console.error('Failed to fetch forecast:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchForecastData()
  }, [])

  const chartSeries = forecastData.length > 0 ? forecastData : [
    { date: 'Day -14', historical: 12 },
    { date: 'Day -12', historical: 15 },
    { date: 'Day -10', historical: 18 },
    { date: 'Day -8', historical: 14 },
    { date: 'Day -6', historical: 20 },
    { date: 'Day -4', historical: 22 },
    { date: 'Day -2', historical: 19 },
    { date: 'Day 0 (Today)', historical: 24, predicted: 24 },
    { date: 'Day +2', predicted: 27 },
    { date: 'Day +4', predicted: 31 },
    { date: 'Day +6', predicted: 35 },
    { date: 'Day +8', predicted: 32 },
    { date: 'Day +10', predicted: 38 },
    { date: 'Day +12', predicted: 42 },
    { date: 'Day +14', predicted: 40 }
  ]

  const hotspotsList = (hotspotsData.length > 0 ? hotspotsData : [
    { district: 'Bengaluru Urban (Indiranagar / MG Road)', predictedCount: 42, threshold: 30, severity: 'HIGH RISK ALERT' },
    { district: 'Mysuru City (Devaraja / Mandi)', predictedCount: 28, threshold: 20, severity: 'MEDIUM RISK' },
    { district: 'Mangaluru City (Panambur / Kadri)', predictedCount: 24, threshold: 18, severity: 'MEDIUM RISK' },
    { district: 'Belagavi (Camp / APMC)', predictedCount: 15, threshold: 15, severity: 'LOW RISK' }
  ]).sort((a, b) => b.predictedCount - a.predictedCount)

  const highSeverityAlerts = hotspotsList.filter(h => h.predictedCount > (h.threshold || 25))

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">Predictive Crime Forecasting & Hotspot Alerts</h1>
        <p className="page-subtitle">AI time-series model projections and spatial hotspot vulnerability</p>
      </div>

      <div className="forecasting-layout">
        {/* Left Controls Panel */}
        <div className="card controls-panel">
          <div className="card-body">
            <h3 style={{ marginBottom: 16 }}>Forecast Controls</h3>

            <div className="control-group">
              <label>Target District</label>
              <select className="select" value={district} onChange={e => setDistrict(e.target.value)}>
                <option value="Bengaluru Urban">Bengaluru Urban</option>
                <option value="Mysuru City">Mysuru City</option>
                <option value="Mangaluru">Mangaluru</option>
                <option value="Belagavi">Belagavi</option>
                <option value="Hubballi">Hubballi</option>
              </select>
            </div>

            <div className="control-group">
              <label>Crime Category</label>
              <select className="select" value={crimeType} onChange={e => setCrimeType(e.target.value)}>
                <option value="Cyber Fraud">Cyber Fraud</option>
                <option value="Robbery">Robbery / Theft</option>
                <option value="Assault">Violent Assault</option>
                <option value="Narcotics">Narcotics Racket</option>
              </select>
            </div>

            <div className="control-group">
              <label>Projection Horizon</label>
              <select className="select" value={days} onChange={e => setDays(e.target.value)}>
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
              </select>
            </div>

            <button className="btn btn-primary btn-block" onClick={fetchForecastData} disabled={loading} style={{ marginTop: 20 }}>
              ⚡ Generate Forecast
            </button>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="forecasting-main">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h3>Historical vs Predicted Incidence ({days} Days Horizon)</h3>
                <div className="chip" style={{ background: 'rgba(56,189,248,0.1)', color: 'var(--accent-cyan)' }}>
                  Model: LSTM Spatial-Temporal
                </div>
              </div>

              {loading ? (
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LoadingSpinner size={40} />
                </div>
              ) : (
                <div style={{ width: '100%', height: 300, marginTop: 16 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#0d1224', borderColor: 'var(--border)', borderRadius: 8, color: '#f1f5f9' }} />
                      <Legend verticalAlign="top" height={36} />
                      <Line
                        type="monotone"
                        dataKey="historical"
                        name="Historical FIR Count"
                        stroke="#38bdf8"
                        strokeWidth={3}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        name="Predicted Projection"
                        stroke="#f87171"
                        strokeWidth={3}
                        strokeDasharray="5 5"
                        dot={{ r: 4, fill: '#f87171' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Alert Cards for High Threshold Hotspots */}
          {highSeverityAlerts.length > 0 && (
            <div className="alerts-section" style={{ marginTop: 20 }}>
              <h3 style={{ marginBottom: 12, color: 'var(--accent-red)' }}>🚨 Active Threshold Spike Warnings</h3>
              <div className="alerts-grid">
                {highSeverityAlerts.map((alt, idx) => (
                  <div key={idx} className="card alert-card-red">
                    <div className="card-body">
                      <div className="flex items-center justify-between">
                        <span className="badge badge-red">{alt.severity || 'HIGH RISK ALERT'}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Threshold Exceeded</span>
                      </div>
                      <h4 style={{ marginTop: 10, marginBottom: 4 }}>{alt.district}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        Predicted Volume: <strong style={{ color: 'var(--accent-red)' }}>{alt.predictedCount} cases</strong> (Normal Baseline: {alt.threshold})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hotspots List */}
          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-body">
              <h3>📍 Spatial Hotspot Vulnerability Index</h3>
              <div className="table-container" style={{ marginTop: 12, border: 'none' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>DISTRICT / ZONE</th>
                      <th>PREDICTED INCIDENCE</th>
                      <th>BASELINE THRESHOLD</th>
                      <th>SEVERITY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hotspotsList.map((hs, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{hs.district}</td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{hs.predictedCount} FIRs</td>
                        <td>{hs.threshold || 20}</td>
                        <td>
                          <span className={`badge ${
                            (hs.severity || '').includes('HIGH') ? 'badge-red' : (hs.severity || '').includes('MEDIUM') ? 'badge-amber' : 'badge-green'
                          }`}>
                            {hs.severity || 'NORMAL'}
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
      </div>
    </div>
  )
}
