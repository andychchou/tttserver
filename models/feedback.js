const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phoneNum: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    agree: {
        type: Boolean
    },
    contactType: {
        type: String
    },
    feedback: {
        type: String
    }
}, {
    timestamps: true
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;