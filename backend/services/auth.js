import jwt from 'jsonwebtoken'

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
    console.log(token);
    if (!token) {
      return res.status(401).json({ message: "Access Denied. No token provided." });
    }
  
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);  // Debug: print the decoded token to check if `id` is included

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
  
