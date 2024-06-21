const mongoose = require('mongoose');

const TaskCommentsSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // Ensure 'User' is the model name used in mongoose.model for User schema
      required: true,
      autopopulate: true,
    },
      message: {
      type: String,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subtask'
      ,      autopopulate: true,

    },
    file: [{ // Update to handle an array of file paths
      type: String,
    }]
  },
  {
    timestamps: true
  }
);

const TaskComments = mongoose.model('SubtaskComments', TaskCommentsSchema);
TaskCommentsSchema.plugin(require('mongoose-autopopulate'));

module.exports = TaskComments;
