const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    image: { type: String, required: true },
    comments: [{
        comment: { type: String },
        position: {
           
        },
        timestamp: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('Comment', commentSchema);