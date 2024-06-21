const Discussion = require("../models/discussion");
const mongoose = require("mongoose");
const User = require("../models/user");

const getExistingDiscussion = async (req, res) => {
  try {
    const { participants } = req.params;

    // Split participant IDs by comma
    const participantIds = participants.split(",");

    
    // Find discussions where all provided participants are included
    const existingDiscussions = await Discussion.find({
      participants: { $all: participantIds },
    })
      .populate({
        path: "participants",
        match: { _id: { $ne: participantIds } }, // Exclude the current user's ID
      })
      .populate("lastMessage")
      .select("-messages"); // Exclude the 'messages' field

    if (existingDiscussions.length > 0) {
      return res.status(200).json(existingDiscussions);
    } else {
      return res.status(404).json({ error: "No existing discussions found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error getting existing Discussions" });
  }
};
const getConversation = async (req, res) => {
  try {
    const { id } = req.params;

    // Extract values from the participants object

    // Find discussions where all provided participants are included
    const existingDiscussion = await Discussion.findOne({
      _id: id,
    })
      .populate({
        path: "messages", // Populate messages
        options: { sort: { timestamp: -1 }, limit: 15 }, // Sort messages by timestamp in descending order and limit to 30
        populate: {
          path: "sender", // Populate sender inside messages
          select: "_id", // Select only the _id field of sender
        },
      })
      .populate("lastMessage"); // Populate the 'lastMessage' field

    if (existingDiscussion) {
      return res.status(200).json(existingDiscussion);
    } else {
      return res.status(404).json({ error: "No existing discussion found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error getting existing discussion" });
  }
};
const getConversationLoad = async (req, res) => {
  try {
    const { id, pageNumber } = req.params; // Récupérer à la fois id et pageNumber des paramètres de la requête

    const pageNumberInt = parseInt(pageNumber); // Convertir la valeur de pageNumber en entier

    // Calculez l'offset en fonction du numéro de la page
    const offset = (pageNumberInt - 1) * 15;

    // Find discussions where all provided participants are included
    const existingDiscussion = await Discussion.findOne({
      _id: id,
    })
      .populate({
        path: "messages", // Populate messages
        options: { sort: { timestamp: -1 }, skip: offset, limit: 15 }, // Sort messages by timestamp in descending order, skip the offset, and limit to 30
        populate: {
          path: "sender", // Populate sender inside messages
          select: "_id", // Select only the _id field of sender
        },
      })
      .populate("lastMessage"); // Populate the 'lastMessage' field

    if (existingDiscussion) {
      return res.status(200).json(existingDiscussion);
    } else {
      return res.status(404).json({ error: "No existing discussion found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error getting existing discussion" });
  }
};

const getConversationById = async (req, res) => {
  try {
    const { Id1 } = req.params;

    // Extract values from the participants object
    
        
    // Find discussions where all provided participants are included
    const Conversation = await Discussion.findById(Id1)
      .populate({
        path: "messages", // Populate messages
        options: { sort: { timestamp: -1 }, limit: 30 }, // Sort messages by timestamp in descending order and limit to 30
        populate: {
          path: "sender", // Populate sender inside messages
          select: "_id", // Select only the _id field of sender
        },
      })
      .populate("lastMessage"); // Populate the 'lastMessage' field

    if (Conversation) {
      return res.status(200).json(Conversation);
    } else {
      return res.status(404).json({ error: "No existing discussion found" });
    }
  } catch (error) {
    console.log("Error getting existing discussion", error);
    res.status(500).json({ error: "Error getting existing discussion" });
  }
};

const createDiscussion = async (req, res) => {
  try {
    const { IdSender } = req.params;
    const { participant } = req.body;

    // Find the user by email
    const user = await User.findOne({ "email.primary": participant });
    const userIdSender = await User.findById(IdSender);

    if (!user || !userIdSender) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if a discussion already exists between the participants
    const existingDiscussion = await Discussion.findOne({
      participants: { $all: [IdSender, user._id] },
    });

    if (existingDiscussion) {
      return res.status(201).json({ Id: existingDiscussion._id });
    }

    // Create the discussion
    const discussion = new Discussion({
      participants: [IdSender, user._id], // Assuming IdSender is the ID of the sender
    });


    // Save the discussion to the database
    const newDiscussion = await discussion.save();

    // Update user and userIdSender with the new discussion
    user.discussions.push(newDiscussion._id);
    userIdSender.discussions.push(newDiscussion._id);

    await user.save();
    await userIdSender.save();

    res.status(201).json(newDiscussion);
  } catch (error) {
    console.error("Error creating Discussion", error);
    res.status(500).json({ error: "Error creating Discussion" });
  }
};
const getAllDiscussions = async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 10;

    const skip = (page - 1) * limit;

    const discussions = await Discussion.find()
      .populate("participants")
      .populate("messages")
      .sort({ updatedAt: -1 })
      .select("-messages")
      .skip(skip)
      .limit(limit);
    const total = await Discussion.countDocuments();

    res.status(200).json({ discussions, total });
  } catch (error) {
    console.log("Error getting Discussions", error);
    res.status(500).json({ error: "Error getting Discussions" });
  }
};

const getDiscussionsAdmin = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const discussions = await Discussion.findById(discussionId)
      .populate("participants")
      .populate("messages")

    res.status(200).json(discussions);
  } catch (error) {
    console.log("Error getting Discussions", error);
    res.status(500).json({ error: "Error getting Discussions" });
  }     

};
     

const getDiscussions = async (req, res) => {
  try {
    const { discussionId } = req.params;

    const discussions = await Discussion.findById(discussionId).populate(
      "messages"
    );

    console.log("discussions", discussions);

    res.status(200).json(discussions);
  } catch (error) {
    console.log("Error getting Discussions", error);
    res.status(500).json({ error: "Error getting Discussions" });
  }
};

const deleteDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;

    await Discussion.findByIdAndDelete(discussionId);

    res.status(200).json({ message: "Discussion deleted" });
  } catch (error) {
    console.log("Error deleting Discussion", error);
    res.status(500).json({ error: "Error deleting Discussion" });
  }
};

const updateDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { participants } = req.body; // Corrected from participant to participants

    // Find the discussion
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res
        .status(404)
        .json({ error: "No discussion found with the provided ID" });
    }

    // Push the new participant to the existing participants array
    discussion.participants.push(participants); // Corrected from participant to participants

    // Save the updated discussion
    const updatedDiscussion = await discussion.save();

    res.status(200).json(updatedDiscussion);
  } catch (error) {
    console.error("Error updating Discussion", error);
    res.status(500).json({ error: "Error updating Discussion" });
  }
};

module.exports = {
  createDiscussion,
  getDiscussions,
  updateDiscussion,
  deleteDiscussion,
  getExistingDiscussion,
  getConversation,
  getConversationById,
  getConversationLoad,
  getAllDiscussions,
  getDiscussionsAdmin
};
