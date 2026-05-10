const http = require('http');
const crypto = require('crypto');
const { readDb, updateDb } = require('./db');
const { createToken, hashPassword, sanitizeUser, verifyPassword, verifyToken } = require('./auth');

const PORT = Number(process.env.PORT || 4000);

function send(res, status, payload) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1_000_000) req.destroy();
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function requireUser(req) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const claims = verifyToken(token);
  if (!claims) return null;

  const db = readDb();
  const user = db.users.find(item => item.id === claims.sub);
  if (!user) return null;
  return user;
}

function getProfile(db, userId) {
  return db.profiles.find(profile => profile.userId === userId);
}

function upsertProfile(db, userId, values) {
  const existing = getProfile(db, userId);
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

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function route(req, res) {
  if (req.method === 'OPTIONS') return send(res, 204, {});

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  try {
    if (req.method === 'GET' && path === '/health') {
      return send(res, 200, { ok: true, service: 'fitai-api' });
    }

    if (req.method === 'POST' && path === '/auth/signup') {
      const body = await readBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const name = String(body.name || '').trim();

      if (!name || !email.includes('@') || password.length < 6) {
        return send(res, 400, { error: 'Name, valid email, and 6+ character password are required.' });
      }

      const authResult = updateDb(db => {
        if (db.users.some(user => user.email === email)) {
          return { error: 'An account with this email already exists.' };
        }

        const user = {
          id: crypto.randomUUID(),
          email,
          name,
          passwordHash: hashPassword(password),
          createdAt: new Date().toISOString(),
        };
        db.users.push(user);
        const profile = upsertProfile(db, user.id, { name, goalCal: 2100 });
        return { user, profile };
      });

      if (authResult.error) return send(res, 409, { error: authResult.error });
      return send(res, 201, {
        token: createToken(authResult.user),
        user: sanitizeUser(authResult.user, authResult.profile),
      });
    }

    if (req.method === 'POST' && path === '/auth/login') {
      const body = await readBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const db = readDb();
      const user = db.users.find(item => item.email === email);

      if (!user || !verifyPassword(password, user.passwordHash)) {
        return send(res, 401, { error: 'Invalid email or password.' });
      }

      return send(res, 200, {
        token: createToken(user),
        user: sanitizeUser(user, getProfile(db, user.id)),
      });
    }

    const user = requireUser(req);
    if (!user) return send(res, 401, { error: 'Authentication required.' });

    if (req.method === 'GET' && path === '/auth/me') {
      const db = readDb();
      return send(res, 200, { user: sanitizeUser(user, getProfile(db, user.id)) });
    }

    if (req.method === 'PUT' && path === '/profile') {
      const body = await readBody(req);
      const profile = updateDb(db => upsertProfile(db, user.id, body));
      return send(res, 200, { user: sanitizeUser(user, profile) });
    }

    if (req.method === 'GET' && path === '/food-logs') {
      const db = readDb();
      const logs = db.foodLogs.filter(log => log.userId === user.id && (!url.searchParams.get('date') || log.loggedAt === url.searchParams.get('date')));
      return send(res, 200, { logs });
    }

    if (req.method === 'POST' && path === '/food-logs') {
      const body = await readBody(req);
      const log = updateDb(db => {
        const item = {
          id: crypto.randomUUID(),
          userId: user.id,
          meal: String(body.meal || 'Snack'),
          name: String(body.name || ''),
          qty: String(body.qty || '1 serving'),
          cal: Number(body.cal || 0),
          prot: Number(body.prot || 0),
          carb: Number(body.carb || 0),
          fat: Number(body.fat || 0),
          loggedAt: body.loggedAt || today(),
          createdAt: new Date().toISOString(),
        };
        db.foodLogs.push(item);
        return item;
      });
      return send(res, 201, { log });
    }

    if (req.method === 'DELETE' && path.startsWith('/food-logs/')) {
      const id = path.split('/').pop();
      updateDb(db => {
        db.foodLogs = db.foodLogs.filter(log => !(log.id === id && log.userId === user.id));
      });
      return send(res, 200, { ok: true });
    }

    if (req.method === 'GET' && path === '/workout-logs') {
      const db = readDb();
      const logs = db.workoutLogs.filter(log => log.userId === user.id && (!url.searchParams.get('date') || log.loggedAt === url.searchParams.get('date')));
      return send(res, 200, { logs });
    }

    if (req.method === 'POST' && path === '/workout-logs') {
      const body = await readBody(req);
      const log = updateDb(db => {
        const item = {
          id: crypto.randomUUID(),
          userId: user.id,
          exercise: String(body.exercise || ''),
          sets: Array.isArray(body.sets) ? body.sets : [],
          loggedAt: body.loggedAt || today(),
          createdAt: new Date().toISOString(),
        };
        db.workoutLogs.push(item);
        return item;
      });
      return send(res, 201, { log });
    }

    if (req.method === 'PUT' && path.startsWith('/workout-logs/')) {
      const id = path.split('/').pop();
      const body = await readBody(req);
      const log = updateDb(db => {
        const existing = db.workoutLogs.find(item => item.id === id && item.userId === user.id);
        if (!existing) return null;
        Object.assign(existing, { sets: Array.isArray(body.sets) ? body.sets : existing.sets });
        return existing;
      });
      if (!log) return send(res, 404, { error: 'Workout log not found.' });
      return send(res, 200, { log });
    }

    return send(res, 404, { error: 'Route not found.' });
  } catch (error) {
    return send(res, 500, { error: error.message || 'Unexpected server error.' });
  }
}

http.createServer(route).listen(PORT, '0.0.0.0', () => {
  console.log(`FitAI API running at http://localhost:${PORT}`);
});
