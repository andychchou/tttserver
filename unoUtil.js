const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./socketUsersUtil');

// array of objects that contain roomCode, deck array, maxPlayers, player objects, discard pile, turn, play direction.
const unoRooms = [];

const deckInit = [
    '0R', '1R', '1R', '2R', '2R', '3R', '3R', '4R', '4R', '5R', '5R', '6R', '6R', '7R', '7R', '8R', '8R', '9R', '9R', 'skipR', 'skipR', '_R', '_R', 'D2R', 'D2R',
    '0G', '1G', '1G', '2G', '2G', '3G', '3G', '4G', '4G', '5G', '5G', '6G', '6G', '7G', '7G', '8G', '8G', '9G', '9G', 'skipG', 'skipG', '_G', '_G', 'D2G', 'D2G',
    '0B', '1B', '1B', '2B', '2B', '3B', '3B', '4B', '4B', '5B', '5B', '6B', '6B', '7B', '7B', '8B', '8B', '9B', '9B', 'skipB', 'skipB', '_B', '_B', 'D2B', 'D2B',
    '0Y', '1Y', '1Y', '2Y', '2Y', '3Y', '3Y', '4Y', '4Y', '5Y', '5Y', '6Y', '6Y', '7Y', '7Y', '8Y', '8Y', '9Y', '9Y', 'skipY', 'skipY', '_Y', '_Y', 'D2Y', 'D2Y',
    'W', 'W', 'W', 'W', 'D4W', 'D4W', 'D4W', 'D4W'
];

function roomJoinUno(userObj) {
    // Uno room game creation.
    if (!unoRooms.filter(room => room.roomCode === userObj.room)[0]) {
        // code WIP
        const roomToAdd = {
            roomCode: userObj.room,
            deck: deckInit,
            maxPlayers: 0,
            players: [userObj],
            host: userObj,
            discardPile: [],
            turn: 0,
            playDirection: 0
        }
        unoRooms.push(roomToAdd);
    } else {
        // join existing room
        const roomToJoin = unoRooms.filter(room => room.roomCode === userObj.room)[0];
        roomToJoin.players = [...roomToJoin.players, userObj];
    }
}

function roomLeaveUno(userObj) {
    const roomToLeave = unoRooms.filter(room => room.roomCode === userObj.room)[0];
    const usersNow = getRoomUsers(userObj.room);
    roomToLeave.players = [...usersNow];
    // check if empty room
    if (roomToLeave.players.length === 0) {
        const roomToLeaveIndex = unoRooms.indexOf(roomToLeave);
        unoRooms.splice(roomToLeaveIndex, 1);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        [array[i], array[j]] = [array[j], array[i]]
    }
    return array;
}

module.exports = {
    roomJoinUno,
    shuffleArray,
    roomLeaveUno
}