const Task = require("../models/tasks");
const createError = require("http-errors");
const SubTask = require("../models/subTask");

const User = require("../models/user");
const TaskComments = require("../models/SubtaskComments");
const taskLikes = require("../models/SubTaskLike");
const mongoose = require("mongoose");
const moment = require('moment');
const {endTaskCron} = require("../utils/cron/tasksCron")
const {upload}  = require("../utils/multer")
module.exports = {
  // Get Tasks by Owner ID
  getTasksByOwnerId: async (req, res) => {
    try {
      const ownerId = req.params.ownerId; // Assuming ownerId is passed as a parameter in the URL
      const tasks = await SubTask.find({
        $or: [
          { owner: ownerId }        ]
      });
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
    // Create Task
    createTask: async (req, res) => {
      try {
        const taskData = req.body;
    
        // Check if required fields are present
        if (!taskData || !taskData.owner || !taskData.description || !taskData.priority || !taskData.title || !taskData.endDate) {
          throw createError(400, `Missing information!`);
        }
    
        // Parse the end date using moment
        const endDateMoment = moment(taskData.endDate, "HH:mm DD/MM/YYYY");
        taskData.endDate = endDateMoment.toDate();
    
        // Create the new subtask
        const newSubTask = await SubTask.create(taskData);
    
        // Find the task and push the subtask ID into its subtasks array
        const task = await Task.findById(taskData.owner);
        if (!task) {
          throw createError(404, `Task not found for the given owner ID`);
        }
    
        task.subtasks.push(newSubTask._id);
        await task.save();
    
        // Calculate cron start time and schedule the task
        const cronStartTime = moment(newSubTask.endDate, 'HH:mm DD/MM/YYYY').format('mm HH DD MM *');
        endTaskCron(cronStartTime, newSubTask);
    
        // Respond with the newly created subtask
        res.status(201).json(newSubTask);
      } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
      }
    }
    ,  
  // Get Task by ID
  getTask: async (req, res) => {
    try {
      const taskId = req.params.id;
      const task = await SubTask.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all tasks
  getAllTasks: async (req, res) => {
    try {
      const tasks = await SubTask.find();
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete Task by ID
  deleteTask: async (req, res) => {
    try {
      const taskId = req.params.id;
      const deletedTask = await SubTask.findByIdAndDelete(taskId);
      if (!deletedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update Task Status by ID
  updateTaskStatus: async (req, res) => {
    try {
      const taskId = req.params.id;
      const { status } = req.body;
      if ( !status || !["pending", "progress", "review", "done"].includes(status)) {
        throw createError(400, `invalide status!`);
      }
      const updatedTask = await SubTask.findByIdAndUpdate(
        taskId,
        { status },
        { new: true }
      );
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      console.log(updatedTask);

      res.status(200).json(updatedTask);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Add Comment to Task
   addCommentToTask : async (req, res) => {
    try {
      const ObjectId = mongoose.Types.ObjectId;
      const {taskId,sender} = req.params;
      const {commentText}= req.body;
      console.log(taskId,sender,commentText);

      // Check if comment or sender or message is missing
      if (!commentText || !sender ) {
        throw createError(400, `Invalid comment!`);
      }
      // Check if the user with the given sender ID exists
      const user = await User.findById(sender);
      console.log(sender,"senderrrrrrrrrr")
      if (!user) {
        throw createError(400, `Invalid sender!`);
      }
      // Find the task by ID
      const task = await SubTask.findById(taskId);
      if (!task) {
        throw createError(400, `Task not found!`);
      }
      // Handle file upload using Multer middleware
        try {
          // Create a new TaskComment instance
          const newTaskComment = new TaskComments({
            sender: sender,
            message: commentText,
            taskId: taskId
          });
  
          await newTaskComment.save();
  
          task.comments.push(newTaskComment._id);
          await task.save();
  
          res.status(200).json(task);
          console.log(task)
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error.message });
    }
  }, 
  displayCommentAndSender: async (req, res) => {
    try {
      const taskId = req.params.idTask;
      console.log(taskId);
  
      const task = await SubTask.findById(taskId).populate({
        path: 'comments', // Populate the comments field with actual comment objects
        populate: {
          path: 'sender',
          select: 'name', // Change 'username' to 'name' to match the field in userSchema
        },
      });
  
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
  
      // Now the 'comments' field should contain the actual comment objects
      const commentsWithSenderAndFiles = task.comments.map(comment => ({
        message: comment.message,
        sender: comment.sender.name,
        files: comment.file,
        id: comment._id.toString() // Convert _id to string
      }));
  
      res.json(commentsWithSenderAndFiles);
      console.log(commentsWithSenderAndFiles);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Error fetching comments' });
    }
  },
  
// Assuming `participants` is the correct field in the tasksSchema
displayTeamateImg: async (req, res) => {
    try {
        const {taskId} = req.params;
        console.log(taskId);

        const task = await SubTask.findById(taskId).populate({
            path: 'participants',
            select: 'imagePath', // Select both imagePath and name fields
        });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Extract participants' image paths

        res.json(task.participants.map(participant => ({
          imagePath: participant.imagePath,
      })));
    } catch (error) {
        console.error('Error fetching teammate images:', error);
        res.status(500).json({ error: 'Error fetching teammate images' });
    }
},
        
  
  // Add Like to Task
  addLikeToTask: async (req, res) => {
    try {
        const {taskId,like} = req.params;

        // Check if like is provided
        if (!like ) {
            return res.status(400).json({ message: "Like information missing" });
        }
        console.log('tskidd',taskId)

        // Find the task by ID
        const task = await SubTask.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        const newLikeComment = new taskLikes({
            user: like,
            taskId: taskId
        });
        await newLikeComment.save();

        // Push the like into the task's likes array
        task.likes.push(newLikeComment);
        
        // Save the updated task
        await task.save();

        // Respond with the updated task
        res.status(200).json(task);
    } catch (error) {
        // Handle any errors
        res.status(500).json({ error: error.message });
    }
},
// Modify the controller function to accept an array of file objects
addFiletoTask: async (req, res) => {
  try {
    const { TaskId } = req.params;
    console.log('TaskId:', TaskId);

    // Construct an array of image paths from the uploaded files
    const imagePaths = req.files.map(file => "http://localhost:3000/images/" + file.filename);
    console.log('Uploaded files:', req.files);

    // Find the task with the provided ID and update the imagePaths
    const updatedTask = await SubTask.findByIdAndUpdate(TaskId, { $push: { imagePaths: { $each: imagePaths } } }, { new: true });
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Respond with success message or updated task object
    res.status(200).json({ message: "Images uploaded successfully", updatedTask });
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({ message: "Internal server error" });
  }
},

addFiletoCommentTask : async (req, res) => {
  try {
    const { TaskId } = req.params;
    const { userId } = req.params;

    // Check if Task exists
    const task = await SubTask.findById(TaskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Construct an array of file paths from the uploaded files
    const filePaths = req.files.map(file => "http://localhost:3000/images/" + file.filename);
    console.log('Uploaded files:', req.files);

    // Create new task comment with file(s) and save it
    const newComment = {
      sender: userId, // Assuming userId is the sender of the comment
      file: filePaths // Assuming you're saving file paths in the task comment
    };
    const createdComment = await TaskComments.create(newComment);

    // Push the created comment to task comments array
    task.comments.push(createdComment);
    await task.save();

    // Respond with success message or updated task object
    res.status(200).json({ message: 'Files uploaded successfully', createdComment });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
},

addTeammateToTask: async (req, res) => {
  try {
    // Parse task ID and teammate ID from request parameters
    const { TaskId, teammateId } = req.params;
    console.log('taskId:', TaskId);
    console.log('teammateId:', teammateId);
    
    // Find the task by ID
    const task = await SubTask.findById(TaskId);
    console.log(task.owner.toString(),'tasktasktasktasktasktasktasktask')
    const realTask = await Task.findById(task.owner.toString());
    

    // Check if the task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    // Check if the task exists
    if (!realTask) {
      return res.status(404).json({ message: 'RealTask not found' });
    }

    // Add the provided teammate ID to the participants array
    task.participants.push(teammateId);
    realTask.participants.push(teammateId);


    // Save the updated task
    const updatedTask = await task.save();
    const updatedRealTask = await realTask.save();

    // Respond with success message or updated task object
    res.status(200).json({ message: 'Teammate added to task and realtask successfully', updatedTask, updatedRealTask });

  } catch (error) {
    console.error('Error adding teammate to task:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
},

deleteTeammate: async (req, res) => {
  const taskId = req.params; // Récupérer l'ID de la tâche depuis les paramètres de la requête
  console.log('mmmmm',taskId.TaskId)
  const { teammateIds } = req.body;

  try {
      // Supprimer le participant de la tâche
      const updatedTask = await SubTask.findByIdAndUpdate(
        taskId.TaskId,
          { $pull: { participants: { $in: teammateIds } } },
          { new: true }
      );

      if (!updatedTask) {
          return res.status(404).json({ message: 'Tâche non trouvée' });
      }

      res.status(200).json({ message: 'Participants supprimés de la tâche avec succès', task: updatedTask });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de la suppression des participants de la tâche' });
  }
},

changeTaskPosition: async (req, res) => {
  const { taskId, collection } = req.params;

  try {
    // Find the task by its ID and update its collection and position
    const updatedTask = await SubTask.findOneAndUpdate(
      { _id: taskId }, // Filter to find the task by its ID
      { collections: collection }, // Set the new collection and position values
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    console.log('Backend Change Position', updatedTask);

    return res.status(200).json({ message: 'Task position and collection updated successfully', task: updatedTask });
  } catch (error) {
    console.error('Error updating task position and collection:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
},
changeTaskInd: async (req, res) => {
  const { taskId, Index, NewIndex } = req.params;

  console.log("Task ID:", taskId);
  console.log("Index:", Index); // Changed variable name to match the request parameter
  console.log("New Index:", NewIndex); // Changed variable name to match the request parameter

  try {
    // Find the task by its ID and update its index
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId }, // Filter to find the task by its ID
      { position: NewIndex }, // Set the new index value using NewIndex
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(200).json({ message: 'Task position and index updated successfully', task: updatedTask });
  } catch (error) {
    console.error('Error updating task position and index:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
},
populateIndexes: async (req, res) => {
  try {
    const { taskId, UserId, collectionSource, collectionDestination, sourceIndex, destinationIndex } = req.params;
    console.log(taskId, UserId, collectionSource, collectionDestination, sourceIndex, destinationIndex);

    // Update the position of the moved task
    await SubTask.findByIdAndUpdate(taskId, { position: destinationIndex });

    // Find all tasks owned by the specified user and in the specified collections
    const tasks = await SubTask.find({
      owner: UserId,
      collections: { $in: [collectionSource, collectionDestination] }
    });

    // Iterate through tasks and update indexes
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];

      // Skip the moved task
      if (task._id.toString() === taskId) {
        continue;
      }

      // Update the index based on the source and destination collections and positions
      if (collectionSource === collectionDestination) {
        if (task.position > sourceIndex && task.position <= destinationIndex) {
          task.position--; // Decrease index for tasks moving towards the center
        } else if (task.position < sourceIndex && task.position >= destinationIndex) {
          task.position++; // Increase index for tasks moving towards the top
        }
      } else {
        if (task.collections === collectionSource && task.position > sourceIndex) {
          task.position--; // Decrease index for tasks in the source collection after the sourceIndex
        } else if (task.collections === collectionDestination && task.position >= destinationIndex && task._id.toString() !== taskId) {
          task.position++; // Increase index for tasks in the destination collection after the destinationIndex
        }
      }

      // Save the updated task
      await task.save();
      
    }

    console.log('Indexes populated successfully');
  } catch (error) {
    console.error('Error populating indexes:', error);
  }
},

updateTaskComment: async (req, res) => {
  try {
    const { commentId } = req.params;
    const { message } = req.body;
    const files = req.files ? req.files.map(file => "http://localhost:3000/images/" + file.filename) : undefined;
    console.log('Uploaded files:', req.files);

    // Find the task comment by ID
    let taskComment = await TaskComments.findById(commentId);
    if (!taskComment) {
      throw createError(404, "Task comment not found");
    }

    // Update the message if provided
    if (message !== undefined) {
      taskComment.message = message;
    }

    // Update the files if provided
    if (files && files.length > 0) { // Only update if files are uploaded
      taskComment.file = files;
    }

    // Save the updated task comment
    taskComment = await taskComment.save();

    res.status(200).json({ message: "Task comment updated successfully", taskComment });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

};

