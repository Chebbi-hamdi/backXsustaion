const bcrypt = require("bcrypt");
const { sendEmail } = require("../utils/mailer/mailer.utils");
const User = require("../models/user");
const { verifyJWT,generateResetAccountToken } = require("../utils/jwt.utils");
const jwt = require("../utils/jwt.utils");



/**
* Generates a random token.
*
* @returns {string} - Returns a randomly generated token.
*/
// const generateToken = async (user) => {
// const token = await generateResetAccountToken(user );
// return token
// }
// // Function to verify JWT token and extract email
function verifyToken(token) {
try {
    const decoded = verifyJWT(token);
    return decoded;
} catch (error) {
    return null;
}
}


/**
* Handles password reset request.
*
* @param {Object} req - The request object containing user email.
* @param {Object} res - The response object for sending HTTP responses.
*/
async function requestPasswordReset(req, res) {
  const { email } = req.body.email;

  try {
      // Check if the user with the provided email exists
      const user = await User.findOne({ "email.primary": email.toLowerCase() });
      if (!user) {
      return res.status(404).json({ message: "User not found" });
      }

      // Generate a password reset token with essential user info
      const resetToken = await generateResetAccountToken(user);
      console.log('Reset token size:', Buffer.byteLength(resetToken, 'utf8'));

      // Save the reset token to the user's document
      user.resetToken = resetToken;
      await user.save();
console.log('_____________',email)
      // Send the password reset email
      const resetLink = `http://localhost:3001/forgot_password/${resetToken}`;
      await sendEmail(
      email,
      "Password Reset Request",
      `Click the following link to reset your password: ${resetLink}`,
      `<p>Click the following link to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p>`
      );

      res.status(200).json({ message: "Password reset email sent successfully" });
  } catch (error) {
      console.error("Error requesting password reset:", error);
      res.status(500).json({ message: "Internal server error" });
  }
  }


/**
* Handles email verification request.
*
* @param {Object} req - The request object containing user email.
* @param {Object} res - The response object for sending HTTP responses.
*/
async function requestEmailVerification(req, res) {
const { email } = req.body;

try {
    // Check if the user with the provided email exists
    const user = await User.findOne({ "email.primary": email.toLowerCase() });
    if (!user) {
     return res.status(404).json({ message: "User not found" });
    }
    if ((user.status)==='verified') {
        return res.status(400).json({ message: "User already verified" });
     }


    // Generate a verification token
    const verificationToken = jwt.generateJWTEmail(user);

    // Save the verification token to the user's document
    user.verificationToken = verificationToken;
    await user.save();

    // Send the verification email
    const verificationLink = `http://localhost:3000/api/v0/users/verify-email/${verificationToken}`;
    console.log('rrrrrr',verificationToken)
    await sendEmail(
     email,
     "Email Verification Request",
     `Click the following link to verify your email address: ${verificationLink}`,
     `<p>Click the following link to verify your email address:</p><p><a href="${verificationLink}">Verify Email</a></p>`
    );

    res.status(200).json({ message: "Email verification email sent successfully" });
} catch (error) {
    console.error("Error requesting email verification:", error);
    res.status(500).json({ message: "Internal server error" });
}
}

/**
* Handles email verification.
*
* @param {Object} req - The request object containing verification token.
* @param {Object} res - The response object for sending HTTP responses.
*/
async function verifyEmail(req, res) {
  const { token } = req.params;

  try {
      // Find the user with the provided verification token
      const user = await User.findOne({ verificationToken: token });
      if (!user) {
          return res.status(404).json({ message: "User not found or verification token invalid" });
      }
      user.status = "verified";
      user.verificationToken = undefined;
      await user.save();

      // Redirect to the profile page after successful verification
      res.redirect('http://localhost:3001/profile');
  } catch (error) {
      console.error("Error verifying email:", error);
      res.status(500).json({ message: "Internal server error" });
  }
}

/**
* Get User by token.
*
* @param {Object} req - The request object containing verification token.
* @param {Object} res - The response object for sending HTTP responses.
*/
async function getAllUsers(req, res) {
    try {
      const users = await User.find();
      return res.send({ users });
    } catch (e) {
      console.log(e);
      next(e);
    }
  };
  async function getAllFormatUsers(req, res) {
    try {
      const users = await User.find();
      const formedUsers= users.map((user) => 
      {
        return {
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.agent,
          status: user.status,
  
        };
      });
      console.log('==========',{formedUsers})
      return res.send({ formedUsers });
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
async function GetUserByToken(req, res) {


try {
    const user_id = req.user._id
    // Find the user with the provided verification token
    const user = await User.findById(user_id);
    if (!user) {
     return res.status(404).json({ message: "User not found or verification token invalid" });
    }

    res.status(200).json(user);

  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Internal server error" });
}
}

async function updateProfilePic(req, res) {
try {
    const imagePath = "http://localhost:3000/images/" + req.file.filename;

    const user_id = req.user._id;
    // Find the user with the provided ID
    const updatePic = await User.findByIdAndUpdate(user_id, { imagePath });
    if (!updatePic) {
     return res.status(404).json({ message: "User not found or verification token invalid" });
    }

    // Update the user's profile picture
    await updatePic.save();

    // Respond with success message or updated user object
    res.status(200).json({ message: "Profile picture updated successfully", imagePath });

} catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ message: "Internal server error" });
}
}

async function updateProfileData(req, res) {
  try {
    const user_id = req.user._id;
    // Find the user with the provided ID and update
    const user = await User.findByIdAndUpdate(user_id, req.body, { new: true });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or verification token invalid" });
    }

    // Respond with success message or updated user object
    res
      .status(200)
      .json({ message: "Profile data updated successfully", user });
  } catch (error) {
    console.error("Error updating profile data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
async function getAllUsers(req, res) {
  try {
    const users = await User.find();
    return res.send({ users });
  } catch (error) {
    console.log(error);
  
  }
}

async function getAllUsersTasks(req, res) {
  try {
    const users = await User.find();
    const formedUsers = users.map((user) => {
      return {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      };
    });
    return res.send({ formedUsers });
  } catch (e) {
    console.log(e);
  }
}

async function getAllFormatUsersCount(req, res) {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 5;

    const skip = (page - 1) * limit;
    const users = await User.find().skip(skip).limit(limit);
  
    const total = await User.countDocuments();
    return res.send({ users, total });
  } catch (e) {
    console.log(e);
  }
}

async function getuserbiId(req, res, next) {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    return res.send({ user });
  } catch (e) {
    console.log(e);
    next(e);
  }
}
async function verifyyjwt(req, res) {
const token = req.headers.authorization;

if (!token) {
     return res.status(400).json({ success: false, error: "No token provided" });
}

// Extrait le jeton du format 'Bearer <token>'
const tokenString = token.split(' ')[1];

try {
     const decoded = await verifyJWT(tokenString);
     console.log(decoded);
     if (decoded) {
         return res.status(200).json({ success: true });
     } else {
         return res.status(401).json({ success: false, error: "Invalid token" });
     }
} catch (error) {
     console.error("Error verifying token:", error);
     return res.status(500).json({ success: false, error: "Internal server error" });
}
};
async function changeThePassword(req, res) {
const { password,token } = req.body.password;
console.log('token',req.body)
console.log('password+++++++++++++++++++++++++',password)
try {
    const email = await verifyToken(token);
    console.log('email-----------',email)
    const user = await User.findOne({ "email.primary": email.email });
    // const user = await User.findOne({ });
    console.log('----------------------------user',user)

    if (!user) {
     return res.status(404).json({ message: "User not found" });
    }
    if (!password) {
     return res.status(401).json({ message: "Missing Password" });
    }
    const hash = await bcrypt.hash(password, 10);
    user.password = hash;
    await user.save();
    await sendEmail(
     email.email,
     "Password Changed ",
     `Password Changed`,
     `<p>Password Changed</p>`
    );
    res.status(200).json({ message: "Password changed" });
} catch (error) {
    res.status(500).json({ message: "Internal server error" });
}
}


async function deleteTheUser(req, res) {
    try {
      const { id } = req.params;
  
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({ message: "User deleted" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  async function getUserById(req, res) {
    try {
      const { id } = req.params;
      console.log("userId", id);
      const user = await User.findById(id);
      console.log("user", user);
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };


  async function getAllFormatUsers(req, res) {
    try {
      const users = await User.find();
      const formedUsers= users.map((user) => 
      {
        return {
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
  
        };
      });
      return res.send({ formedUsers });
    } catch (e) {
      console.log(e);
      next(e);
    }
  };
  async function getAllUsersTasks(req, res) {
    try {
      const users = await User.find();
      const formedUsers = users
        .filter((user) => user.agent === true)
        .map((user) => ({
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.agent,
          status: user.status,
        }));
      console.log('====================', formedUsers);
      return res.send({ formedUsers });
    } catch (e) {
      console.log(e);
      return res.status(500).send('Internal Server Error');
    }
  };
   
module.exports = {
requestPasswordReset,
requestEmailVerification,
verifyEmail,
GetUserByToken,
updateProfilePic,
getuserbiId,
verifyyjwt,
updateProfileData,
deleteTheUser,
changeThePassword,
getUserById,
getAllFormatUsers,
getAllUsers,
getAllUsersTasks,
getAllFormatUsersCount  
};
