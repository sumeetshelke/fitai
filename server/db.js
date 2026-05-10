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

const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

function ensureDatabase() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
  }
}

function readFileDb() {
  ensureDatabase();
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  return { ...initialData, ...data };
}

function writeFileDb(data) {
  ensureDatabase();
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function updateFileDb(mutator) {
  const db = readFileDb();
  const result = mutator(db);
  writeFileDb(db);
  return result;
}

function camelUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

function camelProfile(row) {
  if (!row) return null;
  return {
    userId: row.user_id,
    name: row.name,
    goal: row.goal,
    activity: row.activity,
    goalCal: row.goal_cal,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function camelFoodLog(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    meal: row.meal,
    name: row.name,
    qty: row.qty,
    cal: row.cal,
    prot: row.prot,
    carb: row.carb,
    fat: row.fat,
    loggedAt: row.logged_at,
    createdAt: row.created_at,
  };
}

function camelWorkoutLog(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    exercise: row.exercise,
    sets: row.sets || [],
    loggedAt: row.logged_at,
    createdAt: row.created_at,
  };
}

async function supabaseRequest(table, { method = 'GET', query = '', body, headers = {} } = {}) {
  const baseUrl = process.env.SUPABASE_URL.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const response = await fetch(`${baseUrl}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || data?.hint || `Supabase request failed: ${response.status}`);
  }

  return data;
}

const fileStore = {
  async findUserByEmail(email) {
    return readFileDb().users.find(user => user.email === email) || null;
  },

  async findUserById(id) {
    return readFileDb().users.find(user => user.id === id) || null;
  },

  async createUserWithProfile(user, profileValues) {
    return updateFileDb(db => {
      if (db.users.some(item => item.email === user.email)) {
        return { error: 'An account with this email already exists.' };
      }

      db.users.push(user);
      const profile = upsertFileProfile(db, user.id, profileValues);
      return { user, profile };
    });
  },

  async getProfile(userId) {
    return readFileDb().profiles.find(profile => profile.userId === userId) || null;
  },

  async upsertProfile(userId, values) {
    return updateFileDb(db => upsertFileProfile(db, userId, values));
  },

  async listFoodLogs(userId, date) {
    return readFileDb().foodLogs.filter(log => log.userId === userId && (!date || log.loggedAt === date));
  },

  async createFoodLog(log) {
    return updateFileDb(db => {
      db.foodLogs.push(log);
      return log;
    });
  },

  async deleteFoodLog(userId, id) {
    updateFileDb(db => {
      db.foodLogs = db.foodLogs.filter(log => !(log.id === id && log.userId === userId));
    });
  },

  async listWorkoutLogs(userId, date) {
    return readFileDb().workoutLogs.filter(log => log.userId === userId && (!date || log.loggedAt === date));
  },

  async createWorkoutLog(log) {
    return updateFileDb(db => {
      db.workoutLogs.push(log);
      return log;
    });
  },

  async updateWorkoutLog(userId, id, values) {
    return updateFileDb(db => {
      const existing = db.workoutLogs.find(item => item.id === id && item.userId === userId);
      if (!existing) return null;
      Object.assign(existing, values);
      return existing;
    });
  },
};

const supabaseStore = {
  async findUserByEmail(email) {
    const rows = await supabaseRequest('fitai_users', {
      query: `?select=*&email=eq.${encodeURIComponent(email)}&limit=1`,
    });
    return camelUser(rows?.[0]);
  },

  async findUserById(id) {
    const rows = await supabaseRequest('fitai_users', {
      query: `?select=*&id=eq.${encodeURIComponent(id)}&limit=1`,
    });
    return camelUser(rows?.[0]);
  },

  async createUserWithProfile(user, profileValues) {
    const existing = await this.findUserByEmail(user.email);
    if (existing) return { error: 'An account with this email already exists.' };

    const userRows = await supabaseRequest('fitai_users', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: {
        id: user.id,
        email: user.email,
        name: user.name,
        password_hash: user.passwordHash,
        created_at: user.createdAt,
      },
    });
    const createdUser = camelUser(userRows[0]);
    const profile = await this.upsertProfile(createdUser.id, profileValues);
    return { user: createdUser, profile };
  },

  async getProfile(userId) {
    const rows = await supabaseRequest('fitai_profiles', {
      query: `?select=*&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
    });
    return camelProfile(rows?.[0]);
  },

  async upsertProfile(userId, values) {
    const existing = await this.getProfile(userId);
    const body = {
      user_id: userId,
      name: values.name?.trim() || existing?.name || '',
      goal: values.goal || existing?.goal || null,
      activity: values.activity || existing?.activity || null,
      goal_cal: Number(values.goalCal || existing?.goalCal || 2100),
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const rows = await supabaseRequest('fitai_profiles', {
        method: 'PATCH',
        query: `?user_id=eq.${encodeURIComponent(userId)}`,
        headers: { Prefer: 'return=representation' },
        body,
      });
      return camelProfile(rows[0]);
    }

    const rows = await supabaseRequest('fitai_profiles', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: { ...body, created_at: new Date().toISOString() },
    });
    return camelProfile(rows[0]);
  },

  async listFoodLogs(userId, date) {
    const dateFilter = date ? `&logged_at=eq.${encodeURIComponent(date)}` : '';
    const rows = await supabaseRequest('fitai_food_logs', {
      query: `?select=*&user_id=eq.${encodeURIComponent(userId)}${dateFilter}&order=created_at.asc`,
    });
    return rows.map(camelFoodLog);
  },

  async createFoodLog(log) {
    const rows = await supabaseRequest('fitai_food_logs', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: {
        id: log.id,
        user_id: log.userId,
        meal: log.meal,
        name: log.name,
        qty: log.qty,
        cal: log.cal,
        prot: log.prot,
        carb: log.carb,
        fat: log.fat,
        logged_at: log.loggedAt,
        created_at: log.createdAt,
      },
    });
    return camelFoodLog(rows[0]);
  },

  async deleteFoodLog(userId, id) {
    await supabaseRequest('fitai_food_logs', {
      method: 'DELETE',
      query: `?id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(userId)}`,
    });
  },

  async listWorkoutLogs(userId, date) {
    const dateFilter = date ? `&logged_at=eq.${encodeURIComponent(date)}` : '';
    const rows = await supabaseRequest('fitai_workout_logs', {
      query: `?select=*&user_id=eq.${encodeURIComponent(userId)}${dateFilter}&order=created_at.asc`,
    });
    return rows.map(camelWorkoutLog);
  },

  async createWorkoutLog(log) {
    const rows = await supabaseRequest('fitai_workout_logs', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: {
        id: log.id,
        user_id: log.userId,
        exercise: log.exercise,
        sets: log.sets,
        logged_at: log.loggedAt,
        created_at: log.createdAt,
      },
    });
    return camelWorkoutLog(rows[0]);
  },

  async updateWorkoutLog(userId, id, values) {
    const rows = await supabaseRequest('fitai_workout_logs', {
      method: 'PATCH',
      query: `?id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(userId)}`,
      headers: { Prefer: 'return=representation' },
      body: {
        sets: values.sets,
      },
    });
    return camelWorkoutLog(rows?.[0]);
  },
};

function upsertFileProfile(db, userId, values) {
  const existing = db.profiles.find(profile => profile.userId === userId);
  const next = {
    userId,
    name: values.name?.trim() || existing?.name || '',
    goal: values.goal || existing?.goal || null,
    activity: values.activity || existing?.activity || null,
    goalCal: Number(values.goalCal || existing?.goalCal || 2100),
    updatedAt: new Date().toISOString(),
  };

  if (existing) {
    Object.assign(existing, next);
    return existing;
  }

  db.profiles.push({ ...next, createdAt: new Date().toISOString() });
  return db.profiles[db.profiles.length - 1];
}

module.exports = hasSupabase ? supabaseStore : fileStore;
