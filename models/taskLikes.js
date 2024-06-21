const mongoose = require('mongoose');

const TaskLikesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      autopopulate: true,

    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'tasks',
      autopopulate: true,

    }
  },
  {
    timestamps: true
  }
);
TaskLikesSchema.plugin(require('mongoose-autopopulate'));

const taskLikesSchema = mongoose.model('taskLikes', TaskLikesSchema);

module.exports = taskLikesSchema;
