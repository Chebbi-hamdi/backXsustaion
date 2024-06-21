const jwt = require('jsonwebtoken')
const MAX_JWT_PAYLOAD_LENGTH = 1024; // Define the maximum length for the JWT payload

const generateJWT = (user) => {
    // Extract all user information
    const userInfo = { ...user._doc };

    // Remove sensitive information if needed (e.g., password)
    delete userInfo.password;

    // Generate JWT token with all user information in payload
    return jwt.sign(userInfo, process.env.JWT_TOKEN_SECRET, {
        expiresIn: process.env.JWT_TOKEN_DURATION
    });
}
const generateResetAccountToken = async (user) => {
	try {
	  // Include only the necessary user information in the token payload
	  const payload = { userId: user._id, email: user.email.primary };
	  const token = await jwt.sign(
		payload,
		process.env.JWT_TOKEN_SECRET,
		{
		  expiresIn: process.env.JWT_TOKEN_DURATION
		}
	  );
	  console.log('Generated Token:', token);
	  return token;
	} catch (error) {
	  console.error("Error generating reset account token:", error);
	  throw new Error("Failed to generate reset account token");
	}
  };
  
const generateJWTEmail = (user) => {
    // Extract all user information
    const userInfo = { ...user.email.primary };

    // Remove sensitive information if needed (e.g., password)

    // Generate JWT token with all user information in payload
    return jwt.sign(userInfo, process.env.JWT_TOKEN_SECRET, {
        expiresIn: process.env.JWT_TOKEN_DURATION
    });
}

  
const generateTeamJWT = (team) => {
    return jwt.sign({ team: team._id }, process.env.JWT_TOKEN_SECRET, {
        expiresIn: process.env.JWT_TOKEN_DURATION
    });
}
const generateRefFriendJWT = (refId) => {
    return jwt.sign({ refId }, process.env.JWT_TOKEN_SECRET, {
        expiresIn: process.env.JWT_TOKEN_DURATION
    });
}
const getUserInfoFromToken = (token) => {
	try {
	  // Decode the token
	  const decodedToken = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
  
	  // Extract user information from the decoded token
	  const userInfo = decodedToken;
  
	  return userInfo;
	} catch (error) {
	  console.error('Error decoding token:', error);
	  return null;
	}
  };
  

const generateRefreshJWT = (user) => {
	return jwt.sign(
		{
			id:user._id.toString()
		},
		process.env.JWT_TOKEN_SECRET,
		{
			expiresIn: "7d"
		}
	)
}

const verifyJWT = (token) => {
	return jwt.verify(token, process.env.JWT_TOKEN_SECRET);
  };

const recoveryJWT = (user) => {
	return jwt.sign(
		{id: user.id},
		process.env.JWT_RESET_ACCOUNT,
		{expiresIn: process.env.JWT_RESET_ACCOUNT_DURATION}
	)
}

const verifyRecoveryJWT = (token) => {
	return jwt.verify(token, process.env.JWT_RESET_ACCOUNT)
}

const enableAccJWT = (user) => {
	return jwt.sign(
		{name: user.email.primary},
		process.env.JWT_ACTIVATE_ACCOUNT,
		{expiresIn: process.env.JWT_ACTIVATE_ACCOUNT_DURATION}
	)
}

const verifyEnableAccJWT = (token) => {
	return jwt.verify(token, process.env.JWT_ACTIVATE_ACCOUNT)
}

const getJWTPayload = (token) => {
	return jwt.decode(token, process.env.JWT_TOKEN_SECRET)
}
const decodeJWT = (token) => {
	console.log(jwt.decode(token));
	//return data from token
	return jwt.decode(token)
}

module.exports = {
	generateJWT,
	verifyJWT,
	generateRefreshJWT,
	generateTeamJWT,
	recoveryJWT,
	verifyRecoveryJWT,
	getUserInfoFromToken,
	enableAccJWT,
	verifyEnableAccJWT,
	getJWTPayload,
	decodeJWT,
	generateRefFriendJWT,
	generateResetAccountToken,
	generateJWTEmail,
	generateRefFriendJWT,
}