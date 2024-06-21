const mongoose = require("mongoose");
const tasks = require("./tasks");
const schema = mongoose.Schema;

const projectSchema = new schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    imagePath: {
        type: String,
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "tasks",
        autopopulate: true,
    }],
    indexTaskManage:{
        type: Number,
        default: 0 // Default position can be adjusted as needed
    
      },
      StatusProjectManager:{
        type:String,
        default:'Unassigned'
      }
    

    });


const Project = mongoose.model("Project", projectSchema);

module.exports = Project;