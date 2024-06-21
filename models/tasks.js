const { Comment } = require("@mui/icons-material");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tasksSchema = new Schema({
  owner:{ type: mongoose.Schema.Types.ObjectId, ref: "User" , required: true},
  title: {
    type: String,
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
      },
      notification: {
        type:Boolean,
        default:false
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
      Title: {
        type: String,
      }
    },
  ],
  coverPhoto: {
    type: String,
    default: "" // Default value for cover photo
  },
  description: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "progress", "review", "done"],
  },
  priority: {
    type: String,
    enum: ["High", "Completed", "Low"],
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "taskComments",
    },
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "taskLikes",
     
      
    },
  ],
  startTime: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: String,
  },
  position: {
    type: Number,
    default: 0, // Default position can be adjusted as needed
  },
  collections: {
    type: String,
    default: "todo",
  },
  subtasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subtask"}],
  Designer: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" , default:'Xsustain.',required: true}],
  ReqType:{
    type:String,
  },
  SubBy: {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  TaskManagerStatus: {
    type: String,
    default: "Unassigned",
  },
  type:{
    type:String ,
    default: "Task" 
  },
  indexTaskManage:{
    type: Number,
    default: 0 // Default position can be adjusted as needed

  },
  direction: {
    type: [String], 

  },
  TaskType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TaskType",
    autopopulate:true
    
  },
  CommentImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    
  },
  notifications: {
    type:Boolean,
    default:false
  },
  Project: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
}]
});

tasksSchema.plugin(require("mongoose-autopopulate"));

module.exports = mongoose.model("tasks", tasksSchema);
