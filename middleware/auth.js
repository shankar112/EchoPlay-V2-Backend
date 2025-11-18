// middleware/auth.js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  // 1. Get the token from the header
  const token = req.header('x-auth-token');

  // 2. Check if no token
  if (!token) {
    // 401 = Unauthorized
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // 3. Verify token
  try {
    // 'jwt.verify' checks the signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. If valid, add the user payload to the request object
    // 'decoded.user' is the payload we created in routes/auth.js
    req.user = decoded.user; 

    // 5. Call 'next()' to pass control to the next function
    next(); 
  } catch (err) {
    // If token is not valid (e.g., expired, wrong secret)
    res.status(401).json({ msg: 'Token is not valid' });
  }
}

module.exports = authMiddleware;