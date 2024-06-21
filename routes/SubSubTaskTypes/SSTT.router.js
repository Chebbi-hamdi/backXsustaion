const express = require('express');
const router = express.Router();
const SubSubtaskController = require('../../controllers/SubSubTasksType.controller');
const authJwt = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/multer');

router.get('/', SubSubtaskController.getAllSubSubtasks);
router.post('/', SubSubtaskController.createSubSubtask);
router.get('/:subSubtaskId', SubSubtaskController.getSubSubtaskById);
router.delete('/:subSubtaskId', SubSubtaskController.deleteSubSubtaskById);
router.put('/:subSubtaskId', upload.single('image'), SubSubtaskController.updateImg);

module.exports = router;
