const express = require('express')
const tasksController = require('../../controllers/tasks.controller');
const upload = require('../../utils/multer');
const authJwt = require('../../middlewares/auth.middleware');

const tasksRouter = express.Router()

tasksRouter.post('/create', tasksController.createTask);
tasksRouter.get('/getAllTdasks', tasksController.getAllTasks);
tasksRouter.get('/get/:page/:limit', tasksController.getAllTasksOwner);
tasksRouter.get('/getTask/:id', tasksController.getTask);
tasksRouter.get('/getTaskAdmin/:id', tasksController.getTaskAdmin);
tasksRouter.delete('/del/:id', tasksController.deleteTask);
tasksRouter.put('/updateTaskStatus/:id', tasksController.updateTaskStatus);
tasksRouter.post('/addCommentToTask/:taskId/:sender/:commentText', tasksController.addCommentToTask);
tasksRouter.post('/addLikeToTask/:id', tasksController.addLikeToTask);
tasksRouter.get("/GetByOwner/:ownerId", tasksController.getTasksByOwnerId);
tasksRouter.put("/AddFile/:TaskId", upload.array('files', 10), tasksController.addFiletoTask); // Correction ici
tasksRouter.put("/AddTeammate/:TaskId/:teammateId",  tasksController.addTeammateToTask); // Correction ici
tasksRouter.put("/AsignAgent/:TaskId/:teammateId",  tasksController.asigneAgentToTask); // Correction ici

tasksRouter.delete("/deleteTeammate/:TaskId/:teammateId",  tasksController.deleteTeammate); // Correction ici
tasksRouter.delete("/deleteComment/:commentId",  tasksController.deleteComment); // Correction ici
tasksRouter.put('/updatePos/:taskId/:collection/:Position',  tasksController.changeTaskPosition); // Correction ici
tasksRouter.put('/updateInd/:taskId/:UserId/:collectionSource/:collectionDestination/:sourceIndex/:destinationIndex',  tasksController.populateIndexes); // Correction ici
tasksRouter.put("/addFileToComment/:TaskId/:userId", upload.array('files', 10), tasksController.addFiletoCommentTask); // Correction ici
tasksRouter.put("/UpdateComment/:commentId", upload.array('files', 10), tasksController.updateTaskComment); // Correction ici
tasksRouter.put('/updateDesc/:taskId',  tasksController.updateDescTask); // Correction ici
tasksRouter.get('/pagination/:page/:limit', tasksController.getAllTasksOwner);
tasksRouter.get('/GetCommentByIdTask/:idTask', tasksController.displayCommentAndSender);
tasksRouter.get('/GetMemImgs/:taskId', tasksController.displayTeamateImg);
tasksRouter.get('/getPartic/:taskId', tasksController.getParticipantInfo);
tasksRouter.get('/getFiles/:taskId', tasksController.getfiles);
tasksRouter.put('/changeCoverPhoto/:taskId/:imagePathId', tasksController.changeCoverPhoto);
tasksRouter.delete('/deletefile/:taskId/:imagePathId', tasksController.Deleteile);
tasksRouter.put('/changeTaskManagerIndex/:taskId/:newIndex', tasksController.changeIndexTaskManagerTab);

module.exports = tasksRouter