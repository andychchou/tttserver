const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    date: {
        type: String
    },
    text: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);