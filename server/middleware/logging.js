// @ts-check

/**
 * Request logging middleware
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request details
  console.log(`[${new Date().toISOString()}] REQUEST ${req.method} ${req.path}`);
  console.log({
    type: 'request',
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Intercept response to log it
  const originalSend = res.send;
  res.send = function(body) {
    const responseTime = Date.now() - start;
    
    // Log response details
    console.log(`[${new Date().toISOString()}] RESPONSE ${req.method} ${req.path} ${res.statusCode} ${responseTime}ms`);
    console.log({
      type: 'response',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`
    });

    return originalSend.call(this, body);
  };

  next();
};

/**
 * Error logging middleware
 * @param {Error} err - Error object
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
const errorLogger = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR ${req.method} ${req.path}`);
  console.error({
    type: 'error',
    method: req.method,
    path: req.path,
    error: {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
  next(err);
};

module.exports = {
  requestLogger,
  errorLogger
}; 