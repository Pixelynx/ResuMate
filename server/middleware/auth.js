// @ts-check

/**
 * Authentication middleware for admin endpoints
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
const authenticateAdminRequest = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'];
    
    // Check for API key in header or Authorization header
    const providedKey = apiKey || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null);
    
    if (!providedKey) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'MISSING_AUTH'
      });
    }
    
    // Validate against environment variable
    const validApiKey = process.env.CLEANUP_API_KEY;
    if (!validApiKey) {
      console.error('CLEANUP_API_KEY not configured in environment');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
        code: 'CONFIG_ERROR'
      });
    }
    
    if (providedKey !== validApiKey) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication credentials',
        code: 'INVALID_AUTH'
      });
    }
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Rate limiting middleware for admin endpoints
 * Simple in-memory rate limiting
 */
const rateLimitStore = new Map();

const adminRateLimit = (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 10; // max 10 requests per minute
  
  if (!rateLimitStore.has(clientIp)) {
    rateLimitStore.set(clientIp, { count: 1, resetTime: now + windowMs });
    return next();
  }
  
  const clientData = rateLimitStore.get(clientIp);
  
  if (now > clientData.resetTime) {
    // Reset the window
    rateLimitStore.set(clientIp, { count: 1, resetTime: now + windowMs });
    return next();
  }
  
  if (clientData.count >= maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
    });
  }
  
  clientData.count++;
  rateLimitStore.set(clientIp, clientData);
  next();
};

module.exports = {
  authenticateAdminRequest,
  adminRateLimit
}; 