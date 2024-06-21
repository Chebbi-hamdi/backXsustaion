// // adminMiddlewares.js
// // const jwt = require("jsonwebtoken");
// const { SuperAdmin } = require("../models/admin");
// const createError = require("http-errors");

// const verifySuperAdmin = async (req, res, next) => {
//   try {
//     // Extract the JWT token from the request headers
//     const token = req.headers.authorization;

//     // If no token is provided, return an error
//     if (!token) {
//       throw createError(401, "Token is required");
//     }

//     // Verify the token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     // Extract the user id from the decoded token
//     const userId = decoded.userId;

//     // Check if the user is a SuperAdmin
//     const superAdmin = await SuperAdmin.findById(userId);

//     if (!superAdmin) {
//       throw createError(403, "Access forbidden. SuperAdmin privileges required.");
//     }

//     // Attach the user object to the request for later use
//     req.user = superAdmin;

//     // If everything is fine, proceed to the next middleware or route handler
//     next();
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = { verifySuperAdmin };

// const isSuperAdmin = (req, res, next) => {
//     if (!req.user || !req.user.role || req.user.role !== 'superAdmin') {
//       return res.status(403).json({ message: 'Forbidden: SuperAdmin access required' });
//     }
//     next(); // Proceed to the next middleware or route handler
// };

// module.exports = { isSuperAdmin };

const jwt = require('jsonwebtoken');
const jwt_secret = "fkjhkljlmd";

const isSuperAdmin = (req, res, next) => {
  // Extract the JWT token from the request headers
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: "Authorization token is missing" });
  }

  // Verify the JWT token
  jwt.verify(token, jwt_secret, (err, decoded) => {
    
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Attach user information to the request object
    req.user = decoded;
    
  
    next();
  });
};

module.exports = { isSuperAdmin };

