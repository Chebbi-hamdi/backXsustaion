const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    autopopulate: true
  },
  seen: { type: Boolean, default: false },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    autopopulate: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['NewMessage', 'NewTask', 'NewUsertoTeam', 'NewSubtaskToTask'],
    required: true
  },
  idTask:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'task',
  },
  idDiscution:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'task',
  }
});
notificationSchema.plugin(require('mongoose-autopopulate'));

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
