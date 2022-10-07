const { set } = require('mongoose');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./socketUsersUtil');

// array of objects that contain roomCode, gameStarted, deck array, maxPlayers, player objects, player hands, discard pile, turn, play direction.
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
        const roomToAdd = {
            roomCode: userObj.room,
            gameStarted: false,
            deck: [],
            maxPlayers: 0,
            players: [userObj.user],
            playerHands: [[], []],
            host: userObj,
            discardPile: [],
            turn: 0,
            playDirection: true,
            currentNumber: '',
            currentColor: ''
        }
        unoRooms.push(roomToAdd);
    } else {
        // automatically join game if room exists
        // const roomToJoin = unoRooms.filter(room => room.roomCode === userObj.room)[0];
        // roomToJoin.players = [...roomToJoin.players, userObj];
    }
}

function roomLeaveUno(userObj) {
    console.log("user: " + userObj.user)
    const roomToLeave = unoRooms.filter(room => room.roomCode === userObj.room)[0];
    // if room still exists
    if (roomToLeave) {
        const playerIndex = roomToLeave.players.indexOf(userObj.user);
        console.log("playerIndex" + playerIndex)
        if (playerIndex !== -1) {
            roomToLeave.players.splice(playerIndex, 1);
        }
        console.log("result players: " + roomToLeave.players);
    }
}

function checkEmptyRoom(room) {
    const roomUsersCount = getRoomUsers(room).length
    if (roomUsersCount === 0) {
        const roomToLeaveIndex = unoRooms.indexOf(room);
        if (roomToLeaveIndex !== -1) {
            unoRooms.splice(roomToLeaveIndex, 1);
        }
    }
}

function getGameState(roomId) {
    const roomIndex = unoRooms.findIndex(room => room.roomCode === roomId);
    const unoRoom = unoRooms.slice(roomIndex, roomIndex + 1)[0];
    // snapshot of room that excludes hidden info
    const gameUpdateObj = {
        gameStarted: unoRoom.gameStarted,
        maxPlayers: unoRoom.maxPlayers,
        players: unoRoom.players,
        playerHandsCounts: unoRoom.playerHands.map((playerHand) => playerHand.length),
        host: unoRoom.host,
        discardPile: unoRoom.discardPile,
        turn: unoRoom.turn,
        playDirection: unoRoom.playDirection,
        currentNumber: unoRoom.currentNumber,
        currentColor: unoRoom.currentColor
    }
    return gameUpdateObj;
}

function getPlayerHand(roomId, player) {
    const roomIndex = unoRooms.findIndex(room => room.roomCode === roomId);
    const unoRoom = unoRooms.slice(roomIndex, roomIndex + 1)[0];
    const playerIndex = unoRoom.players.indexOf(player)
    const hand = unoRoom.playerHands[playerIndex]
    return hand;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
        // [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function setGameState(roomId, action, value) {
    const targetRoom = unoRooms.find(room => room.roomCode === roomId);
    action(targetRoom, value);
}

const drawCard = (targetRoom, value) => {
    const userIndex = targetRoom.players.indexOf(value);
    const drawnCard = targetRoom.deck.pop();
    targetRoom.playerHands[userIndex].push(drawnCard);
}

const setMaxPlayers = (targetRoom, value) => {
    targetRoom.maxPlayers = value;
}

const addPlayer = (targetRoom, value) => {
    if (targetRoom.players.includes(null)) {
        const nullIndex = targetRoom.players.indexOf(null);
        targetRoom.players.splice(nullIndex, 1, value)
    }
    targetRoom.players = [...targetRoom.players, value];
}

const deckRefresh = (targetRoom) => {
    targetRoom.deck = shuffleArray([...targetRoom.deck, ...targetRoom.discardPile]);
    targetRoom.discardPile = [];
}

const startGame = (targetRoom) => {
    targetRoom.gameStarted = true;
    targetRoom.deck = deckInit.map(card => card);
    deckRefresh(targetRoom);

    const gamePlayersCount = targetRoom.players.length;
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < gamePlayersCount; j++) {
            drawCard(targetRoom, targetRoom.players[j])
        }
    }

    const flipStartingCard = (targetRoom) => {
        const cardToDiscard = targetRoom.deck.pop();
        targetRoom.discardPile.push(cardToDiscard);
        if (targetRoom.discardPile[0] === 'D4W') {
            deckRefresh(targetRoom);
            flipStartingCard(targetRoom);
        }
    }

    flipStartingCard(targetRoom);

    const startingCard = targetRoom.discardPile[0];
    targetRoom.currentNumber = startingCard.charAt(0);
    targetRoom.currentColor = startingCard.charAt(startingCard.length - 1)
}

module.exports = {
    roomJoinUno,
    shuffleArray,
    roomLeaveUno,
    checkEmptyRoom,
    getGameState,
    setGameState,
    getPlayerHand,
    startGame,
    drawCard,
    setMaxPlayers,
    addPlayer,
    deckRefresh
}