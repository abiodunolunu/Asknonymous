const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    text: {
        content: {
            type: String,
            required: true
        },
        owner: {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema)