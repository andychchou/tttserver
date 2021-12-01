const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const gameSchema = new Schema({
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
    instruction: {
        type: String
    },
    link: {
        type: String
    },
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;