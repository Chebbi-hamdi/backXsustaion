const express = require("express");
const router = express.Router();
const { getUserInfoFromToken } = require('../../utils/jwt.utils');
const upload = require('../../middlewares/multer');

// Importer les fonctions de gestion des utilisateurs
const {
verifyyjwt,
requestPasswordReset,
requestEmailVerification,
verifyEmail,
GetUserByToken,
updateProfilePic,
getuserbiId,
updateProfileData,
changeThePassword,
getAllUsers,
deleteTheUser,
getUserById,
getAllFormatUsers,
getAllUsersTasks,
getAllFormatUsersCount

} = require('../../controllers/user.controller');
const authJwt = require('../../middlewares/auth.middleware');
const authMidllware = require('../../middlewares/authMiddleware');
// Routes pour les différentes fonctionnalités liées à l'utilisateur
router.get("/all", getAllUsersTasks);

// Route pour demander la réinitialisation du mot de passe
router.post('/password-reset', requestPasswordReset);
router.post('/changeThePassword', changeThePassword);
router.put('/profilePic', authJwt, upload.single('image'), updateProfilePic);

router.get('/', getAllUsers);
// Route pour demander la vérification de l'email
router.post('/requestEmailVerification', requestEmailVerification);

// Route pour vérifier l'email
router.get('/verify-email/:token', verifyEmail);

router.get('/getUser',authJwt ,GetUserByToken);
router.get('/getusebyId/:userId',getuserbiId);
router.post('/verifyjwt', verifyyjwt);
router.patch('/updateProfile', authJwt, updateProfileData);
router.delete('/del/:id', authMidllware.roleAuthorization('superAdmin') , deleteTheUser);
router.get('/get/:id', authMidllware.roleAuthorization('superAdmin') , getUserById);

router.get("/get/:page/:limit", getAllFormatUsersCount);
router.get("/all", getAllFormatUsers);

router.get("/", getAllUsers);
router.get("/all", getAllUsersTasks);

router.get("/getUser", authJwt, GetUserByToken);
router.get("/getusebyId/:userId", getuserbiId);
router.post("/verifyjwt", verifyyjwt);
router.patch("/updateProfile", authJwt, updateProfileData);
router.delete(
  "/del/:id",
  authMidllware.roleAuthorization("superAdmin"),
  deleteTheUser
);
router.get("/:id", authMidllware.roleAuthorization("superAdmin"), getUserById);

module.exports = router;
