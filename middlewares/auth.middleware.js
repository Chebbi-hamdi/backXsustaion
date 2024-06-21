const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Import your User model
const Agent = require('../models/agent'); // Import your User model
const { verifyJWT } = require('../utils/jwt.utils');

const authJwt = async (req, res, next) => {

    const authHeader = req.header('Authorization');

    if (!authHeader) {
     return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0].toLowerCase()!== 'bearer') {
     return res.status(401).json({ error: 'Invalid token format.' });
    }

    const token = tokenParts[1];

try {
    const decoded = verifyJWT(token);
    const user = await User.findById(decoded._id).select('-password');
    const agent = await Agent.findById(decoded._id).select('-password');

    if (!user&&!agent) {
     return res.status(401).json({ error: 'User nd agent not found.' });
    }
    if (user){
        req.user = user; // Store the user in req.user
        next();

    }
    if (agent){
        req.user = agent; // Store the user in req.user
        next();

    }

} catch (error) {
    console.error(error);
    return res.status(401).json({ error: 'Invalid token.' });
}
};

module.exports = authJwt;