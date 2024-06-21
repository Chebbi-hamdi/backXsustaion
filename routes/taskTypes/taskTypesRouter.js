var express = require('express');
var router = express.Router();

const taskTypeController = require('../../controllers/taskType.controller');
const upload = require('../../middlewares/multer');
const authJwt = require('../../middlewares/auth.middleware');

router.get('/', taskTypeController.getTaskType);
router.post('/', taskTypeController.createTaskType);
router.get('/:id', taskTypeController.getTaskTypeById);
router.put('/:id', upload.single('image'), taskTypeController.updateTaskType);
router.delete('/:id', taskTypeController.deleteTaskType);
router.put('/ImageType/:id', upload.single('image'), taskTypeController.AddPicTotaskType);



module.exports = router;