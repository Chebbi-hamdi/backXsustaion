const express = require('express')
const notifController = require('../../controllers/notification.controller');
const authJwt = require('../../middlewares/auth.middleware');

const NotifRouter = express.Router()

NotifRouter.get('/getNotifs/:receiver', notifController.getNotifByIdUser);
NotifRouter.post('/createNotif', notifController.createNotification);
NotifRouter.put('/updateNotif/:notificationId', notifController.updateNotification);
NotifRouter.delete('/deleteNotif/:notificationId', notifController.deleteNotification);
NotifRouter.put('/markSeen/:notificationId', notifController.markNotificationSeen);
NotifRouter.put('/mark-notification-task-seen/:TaskId/:userId', notifController.markNotificationTaskSeen);
NotifRouter.put('/activeNotif/:nature',authJwt, notifController.ActiveNotification);
NotifRouter.put('/DesactiveNotif/:nature',authJwt, notifController.DesActiveNotification);

module.exports = NotifRouter;
