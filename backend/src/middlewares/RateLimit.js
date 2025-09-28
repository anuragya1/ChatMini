import rateLimit from 'express-rate-limit';

// Generic factory for limiters
const createAuthLimiter = (maxAttempts, action = 'auth') => rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: maxAttempts,
  message: { 
    error: `Too many ${action} attempts from this IP. Try again later.` 
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip localhost for development
   skip: (req) => req.ip === '::1' || req.ip === '127.0.0.1'
});

// Specific limiters for  endpoints
export const registerLimiter = createAuthLimiter(10, 'registration');
export const loginLimiter = createAuthLimiter(5, 'login');
export const messageLimiter = createAuthLimiter(60,'messages');
export const userSearchLimiter = createAuthLimiter(20, 'user searches'); // 20/min
