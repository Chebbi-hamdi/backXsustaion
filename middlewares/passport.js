const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");
const FacebookStrategy = require("passport-facebook").Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const dotenv = require("dotenv");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const user = require("../models/user");
const { generateJWT } = require("../utils/jwt.utils");
const { red } = require("@mui/material/colors");

dotenv.config();

/**
 * Configures Passport to use Google OAuth 2.0 for authentication.
 */

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
        
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/v0/auth/google/callback",
      // callbackURL: "http://192.168.11.113:3000/api/v0/auth/google/callback",
      scope: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ],
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(
        "------------------------profile:------------------",
        profile
      );
      const profileData = {
        googleId: profile.id,
        email: profile.emails[0].value,
        imagePath: profile.photos[0].value,
        name: profile.displayName,
        familyName: profile.name.familyName,
      };
      console.log("profileData:", profileData); // Log the profile data
      try {
        let user = await User.findOne({
          "email.primary": profileData.email,
        });

        console.log("user%%%%%%%%%%%%%%%:", user.name); // Log the user data
        const playload = {
          exp: moment()
            .add(process.env.JWT_EXPIRATION_MINUTES, "minutes")
            .unix(),
          iat: moment().unix(),
          sub: user._id,
        };
        const access = jwt.sign(playload, process.env.JWT_TOKEN_SECRET);
        if (!user.googleAuth) {
          user.googleAuth = {};
        }
        user.googleAuth.accessToken = access;
        await user.save();
        console.log("user://////////////////", user); // Log the user data
        return done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

/**
 * Serializes user object into the session.
 */

passport.serializeUser((user, done) => {
  done(null, user.id);
});
/**
 * Deserializes user object from the session.
 */

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
/**
 * Configures Passport to use Facebook OAuth 2.0 for authentication.
 */

// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: "405186162380582",
//       clientSecret: "1da8566aac2d2e2ce4ae6ebbe3f17057",
//       callbackURL: "http://localhost:3000/api/v0/auth/facebook/callback",
//       profileFields: ["id", "displayName", "photos", "email"], // Specify the profile fields you need
//       scope: ["user_photos", "user_profile"],
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       console.log("FacebookStrategy callback called");
//       try {
//         let user = await User.findOne({ "facebookAuth.id": profile.id });
//         console.log(profile);
//         if (!user) {
//           let userna = profile.displayName.split(" ");
//           const email =
//             profile.emails && profile.emails.length > 0
//               ? profile.emails[0].value
//               : null;
//           const photo =
//             profile.photos && profile.photos.length > 0
//               ? profile.photos[0].value
//               : null;

//           if (!email) {
//             return done(
//               new Error(
//                 "An email address is required to login with Facebook. Please ensure your Facebook account has an email address and you have allowed our app to access it."
//               )
//             );
//           }

//           user = new User({
//             facebookAuth: { id: profile.id },
//             provider: "facebook",
//             firstName: userna[0],
//             lastName: userna[1],
//             username: profile.displayName,
//             email: email,
//             photo: photo,
//           });
//           await user.save();
//         }
//         const payload = {
//           exp: moment()
//             .add(process.env.JWT_EXPIRATION_MINUTES, "minutes")
//             .unix(),
//           iat: moment().unix(),
//           sub: user._id,
//         };

//         // Use a secret key to sign the JWT token
//         // const secretKey = 'EAAFwg8FGzyYBOZBZAw06PJ2NW6LqpuJUgx8a6qII2nkh7z9RkAwkuOIYzwcXsKYOTkz59INsfolVZB27w28LFxBZCcH5wZAt5rQel1AhkVZAQE3DA606k3wgpIZBuLZBgi4pQIZAx1ZCgFDeUSQZBVJbZCQBrXXAj6fFsgy7yWDlagruwNVY5vSO5L7cBiPERcIv1WGwQdCqZAQbTfWScibZAy9WoZD';
//         const jwtToken = jwt.sign(payload, process.env.JWT_TOKEN_SECRET);
//         user.jwtToken = jwtToken;
//         user.facebookAuth.accessToken = accessToken;

//         await user.save();

//         return done(null, user);
//       } catch (error) {
//         return done("failed", error);
//       }
//     }
//   )
// );



passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_KEY,
      clientSecret: process.env.LINKEDIN_SECRET,
      callbackURL: "http://localhost:3000/api/v0/auth/linkedin/callback",
      // callbackURL: "http://192.168.11.113:3000/api/v0/auth/linkedin/callback",

      scope: ["email", "profile", "openid"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("LinkedInStrategy callback called");
        let user = await User.findOne({ "linkedinAuth.id": profile.id });
        console.log('-----------------------------------',profile);
        if (!user) {
            // Check if a user with the same email already exists
            const existingUser = await User.findOne({ 'email.primary': profile.email });
            if (existingUser) {
                console.error("A user with this email already exists");
                done(null, existingUser);
                // Handle the error appropriately here
                // For example, you could send a response with a status code of 400
                // and a message indicating that a user with this email already exists
            } else {
                user = new User({
                    linkedinAuth: { id: profile.id },
                    provider: "linkedin",
                    'socials.linkedin': 'facebook',
                    'familyName': profile.familyName,
                    'name': profile.displayName,
                    'email.primary': profile.email,
                    'imagePath': profile.picture
                });
                console.log("user", user);
                try {
                    await user.save();
                    done(null, user);
                } catch (err) {
                    console.error("Error saving user to database:", err);
                    // Handle the error appropriately here
                }
            }
        }
      } catch (error) {
        done(error);
      }
    }
  )
);





passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;