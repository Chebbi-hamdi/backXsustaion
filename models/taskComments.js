const mongoose = require('mongoose');

const TaskCommentsSchema = new mongoose.Schema({
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
    ref: 'tasks',
    autopopulate: true,

  },
  file: [{ // Handles an array of file paths
    type: String,
  }]
}, {
  timestamps: true
});

// Apply the autopopulate plugin to the TaskCommentsSchema
TaskCommentsSchema.plugin(require('mongoose-autopopulate'));

// Create the model from the schema
const TaskComments = mongoose.model('taskComments', TaskCommentsSchema);

module.exports = TaskComments;
