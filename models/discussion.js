const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DiscussionSchema = new Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }
});

module.exports = mongoose.model('Discussion', DiscussionSchema);
