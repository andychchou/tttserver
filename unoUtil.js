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
            gamePaused: false,
            deck: [],
            maxPlayers: 0,
            players: [userObj.user],
            playerHands: [[], []],
            host: userObj,
            discardPile: [],
            turn: 0,
            playDirection: true,
            currentNumber: '',
            currentColor: '',
            draw4check: false,
            draw4illegal: false
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
        gamePaused: unoRoom.gamePaused,
        maxPlayers: unoRoom.maxPlayers,
        players: unoRoom.players,
        playerHandsCounts: unoRoom.playerHands.map((playerHand) => playerHand.length),
        host: unoRoom.host,
        discardPile: unoRoom.discardPile,
        turn: unoRoom.turn,
        playDirection: unoRoom.playDirection,
        currentNumber: unoRoom.currentNumber,
        currentColor: unoRoom.currentColor,
        draw4check: unoRoom.draw4check
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

function isPlayable(card, targetRoom) {
    if (card.charAt(0) === targetRoom.currentNumber) return true;
    if (card.charAt(card.length - 1) === targetRoom.currentColor) return true;
    if (card === 'W') return true;
    if (card.charAt(0) === 's') {
        if (card.charAt(4) === targetRoom.currentColor) {
            return true;
        }
    }
    return false;
}

function setGameState(roomId, action, value) {
    const targetRoom = unoRooms.find(room => room.roomCode === roomId);
    action(targetRoom, value);
}

const drawCard = (targetRoom, playerIndex) => {
    const drawnCard = targetRoom.deck.pop();
    targetRoom.playerHands[playerIndex].push(drawnCard);
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

const gamePause = (targetRoom, boolean) => {
    console.log("gamePause set to: " + boolean);
    targetRoom.gamePaused = boolean;
}

const setDraw4check = (targetRoom, boolean) => {
    targetRoom.draw4check = boolean;
}

const startGame = (targetRoom) => {
    targetRoom.gameStarted = true;
    targetRoom.deck = deckInit.map(card => card);
    deckRefresh(targetRoom);

    const gamePlayersCount = targetRoom.players.length;
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < gamePlayersCount; j++) {
            drawCard(targetRoom, j);
        }
    }

    const flipStartingCard = (targetRoom) => {
        const cardToDiscard = targetRoom.deck.pop();
        targetRoom.discardPile.push(cardToDiscard);
        if (targetRoom.discardPile[0] === 'D4W' ||
            targetRoom.discardPile[0] === 'W') {
            deckRefresh(targetRoom);
            flipStartingCard(targetRoom);
        }
    }

    flipStartingCard(targetRoom);

    const startingCard = targetRoom.discardPile[0];
    targetRoom.currentNumber = startingCard.charAt(0);
    targetRoom.currentColor = startingCard.charAt(startingCard.length - 1)
    //TODO: start game cases
}

const setCurrentColor = (targetRoom, color) => {
    targetRoom.currentColor = color;
}

const nextPlayer = (targetRoom) => {
    if (targetRoom.playDirection) {
        if (targetRoom.turn === (targetRoom.maxPlayers - 1)) {
            targetRoom.turn = 0;
        } else {
            targetRoom.turn++;
        }
    } else {
        if (targetRoom.turn === 0) {
            targetRoom.turn = targetRoom.maxPlayers - 1;
        } else {
            targetRoom.turn--;
        }
    }
}

const draw4 = (targetRoom) => {
    drawCard(targetRoom, targetRoom.turn);
    drawCard(targetRoom, targetRoom.turn);
    drawCard(targetRoom, targetRoom.turn);
    drawCard(targetRoom, targetRoom.turn);
    targetRoom.draw4illegal = false;
    setDraw4check(targetRoom, false);
    nextPlayer(targetRoom);
}

const getPreviousPlayerIndex = (targetRoom) => {
    let previousPlayerIndex = -1;
    if (targetRoom.playDirection) {
        if (targetRoom.turn = 0) {
            previousPlayerIndex = targetRoom.maxPlayers - 1;
        } else {
            previousPlayerIndex = targetRoom.turn - 1;
        }
    } else {
        if (targetRoom.turn === (targetRoom.maxPlayers - 1)) {
            previousPlayerIndex = 0;
        } else {
            previousPlayerIndex = targetRoom.turn + 1;
        }
    }

    return previousPlayerIndex;
}

const getPreviousPlayerHand = (roomId) => {
    const targetRoom = unoRooms.find(room => room.roomCode === roomId);
    const previousPlayerIndex = getPreviousPlayerIndex(targetRoom);
    return targetRoom.playerHands[previousPlayerIndex];
}

const checkChallenge = (roomId) => {
    const targetRoom = unoRooms.find(room => room.roomCode === roomId);
    if (targetRoom.draw4illegal === true) {
        return true;
    } else {
        return false;
    }
}

const checkChallengePass = (roomId) => {
    const targetRoom = unoRooms.find(room => room.roomCode === roomId);
    const previousPlayerIndex = getPreviousPlayerIndex(targetRoom);
    drawCard(targetRoom, previousPlayerIndex);
    drawCard(targetRoom, previousPlayerIndex);
    drawCard(targetRoom, previousPlayerIndex);
    drawCard(targetRoom, previousPlayerIndex);
    targetRoom.draw4illegal = false;
    setDraw4check(targetRoom, false);
}

const checkChallengeFail = (roomId) => {
    const targetRoom = unoRooms.find(room => room.roomCode === roomId);
    drawCard(targetRoom, targetRoom.turn);
    drawCard(targetRoom, targetRoom.turn);
    draw4(targetRoom);
    targetRoom.draw4illegal = false;
    setDraw4check(targetRoom, false);
}

const drawClicked = (roomId) => {
    const targetRoom = unoRooms.find(room => room.roomCode === roomId);
    drawCard(targetRoom, targetRoom.turn);
    gamePause(targetRoom, true);
    // const currentPlayerHand = targetRoom.playerHands[targetRoom.turn];
    // const drawnCard = currentPlayerHand[currentPlayerHand.length - 1];
    // if (isPlayable(drawnCard, targetRoom)) {
    //     return true;
    // } else {
    //     return false;
    // }
}

const cardPlayedAction = (roomId, user, cardIndex) => {
    const targetRoom = unoRooms.find(room => room.roomCode === roomId)
    targetRoom.gamePaused = false;
    const playerIndex = targetRoom.players.indexOf(user);
    console.log("playerIndex: " + playerIndex);
    const playerHand = targetRoom.playerHands[playerIndex];
    console.log("playerHand: " + playerHand);

    const cardPlayed = playerHand[cardIndex];
    playerHand.splice(cardIndex, 1);

    targetRoom.discardPile.push(cardPlayed);

    if (cardPlayed.charAt(0) === 'D') {
        if (cardPlayed.charAt(1) === '2') {
            // draw 2
            console.log('draw 2 played');
            targetRoom.currentNumber = 'n';
            targetRoom.currentColor = cardPlayed.charAt(2);
            nextPlayer(targetRoom);
            drawCard(targetRoom, targetRoom.turn);
            drawCard(targetRoom, targetRoom.turn);
            nextPlayer(targetRoom);
        } else {
            // draw 4 wild
            console.log('draw 4 played');
            const playableCards = playerHand.filter(card => isPlayable(card, targetRoom));

            if (playableCards.length > 0) {
                targetRoom.draw4illegal = true;
            }

            nextPlayer(targetRoom);
            setDraw4check(targetRoom, true);
            return true;
        }
    } else if (cardPlayed.charAt(0) === 'W') {
        console.log('wild played');
        targetRoom.currentNumber = 'n';
        nextPlayer(targetRoom);
        return true;
    } else if (cardPlayed.charAt(0) === 's') {
        console.log('skip played');
        targetRoom.currentNumber = 's';
        targetRoom.currentColor = cardPlayed.charAt(4);
        nextPlayer(targetRoom);
        nextPlayer(targetRoom);
        return false;
    } else if (cardPlayed.charAt(0) === '_') {
        console.log('reverse played');
        targetRoom.currentNumber = '_';
        targetRoom.currentColor = cardPlayed.charAt(1);
        targetRoom.playDirection = !(targetRoom.playDirection);
        nextPlayer(targetRoom);
        return false;
    } else {
        console.log('normal card played');
        targetRoom.currentNumber = cardPlayed.charAt(0);
        targetRoom.currentColor = cardPlayed.charAt(1);
        nextPlayer(targetRoom);

        return false;
    }

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
    deckRefresh,
    gamePause,
    setCurrentColor,
    nextPlayer,
    draw4,
    getPreviousPlayerHand,
    checkChallenge,
    checkChallengePass,
    checkChallengeFail,
    drawClicked,
    cardPlayedAction,
}