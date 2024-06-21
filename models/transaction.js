const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    amount: {
        type: Number,
        required: true,
    },
    order: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['flouci', 'debit'],
    },
    status: {
        type: String,
        required: true,
        enum: ['SUCCESS', 'FAILED', 'PENDING', 'CANCELLED   '],
    },
    name: {
        type: String,
    },
    email: {
        type: String,

    },
    phone: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Transaction', transactionSchema);

