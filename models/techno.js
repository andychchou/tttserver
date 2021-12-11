const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const technoSchema = new Schema({
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
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Techno = mongoose.model('Techno', technoSchema);

module.exports = Techno;