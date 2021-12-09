const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const postSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    text: {
        type: Array
    },
    author: {
        type: String
    },
    date: {
        type: String
    },
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;