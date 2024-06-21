const mongoose = require('mongoose');
const User = require('./user'); // Assuming UserModel.js contains the User model definition

const AgentSchema = new mongoose.Schema({
    // Fields to extend from the User model
    name: {
        type: String,
        default: '' // Provide your default value here if needed
    },
    familyName: {
        type: String,
        default: '' // Provide your default value here if needed
    },
    email: {
        primary: {
            type: String,
            default: '' // Provide your default value here if needed
        }
    },
    password: {
        type: String,
        default: '' // Provide your default value here if needed
    },
    discussions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discussions'
    }],
    agent: {
        type: Boolean,
        default: true // Set the default value to true as requested
    }
});

// Merge AgentSchema with User schema
const Agent = User.discriminator('Agent', AgentSchema);

module.exports = Agent;
