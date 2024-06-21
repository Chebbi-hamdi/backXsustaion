const Message = require("../models/message");
const Discussion = require("../models/discussion");

const {sendMessage}=require('../utils/socket/socketMessage');
let initIoVar = {}
const initIo = (io)=>{
  initIoVar=io
}



const createMessage = async (req, res) => {
  try {
    const {  content } = req.body;

    const {discussion,sender,recieverId}=req.params
    // Create the message
    const message = new Message({
      sender,
      content,
      discussion,
    });
    // sender username 
    //{ tethat fel content username sen u a msg type message }
    // tzid new notification 
    // Save the message to the database
    const newMessage = await message.save();

    
  
    // Update the discussion document to include the new message
    await Discussion.findByIdAndUpdate(discussion, {
      $push: { messages: newMessage._id },
      $set: { lastMessage: newMessage._id }
    });
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "Error creating message" });
  }
};


const getMessages = async (req, res) => {
  try {
    const { discussionId } = req.params;

    const messages = await Message.find({ discussion: discussionId }).populate('sender');

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Error getting Messages" });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting Message" });
  }
};

const updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { content },
      { new: true }
    );

    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ error: "Error updating Message" });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    // Find the message and update the 'seen' field
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { seen: true },
      { new: true }
    );
    

    res.json(updatedMessage);
  } catch (error) {
    console.error("Error marking message as seen:", error);
    res.status(500).json({ error: "Error marking message as seen" });
  }
};
module.exports = {
  createMessage,
  getMessages,
  deleteMessage,
  updateMessage,
  markAsRead,
  initIo
};
