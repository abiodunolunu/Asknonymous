const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    fullname: {
       type: String,
       required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    messages: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Message'
        }
    ],
    resetToken: String,
    resetTokenExpiration: Date      
});



module.exports = mongoose.model('User', userSchema)