const express = require('express');
const router = express.Router();
const SubTaskTypeController = require('../../controllers/SubTaskType.controller');
const upload = require('../../middlewares/multer');

router.get('/', SubTaskTypeController.getAllSubtasks);
router.post('/', SubTaskTypeController.createSubtask);
router.get('/:subtaskId', SubTaskTypeController.getSubtaskById);
router.delete('/:subtaskId', SubTaskTypeController.deleteSubtaskById);
router.put('/:subtaskId', upload.single('image'), SubTaskTypeController.updateSubtask);

module.exports = router;
