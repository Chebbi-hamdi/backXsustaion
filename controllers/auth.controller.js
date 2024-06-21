const { generateJWT } = require("../utils/jwt.utils");
const asyncHandler = require("express-async-handler");
const requestIp = require("request-ip");
const geoip = require("geoip-lite");
const jwt = require("../utils/jwt.utils");
const bcrypt = require("bcrypt");
const createError = require("http-errors");
const Userr = require("../models/user");
const { getName } = require("country-list");
const passport = require("../middlewares/passport");
const { getUserInfoFromToken } = require("../utils/jwt.utils");
const Team = require("../models/team");
const { getTokenValues, getTokenValuesRef } = require("./team.controller");
/**
 * Handles user registration.
 *
 * @param {Object} req - The request object containing user information.
 * @param {Object} res - The response object for sending HTTP responses.
 * @returns {Object} - Returns a JWT token upon successful registration.
 */
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const signUp = async (req, res) => {
  try {
    const userInfo = req.body;
    const tokenTeam = req.query.tokenteam;
    const tokenRef = req.query.tokenRef;
    const color = getRandomColor();

    if (
      !(
        userInfo &&
        userInfo.password &&
        userInfo.email.primary &&
        userInfo.name &&
        userInfo.familyName &&
        (userInfo.ip !== undefined || userInfo.ip === "")
      )
    ) {
      throw createError(400, `Missing information!`);
    }

    // Vérifiez si userInfo.ip est défini
    const geo = userInfo.ip;
    if (!geo) {
      console.warn("No geo information found for IP:", userInfo.ip);
    }

    const similarUser = await Userr.findOne({
      "email.primary": userInfo.email.primary.toLowerCase(),
    });
    if (similarUser) {
      throw createError(401, `User with the same Email already exists!`);
    }

    const hash = await bcrypt.hash(userInfo.password, 10);
    userInfo.password = hash;
    userInfo.authType = "local";
    userInfo.email.primary = userInfo.email.primary.toLowerCase();
    userInfo.color = color; // Include color in userInfo

    let user = await Userr.create(userInfo);
    const token = jwt.enableAccJWT(user);

    const newTeam = new Team({ leader: user._id });
    await newTeam.save();

    if (tokenTeam) {
      const idteam = await getTokenValues(tokenTeam);
      const team = await Team.findById(idteam);
      if (!team) {
        throw createError(404, `Team not found!`);
      }
      team.members.push(user._id.toString());
      await team.save();
    }

    if (tokenRef) {
      const idRef = await getTokenValuesRef(tokenRef);
      const userRef = await Userr.findById(idRef);
      const existingFriend = userRef.friendsRefered.find((friend) =>
        friend.user.equals(user._id)
      );

      if (!userRef) {
        throw createError(404, `User referenced not found!`);
      }
      if (existingFriend) {
        existingFriend.Status = "Successful";
      } else {
        userRef.friendsRefered.push({ user: user._id, Status: "Successful" });
      }
      await userRef.save();
    }

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
/**
 * Handles user login.
 *
 * @param {Object} req - The request object containing user login information.
 * @param {Object} res - The response object for sending HTTP responses.
 * @returns {Object} - Returns a JWT token upon successful login.
 */

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError(400, "Email and password are required");
    }

    const user = await Userr.findOne({ "email.primary": email.toLowerCase() });

    if (!user) {
      throw createError(401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw createError(401, "Invalid email or password");
    }

    user.last_access_date = new Date();
    await user.save();

    const token = generateJWT(user);
    const userInfo = getUserInfoFromToken(token);
    console.log("user:", user);
    console.log("userinfo:", userInfo);

    res.status(200).json({ token, user });
  } catch (error) {
      console.error(error);
      res.status(error.status || 500).json({ error: error.message });
  }
  };
  
/**
 * Initiates Google login.
 */

const googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"],
});
/**
 * Callback for Google login.
 */

const googleCallback = passport.authenticate("google", {
  failureRedirect: "/login",
});
/**
 * Handles successful Google login.
 *
 * @param {Object} req - The request object containing user information.
 * @param {Object} res - The response object for sending HTTP responses.
 */

const handleGoogleSuccess = (req, res) => {
  // console.log("req.user----------:",req.user);
  const token = generateJWT(req.user);
  // res.status(200).json({ token });
  // res.redirect(`http://localhost:3001/redGoogle?token=${token}`);
  res.redirect(`http://192.168.11.113:3001/redGoogle?token=${token}`);
};

/**
 * Initiates Facebook login.
 */

const facebookLogin = passport.authenticate("facebook", { scope: ["email"] });

/**
 * Callback for Facebook login.
 */

const facebookCallback = passport.authenticate("facebook", {
  failureRedirect: "/login",
});

/**
 * Handles successful Facebook login.
 *
 * @param {Object} req - The request object containing user information.
 * @param {Object} res - The response object for sending HTTP responses.
 */

const handleFacebookSuccess = (req, res) => {
  try {
    console.log("req.user", req.user);
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const token = generateJWT(req.user);
    res.redirect(`http://localhost:3001/redFacebook?token=${token}`);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message });
  }
};
const { JWT_TOKEN_SECRET } = process.env; // Make sure JWT_TOKEN_SECRET is set in your environment variables

const linkedinLogin = passport.authenticate("linkedin", {
scope: ["email", "profile"],
});

const linkedinCallback = passport.authenticate("linkedin", {
  // failureRedirect: "http://localhost:3001/sign_in",
  failureRedirect: "http://192.168.11.113:3001/sign_in",
});

const handleLinkedinSuccess = (req, res) => {
// localStorage.setItem("token", token);

 const token = generateJWT(req.user);
 
  // res.status(200).json({ token });


 console.log('-------------------------------',token);
  res.redirect(`http://192.168.11.113:3001/redLinkedin?token=${token}`);
  // res.redirect(`http://localhost:3001/redFacebook?token=${token}`);
};

module.exports = {
  signUp,
  login,
  googleLogin,
  googleCallback,
  handleGoogleSuccess,
  facebookLogin,
  facebookCallback,
  handleFacebookSuccess,
  getUserInfoFromToken,
  linkedinLogin,
  linkedinCallback,
  handleLinkedinSuccess,
};