const crypto = require('crypto');

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
const SECRET = process.env.JWT_SECRET || 'fitai-dev-secret-change-me';

function base64Url(input) {
  return Buffer.from(input).toString('base64url');
}

function sign(data) {
  return crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, originalHash] = storedHash.split(':');
  if (!salt || !originalHash) return false;
  const nextHash = hashPassword(password, salt).split(':')[1];
  return crypto.timingSafeEqual(Buffer.from(nextHash, 'hex'), Buffer.from(originalHash, 'hex'));
}

function createToken(user) {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64Url(JSON.stringify({
    sub: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  }));
  const unsigned = `${header}.${payload}`;
  return `${unsigned}.${sign(unsigned)}`;
}

function verifyToken(token) {
  if (!token) return null;
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) return null;

  const unsigned = `${header}.${payload}`;
  if (signature !== sign(unsigned)) return null;

  const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (!claims.exp || claims.exp < Math.floor(Date.now() / 1000)) return null;
  return claims;
}

function sanitizeUser(user, profile) {
  return {
    id: user.id,
    email: user.email,
    name: profile?.name || user.name,
    initials: getInitials(profile?.name || user.name || user.email),
    goal: profile?.goal || user.goal || null,
    activity: profile?.activity || user.activity || null,
    goalCal: profile?.goalCal || user.goalCal || 2100,
    createdAt: user.createdAt,
  };
}

function getInitials(value) {
  return value
    .split(/[\s@.]+/)
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

module.exports = {
  createToken,
  hashPassword,
  sanitizeUser,
  verifyPassword,
  verifyToken,
};
