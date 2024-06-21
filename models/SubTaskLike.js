const mongoose = require('mongoose');

const TaskLikesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
      ,      autopopulate: true,

    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subtask'
      ,      autopopulate: true,

    }
  },
  {
    timestamps: true
  }
);

const taskLikesSchema = mongoose.model('SubtaskLikes', TaskLikesSchema);
TaskLikesSchema.plugin(require('mongoose-autopopulate'));

module.exports = taskLikesSchema;
