const http = require('http');
const crypto = require('crypto');
const db = require('./db');
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

async function requireUser(req) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const claims = verifyToken(token);
  if (!claims) return null;

  return db.findUserById(claims.sub);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function route(req, res) {
  if (req.method === 'OPTIONS') return send(res, 204, {});

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  try {
    if (req.method === 'GET' && path === '/health') {
      return send(res, 200, { ok: true, service: 'fitai-api' });
    }

    if (req.method === 'GET' && path === '/nutrition-items') {
      const items = await db.listNutritionItems();
      return send(res, 200, { items });
    }

    if (req.method === 'POST' && path === '/auth/signup') {
      const body = await readBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const name = String(body.name || '').trim();

      if (!name || !email.includes('@') || password.length < 6) {
        return send(res, 400, { error: 'Name, valid email, and 6+ character password are required.' });
      }

      const authResult = await db.createUserWithProfile({
        id: crypto.randomUUID(),
        email,
        name,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
      }, {
        name,
        goalCal: 2100,
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
      const user = await db.findUserByEmail(email);

      if (!user || !verifyPassword(password, user.passwordHash)) {
        return send(res, 401, { error: 'Invalid email or password.' });
      }

      return send(res, 200, {
        token: createToken(user),
        user: sanitizeUser(user, await db.getProfile(user.id)),
      });
    }

    if (req.method === 'POST' && path === '/auth/forgot-password') {
      const body = await readBody(req);
      const email = String(body.email || '').trim().toLowerCase();

      if (!email.includes('@')) {
        return send(res, 400, { error: 'Enter a valid email address.' });
      }

      const token = String(crypto.randomInt(100000, 999999));
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      const user = await db.savePasswordReset(email, hashResetToken(token), expiresAt);

      if (!user) {
        return send(res, 200, { message: 'If that email exists, a reset code was created.' });
      }

      // TODO: Send this code by email with a provider such as Resend, SendGrid, or Supabase Edge Functions.
      return send(res, 200, {
        message: 'Use this reset code to set a new password.',
        resetCode: token,
        expiresAt,
      });
    }

    if (req.method === 'POST' && path === '/auth/reset-password') {
      const body = await readBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const resetCode = String(body.resetCode || '').trim();
      const password = String(body.password || '');

      if (!email.includes('@') || !resetCode || password.length < 6) {
        return send(res, 400, { error: 'Email, reset code, and 6+ character password are required.' });
      }

      const user = await db.findUserByEmail(email);
      const tokenHash = hashResetToken(resetCode);

      if (
        !user?.resetTokenHash ||
        user.resetTokenHash !== tokenHash ||
        !user.resetTokenExpiresAt ||
        new Date(user.resetTokenExpiresAt).getTime() < Date.now()
      ) {
        return send(res, 400, { error: 'Reset code is invalid or expired.' });
      }

      await db.resetPassword(email, hashPassword(password));
      return send(res, 200, { ok: true, message: 'Password updated. Please sign in.' });
    }

    const user = await requireUser(req);
    if (!user) return send(res, 401, { error: 'Authentication required.' });

    if (req.method === 'GET' && path === '/auth/me') {
      return send(res, 200, { user: sanitizeUser(user, await db.getProfile(user.id)) });
    }

    if (req.method === 'PUT' && path === '/profile') {
      const body = await readBody(req);
      const profile = await db.upsertProfile(user.id, body);
      return send(res, 200, { user: sanitizeUser(user, profile) });
    }

    if (req.method === 'GET' && path === '/food-logs') {
      const logs = await db.listFoodLogs(user.id, url.searchParams.get('date'));
      return send(res, 200, { logs });
    }

    if (req.method === 'POST' && path === '/food-logs') {
      const body = await readBody(req);
      const log = await db.createFoodLog({
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
      });
      return send(res, 201, { log });
    }

    if (req.method === 'DELETE' && path.startsWith('/food-logs/')) {
      const id = path.split('/').pop();
      await db.deleteFoodLog(user.id, id);
      return send(res, 200, { ok: true });
    }

    if (req.method === 'GET' && path === '/workout-logs') {
      const logs = await db.listWorkoutLogs(user.id, url.searchParams.get('date'));
      return send(res, 200, { logs });
    }

    if (req.method === 'POST' && path === '/workout-logs') {
      const body = await readBody(req);
      const log = await db.createWorkoutLog({
        id: crypto.randomUUID(),
        userId: user.id,
        exercise: String(body.exercise || ''),
        sets: Array.isArray(body.sets) ? body.sets : [],
        loggedAt: body.loggedAt || today(),
        createdAt: new Date().toISOString(),
      });
      return send(res, 201, { log });
    }

    if (req.method === 'PUT' && path.startsWith('/workout-logs/')) {
      const id = path.split('/').pop();
      const body = await readBody(req);
      const log = await db.updateWorkoutLog(user.id, id, {
        sets: Array.isArray(body.sets) ? body.sets : undefined,
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
