
const Agent = require("../models/agent");
const bcrypt = require("bcrypt");
const jwt = require("../utils/jwt.utils");
const createError = require("http-errors");

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
      const color = getRandomColor();
  
      if (
        !(
          userInfo &&
          userInfo.password &&
          userInfo.email.primary &&
          userInfo.name &&
          userInfo.familyName
        )
      ) {
        throw createError(400, `Missing information!`);
      }
  
      // Vérifiez si userInfo.ip est défini
      const geo = userInfo.ip;
  
      const similarUser = await Agent.findOne({
        "email.primary": userInfo.email.primary.toLowerCase(),
      });
      if (similarUser) {
        throw createError(401, `User with the same Email already exists!`);
      }
  
      const hash = await bcrypt.hash(userInfo.password, 10);
      userInfo.password = hash;
      userInfo.authType = "local";
      userInfo.email.primary = userInfo.email.primary.toLowerCase();
      userInfo.status = "unverified";
      userInfo.color = color; // Include color in userInfo
  
      let user = await Agent.create(userInfo);
      const token = jwt.enableAccJWT(user);
  
      res.status(200).json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  };
  



  module.exports = {
    signUp    };
    