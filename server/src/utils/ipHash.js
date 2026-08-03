import crypto from 'crypto';

export function hashIp(req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const salt = process.env.JWT_SECRET || 'salt';
  return crypto.createHash('sha256').update(`${ip}:${salt}`).digest('hex');
}
