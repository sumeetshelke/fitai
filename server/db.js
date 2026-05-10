const fs = require('fs');
const path = require('path');

const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'fitai-db.json');

const initialData = {
  users: [],
  profiles: [],
  foodLogs: [],
  workoutLogs: [],
  weightLogs: [],
};

function ensureDatabase() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
  }
}

function readDb() {
  ensureDatabase();
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  return { ...initialData, ...data };
}

function writeDb(data) {
  ensureDatabase();
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function updateDb(mutator) {
  const db = readDb();
  const result = mutator(db);
  writeDb(db);
  return result;
}

module.exports = {
  readDb,
  updateDb,
};
