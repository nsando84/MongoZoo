const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    friends: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    image: {
        type: String,
        required: true
    },
    requestedfriend: [{
        id: {
            type: Schema.Types.ObjectId,
            required: true
        },
        username: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        }
    }]

});

module.exports = mongoose.model('User', userSchema);