const Task = require("../models/tasks");
const SubTask = require("../models/subTask");
const createError = require("http-errors");
const User = require("../models/user");
const TaskComments = require("../models/taskComments");
const SubtaskComments = require("../models/SubtaskComments");
const taskLikes = require("../models/taskLikes");
const {TaskType} = require("../models/type");
const mongoose = require("mongoose");
const moment = require("moment");
const { endTaskCron } = require("../utils/cron/tasksCron");
const { upload } = require("../utils/multer");
const Project = require("../models/project");
const { getAllTasks } = require("./SubTask");
module.exports = {
  getAllTasksOwner: async (req, res) => {
    try {
      const page = parseInt(req.params.page) || 1;
      const limit = parseInt(req.params.limit) || 10;

      const skip = (page - 1) * limit;

      const tasks = await Task.find()
        .populate({
          path: "owner",
          select: "name email",
        })
        .skip(skip)
        .limit(limit);
      const totalTasks = await Task.countDocuments({});

      res.status(200).json({ tasks, totalTasks });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // Get Tasks by Owner ID
  getTasksByOwnerId: async (req, res) => {
    try {
      const ownerId = req.params.ownerId;
      const tasks = await Task.find({
        $or: [
          { owner: ownerId },
          { 'participants.id': ownerId }
        ]
      }).select('-createdAt -updatedAt') // Exclude unnecessary fields
        .populate('Designer', 'name') // Only populate the 'name' field of the Designer
        .populate('SubBy.owner', '_id name imagePath') // Only populate the 'name' field of the SubBy.owner
        .populate('participants.id', '_id name') // Populate the 'id' and 'name' fields of participants
        .populate('participants.role')
        .populate('collections')
        
  
      if (!tasks.length) {
        return res.status(404).send("No tasks found for the provided owner.");
      }
  
      const owner = await User.findById(ownerId);
      const formattedTasks = tasks.map((task) => ({
        _id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        ReqType: task.TaskType?.title||task.TaskType?.name,
        deadline: task.endDate,
        DesignerName: task.Designer ? task.Designer.name : "Xsustain.",
        SubmitterName: task.SubBy.owner.name,
        TaskManagerStatus: task.TaskManagerStatus,
        collections: task.collections,
        participants: task.participants.map(participant => ({
          id: participant.id?._id,
          role: participant.role,
          notification:participant.notification
        })),
        idOwner:task.SubBy.owner._id,
        indexTaskManage:task.indexTaskManage
      }));

      res.status(200).json(formattedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: error.message });
    }
  }
  ,
  createTask: async (req, res) => {
    try {
        const taskData = req.body;
        console.log('=============', taskData);
        
        // Validate taskData
        if (
            !taskData ||
            !taskData.SubBy.owner ||
            !taskData.title ||
            !taskData.TaskType ||
            !taskData.CommentImage ||
            (!taskData.description && taskData.description !== '') // Check if description is not empty or null
        ) {
            throw createError(400, "Missing or invalid task data!");
        }
        // Join description array into a single string
        if (Array.isArray(taskData.description)) {
            taskData.description = taskData.description.join("\n");
        }

        // Create the imagePaths array based on the input
        if (Array.isArray(taskData.imagePaths)) {
            taskData.imagePaths = taskData.imagePaths.map((imagePath, index) => ({
                iid: new mongoose.Types.ObjectId(), // Generate a new ObjectId for each image
                imagePath,
                timestamp: new Date(),
                Title: `Image ${index + 1}`, // Customize this title as needed
            }));
        }
          const IdTypeTask =taskData.TaskType.TaskType.id


        // Create new task
        const newTask = await Task.create({
            ...taskData,
            TaskType: IdTypeTask,

            coverPhoto:taskData.imagePaths[0].imagePath // Ensure TaskType is properly assigned
        });

        // If a projectId was provided, add the task to the project
        if (taskData.ProjectId) {
          const projectId = taskData.ProjectId;
          const project = await Project.findById(projectId);

          if (!project) {
              throw createError(404, "Project not found!");
          }

          project.tasks.push(newTask._id);
          await project.save();

          // Update the task with the project ID
          newTask.Project.push(projectId);
          await newTask.save();
      }
      if (taskData.ProjectId1) {
        const ProjectId1 = taskData.ProjectId1;
        const project = await Project.findById(ProjectId1);

        if (!project) {
            throw createError(404, "Project not found!");
        }

        project.tasks.push(newTask._id);
        await project.save();

        // Update the task with the project ID
        newTask.Project.push(ProjectId1);
        await newTask.save();
    }
console.log(newTask);
        res.status(201).json(newTask);
    } catch (error) {
        console.error("Task creation error:", error);
        res.status(500).json({ error: error.message });
    }
},
  getTask: async (req, res) => {
    try {
      const taskId = req.params.id;
      const [task, subtasks] = await Promise.all([
        Task.findById(taskId),
        SubTask.find({ owner: taskId }),
      ]);

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Combine task and subtasks
      const taskWithSubtasks = [task, ...subtasks];
      console.log(taskWithSubtasks);

      res.status(200).json(taskWithSubtasks);
      console.log("--------------", taskWithSubtasks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getTaskAdmin: async (req, res) => {
    try {
      const taskId = req.params.id;
      const task = await Task.findById(taskId).populate({
        path: "owner",
        select: "name email",
      });
   
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
      const tasks = await Task.find();
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getAllTasksOwner: async (req, res) => {
    try {
      const page = parseInt(req.params.page) || 1;
      const limit = parseInt(req.params.limit) || 10;

      const skip = (page - 1) * limit;

      const tasks = await Task.find()
        .populate({
          path: "owner",
          select: "name email",
        })
        .skip(skip)
        .limit(limit);
      const totalTasks = await Task.countDocuments({});

      res.status(200).json({ tasks, totalTasks });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete Task by ID
  deleteTask: async (req, res) => {
    try {
      const taskId = req.params.id;
      const deletedTask = await Task.findByIdAndDelete(taskId);
      const deletedSubTask = await SubTask.findByIdAndDelete(taskId);
      if (!deletedTask && !deletedSubTask) {
        return res.status(404).json({ message: "Task not found" });
      } else {
        res.status(200).json({ message: "Task deleted successfully" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update Task Status by ID
  updateTaskStatus: async (req, res) => {
    try {
      const taskId = req.params.id;
      const { status } = req.body;
      if (
        !status ||
        !["pending", "progress", "review", "done"].includes(status)
      ) {
        throw createError(400, `invalide status!`);
      }
      const updatedTask = await Task.findByIdAndUpdate(
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
  addCommentToTask: async (req, res) => {
    try {
      const ObjectId = mongoose.Types.ObjectId;
      const { taskId, sender, commentText } = req.params;
      console.log(taskId, sender, commentText);

      // Check if comment or sender or message is missing
      if (!commentText || !sender) {
        throw createError(400, `Invalid comment!`);
      }
      // Check if the user with the given sender ID exists
      const user = await User.findById(sender);
      console.log(sender, "senderrrrrrrrrr");
      if (!user) {
        throw createError(400, `Invalid sender!`);
      }
      // Find the task by ID
      const task = await Task.findById(taskId);
      const subtask = await SubTask.findById(taskId);
      if (!task && !subtask) {
        console.log("subtask and Task not found");
        throw createError(400, `subtask and Task not found!`);
      }

      // Handle file upload using Multer middleware
      try {
        if (task) {
          console.log("task ok");
          const newTaskComment = new TaskComments({
            sender: sender,
            message: commentText,
            taskId: taskId,
          });

          await newTaskComment.save();

          task.comments.push(newTaskComment._id);
          await task.save();

          res.status(200).json(task);
          console.log(task);
        }
        if (subtask) {
          console.log("subtask ok");

          const newTaskComment = new SubtaskComments({
            sender: sender,
            message: commentText,
            taskId: taskId,
          });

          await newTaskComment.save();

          subtask.comments.push(newTaskComment._id);
          await subtask.save();

          res.status(200).json(subtask);
          console.log(subtask);
        }

        // Create a new TaskComment instance
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  },
  displayCommentAndSender: async (req, res) => {
    try {
      const taskId = req.params.idTask;
      console.log("Task ID:", taskId);

      // Attempt to find a task with populated comments and senders
      const task = await Task.findById(taskId)
        .populate({
          path: 'comments',
          populate: {
            path: 'sender',
            select: '_id name email color timestamps imagePath'
          }
        });
          
      // Attempt to find a subtask if no task was found
      const subtask = task ? null : await SubTask.findById(taskId).populate({
          path: 'comments',
          populate: {
              path: 'sender',
              select: '_id name email color timestamps imagePath'
            }
      }).exec();
      console.log('Task with populated comments:', task);

      const target = task || subtask;

      if (!target) {
        console.log("Neither task nor subtask found for ID:", taskId);
        return res.status(404).json({ error: "Task and Subtask not found" });
      }

      // Map through comments to structure the response as needed
      const commentsWithSenderAndFiles = target.comments.map((comment) => ({
        message: comment.message,
        sender: comment.sender ? comment.sender.name : "Unknown Sender",
        color: comment.sender.color,
        files: comment.file || [],
        id: comment._id.toString(),
        date: comment.createdAt ,
        imagePath:comment.sender.imagePath// Use createdAt for creation timestamp
    }));
          
      console.log('Comments:', commentsWithSenderAndFiles);
      res.json(commentsWithSenderAndFiles);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ error: "Error fetching comments" });
    }
  },
  displayTeamateImg: async (req, res) => {
    try {
      const { taskId } = req.params;
      console.log(taskId);

      const task = await Task.findById(taskId).populate({
        path: "participants.id", // Use 'participants.id' to populate the user
        select: "imagePath name color", // Select imagePath, name, and color fields
      });

      const subtask = await SubTask.findById(taskId).populate({
        path: "participants.id", // Use 'participants.id' to populate the user
        select: "imagePath name color", // Select imagePath, name, and color fields
      });

      if (!task && !subtask) {
        return res.status(404).json({ error: "Subtask and Task not found" });
      }

      if (task) {
        res.json(
          task.participants.map((participant) => ({
            imagePath: participant.id.imagePath,
            name: participant.id.name,
            color: participant.id.color,
          }))
        );
      }

      if (subtask) {
        res.json(
          subtask.participants.map((participant) => ({
            imagePath: participant.id.imagePath,
            name: participant.id.name,
            color: participant.id.color,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching teammate images:", error);
      res.status(500).json({ error: "Error fetching teammate images" });
    }
  },

  // Add Like to Task
  addLikeToTask: async (req, res) => {
    try {
      const taskId = req.params.id;
      const like = req.body;

      // Check if like is provided
      if (!like || !like.user) {
        return res.status(400).json({ message: "Like information missing" });
      }
      console.log("tskidd", taskId);

      // Find the task by ID
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      const newLikeComment = new taskLikes({
        user: like.user,
        taskId: taskId,
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

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      // Assuming there's only one file uploaded
      const file = req.files[0];
      const imagePath = `http://192.168.11.113:3000/images/${file.filename}`;
      const Title = file.filename;
      console.log("----------------------------------", imagePath);
      console.log("1");
      // Update the task with the new image path
      const updatedTask = await Task.findByIdAndUpdate(
        TaskId,
        { $push: { imagePaths: { imagePath, timestamp: new Date(), Title } } },
        { new: true }
      );
      console.log("2");

      const updatedSubTask = await SubTask.findByIdAndUpdate(
        TaskId,
        { $push: { imagePaths: { imagePath, timestamp: new Date(), Title } } },
        { new: true }
      );

      console.log("3");

      if (!updatedTask && !updatedSubTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.status(200).json({
        message: "Image uploaded successfully",
        updatedTask,
        updatedSubTask,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  addFiletoCommentTask: async (req, res) => {
    try {
      const { TaskId } = req.params;
      const { userId } = req.params;

      // Check if Task exists
      const task = await Task.findById(TaskId);
      const subtask = await SubTask.findById(TaskId);

      if (!task && !subtask) {
        console.log("taskerr");
        return res.status(404).json({ message: "subtask and Task not found" });
      }

      // Construct an array of file paths from the uploaded files
      const filePaths = req.files.map(
        (file) => "http://192.168.11.113:3000/images/" + file.filename
      );
      console.log("Uploaded files:", req.files);

      // Create new task comment with file(s) and save it
      const newComment = {
        sender: userId, // Assuming userId is the sender of the comment
        file: filePaths, // Assuming you're saving file paths in the task comment
      };
      if (task) {
        const createdComment = await TaskComments.create(newComment);
        task.comments.push(createdComment);
        await task.save();
        // Respond with success message or updated task object
        res
          .status(200)
          .json({ message: "Files uploaded successfully", createdComment });
      }
      if (subtask) {
        const createdComment = await SubtaskComments.create(newComment);
        subtask.comments.push(createdComment);
        await subtask.save();
        // Respond with success message or updated task object
        res
          .status(200)
          .json({ message: "Files uploaded successfully", createdComment });
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  addTeammateToTask: async (req, res) => {
    try {
      const { TaskId, teammateId } = req.params;
      console.log('taskId:', TaskId);
      console.log('teammateId:', teammateId);
      const {role} = req.body;
  
      
      // Find the task by ID
      const task = await Task.findById(TaskId);
      const subtask = await SubTask.findById(TaskId);
  
      // Check if the task exists
      if (!task&&!subtask) {
        return res.status(404).json({ message: 'subtas and Task not found' });
      } 
      if (task) {
      // Add the provided teammate ID to the participants array
      task.participants.push({id:teammateId,role:role});
      // Save the updated task
      const updatedTask = await task.save();
      // Respond with success message or updated task object
      res.status(200).json({ message: 'Teammate added to task successfully', updatedTask });
      } 
      if (subtask) {
      // Add the provided teammate ID to the participants array
      subtask.participants.push({id:teammateId,role:role});
      // Save the updated task
      const updatedTask = await subtask.save();
      // Respond with success message or updated task object
      res.status(200).json({ message: 'Teammate added to task successfully', updatedTask });
      }
  
    } catch (error) {
      console.error('Error adding teammate to task:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  asigneAgentToTask: async (req, res) => {
    try {
      const { TaskId, teammateId } = req.params;
      const { role } = req.body;

      // Check if teammateId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(teammateId)) {
        return res.status(400).json({ message: "Invalid teammateId" });
      }

      // Find the task by ID
      const task = await Task.findById(TaskId);
      const subtask = await SubTask.findById(TaskId);

      // Check if the task exists
      if (!task && !subtask) {
        return res.status(404).json({ message: "subtas and Task not found" });
      }
      if (task) {
        // Add the provided teammate ID to the participants array
        task.participants.push({id:teammateId,role:role});
        task.TaskManagerStatus = "In Progress";
        // Save the updated task
        const updatedTask = await task.save();
        // Respond with success message or updated task object
        res.status(200).json({
          message: "Teammate added to task successfully",
          updatedTask,
        });
      }
      if (subtask) {
        // Add the provided teammate ID to the participants array
        subtask.participants.push({ id: teammateId, role: role });
        // Save the updated task
        const updatedTask = await subtask.save();
        // Respond with success message or updated task object
        res.status(200).json({
          message: "Teammate added to task successfully",
          updatedTask,
        });
      }
    } catch (error) {
      console.error("Error adding teammate to task:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  deleteTeammate: async (req, res) => {
    const { TaskId, teammateId } = req.params; // Get TaskId and teammateId from request parameters
    console.log(teammateId);
    console.log(TaskId);
    try {
      // Use $pull to directly remove the participant from the participants array
      const result = await Task.findByIdAndUpdate(
        TaskId,
        { $pull: { participants: { id: teammateId } } },
        { new: true } // This option returns the document after update was applied
      );
      const subresult = await SubTask.findByIdAndUpdate(
        TaskId,
        { $pull: { participants: { id: teammateId } } },
        { new: true } // This option returns the document after update was applied
      );

      if (!result && !subresult) {
        return res.status(404).json({
          message: "sub and Task not found or no participant removed",
        });
      }

      console.log("Participant removed successfully");
      res
        .status(200)
        .json({ message: "Participant removed from the task successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error removing participant from the task" });
    }
  },

  changeTaskPosition: async (req, res) => {
    const { taskId, collection } = req.params;

    try {
      // Attempt to update a Task
      const updatedTask = await Task.findOneAndUpdate(
        { _id: taskId },
        { collections: collection },
        { new: true } // Return the updated document
      );

      // If no Task was updated, try updating a SubTask
      const updatedSubTask = !updatedTask
        ? await SubTask.findOneAndUpdate(
            { _id: taskId },
            { collections: collection },
            { new: true } // Return the updated document
          )
        : null;

      // If neither was found and updated, return a 404
      if (!updatedTask && !updatedSubTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Log the backend change and prepare the response data
      console.log("Backend Change Position", updatedTask || updatedSubTask);
      const responseData = updatedTask ? updatedTask : updatedSubTask;

      return res.status(200).json({
        message: "Task position and collection updated successfully",
        task: responseData,
      });
    } catch (error) {
      console.error("Error updating task position and collection:", error);
      return res.status(500).json({ message: "Internal server error" });
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
        { position: NewIndex } // Set the new index value using NewIndex
      );

      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      return res.status(200).json({
        message: "Task position and index updated successfully",
        task: updatedTask,
      });
    } catch (error) {
      console.error("Error updating task position and index:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  populateIndexes: async (req, res) => {
    try {
      const {
        taskId,
        UserId,
        collectionSource,
        collectionDestination,
        sourceIndex,
        destinationIndex,
      } = req.params;
      console.log(
        taskId,
        UserId,
        collectionSource,
        collectionDestination,
        sourceIndex,
        destinationIndex
      );

      // Update the position of the moved task
      await Task.findByIdAndUpdate(taskId, { position: destinationIndex });

      // Find all tasks owned by the specified user and in the specified collections
      const tasks = await Task.find({
        owner: { $in: [UserId] },
        collections: { $in: [collectionSource, collectionDestination] },
      });

      // Iterate through tasks and update indexes
      for (let task of tasks) {
        if (task._id.toString() === taskId) continue;

        let positionChange = 0;
        if (collectionSource === collectionDestination) {
          if (
            task.position > sourceIndex &&
            task.position <= destinationIndex
          ) {
            positionChange = -1; // Move towards the end
          } else if (
            task.position < sourceIndex &&
            task.position >= destinationIndex
          ) {
            positionChange = 1; // Move towards the start
          }
        } else {
          if (
            task.collections.includes(collectionSource) &&
            task.position > sourceIndex
          ) {
            positionChange = -1; // Move towards the end in source
          }
          if (
            task.collections.includes(collectionDestination) &&
            task.position >= destinationIndex
          ) {
            positionChange = 1; // Move towards the start in destination
          }
        }

        if (positionChange !== 0) {
          task.position += positionChange;
          await task.save();
        }
      }

      // Similarly, update subtasks (Assuming similar logic applies or adjust accordingly)
      const subtasks = await SubTask.find({
        owner: taskId,
        collections: { $in: [collectionSource, collectionDestination] },
      });
      for (let subtask of subtasks) {
        // similar logic for updating positions as done for tasks
        // remember to save each subtask after modification
      }

      console.log("Indexes populated successfully");
    } catch (error) {
      console.error("Error populating indexes:", error);
      res.status(500).send(error);
    }
  },

  updateTaskComment: async (req, res) => {
    try {
      const { commentId } = req.params;
      const { message } = req.body;
      const files = req.files
        ? req.files.map(
            (file) => "http://192.168.11.113:3000/images/" + file.filename
          )
        : undefined;
      console.log("Uploaded files:", req.files);

      // Find the task comment by ID
      let taskComment = await TaskComments.findById(commentId);
      let subtaskCommentt = await SubtaskComments.findById(commentId);
      if (!taskComment && !subtaskCommentt) {
        throw createError(404, "subtask and Task comment not found");
      }

      // Update the message if provided

      if (taskComment) {
        if (message !== undefined) {
          taskComment.message = message;
        }

        // Update the files if provided
        if (files && files.length > 0) {
          // Only update if files are uploaded
          taskComment.file = files;
        }
        taskComment = await taskComment.save();
        res
          .status(200)
          .json({ message: "Task comment updated successfully", taskComment });
      }
      if (subtaskCommentt) {
        if (message !== undefined) {
          subtaskCommentt.message = message;
        }

        // Update the files if provided
        if (files && files.length > 0) {
          // Only update if files are uploaded
          subtaskCommentt.file = files;
        }
        subtaskCommentt = await subtaskCommentt.save();
        res.status(200).json({
          message: "subTask comment updated successfully",
          subtaskCommentt,
        });
      }

      // Save the updated task comment
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
    0;
  },

  getParticipantInfo: async (req, res, next) => {
    try {
      const { taskId } = req.params;

      const taskWithParticipants = await Task.findById(taskId)
        .populate("participants", "id", "name imagePath email color")
        .populate("owner", "name imagePath email color")
        .exec();

      const taskWithParticipantsSub = await SubTask.findById(taskId)
        .populate("participants", "name imagePath email")
        .populate("owner", "name imagePath email color")
        .exec();

      if (taskWithParticipants && !taskWithParticipantsSub) {
        res.status(200).json(taskWithParticipants);
      } else if (taskWithParticipantsSub && !taskWithParticipants) {
        res.status(200).json(taskWithParticipantsSub);
      } else {
        res.status(404).send("Task not found");
      }
    } catch (error) {
      res.status(500).send("Server error");
    }
  },
  updateDescTask: async (req, res, next) => {
    try {
      const { taskId } = req.params;
      const { description } = req.body;

      // Find the task by ID and update its description
      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { description: description },
        { new: true }
      );
      const updatedSubTask = await SubTask.findByIdAndUpdate(
        taskId,
        { description: description },
        { new: true }
      );

      if (updatedTask) {
        res.status(200).json(updatedTask);
      } else if (updatedSubTask) {
        res.status(200).json(updatedSubTask);
      } else {
        res.status(404).send("Task not found");
      }
    } catch (error) {
      console.error("Server error", error);
      res.status(500).send("Server error");
    }
  },
  getfiles: async (req, res, next) => {
    try {
      const { taskId } = req.params;

      // Find the task by ID and populate its comments
      const task = await Task.findById(taskId).populate("comments").exec();
      const taskFiles = await Task.findById(taskId)
        .populate("imagePaths")
        .exec();
      const subtask = await SubTask.findById(taskId)
        .populate("comments")
        .exec();
      const subtaskFiles = await SubTask.findById(taskId)
        .populate("imagePaths")
        .exec();
      if (!task && !taskFiles && !subtaskFiles && !subtask) {
        return res.status(404).send("Task or sub not found");
      }


    if (task&&taskFiles) {
      const imagePathsWithTimestamps = task?.imagePaths?.map(imagePath => ({
        imagePath: imagePath,
        id: imagePath.id,
  
        timestamp: task.createdAt, // or any other timestamp field you want to use
      }));
      res.status(200).json({ imagePathsWithTimestamps /*filesWithTimestamps*/ });

      }
    if (subtaskFiles&&subtask) {
      const subimagePathsWithTimestamps = subtask.imagePaths.map(imagePath => ({
        imagePath: imagePath,
        id: imagePath.id,
  
        timestamp: subtask.createdAt, // or any other timestamp field you want to use
      }));
      res.status(200).json({ subimagePathsWithTimestamps /*filesWithTimestamps*/ });

      }

      // Extract files with timestamps from comments
      /* const filesWithTimestamps = task.comments.reduce((acc, comment) => {
      // Check if comment has files
      if (comment.file && comment.file.length > 0) {
        // Extract file paths with timestamps
        const files = comment.file.map(filePath => ({
          file: filePath,
          timestamp: comment.createdAt // or any other timestamp field you want to use
        }));
        acc.push(...files);
      }
      return acc;
    }, []);*/
    } catch (error) {
      console.error("Server error", error);
      res.status(500).send("Server error");
    }
  },
  changeCoverPhoto: async (req, res) => {
    const { taskId, imagePathId } = req.params;
    console.log(taskId, imagePathId);
    try {
      // Find the task by its ID
      const task = await Task.findById(taskId).populate("imagePaths");
      const subtask = await SubTask.findById(taskId).populate("imagePaths");

      if (!task && !subtask) {
        return res.status(404).json({ message: "Task not found" });
      }
      console.log(task);
      if (task) {
        const imagePath = task.imagePaths.find(
          (image) => image._id.toString() === imagePathId
        );
        if (!imagePath) {
          return res
            .status(404)
            .json({ message: "Image path not found for the specified ID" });
        }
        task.coverPhoto = imagePath.imagePath;
        await task.save();

        res
          .status(200)
          .json({ message: "Cover photo changed successfully", task });
      }
      if (subtask) {
        const imagePath = subtask.imagePaths.find(
          (image) => image._id.toString() === imagePathId
        );
        if (!imagePath) {
          return res
            .status(404)
            .json({ message: "Image path not found for the specified ID" });
        }
        subtask.coverPhoto = imagePath.imagePath;
        const coverPhoto = subtask.coverPhoto;
        await subtask.save();

        res
          .status(200)
          .json({ message: "Cover photo changed successfully", subtask });
      }

      // Find the image path by its ID

      // Update the cover photo
    } catch (error) {
      console.error("Error changing cover photo:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  Deleteile: async (req, res) => {
    const { taskId, imagePathId } = req.params;
    console.log(taskId, imagePathId);
    try {
      // Find the task by its ID
      const task = await Task.findById(taskId).populate("imagePaths");
      const subtask = await SubTask.findById(taskId).populate("imagePaths");

      if (!task && !subtask) {
        return res.status(404).json({ message: "Sub and Task not found" });
      }
      if (task) {
        // Find the index of the image path by its ID
        const imagePathIndex = task.imagePaths.findIndex(
          (image) => image._id.toString() === imagePathId
        );

        if (imagePathIndex === -1) {
          return res
            .status(404)
            .json({ message: "Image path not found for the specified ID" });
        }

        // Remove the image path from the task
        task.imagePaths.splice(imagePathIndex, 1);

        // Save the updated task
        await task.save();

        res
          .status(200)
          .json({ message: "Image path deleted successfully", task });
      }
      if (subtask) {
        // Find the index of the image path by its ID
        const imagePathIndex = subtask.imagePaths.findIndex(
          (image) => image._id.toString() === imagePathId
        );

        if (imagePathIndex === -1) {
          return res
            .status(404)
            .json({ message: "Image path not found for the specified ID" });
        }

        // Remove the image path from the task
        subtask.imagePaths.splice(imagePathIndex, 1);

        // Save the updated task
        await subtask.save();

        res
          .status(200)
          .json({ message: "Image path deleted successfully", subtask });
      }
    } catch (error) {
      console.error("Error deleting image path:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  changeIndexTaskManagerTab: async (req, res) => {
    const { taskId, newIndex } = req.params;
    try {
      // Find the task by its ID
      const task = await Task.findById(taskId);

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const oldIndex = task.indexTaskManage;

      // If the new index is greater than the old index,
      // decrement the index of all tasks whose index is between the old and new index
      if (newIndex > oldIndex) {
        await Task.updateMany(
          { indexTaskManage: { $gt: oldIndex, $lte: newIndex } },
          { $inc: { indexTaskManage: -1 } }
        );
      }
      // If the new index is less than the old index,
      // increment the index of all tasks whose index is between the new and old index
      else if (newIndex < oldIndex) {
        await Task.updateMany(
          { indexTaskManage: { $gte: newIndex, $lt: oldIndex } },
          { $inc: { indexTaskManage: 1 } }
        );
      }

      // Update the index of the task
      task.indexTaskManage = newIndex;

      // Save the updated task
      await task.save();

      res
        .status(200)
        .json({ message: "Task index changed successfully", task });
    } catch (error) {
      console.error("Error changing task index:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  deleteComment: async (req, res) => {
    const { commentId } = req.params;
    try {
      const result = await TaskComments.findByIdAndDelete(commentId);
      const result1 = await SubtaskComments.findByIdAndDelete(commentId);
      if (!result && !result1) {
        return res.status(404).send({ message: "Comment not found" });
      }
      if (result) {
        return res
          .status(200)
          .send({ message: "Comment deleted successfully" });
      }
      if (result1) {
        return res
          .status(200)
          .send({ message: "Comment deleted successfully" });
      }
    } catch (error) {
      console.error("Error deleting the comment:", error);
      res.status(500).send({ message: "Internal server error" });
    }
  },
};
