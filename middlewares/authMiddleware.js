const jwt = require('jsonwebtoken');
const jwt_secret = "fkjhkljlmd";

userRoles = {
    user: 'user',
    admin: 'admin , user',
    superAdmin: 'superAdmin , admin , user'
}

const roleAuthorization = (allowRoles)=>{
    return (req, res, next)=>{
        // Extract the JWT token from the request headers
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        
        if (!token) {
          return res.status(401).json({ message: "Authorization token is missing" });
        }
        
        jwt.verify(token, jwt_secret, (err, decoded) => {
    
            if (err) {
              return res.status(401).json({ message: "Invalid token" });
            }
        req.user = decoded;
        if(allowRoles.includes(req.user.admin.role)){
            next();

        }
        else{
            return res.status(403).json({ message: 'Forbidden: SuperAdmin access required' });
        }

    });
    }

}

module.exports = { roleAuthorization, userRoles };