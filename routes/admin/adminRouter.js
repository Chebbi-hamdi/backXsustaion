var express = require('express');
var router = express.Router();



const adminController = require('../../controllers/admin.controller');
const authMidllware = require('../../middlewares/authMiddleware');

const  { signUpAdmin, loginAdmin } = require('../../controllers/authAdmin.controller');

router.post ('/register', signUpAdmin);
router.post ('/login', loginAdmin);




router.get('/' ,authMidllware.roleAuthorization('superAdmin'), adminController.getAllAdmins);
router.get('/getUserByToken' ,authMidllware.roleAuthorization('superAdmin') , adminController.getAdminByToken);
router.get('/:id' ,authMidllware.roleAuthorization('superAdmin') , adminController.getAdmin);
router.post('/',authMidllware.roleAuthorization('superAdmin') , adminController.createAdmin);
router.delete('/:id' ,authMidllware.roleAuthorization('superAdmin')  , adminController.deleteAdmin);
router.put('/:id' ,authMidllware.roleAuthorization('superAdmin') , adminController.updateAdmin);

module.exports = router;