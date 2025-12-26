import jwt from 'jsonwebtoken';

// Middleware to protect routes using JWT authentication
export default function authMiddleware(req, res, next) {
  // Read Authorization header (expects: Bearer <token>)
  const authHeader = req.headers.authorization;

  // Reject request if token is missing or malformed
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Extract JWT from header
  const token = authHeader.split(' ')[1];

  try {
    // Verify token and decode payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request for later use
    req.user = decoded;

    // Allow request to continue
    next();
  } catch (err) {
    // Token is invalid or expired
    return res.status(401).json({ error: 'Invalid token' });
  }
}
