const express = require('express')
const authController = require('../../controllers/auth.controller')
const passport = require('passport');
const upload = require('../../middlewares/multer'); 

const authRouter = express.Router()

// From authRouter.js
authRouter.post('/register', authController.signUp);
authRouter.post('/login', authController.login);


// Google
authRouter.get('/google', authController.googleLogin);
authRouter.get('/google/callback', authController.googleCallback, authController.handleGoogleSuccess);


// Facebook
authRouter.get('/facebook', authController.facebookLogin); 
authRouter.get('/facebook/callback', authController.facebookCallback, authController.handleFacebookSuccess);

// LinkedIn
authRouter.get('/linkedin', passport.authenticate('linkedin', { state: 'SOME STATE' }),
function (req, res) {
  // The request will be redirected to LinkedIn for authentication, so this
  // function will not be called.

    console.log("req.user", req.user);

});
authRouter.get('/linkedin/callback', authController.linkedinCallback, authController.handleLinkedinSuccess);
// authRouter.get('/linkedin/callback',   passport.authenticate('linkedin', {
    
//     successRedirect: '/profile',
//     failureRedirect: '/sign_in',
//   })
// );


module.exports = authRouter





