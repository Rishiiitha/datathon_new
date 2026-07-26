// Synthetic data generation utilities for Catalyst seed
const faker = require('faker');

// Lookup tables
const GRAVITY_LEVELS = ['Minor', 'Major', 'Heinous'];
const CRIME_HEADS = [
  { id: 1, name: 'Theft' },
  { id: 2, name: 'Assault' },
  { id: 3, name: 'Robbery' },
  { id: 4, name: 'Fraud' },
  { id: 5, name: 'Homicide' },
];

const DISTRICTS = [
  { id: 1, name: 'Bengaluru Urban' },
  { id: 2, name: 'Mysuru' },
  { id: 3, name: 'Hubballi-Dharwad' },
  { id: 4, name: 'Belagavi' },
  { id: 5, name: 'Mangaluru' },
];

// Helper to generate a random date within the last N years
function randomDate(yearsBack = 5) {
  const end = new Date();
  const start = new Date();
  start.setFullYear(end.getFullYear() - yearsBack);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');
}

function randomGender() {
  return Math.random() < 0.5 ? 1 : 2; // 1=Male, 2=Female
}

function randomAge() {
  return Math.floor(Math.random() * 60) + 18;
}

module.exports = {
  GRAVITY_LEVELS,
  CRIME_HEADS,
  DISTRICTS,
  randomDate,
  randomGender,
  randomAge,
};
