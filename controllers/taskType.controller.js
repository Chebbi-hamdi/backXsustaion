const { TaskType, SubtaskType, SubSubtask } = require('../models/type');

const createTaskType = async (req, res) => {
    try {
        const { title,content,image, subtasks } = req.body;
        
       
console.log(req.body)

        // Iterate over each subtype provided in the request body
        // Create the TaskType with the created SubtaskTypes
        const taskType = new TaskType({
            title,
            content,
            image,
            subtasks
        });

        // Save the TaskType
        await taskType.save();
        console.log('vvvvvvvvvvvvvvvvvvvvvvv',taskType)

        res.status(201).json(taskType);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
};


const getTaskType = async (req, res) => {
    try {
        const taskTypes = await TaskType.find().populate('subtasks');

        res.status(200).json(taskTypes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getTaskTypeById = async (req, res) => {
    try {
        const taskType = await TaskType.findById(req.params.id).populate({
            path: 'subtasks',
            populate: {
                path: 'SubSubtask'
            }
        });

        if (!taskType) {
            return res.status(404).json({ message: 'TaskType not found' });
        }

        res.status(200).json(taskType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const AddPicTotaskType = async (req, res) => {
    try {
        const imagePath = "http://localhost:3000/images/" + req.file.filename;


        const updatePic = await TaskType.findByIdAndUpdate(req.params.id,{image:imagePath});


        if (!updatePic) {
            return res.status(404).json({ message: 'TaskType not found' });
        }

        res.status(200).json(updatePic);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateTaskType = async (req, res) => {
    try {
        const { id } = req.params; 
        const { name, subtypes } = req.body;

        
        // Find the TaskType by ID
        const taskType = await TaskType.findById(id).populate('subtasks');
        
        if (!taskType) {
            return res.status(404).json({ message: 'TaskType not found' });
        }

        // Update the TaskType name
        taskType.name = name;

        // Clear existing subtasks
        taskType.subtasks = [];

        // Create or update subtasks
        for (const subtypeData of subtypes) {
            let subtask;

            // Check if the subtype has an ID
            if (subtypeData._id) {
                // If it has an ID, find the existing subtask by ID
                subtask = await SubtaskType.findById(subtypeData._id);
                if (!subtask) {
                    return res.status(404).json({ message: `Subtask with ID ${subtypeData._id} not found` });
                }
                // Update existing subtask
                subtask.name = subtypeData.name;
                subtask.content = subtypeData.content;
                subtask.subSubtasks = subtypeData.subSubtypes;
            } else {
                // If it doesn't have an ID, create a new subtask
                subtask = new SubtaskType({
                    name: subtypeData.name,
                    content: subtypeData.content,
                    parentTaskType: taskType._id,
                    subSubtasks: subtypeData.subSubtypes
                });
            }

            // Save the subtask and push its ID to the taskType's subtasks array
            const savedSubtask = await subtask.save();
            taskType.subtasks.push(savedSubtask._id);
        }

        // Save the updated TaskType
        await taskType.save();

        res.status(200).json(taskType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTaskType = async (req, res) => {
    try {
        const { id } = req.params; // Extract the TaskType ID from the request parameters

        // Find the TaskType by ID and populate its subtasks
        const taskType = await TaskType.findById(id).populate('subtasks');
        
        if (!taskType) {
            return res.status(404).json({ message: 'TaskType not found' });
        }

        // Loop through each subtask and remove its associated subSubtasks
        await Promise.all(taskType.subtasks.map(async (subtask) => {
            // Remove subSubtasks associated with the subtask
            await SubSubtask.deleteMany({ _id: { $in: subtask.subSubtasks } });
            // Remove the subtask
            await SubtaskType.findByIdAndDelete(subtask._id); // Change to SubtaskType
        }));

        // Remove the TaskType
        await TaskType.findByIdAndDelete(id);
        res.status(200).json({ message: 'TaskType deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createTaskType, getTaskType, getTaskTypeById, updateTaskType, deleteTaskType,AddPicTotaskType };