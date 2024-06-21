const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskTypeSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    trim: true
  },
  image: {
    type: String,

  },
  subtasks: [{
    type: Schema.Types.ObjectId,
    ref: 'SubtaskType' // Change ref from 'Subtask' to 'SubtaskType'
    ,    autopopulate: true,

  }],
  SubSubtask:[{
    type: Schema.Types.ObjectId,
    ref: 'SubSubtask' // Change ref from 'Subtask' to 'SubtaskType'
  }]
});

const subSubtaskSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'url'] // Valid types
  },
  text: {
    type: String,
    trim: true
  },
  image: {
    type: String,
  },
  url: {
    type: String,
  }
});
const subtaskSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    trim: true
  },
  image: {
    type: String,
  },
  SubSubtask: [{    type: Schema.Types.ObjectId,
    ref: 'SubSubtask',
    autopopulate: true,
}]
});
subSubtaskSchema.plugin(require("mongoose-autopopulate"));
subtaskSchema.plugin(require("mongoose-autopopulate"));
taskTypeSchema.plugin(require("mongoose-autopopulate"));

const SubSubtask = mongoose.model('SubSubtask', subSubtaskSchema);
const TaskType = mongoose.model('TaskType', taskTypeSchema);
const SubtaskType = mongoose.model('SubtaskType', subtaskSchema); // Change model name to 'SubtaskType'

module.exports = { TaskType, SubtaskType, SubSubtask };