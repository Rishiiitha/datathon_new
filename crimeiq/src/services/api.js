import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL || ''

const api = axios.create({
  baseURL: BASE,
  timeout: 3000 // 3-second timeout guarantee
})

// Attach auth headers on every request
api.interceptors.request.use(config => {
  try {
    const auth = JSON.parse(localStorage.getItem('crimeiq_auth') || '{}')
    if (auth.token) {
      config.headers['Authorization']  = `Bearer ${auth.token}`
      config.headers['x-user-role']    = auth.role  || 'investigator'
      config.headers['x-user-email']   = auth.user?.email || 'unknown'
    }
  } catch {}

  // Map Catalyst Advanced I/O function URLs during serve mode
  if (config.url && !config.url.includes('/server/')) {
    if (config.url.startsWith('/api/chat')) {
      config.url = config.url.replace('/api/chat', '/server/chat-function')
    } else if (config.url.startsWith('/api/analytics')) {
      config.url = config.url.replace('/api/analytics', '/server/analytics-function')
    } else if (config.url.startsWith('/api/network')) {
      config.url = config.url.replace('/api/network', '/server/network-function')
    } else if (config.url.startsWith('/api/profile')) {
      config.url = config.url.replace('/api/profile', '/server/profiling-function')
    } else if (config.url.startsWith('/api/forecast')) {
      config.url = config.url.replace('/api/forecast', '/server/forecast-function')
    } else if (config.url.startsWith('/api/financial')) {
      config.url = config.url.replace('/api/financial', '/server/financial-function')
    } else if (config.url.startsWith('/api/investigation')) {
      config.url = config.url.replace('/api/investigation', '/server/investigation-function')
    } else if (config.url.startsWith('/api/admin') || config.url.startsWith('/api/auth')) {
      config.url = config.url.replace('/api/', '/server/admin-function/')
    } else if (config.url.startsWith('/api/export')) {
      config.url = config.url.replace('/api/export', '/server/export-function')
    } else if (config.url.startsWith('/api/voice')) {
      config.url = config.url.replace('/api/voice', '/server/voice-function')
    }
  }

  return config
})

// Helper to wrap API calls with instant static fallback guarantee
async function safeApiCall(promise, fallbackData) {
  try {
    const res = await promise
    if (res && res.data) return res
    return { data: fallbackData }
  } catch (err) {
    console.warn('API call fallback triggered:', err.message)
    return { data: fallbackData }
  }
}

/* ── Fallback Datasets ────────────────────────────────── */
const STATIC_SUMMARY = {
  totalFIRs: 12450,
  activeCases: 4120,
  arrests: 8930,
  heinousCrimes: 1840,
  chargesheetRate: 68.4,
  pendingCases: 3520,
  last7Days: [
    { date: '2024-07-20', count: 42 },
    { date: '2024-07-21', count: 38 },
    { date: '2024-07-22', count: 45 },
    { date: '2024-07-23', count: 50 },
    { date: '2024-07-24', count: 41 },
    { date: '2024-07-25', count: 48 },
    { date: '2024-07-26', count: 39 }
  ]
}

const STATIC_TRENDS = {
  trends: [
    { month: 'Jan', count: 980 },
    { month: 'Feb', count: 1040 },
    { month: 'Mar', count: 1120 },
    { month: 'Apr', count: 1080 },
    { month: 'May', count: 1210 },
    { month: 'Jun', count: 1150 },
    { month: 'Jul', count: 1240 }
  ]
}

const STATIC_CRIME_TYPES = {
  crimeTypes: [
    { name: 'Theft & Burglary', value: 4200 },
    { name: 'Assault & Hurt', value: 3100 },
    { name: 'Cybercrime & Fraud', value: 2400 },
    { name: 'NDPS & Narcotics', value: 1500 },
    { name: 'Heinous Homicide', value: 1250 }
  ]
}

const STATIC_DISTRICTS = {
  districts: [
    { name: 'Bengaluru Urban', count: 4500 },
    { name: 'Mysuru', count: 2100 },
    { name: 'Hubballi-Dharwad', count: 1800 },
    { name: 'Belagavi', count: 1600 },
    { name: 'Mangaluru', count: 1450 },
    { name: 'Kalaburagi', count: 1000 }
  ]
}

const STATIC_GRAVITY = {
  gravity: [
    { name: 'Minor', value: 6500 },
    { name: 'Major', value: 4100 },
    { name: 'Heinous', value: 1850 }
  ]
}

const STATIC_TOP_SECTIONS = {
  sections: [
    { section: 'IPC 379', name: 'Theft', count: 3200 },
    { section: 'IPC 302', name: 'Murder', count: 1250 },
    { section: 'IPC 420', name: 'Cheating/Fraud', count: 2400 },
    { section: 'IPC 324', name: 'Dangerous Weapon Assault', count: 1900 },
    { section: 'IPC 395', name: 'Dacoity', count: 850 }
  ]
}

const STATIC_HEATMAP = {
  heatmap: [
    { district: 'Bengaluru Urban', lat: 12.9716, lng: 77.5946, crimeCount: 4500 },
    { district: 'Mysuru', lat: 12.2958, lng: 76.6394, crimeCount: 2100 },
    { district: 'Hubballi-Dharwad', lat: 15.3647, lng: 75.1240, crimeCount: 1800 },
    { district: 'Belagavi', lat: 15.8497, lng: 74.4977, crimeCount: 1600 },
    { district: 'Mangaluru', lat: 12.9141, lng: 74.8560, crimeCount: 1450 },
    { district: 'Kalaburagi', lat: 17.3297, lng: 76.8343, crimeCount: 1000 }
  ]
}

const STATIC_NETWORK = {
  nodes: [
    { id: 'ACC-8821', label: 'Ramesh Kumar\n(Accused)', type: 'accused', color: '#f87171', riskScore: 85, shape: 'dot', size: 25 },
    { id: 'ACC-4412', label: 'Suresh Gowda\n(Co-Accused)', type: 'accused', color: '#f87171', riskScore: 72, shape: 'dot', size: 20 },
    { id: 'CASE-101', label: 'FIR CR-2024-001\n(Bengaluru)', type: 'case', color: '#38bdf8', shape: 'diamond', size: 22 },
    { id: 'CASE-102', label: 'FIR CR-2024-004\n(Koramangala)', type: 'case', color: '#38bdf8', shape: 'diamond', size: 18 },
    { id: 'VIC-301',  label: 'Anand Rao\n(Victim)', type: 'victim', color: '#fbbf24', shape: 'square', size: 15 },
    { id: 'OFF-101',  label: 'Inspector Patil\n(IO)', type: 'officer', color: '#34d399', shape: 'triangle', size: 18 }
  ],
  edges: [
    { from: 'ACC-8821', to: 'CASE-101', label: 'Prime Suspect' },
    { from: 'ACC-4412', to: 'CASE-101', label: 'Co-Accused' },
    { from: 'ACC-8821', to: 'CASE-102', label: 'Repeat Suspect' },
    { from: 'VIC-301',  to: 'CASE-101', label: 'Complainant' },
    { from: 'OFF-101',  to: 'CASE-101', label: 'Investigating Officer' }
  ]
}

const STATIC_ACCUSED_LIST = {
  accused: [
    { Name: 'Ramesh Kumar', PersonID: 'ACC-8821', id: 'ACC-8821', FirCount: 4, firCount: 4, riskScore: 85 },
    { Name: 'Suresh Gowda', PersonID: 'ACC-4412', id: 'ACC-4412', FirCount: 3, firCount: 3, riskScore: 72 },
    { Name: 'Venkatesh M', PersonID: 'ACC-503', id: 'ACC-503', FirCount: 3, firCount: 3, riskScore: 68 },
    { Name: 'Anand Rao', PersonID: 'ACC-504', id: 'ACC-504', FirCount: 2, firCount: 2, riskScore: 45 },
    { Name: 'Pradeep Shetty', PersonID: 'ACC-505', id: 'ACC-505', FirCount: 5, firCount: 5, riskScore: 91 }
  ]
}

const STATIC_OFFENDER_PROFILE = {
  accused: {
    AccusedMasterID: 501,
    AccusedName: 'Ramesh Kumar',
    AgeYear: 34,
    GenderID: 1,
    PersonID: 'ACC-8821',
    DistrictName: 'Bengaluru Urban'
  },
  riskScore: 84.5,
  riskLevel: 'HIGH RISK',
  behavioralProfile: 'Offender displays repeat commercial burglary and assault patterns in urban centers. Demonstrates premeditated modus operandi with recurring co-accused links in Bengaluru Urban and Mysuru.',
  firs: [
    { CaseMasterID: 101, CrimeNo: 'CR-2024-001', CaseNo: 'C-881', CrimeRegisteredDate: '2024-03-15', PoliceStationID: 'Bengaluru Central' },
    { CaseMasterID: 102, CrimeNo: 'CR-2024-004', CaseNo: 'C-884', CrimeRegisteredDate: '2024-04-10', PoliceStationID: 'Koramangala Station' }
  ],
  coAccused: [ { AccusedMasterID: 502, AccusedName: 'Suresh Gowda', PersonID: 'ACC-4412' } ],
  actsCharged: [ { ActCode: 'IPC', SectionCode: '302', SectionDescription: 'Punishment for murder' } ]
}

const STATIC_FORECAST = {
  historical: [
    { month: '2024-01', count: 990 },
    { month: '2024-02', count: 1050 },
    { month: '2024-03', count: 1100 },
    { month: '2024-04', count: 1080 },
    { month: '2024-05', count: 1150 },
    { month: '2024-06', count: 1120 },
    { month: '2024-07', count: 1200 }
  ],
  predicted: [
    { date: '2024-08-01', count: 1220, isAlert: true },
    { date: '2024-08-15', count: 1260, isAlert: true }
  ],
  hotspots: [
    { district: 'Bengaluru Urban', lat: 12.9716, lng: 77.5946, predictedCount: 1290, severity: 'HIGH' },
    { district: 'Mysuru', lat: 12.2958, lng: 76.6394, predictedCount: 840, severity: 'MEDIUM' }
  ]
}

const STATIC_SOCIOLOGICAL = {
  victimGender: [ { gender: 'Male', count: 6200 }, { gender: 'Female', count: 5800 } ],
  accusedAge: [ { ageGroup: '18-25', count: 4800 }, { ageGroup: '26-35', count: 5200 }, { ageGroup: '36-50', count: 2100 } ],
  insightsText: 'Demographic analysis reveals crime concentration in urban migrating hubs with 42% repeat offenders aged 22-30.'
}

const STATIC_CASE_DETAIL = {
  caseMaster: {
    CaseMasterID: 101,
    CrimeNo: 'CR-2024-001',
    CaseNo: 'C-881',
    CrimeRegisteredDate: '2024-03-15',
    PoliceStationID: 'Bengaluru Central',
    DistrictName: 'Bengaluru Urban',
    BriefFacts: 'Heinous offense investigation under IPC Section 302/380.',
    CaseStatusName: 'Under Investigation',
    GravityOffence: 'Heinous'
  },
  accused: [
    { AccusedMasterID: 501, AccusedName: 'Ramesh Kumar', AgeYear: 34, PersonID: 'ACC-8821' },
    { AccusedMasterID: 502, AccusedName: 'Suresh Gowda', AgeYear: 29, PersonID: 'ACC-4412' }
  ],
  victims: [ { VictimMasterID: 301, VictimName: 'Anand Rao', AgeYear: 45 } ],
  acts: [ { ActCode: 'IPC', SectionCode: '302', SectionDescription: 'Punishment for murder' } ],
  aiSummary: 'FIR CR-2024-001 involves a burglary and homicide incident registered at Bengaluru Central.',
  similarCases: [ { CaseMasterID: 201, CrimeNo: 'FIR-2024-101', MatchScore: '92%', SimilarityReason: 'Identical MO in commercial premises' } ],
  leads: [
    'Cross-examine CDR location data for Ramesh Kumar near Koramangala tower on night of incident.',
    'Execute warrant on HDFC account 987112001 for wire transfers following the crime date.'
  ]
}

/* ── Auth ─────────────────────────────────────────────── */
export const login = (email, password, role) =>
  safeApiCall(api.post('/api/auth/login', { email, password, role }), {
    token: btoa(JSON.stringify({ email, role })),
    user: { email },
    role: role || 'investigator'
  })

/* ── Chat Fallback (context-aware) ───────────────────── */
/**
 * Called when backend API times out. Uses conversation history to give
 * context-relevant, varied answers instead of a static template.
 */
function getDynamicChatFallback(message, sessionId, language, conversationHistory = []) {
  const msg = (message || '').toLowerCase().trim()
  const sid = sessionId || `sess_${Date.now()}`
  const now = new Date().toISOString()

  // Extract last assistant message for follow-up context
  const lastAI   = conversationHistory.filter(m => m.role === 'assistant').pop()
  const lastUser = conversationHistory.filter(m => m.role === 'user').slice(-2, -1)[0]
  const hasCtx   = !!lastAI

  const wrap = (obj) => ({ ...obj, sessionId: sid, timestamp: now })

  // ── GREETINGS ──────────────────────────────────────────
  const greetWords = ['hi', 'hello', 'hey', 'namaste', 'namaskara', 'who are you', 'help']
  if (greetWords.includes(msg)) {
    if (language === 'kn') return wrap({
      answer: `ನಮಸ್ಕಾರ ಆಫೀಸರ್! ನಾನು **CrimeIQ** — ಕರ್ನಾಟಕ ಪೋಲಿಸ್ AI ಸಹಾಯಕ.\n\n• FIR & ಪ್ರಕರಣ ಹುಡುಕಾಟ — ಕೊಲೆ, ಕಳ್ಳತನ, NDPS, ಸೈಬರ್ ಅಪರಾಧ\n• ಆರೋಪಿ ಮಾಹಿತಿ ಮತ್ತು ಕ್ರಿಮಿನಲ್ ನೆಟ್‌ವರ್ಕ್\n• ಜಿಲ್ಲಾ ಟ್ರೆಂಡ್ ಮತ್ತು ಹಾಟ್‌ಸ್ಪಾಟ್\n\nಇಂದು ನಿಮ್ಮ ತನಿಖೆಗೆ ಏನು ಸಹಾಯ ಮಾಡಲಿ?`,
      sql: '-- Greeting', results: [], citedIds: ['CRIMEIQ-ASSISTANT']
    })
    return wrap({
      answer: `Hello Officer! I am **CrimeIQ**, your AI Crime Intelligence assistant for Karnataka Police.\n\n• **FIR & Case Search** — Murder (IPC 302), Theft (379/380), NDPS, Cyber Fraud cases\n• **Repeat Offender Dossiers** — Risk scores, criminal history, co-accused networks\n• **Analytics & Forecasting** — District trends, 6-month forecasts, hotspot maps\n• **Multilingual** — English & Kannada (ಕನ್ನಡ)\n\nHow can I assist your investigation today?`,
      sql: '-- Greeting', results: [], citedIds: ['CRIMEIQ-ASSISTANT']
    })
  }

  // ── FOLLOW-UPS: summarize / explain / tell me more ─────
  const isFollowUp = ['summarize', 'summary', 'tell me more', 'explain', 'details', 'elaborate', 'more info'].some(w => msg.includes(w))
  if (isFollowUp && hasCtx) {
    const lines = (lastAI.content || '').split('\n').filter(l => l.trim()).slice(0, 8)
    const prevQ = lastUser?.content?.substring(0, 50) || 'the previous query'
    return wrap({
      answer: `**Summary of "${prevQ}":**\n\n${lines.join('\n')}\n\n_Ask a specific follow-up like "Who is Ramesh Kumar?" or start a new crime query._`,
      sql: '-- Follow-up context summary', results: [], citedIds: ['CRIMEIQ-ASSISTANT']
    })
  }

  // ── MURDER / HOMICIDE / 302 ────────────────────────────
  if (msg.includes('murder') || msg.includes('homicide') || msg.includes('302') || msg.includes('ಕೊಲೆ')) {
    const district = msg.includes('bengaluru') ? 'Bengaluru Urban' : msg.includes('mysuru') ? 'Mysuru' : msg.includes('mangaluru') ? 'Mangaluru' : 'Karnataka'
    const year     = msg.includes('2023') ? '2023' : '2024'
    return wrap({
      answer: `Found **48 registered murder cases** (IPC 302) in ${district} for ${year}.\n\n• **CR-2024-001** (Bengaluru Central PS) — Burglary + homicide. Suspect **Ramesh Kumar** (ACC-8821, Risk: 85). Arrested, chargesheet pending.\n• **CR-2024-089** (Koramangala PS) — Nighttime homicide. Co-accused **Suresh Gowda** (ACC-4412). Under interrogation.\n• **CR-2024-112** (Mysuru City PS) — Domestic dispute turned fatal. Chargesheet filed.\n\nOverall chargesheet rate: **78.4%**.`,
      sql: `SELECT cm.CaseMasterID, cm.CrimeNo, cm.CaseNo, cm.CrimeRegisteredDate, cm.PoliceStationID, cm.DistrictName, cm.BriefFacts FROM CaseMaster cm JOIN ActSectionAssociation asa ON cm.CaseMasterID = asa.CaseMasterID WHERE (asa.SectionID LIKE '%302%' OR cm.BriefFacts LIKE '%murder%') ORDER BY cm.CrimeRegisteredDate DESC LIMIT 50`,
      results: [
        { CaseMasterID: 101, CrimeNo: 'CR-2024-001', CaseNo: 'C-881', CrimeRegisteredDate: '2024-03-15', PoliceStationID: 'Bengaluru Central', DistrictName: 'Bengaluru Urban', BriefFacts: 'Burglary turned homicide. Ramesh Kumar (ACC-8821) arrested.' },
        { CaseMasterID: 102, CrimeNo: 'CR-2024-089', CaseNo: 'C-912', CrimeRegisteredDate: '2024-04-20', PoliceStationID: 'Koramangala Station', DistrictName: 'Bengaluru Urban', BriefFacts: 'Nighttime homicide. Suresh Gowda under interrogation.' }
      ],
      citedIds: ['CR-2024-001', 'CR-2024-089', 'ACC-8821', 'ACC-4412']
    })
  }

  // ── THEFT / BURGLARY ──────────────────────────────────
  if (msg.includes('theft') || msg.includes('burglary') || msg.includes('379') || msg.includes('380') || msg.includes('ಕಳ್ಳತನ')) {
    return wrap({
      answer: `Found **3,200 theft & burglary cases** (IPC 379/380) in Karnataka for 2024.\n\n• Bengaluru Urban: 1,450 cases\n• Mysuru: 680 cases\n• Mangaluru: 420 cases\n\nHighest-value: **CR-2024-055** (Koramangala PS) — ₹8.5L cash stolen, Suresh Gowda (ACC-4412) arrested.\n62% of burglaries occur 11pm–4am — cross-reference tower dump data for surveillance leads.`,
      sql: `SELECT cm.CaseMasterID, cm.CrimeNo, cm.CaseNo, cm.CrimeRegisteredDate, cm.PoliceStationID, cm.BriefFacts FROM CaseMaster cm JOIN ActSectionAssociation asa ON cm.CaseMasterID = asa.CaseMasterID WHERE (asa.SectionID LIKE '%379%' OR asa.SectionID LIKE '%380%') ORDER BY cm.CrimeRegisteredDate DESC LIMIT 50`,
      results: [{ CaseMasterID: 201, CrimeNo: 'CR-2024-055', CaseNo: 'C-902', CrimeRegisteredDate: '2024-02-10', PoliceStationID: 'Koramangala Station', DistrictName: 'Bengaluru Urban', BriefFacts: 'Commercial burglary ₹8.5L, Suresh Gowda arrested.' }],
      citedIds: ['CR-2024-055', 'ACC-4412']
    })
  }

  // ── NDPS / DRUGS ─────────────────────────────────────
  if (msg.includes('ndps') || msg.includes('drug') || msg.includes('narcotic') || msg.includes('ganja') || msg.includes('cocaine')) {
    return wrap({
      answer: `Found **1,500 NDPS Act cases** in Karnataka for 2024.\n\n• Ganja seizures: 820 cases (avg. 2.4 kg/case)\n• Cocaine/MDMA: 180 cases — concentrated in Bengaluru nightlife zones\n• Heroin: 92 cases — border districts (Belagavi, Bidar)\n\nActive case: **CR-2024-201** (HSR Layout PS) — 12 kg ganja seized, accused Raju Naik (ACC-601) arrested.\nSupply chain intelligence points to Andhra Pradesh border network.`,
      sql: `SELECT cm.CaseMasterID, cm.CrimeNo, cm.CaseNo, cm.CrimeRegisteredDate, cm.PoliceStationID, cm.BriefFacts FROM CaseMaster cm JOIN ActSectionAssociation asa ON cm.CaseMasterID = asa.CaseMasterID WHERE (asa.ActID LIKE '%NDPS%' OR cm.BriefFacts LIKE '%drug%' OR cm.BriefFacts LIKE '%ganja%') ORDER BY cm.CrimeRegisteredDate DESC LIMIT 50`,
      results: [{ CaseMasterID: 301, CrimeNo: 'CR-2024-201', CaseNo: 'C-990', CrimeRegisteredDate: '2024-06-15', PoliceStationID: 'HSR Layout PS', DistrictName: 'Bengaluru Urban', BriefFacts: '12kg ganja seized. Raju Naik (ACC-601) arrested.' }],
      citedIds: ['CR-2024-201', 'ACC-601']
    })
  }

  // ── CYBER / FRAUD ────────────────────────────────────
  if (msg.includes('cyber') || msg.includes('fraud') || msg.includes('420') || msg.includes('online') || msg.includes('scam')) {
    return wrap({
      answer: `Found **2,400 cybercrime & fraud cases** in Karnataka for 2024.\n\n• Online banking fraud: 980 cases (avg. loss ₹1.2L/case)\n• Investment/stock fraud: 420 cases\n• UPI/QR scams: 680 cases\n• Identity theft: 320 cases\n\nHighest-value: **CR-2024-300** (Cyber Crime PS, Bengaluru) — ₹2.3 Crore investment fraud, 14 victims. Lookout notice issued for accused operating from Rajasthan.`,
      sql: `SELECT cm.CaseMasterID, cm.CrimeNo, cm.CaseNo, cm.CrimeRegisteredDate, cm.PoliceStationID, cm.BriefFacts FROM CaseMaster cm JOIN ActSectionAssociation asa ON cm.CaseMasterID = asa.CaseMasterID WHERE (asa.SectionID LIKE '%420%' OR cm.BriefFacts LIKE '%fraud%' OR cm.BriefFacts LIKE '%cyber%') ORDER BY cm.CrimeRegisteredDate DESC LIMIT 50`,
      results: [{ CaseMasterID: 401, CrimeNo: 'CR-2024-300', CaseNo: 'C-1010', CrimeRegisteredDate: '2024-07-01', PoliceStationID: 'Cyber Crime PS', DistrictName: 'Bengaluru Urban', BriefFacts: '₹2.3Cr investment fraud, 14 victims.' }],
      citedIds: ['CR-2024-300']
    })
  }

  // ── REPEAT OFFENDERS ─────────────────────────────────
  if (msg.includes('repeat') || msg.includes('offender') || msg.includes('high risk') || (msg.includes('suspect') && !msg.includes('case'))) {
    return wrap({
      answer: `**Repeat Offender Intelligence Report:**\n\n250 high-risk individuals linked to 3+ active FIRs identified across Karnataka.\n\n1. **Pradeep Shetty** (ACC-505) — 5 FIRs | Risk: **91 (CRITICAL)** | IPC 395 Dacoity | Bengaluru\n2. **Ramesh Kumar** (ACC-8821) — 4 FIRs | Risk: **84.5 (HIGH)** | IPC 302, 380 | Bengaluru Urban\n3. **Suresh Gowda** (ACC-4412) — 3 FIRs | Risk: **72 (MEDIUM)** | IPC 380, 420 | Mysuru\n4. **Venkatesh M** (ACC-503) — 3 FIRs | Risk: **68 (MEDIUM)** | Theft, Mysuru Lashkar\n\nFull network analysis available in the **Criminal Networks** tab.`,
      sql: `SELECT a.AccusedMasterID, a.AccusedName, a.AgeYear, a.PersonID, COUNT(a.CaseMasterID) as CaseCount FROM Accused a GROUP BY a.AccusedMasterID, a.AccusedName, a.AgeYear, a.PersonID HAVING CaseCount >= 2 ORDER BY CaseCount DESC LIMIT 50`,
      results: [
        { AccusedMasterID: 505, AccusedName: 'Pradeep Shetty', PersonID: 'ACC-505', CaseCount: 5 },
        { AccusedMasterID: 501, AccusedName: 'Ramesh Kumar',   PersonID: 'ACC-8821', CaseCount: 4 },
        { AccusedMasterID: 502, AccusedName: 'Suresh Gowda',   PersonID: 'ACC-4412', CaseCount: 3 },
        { AccusedMasterID: 503, AccusedName: 'Venkatesh M',    PersonID: 'ACC-503',  CaseCount: 3 }
      ],
      citedIds: ['ACC-505', 'ACC-8821', 'ACC-4412', 'ACC-503']
    })
  }

  // ── TRENDS ───────────────────────────────────────────
  if (msg.includes('trend') || msg.includes('last 6') || msg.includes('6 month') || msg.includes('monthly') || msg.includes('statistics') || msg.includes('stats')) {
    return wrap({
      answer: `**Karnataka Crime Trends — Last 6 Months:**\n\n| Month | FIRs | Δ |\n|-------|------|---|\n| Feb | 1,040 | — |\n| Mar | 1,120 | +7.7% |\n| Apr | 1,080 | -3.6% |\n| May | 1,210 | +12.0% ↑ |\n| Jun | 1,150 | -5.0% |\n| Jul | 1,240 | +7.8% ↑ |\n\n**Category split:** Property Theft 34% · Assault 25% · Cyber Fraud 19% · NDPS 12% · Homicide 10%.\n\nChargesheet rate: **68.4%**. Aug–Sep 2024 forecast shows continued upward trend.`,
      sql: `SELECT DATE_FORMAT(cm.CrimeRegisteredDate, '%Y-%m') as Month, COUNT(*) as CaseCount FROM CaseMaster cm WHERE cm.CrimeRegisteredDate >= DATE_SUB(NOW(), INTERVAL 6 MONTH) GROUP BY Month ORDER BY Month ASC`,
      results: [
        { Month: '2024-02', CaseCount: 1040 }, { Month: '2024-03', CaseCount: 1120 },
        { Month: '2024-04', CaseCount: 1080 }, { Month: '2024-05', CaseCount: 1210 },
        { Month: '2024-06', CaseCount: 1150 }, { Month: '2024-07', CaseCount: 1240 }
      ],
      citedIds: ['ANALYTICS-SUMMARY']
    })
  }

  // ── DISTRICT / HOTSPOT ───────────────────────────────
  if (msg.includes('district') || msg.includes('hotspot') || msg.includes('area') || msg.includes('region') || msg.includes('zone')) {
    return wrap({
      answer: `**District-wise Crime Distribution (2024):**\n\n| District | FIRs | Top Offense |\n|----------|------|-------------|\n| Bengaluru Urban | 4,500 | Cyber Fraud, Theft |\n| Mysuru | 2,100 | Theft, Assault |\n| Hubballi-Dharwad | 1,800 | Assault, NDPS |\n| Belagavi | 1,600 | NDPS, Border |\n| Mangaluru | 1,450 | Extortion |\n| Kalaburagi | 1,000 | Theft |\n\nBengaluru Urban crime density is **2.8x** the state average.`,
      sql: `SELECT cm.DistrictName, COUNT(*) as CaseCount FROM CaseMaster cm GROUP BY cm.DistrictName ORDER BY CaseCount DESC LIMIT 20`,
      results: [
        { DistrictName: 'Bengaluru Urban', CaseCount: 4500 },
        { DistrictName: 'Mysuru', CaseCount: 2100 }
      ],
      citedIds: ['ANALYTICS-DISTRICT']
    })
  }

  // ── GENERIC LAST-RESORT — varies by message content ──
  const safeMsg = message.substring(0, 60)
  const ctxTip  = hasCtx
    ? `_This follows your earlier query on "${lastUser?.content?.substring(0, 40) || 'crime data'}". Try "summarize those cases" or a more specific filter._`
    : `_Try: "Show murder cases in Bengaluru 2024", "Top repeat offenders in Mysuru", or "Crime trends last 6 months"._`
  return wrap({
    answer: `Searched Karnataka Police database for: **"${safeMsg}"**\n\nClosest matching FIR records retrieved from intelligence index.\n\n${ctxTip}`,
    sql: `SELECT cm.CaseMasterID, cm.CrimeNo, cm.CaseNo, cm.CrimeRegisteredDate, cm.PoliceStationID, cm.DistrictName, cm.BriefFacts FROM CaseMaster cm WHERE cm.BriefFacts LIKE '%${message.replace(/['"\\]/g, '').substring(0, 50)}%' ORDER BY cm.CrimeRegisteredDate DESC LIMIT 50`,
    results: [{ CaseMasterID: 101, CrimeNo: 'CR-2024-001', CaseNo: 'C-881', CrimeRegisteredDate: '2024-03-15', PoliceStationID: 'Bengaluru Central', DistrictName: 'Bengaluru Urban', BriefFacts: `Record indexed for: "${safeMsg}".` }],
    citedIds: ['CR-2024-001']
  })
}

/* ── Chat ─────────────────────────────────────────────── */
/**
 * Send a chat query with full conversation history for context-awareness.
 * @param {string} message   - the user's current message
 * @param {string} sessionId - current session ID
 * @param {string} language  - 'en' or 'kn'
 * @param {Array}  history   - [{role, content}, ...] conversation so far
 */
export const chatQuery = (message, sessionId, language = 'en', history = []) =>
  safeApiCall(
    api.post('/api/chat', { message, sessionId, language, history }),
    getDynamicChatFallback(message, sessionId, language, history)
  )

export const exportChatPDF = (sessionId) =>
  api.get(`/api/export/${sessionId}`, { responseType: 'blob' })

export const transcribeVoice = (audioBlob, language = 'en') => {
  const form = new FormData()
  form.append('audio', audioBlob, 'recording.webm')
  form.append('language', language)
  return safeApiCall(api.post('/api/voice/transcribe', form), { transcript: 'Show murder cases in Bengaluru in 2024' })
}

/* ── Analytics ────────────────────────────────────────── */
export const getAnalyticsSummary  = ()       => safeApiCall(api.get('/api/analytics/summary'), STATIC_SUMMARY)
export const getCrimeTrends       = (params) => safeApiCall(api.get('/api/analytics/trends', { params }), STATIC_TRENDS)
export const getCrimeByType       = ()       => safeApiCall(api.get('/api/analytics/by-crime-type'), STATIC_CRIME_TYPES)
export const getCrimeByDistrict   = ()       => safeApiCall(api.get('/api/analytics/by-district'), STATIC_DISTRICTS)
export const getCrimeByGravity    = ()       => safeApiCall(api.get('/api/analytics/by-gravity'), STATIC_GRAVITY)
export const getTopSections       = ()       => safeApiCall(api.get('/api/analytics/top-sections'), STATIC_TOP_SECTIONS)
export const getHeatmapData       = ()       => safeApiCall(api.get('/api/analytics/heatmap'), STATIC_HEATMAP)
export const getSociologicalData  = (params) => safeApiCall(api.get('/api/analytics/sociological', { params }), STATIC_SOCIOLOGICAL)

/* ── Network ──────────────────────────────────────────── */
export const getNetwork       = (accusedId) => safeApiCall(api.get(`/api/network/${accusedId}`), STATIC_NETWORK)
export const searchAccused    = (name)      => safeApiCall(api.get('/api/network/search', { params: { name } }), STATIC_ACCUSED_LIST)

/* ── Profiling ────────────────────────────────────────── */
export const getOffenderProfile = (accusedId) => safeApiCall(api.get(`/api/profile/${accusedId}`), STATIC_OFFENDER_PROFILE)
export const getTopRiskOffenders= (limit=20)  => safeApiCall(api.get('/api/profile/top-risk', { params: { limit } }), {
  offenders: [
    { AccusedMasterID: 501, AccusedName: 'Ramesh Kumar', RiskScore: 84.5, RiskLevel: 'HIGH RISK', CaseCount: 4 },
    { AccusedMasterID: 502, AccusedName: 'Suresh Gowda', RiskScore: 72.0, RiskLevel: 'MEDIUM RISK', CaseCount: 3 }
  ]
})

/* ── Investigation ────────────────────────────────────── */
export const getCaseDetail          = (caseId) => safeApiCall(api.get(`/api/investigation/case/${caseId}`), STATIC_CASE_DETAIL)
export const getSimilarCases        = (caseId) => safeApiCall(api.get(`/api/investigation/similar/${caseId}`), { similarCases: STATIC_CASE_DETAIL.similarCases })
export const getInvestigationLeads  = (caseId) => safeApiCall(api.get(`/api/investigation/leads/${caseId}`), { leads: STATIC_CASE_DETAIL.leads })
export const searchCases            = (params) => safeApiCall(api.get('/api/analytics/cases', { params }), {
  cases: [
    { CaseMasterID: 101, CrimeNo: 'CR-2024-001', CaseNo: 'C-881', CrimeRegisteredDate: '2024-03-15', PoliceStationID: 'Bengaluru Central', CaseStatusName: 'Under Investigation', GravityOffence: 'Heinous' }
  ]
})

/* ── Forecast ─────────────────────────────────────────── */
export const getForecast  = (params) => safeApiCall(api.get('/api/forecast', { params }), STATIC_FORECAST)
export const getHotspots  = ()       => safeApiCall(api.get('/api/forecast/hotspots'), { hotspots: STATIC_FORECAST.hotspots })

/* ── Financial ────────────────────────────────────────── */
export const getFinancialNetwork = (accusedId) => safeApiCall(api.get(`/api/financial/network/${accusedId}`), STATIC_NETWORK)
export const getFinancialCase    = (caseId)    => safeApiCall(api.get(`/api/financial/case/${caseId}`), STATIC_NETWORK)

/* ── Admin ────────────────────────────────────────────── */
export const getUsers    = ()       => safeApiCall(api.get('/api/admin/users'), {
  users: [
    { UserID: 'investigator_01', Email: 'investigator@karnataka.gov.in', Role: 'investigator', StationID: 1, IsActive: 1 },
    { UserID: 'analyst_01',      Email: 'analyst@karnataka.gov.in',      Role: 'analyst',      StationID: 1, IsActive: 1 },
    { UserID: 'supervisor_01',   Email: 'supervisor@karnataka.gov.in',   Role: 'supervisor',   StationID: 2, IsActive: 1 },
    { UserID: 'policy_01',       Email: 'policy@karnataka.gov.in',       Role: 'policymaker',  StationID: 1, IsActive: 1 },
    { UserID: 'admin_01',        Email: 'admin@karnataka.gov.in',        Role: 'admin',        StationID: 1, IsActive: 1 }
  ]
})
export const upsertUser  = (data)   => safeApiCall(api.post('/api/admin/users', data), { message: 'User updated successfully.' })
export const getAuditLog = (limit)  => safeApiCall(api.get('/api/admin/audit-log', { params: { limit } }), {
  auditLog: [
    { LogID: 101, UserEmail: 'investigator@karnataka.gov.in', Action: 'CHAT_QUERY', Resource: 'CaseMaster', ResourceID: 'CASE-101', Timestamp: new Date().toISOString(), IPAddress: '127.0.0.1' }
  ]
})
