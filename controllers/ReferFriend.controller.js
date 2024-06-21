const User = require("../models/user");
const {
  generateTeamJWT,
  decodeJWT,
  generateJWT,
  generateRefFriendJWT,
} = require("../utils/jwt.utils");
const { sendEmail, contactUs } = require("../utils/mailer/mailer.utils");

async function ReferAfriend(req, res, next) {
  try {
    const user = req.user._id;
    const { email } = req.body;

    if (!email || !user) {
      return res
        .status(400)
        .json({ message: "User ID and email are required" });
    }

    // Check if the email already exists in the database
    const userex = await User.findOne({ "email.primary": email.toLowerCase() });
    if (userex) {
      return res.status(409).json({ message: "User already subscribed" }); // 409 Conflict is more appropriate here
    }

    const tokenReference = generateRefFriendJWT(user);
    const link = `http://localhost:3001/sign_up/?tokenRef=${tokenReference}`;
    // const link = `http://192.168.11.113:3001/sign_up/?tokenRef=${tokenReference}`;

    await sendEmail(
      email,
      "Rejoindre l'équipe",
      `Cliquez sur ce lien pour rejoindre l'équipe : ${link}`
    );

    return res.status(200).json({ tokenReference });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'invitation de membre :", error);
    return res.status(500).json({ message: "Internal Server Error" }); // Return a proper error response
  }
}

async function GenLinkRef(req, res, next) {
  try {
    const user = req.user._id;

    const tokenReference = generateRefFriendJWT(user);
    const link = `localhost:3001/sign_up/?tokenRef=${tokenReference}`;
    // const link = `192.168.11.113:3001/sign_up/?tokenRef=${tokenReference}`;

    return res.status(200).json({ link });
  } catch (error) {
    console.error("err lors du gen du link:", error);
    throw error;
  }
}

async function GetReferedFriends(req, res, next) {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate({
      path: "friendsRefered.user",
      select: "email.primary",
    });
    const friendsRefered = user.friendsRefered;

    return res.status(200).json(friendsRefered);
  } catch (error) {
    console.error("err lors du gen du link:", error);
    throw error;
  }
}

async function ContactUS(req, res) {
  try {
    const email = req.body.email; // Recipient's email

    const subject = "Contact Us";
    const text = req.body.message;
    const phone = req.body.phoneNumber;
    const name = req.body.fullName;
    if (!email || !subject || !text || !phone || !name) {
      return res
        .status(400)
        .json({ message: "Email, subject and message are required" });
    }
    await contactUs(email, subject, text, phone, name);
    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  ReferAfriend,
  GenLinkRef,
  GetReferedFriends,
  ContactUS,
};
