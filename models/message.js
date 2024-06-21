const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: { type: String },
    seen: { type: Boolean, default: false },
    discussion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discussion',
        required: true
    },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);

