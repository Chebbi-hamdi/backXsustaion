const {SubSubtask} = require('../models/type'); // Import your SubSubtask model

// Create a new SubSubtask
const createSubSubtask = async (req, res) => {
  try {

    const subSubtaskData = req.body;
    const subSubtask = new SubSubtask(subSubtaskData);
    const savedSubSubtask = await subSubtask.save();
    res.status(201).json(savedSubSubtask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all SubSubtasks
const getAllSubSubtasks = async (req, res) => {
  try {
    const subSubtasks = await SubSubtask.find();
    res.json(subSubtasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get SubSubtask by ID
const getSubSubtaskById = async (req, res) => {
  try {
    const { subSubtaskId } = req.params;
    const subSubtask = await SubSubtask.findById(subSubtaskId);
    if (subSubtask) {
      res.json(subSubtask);
    } else {
      res.status(404).json({ message: 'SubSubtask not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete SubSubtask by ID
const deleteSubSubtaskById = async (req, res) => {
  try {
    const { subSubtaskId } = req.params;
    const deletedSubSubtask = await SubSubtask.findByIdAndDelete(subSubtaskId);
    if (deletedSubSubtask) {
      res.json({ message: 'SubSubtask deleted successfully' });
    } else {
      res.status(404).json({ message: 'SubSubtask not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const updateImg = async (req, res) => {
    try {
        const imagePath = "http://localhost:3000/images/" + req.file.filename;

      const { subSubtaskId } = req.params;
      const updatedSubSubtask = await SubSubtask.findByIdAndUpdate(
        subSubtaskId,
        { image:imagePath },
        { new: true }
      );
      if (updatedSubSubtask) {
        res.json(updatedSubSubtask);
      } else {
        await updatedSubSubtask.save();

        res.status(404).json({ message: 'SubSubtask not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
module.exports = {
  createSubSubtask,
  getAllSubSubtasks,
  getSubSubtaskById,
  deleteSubSubtaskById,
  updateImg
};