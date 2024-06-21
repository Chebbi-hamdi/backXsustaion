const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define subtask schema
const subtaskSchema = new Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tasks",
    required: true
  },
  title: {
    type: String
  },
    participants: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        autopopulate: true,
        ref: "User",
      },
      role: {
        type: String,
        enum: ["viewer", "editeur"],
        default:'viewer'
      }
    }
  ],

  imagePaths: [
    {
      iid: {
        type: mongoose.Schema.Types.ObjectId,
      },
      imagePath: {
        type: String,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  coverPhoto: {
    type: String,
    default: "" // Default value for cover photo
  },
  description: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "progress", "review", "done"]
  },
  priority: {
    type: String,
    enum: ["High", "Completed", "Low"]
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubtaskComments",
    default: []
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubtaskLikes",
    default: []
  }],
  startTime: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  SubBy: {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  position: {
    type: Number,
    default: 0
  },
  collections: {
    type: String,
    default: "todo"
  }, 
  type:{
    type:String ,
    default: "Subtask" }
});
subtaskSchema.plugin(require('mongoose-autopopulate'));

// Create Subtask model
const SubTask = mongoose.model('Subtask', subtaskSchema);

module.exports = SubTask;
