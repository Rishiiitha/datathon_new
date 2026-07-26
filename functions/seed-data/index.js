// Seed handler for generating synthetic data (development only)
const { batchInsert, getDatastore } = require('../lib/db');
const { GRAVITY_LEVELS, CRIME_HEADS, DISTRICTS, randomDate, randomGender, randomAge } = require('../lib/synthetic');
const faker = require('faker');

// Configurable counts (can be overridden via query params)
const DEFAULT_COUNTS = {
  districts: 5,
  unitsPerDistrict: 3,
  cases: 2000,
  accusedPerCase: 2,
  victimsPerCase: 2,
  officersPerCase: 2,
  officers: 500,
  crimes: CRIME_HEADS.length,
};

// Helper to generate random element from array
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Generate lookup tables
function generateDistricts() {
  return DISTRICTS.map(d => ({ DistrictID: d.id, DistrictName: d.name }));
}

function generateUnits(districts, perDistrict) {
  let units = [];
  let id = 1;
  districts.forEach(d => {
    for (let i = 0; i < perDistrict; i++) {
      units.push({ UnitID: id, UnitName: `${d.name} Unit ${i+1}`, DistrictID: d.DistrictID });
      id++;
    }
  });
  return units;
}

function generateGravity() {
  return GRAVITY_LEVELS.map((g, i) => ({ GravityOffenceID: i+1, LookupValue: g }));
}

function generateCrimeHeads() {
  return CRIME_HEADS.map(ch => ({ CrimeHeadID: ch.id, CrimeGroupName: ch.name }));
}

function generateCrimeSubs(heads) {
  let subs = [];
  let id = 1;
  heads.forEach(head => {
    const count = faker.datatype.number({ min: 2, max: 4 });
    for (let i = 0; i < count; i++) {
      subs.push({ CrimeSubHeadID: id, CrimeHeadID: head.CrimeHeadID, CrimeHeadName: `${head.CrimeGroupName} Sub ${i+1}` });
      id++;
    }
  });
  return subs;
}

function generateCases(count, districts, units, gravity) {
  let cases = [];
  for (let i = 1; i <= count; i++) {
    const district = rand(districts);
    const unit = rand(units.filter(u => u.DistrictID === district.DistrictID));
    const grav = rand(gravity);
    const crimeSub = null; // will link later via foreign key if needed
    cases.push({
      CaseMasterID: i,
      CrimeNo: `CR${1000 + i}`,
      CaseNo: `C${2000 + i}`,
      CrimeRegisteredDate: randomDate(3),
      PoliceStationID: unit.UnitID,
      GravityOffenceID: grav.GravityOffenceID,
      CrimeMinorHeadID: null,
    });
  }
  return cases;
}

function generateAccused(cases, perCase) {
  let accused = [];
  let id = 1;
  cases.forEach(c => {
    for (let i = 0; i < perCase; i++) {
      accused.push({
        AccusedMasterID: id,
        AccusedName: faker.name.findName(),
        AgeYear: randomAge(),
        GenderID: randomGender(),
        CaseMasterID: c.CaseMasterID,
      });
      id++;
    }
  });
  return accused;
}

function generateVictims(cases, perCase) {
  let victims = [];
  let id = 1;
  cases.forEach(c => {
    for (let i = 0; i < perCase; i++) {
      victims.push({
        VictimMasterID: id,
        VictimName: faker.name.findName(),
        AgeYear: randomAge(),
        GenderID: randomGender(),
        CaseMasterID: c.CaseMasterID,
      });
      id++;
    }
  });
  return victims;
}

function generateOfficers(officerCount) {
  let officers = [];
  for (let i = 1; i <= officerCount; i++) {
    officers.push({
      EmployeeID: i,
      FirstName: faker.name.firstName(),
      KGID: `KG${1000 + i}`,
    });
  }
  return officers;
}

function generateArrests(cases, officers, perCase) {
  let arrests = [];
  let id = 1;
  cases.forEach(c => {
    for (let i = 0; i < perCase; i++) {
      const officer = rand(officers);
      arrests.push({
        ArrestSurrenderID: id,
        ArrestSurrenderDate: randomDate(3),
        ArrestSurrenderTypeID: 1,
        EmployeeID: officer.EmployeeID,
        CaseMasterID: c.CaseMasterID,
        AccusedMasterID: null,
        IsAccused: 0,
        IsComplainantAccused: 0,
      });
      id++;
    }
  });
  return arrests;
}

async function seedDatabase(app, config = {}) {
  // Idempotent: check if any data exists in a core table
  const check = await getDatastore(app).executeQuery('SELECT COUNT(*) as cnt FROM CaseMaster');
  if (check && check[0] && check[0].cnt > 0) {
    // Data already present; skip seeding
    return { message: 'Database already seeded', skipped: true };
  }

  const counts = { ...DEFAULT_COUNTS, ...config };
  // Generate lookup data first
  const districts = generateDistricts().slice(0, counts.districts);
  const units = generateUnits(districts, counts.unitsPerDistrict);
  const gravity = generateGravity();
  const crimeHeads = generateCrimeHeads();
  const crimeSubs = generateCrimeSubs(crimeHeads);

  // Insert lookup tables
  await batchInsert(app, 'District', districts);
  await batchInsert(app, 'Unit', units);
  await batchInsert(app, 'GravityOffence', gravity);
  await batchInsert(app, 'CrimeHead', crimeHeads);
  await batchInsert(app, 'CrimeSubHead', crimeSubs);

  // Core case data
  const cases = generateCases(counts.cases, districts, units, gravity);
  await batchInsert(app, 'CaseMaster', cases);

  const accused = generateAccused(cases, counts.accusedPerCase);
  await batchInsert(app, 'Accused', accused);

  const victims = generateVictims(cases, counts.victimsPerCase);
  await batchInsert(app, 'Victim', victims);

  const officers = generateOfficers(counts.officers);
  await batchInsert(app, 'Employee', officers);

  const arrests = generateArrests(cases, officers, counts.officersPerCase);
  await batchInsert(app, 'ArrestSurrender', arrests);

  // Additional tables (e.g., OffenderRiskScore) can be populated similarly if needed.
  return { message: 'Seeding completed', inserted: true };
}

// HTTP handler (development only)
async function handler(context, req, res) {
  // Simple token protection
  const token = process.env.SEED_TOKEN || 'seed123';
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Seed endpoint disabled in production' });
  }
  if (req.query.token !== token) {
    return res.status(401).json({ error: 'Invalid seed token' });
  }
  const app = require('zcatalyst-sdk-node').initialize(req);
  const result = await seedDatabase(app, req.query);
  return res.status(200).json(result);
}

module.exports = { handler, seedDatabase };
