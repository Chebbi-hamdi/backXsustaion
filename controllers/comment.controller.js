const Comment = require('../models/comment');
const mongoose = require("mongoose");





const createComment = async (req, res) => {
    try {
      const { image, comment, position } = req.body; // Adjust to match the expected fields
      // Create the comment
  
    const newComment = new Comment({
        image,
        comments: [{
            comment,
            position
        }]
    });
  
      // Save the comment to the database
      const savedComment = await newComment.save();
  
      res.status(201).json(savedComment);
    } catch (error) {
      console.error("Error creating Comment", error); // Log error details
      res.status(500).json({ error: "Error creating Comment" });
    }
  }
  
const getComments = async (req, res) => {
    try {
        const comments = await Comment.find();
        res.status(200).json(comments);
    } catch (error) {
        console.log("Error getting Comments", error);
        res.status(500).json({ error: "Error getting Comments" });
    }
}

const getComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        res.status(200).json(comment);
    } catch (error) {
        console.log("Error getting Comment", error);
        res.status(500).json({ error: "Error getting Comment" });
    }
}

const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { comment, position } = req.body;
        
        // Find the comment by ID and update it
        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            {
                $push: {
                    comments: { comment, position }
                }
            },
            { new: true }
        );
        
        // Check if the comment was updated successfully
        if (!updatedComment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        
        // If the comment was updated successfully, send the updated comment as a response
        res.status(200).json(updatedComment);
        
    } catch (error) {
        console.log("Error updating Comment", error);
        res.status(500).json({ error: "Error updating Comment" });
    }
};


const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        await Comment.findByIdAndDelete(commentId);
        res.status(204).json("Comment deleted successfully");
    }
    catch (error) {
        console.log("Error deleting Comment", error);
        res.status(500).json({ error: "Error deleting Comment" });
    }
}

module.exports = {
    createComment,
    getComments,
    getComment,
    updateComment,
    deleteComment,
  
};