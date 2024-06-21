const Project = require("../models/project");
const mongoose = require('mongoose');  // Add this line to import mongoose
const Task =require('../models/tasks');
const createProject = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { dataSend } = req.body;
        const { name, owner, imagePath,description } = dataSend;
        // Increment indexTaskManage for all existing projects of the owner
        await Project.updateMany(
            { owner },
            { $inc: { indexTaskManage: 1 } },
            { session }
        );

        // Create the new project
        const project = await Project.create([{
            name,
            description,
            imagePath,
            owner,
            indexTaskManage: 0, // New project will have index 0
        }], { session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json(project[0]);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error(error);
        res.status(500).json({ error });
    }
};

const getProjects = async (req, res) => {
    try {
        const projects = await Project.find();
        res.status(200).json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error });
    }
    };

const getProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.status(200).json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error });
    }
    };


    const findProjectByOwnerId = async (req, res) => {
        try {
            const { ownerId } = req.params;
    
            // Check if ownerId is a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(ownerId)) {
                return res.status(400).json({ error: 'Invalid owner ID' });
            }
    
            const projects = await Project.find({ owner: ownerId })
            .populate({
              path: 'owner',
              select: 'name imagePath email.primary'
            })
            .populate({
              path: 'tasks',
              select: '_id  owner coverPhoto TaskManagerStatus title',
              populate: {  // Nested population for participants.id
                path: 'participants.id',
                select: '_id'
              },
              populate: {  // Nested population for participants.id
                path: 'SubBy.owner',
                select: 'name imagePath'
              }

            });
          
            // If no projects are found, you might want to handle that case
            if (!projects.length) {
                return res.status(404).json({ message: 'No projects found for this owner' });
            }
            console.log('===============',projects)
            res.status(200).json(projects);
        } catch (error) {
            console.error("Error finding projects by owner's ID:", error);
            res.status(500).json({ error: 'Server error' });
        }
    };
    const assignTaskToProject = async (req, res) => {
        try {
            const { projectId, taskId } = req.params;
    
            // Check if both projectId and taskId are valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(taskId)) {
                return res.status(400).json({ error: 'Invalid project ID or task ID' });
            }
    
            // Check if the project exists
            const project = await Project.findById(projectId);
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }
    
            // Check if the task exists
            const task = await Task.findById(taskId);
            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }
    
            // Assign the task ID to the project
            project.tasks.push(taskId);
            task.Project.push(projectId);
            await project.save();
            await task.save();

            // Return success message
            res.status(200).json({ message: 'Task assigned to project successfully' });
        } catch (error) {
            console.error("Error assigning task to project:", error);
            res.status(500).json({ error: 'Server error' });
        }
    };
    const changeIndexTaskManagerTab= async (req, res) => {
        const { taskId, newIndex } = req.params;
        try {
          // Find the task by its ID
          const task = await Project.findById(taskId);
            console.log("---");
          if (!task) {
            return res.status(500).json({ message: "project not found" });
          }
          
          const oldIndex = task.indexTaskManage;
          
          // If the new index is greater than the old index, 
          // decrement the index of all tasks whose index is between the old and new index
          if (newIndex > oldIndex) {
            await Project.updateMany(
              { indexTaskManage: { $gt: oldIndex, $lte: newIndex } },
              { $inc: { indexTaskManage: -1 } }
            );
          }
          // If the new index is less than the old index, 
          // increment the index of all tasks whose index is between the new and old index
          else if (newIndex < oldIndex) {
            await Project.updateMany(
              { indexTaskManage: { $gte: newIndex, $lt: oldIndex } },
              { $inc: { indexTaskManage: 1 } }
            );
          }
          
          // Update the index of the task
          task.indexTaskManage = newIndex;
      
          // Save the updated task
          await task.save();
      
          res.status(200).json({ message: "Task index changed successfully", task });
        } catch (error) {
          console.error("Error changing task index:", error);
          res.status(500).json({ message: "Internal server error" });
        }
      }
        
      const uploadImage = async (req, res) => {
        try {
          const file = req.file;
          if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
          }
          const imagePath = "http://localhost:3000/images/" + req.file.filename;
          // const imagePath = "http://192.168.11.113:3000/images/" + req.file.filename;
      
          console.log(imagePath);
          res.status(200).json({ imagePath });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error });
        }
      };
      const updateProject = async (req, res) => {
        try {
          const { id } = req.params;
          const { name, description, imagePath } = req.body;
          const project = await Project.findByIdAndUpdate(
            id,
            { name, description, imagePath },
            { new: true }
          );
          if (!project) {
            return res.status(404).json({ message: "Project not found" });
          }
          res.status(200).json(project);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error });
        }
      };    
      const deleteProject = async (req, res) => {
        try {
          const { id } = req.params;
          const project = await Project.findByIdAndDelete(id);
          if (!project) {
            return res.status(404).json({ message: "Project not found" });
          }
          res.status(200).json({ message: "Project deleted" });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error });
        }
      };
      
module.exports = {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject,
    findProjectByOwnerId,
    assignTaskToProject,
    changeIndexTaskManagerTab,
    uploadImage
    };
