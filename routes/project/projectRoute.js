const express = require('express');
const router = express.Router();
const upload = require('../../middlewares/multer'); 
const projectController = require('../../controllers/project.controller');



router.post('/', projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProject);
router.put('/:id', upload.single('imagePath'), projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.get('/getByOwner/:ownerId', projectController.findProjectByOwnerId);
router.put('/:projectId/:taskId', projectController.assignTaskToProject);
router.put('/changeTaskManagerIndex/:taskId/:newIndex', projectController.changeIndexTaskManagerTab);
router.put('/:id', upload.single('imagePath'), projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.post('/upload', upload.single('image'), projectController.uploadImage);
module.exports = router;