/**
 * Chat Guardrails Middleware
 * 
 * 1. Per-user rate limiting  — max 20 messages per minute
 * 2. Input sanitisation      — strip prompt injection attempts
 * 3. Message length cap      — reject overly long inputs
 * 4. Blocked pattern filter  — catch obvious jailbreak attempts
 */

// In-memory store: userId → { count, windowStart }
const rateLimitStore = new Map();

const WINDOW_MS    = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20;        // per user per window
const MAX_MSG_LEN  = 500;       // characters

// Patterns that indicate prompt injection / jailbreak attempts
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/i,
  /you\s+are\s+now\s+(a\s+)?different/i,
  /forget\s+(everything|all|your)\s+(you\s+know|instructions|rules)/i,
  /act\s+as\s+(if\s+you\s+(are|were)|a\s+different)/i,
  /pretend\s+(you|to\s+be|that)/i,
  /jailbreak/i,
  /disregard\s+(your|all|any)\s+(previous|system|rules)/i,
  /reveal\s+(your\s+)?(system\s+)?prompt/i,
  /print\s+(the\s+)?(system|full|entire)\s+prompt/i,
  /what\s+are\s+your\s+(instructions|rules|system\s+prompt)/i,
];

export const chatGuardrails = (req, res, next) => {
  const userId  = req.user?.id;
  const message = req.body?.message || '';

  // ── 1. Rate limiting ─────────────────────────────────────────────────────
  const now  = Date.now();
  const record = rateLimitStore.get(userId) || { count: 0, windowStart: now };

  if (now - record.windowStart > WINDOW_MS) {
    // Reset window
    record.count       = 1;
    record.windowStart = now;
  } else {
    record.count += 1;
  }
  rateLimitStore.set(userId, record);

  if (record.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - record.windowStart)) / 1000);
    res.set('Retry-After', retryAfter);
    return res.status(429).json({
      message: `Too many messages. Please wait ${retryAfter}s before sending another.`,
      retryAfter,
    });
  }

  // ── 2. Message length cap ────────────────────────────────────────────────
  if (message.length > MAX_MSG_LEN) {
    return res.status(400).json({
      message: `Message too long. Please keep questions under ${MAX_MSG_LEN} characters.`,
    });
  }

  // ── 3. Injection / jailbreak filter ─────────────────────────────────────
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(message)) {
      console.warn(`[GUARDRAIL] Injection attempt blocked — user:${userId}, msg: "${message.slice(0, 80)}"`);
      return res.status(400).json({
        message: 'Your message was blocked by the safety filter. Please ask a genuine warehouse question.',
        blocked: true,
      });
    }
  }

  // ── 4. Attach rate limit headers for transparency ────────────────────────
  res.set('X-RateLimit-Limit',     MAX_REQUESTS);
  res.set('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - record.count));

  next();
};

// Cleanup old entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [id, record] of rateLimitStore.entries()) {
    if (now - record.windowStart > WINDOW_MS * 2) {
      rateLimitStore.delete(id);
    }
  }
}, 5 * 60 * 1000);
