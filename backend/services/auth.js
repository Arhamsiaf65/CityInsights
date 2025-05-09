import jwt from 'jsonwebtoken'
import User from '../models/user.js';

export const setUser = (user) => {
    return jwt.sign({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
   }, process.env.JWT_SECRET)
}


export const verifyToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];;
    if (!token) {
      return res.status(401).json({ message: "Access Denied. No token provided." });
    }
  
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;  // Attach decoded user data to the request object
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid or expired token.", error: error.message });
    }
  };
  

  export const requireRole = (roles) => {
    return (req, res, next) => {
      const user = req.user;
  
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
  
      next();
    };
  };

  export const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          req.user = user; // Attach user to request if token is valid
        }
      } catch (err) {
        console.warn('Invalid or expired token');
        // Proceed without attaching user
      }
    }
  
    next(); // Always continue
  };
  
