const Notification = require('../models/notification');
const User = require('../models/user');
const Task = require('../models/tasks');

exports.getNotifByIdUser = async (req, res) => {
    try {
      const { receiver } = req.params;
      const notifications = await Notification.find({ receiver })
                                             .sort({ createdAt: -1 })
                                             .limit(50);
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

exports.createNotification = async (req, res) => {
    try {        
        const notification = new Notification(req.body);
        await notification.save();

        if (req.body.idTask){
            const task = await Task.findById(req.body.idTask);
            task.notifications = false;
            task.participants.forEach(participant => {
                participant.notification = false;
            });
            await task.save(); 
        }

        res.status(200).json(notification);
    } catch (error) {
        console.log(error); 
        res.status(500).json({ error: error.message });
    }
};
  
exports.updateNotification = async (req, res) => {
    try {
        const {notificationId}=req.params
        const {content, type}=req.body

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { content, type },
            { new: true }
        );
        res.status(200).json(notification);
    } catch (error) {
        throw error;
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const {notificationId}=req.params

        await Notification.findByIdAndDelete(notificationId);
        res.status(200).json('delete ok');

    } catch (error) {
        throw error;
    }
};
exports.markNotificationSeen = async (req, res) => {
    try {
      const { notificationId } = req.params;
  
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { seen: true },
        { new: true }
      );
  
      res.status(200).json(notification);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  exports.markNotificationTaskSeen = async (req, res) => {
    try {
        const { TaskId, userId } = req.params;
        const {object}  = req.body; // Destructure Seen and nature directly from req.body

        // Check if the task exists
        const existingTask = await Task.findById(TaskId);
        if (!existingTask) {
            return res.status(404).json({ error: "Task not found" });
        }
        let updateQuery = {};

        if (object.nature === "Owner") {
            updateQuery = { notifications: true };
        } else if (object.nature === "Participant") {
            // Find the index of the participant in the array
            const participantIndex = existingTask.participants.findIndex(participant => participant.id._id.toString() === userId);
            
            if (participantIndex === -1) {
                return res.status(404).json({ error: "Participant not found in the task" });
            }

            // Update the notification field of the found participant
            updateQuery[`participants.${participantIndex}.notification`] = true;
        }

        const updatedTask = await Task.findOneAndUpdate(
            { _id: TaskId },
            { $set: updateQuery },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const updateNotification = async (req, res, notificationType, value, id) => {
    try {
        const updateField = { [notificationType]: value };
        if (notificationType === 'notifGlobal') {
            updateField.notifTask = value;
            updateField.notifMessages = value;
        }
        const notification = await User.findByIdAndUpdate(
            id,
            updateField,
            { new: true }
        );
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.ActiveNotification = async (req, res) => {
    const { nature } = req.params;
    const user_id = req.user._id;
    switch (nature) {
        case 'task':
            await updateNotification(req, res, 'notifTask', true, user_id);
            break;
        case 'msg':
            await updateNotification(req, res, 'notifMessages', true, user_id);
            break;
        case 'glob':
            await updateNotification(req, res, 'notifGlobal', true, user_id);
            break;
        default:
            res.status(400).json({ error: 'Invalid notification type' });
    }
};
exports.DesActiveNotification = async (req, res) => {
    const { nature } = req.params;
    const user_id = req.user._id;
    switch (nature) {
        case 'task':
            await updateNotification(req, res, 'notifTask', false,user_id);
            break;
        case 'msg':
            await updateNotification(req, res, 'notifMessages', false,user_id);
            break;
        case 'glob':
            await updateNotification(req, res, 'notifGlobal', false,user_id);
            break;
        default:
            res.status(400).json({ error: 'Invalid notification type' });
    }
};
