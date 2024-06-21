const  {SubtaskType} = require('../models/type'); // Import your Subtask model

// Create a new Subtask
const createSubtask = async (req, res) => {
  try {
    const subtaskData = req.body;
    console.log('-----------',subtaskData)
    const subtask = new SubtaskType(subtaskData);
    const savedSubtask = await subtask.save();
    res.status(201).json(savedSubtask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all Subtasks
const getAllSubtasks = async (req, res) => {
  try {
    const subtasks = await SubtaskType.find().populate("SubSubtask");
    res.json(subtasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Subtask by ID
const getSubtaskById = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const subtask = await SubtaskType.findById(subtaskId).populate("SubSubtask");
    if (subtask) {
      res.json(subtask);
    } else {
      res.status(404).json({ message: 'Subtask not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Subtask by ID
const updateSubtask = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const imagePath = "http://localhost:3000/images/" + req.file.filename;

    const subtaskData = req.body;
    const updatedSubtask = await SubtaskType.findByIdAndUpdate(subtaskId, { image:imagePath }, { new: true });
    if (updatedSubtask) {
      res.json(updatedSubtask);
    } else {
      res.status(404).json({ message: 'Subtask not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Subtask by ID
const deleteSubtaskById = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const deletedSubtask = await SubtaskType.findByIdAndDelete(subtaskId);
    if (deletedSubtask) {
      res.json({ message: 'Subtask deleted successfully' });
    } else {
      res.status(404).json({ message: 'Subtask not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSubtask,
  getAllSubtasks,
  getSubtaskById,
  updateSubtask,
  deleteSubtaskById
};