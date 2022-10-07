const { set } = require('mongoose');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./socketUsersUtil');
const { roomJoinUno, roomLeaveUno, checkEmptyRoom, getGameState, setGameState, getPlayerHand, startGame, drawCard, setMaxPlayers, addPlayer, deckRefresh } = require('./unoUtil')

module.exports = (io, socket) => {
    console.log('socketServer connected');

    socket.on('tryJoinRoom', ({ user, room }) => {
        const userList = getRoomUsers(room).map(userObj => userObj.user);
        if (userList.includes(user)) {
            socket.emit('userExists', userList);
        } else {
            socket.emit('joinRoomOK', { user });
        }
    })

    socket.on('joinRoom', ({ user, room, game }) => {
        const userObj = userJoin(socket.id, user, room);
        socket.join(userObj.room);

        // socket.emit will emit to the single client connecting
        socket.emit('message', 'You have joined the room.');

        // Broadcast to everyone (except connecting user) when a user connects, use io.emit() to include everyone in general
        socket.broadcast.to(userObj.room).emit('message', `${userObj.user} has joined the room.`);

        // Send users and room info
        io.to(userObj.room).emit('roomUsers', {
            room: userObj.room,
            users: getRoomUsers(userObj.room)
        });

        // Join Uno game
        if (game === 'uno') {
            roomJoinUno(userObj);
            const roomHostUser = getGameState(userObj.room).host.user;
            io.to(userObj.room).emit('updateHost', { roomHostUser });
            // work on code here

            // emit 'joinUno' here
        }
    });

    socket.on('send-message', ({ text, sender }) => {
        const userObj = getCurrentUser(socket.id);
        socket.broadcast.to(userObj.room).emit('receive-message', { text, sender });
        // global broadcast
        // io.emit('message', text);
    });

    // Runs when client disconnects
    socket.on('disconnect', () => {
        const userObj = getCurrentUser(socket.id);
        if (userObj) {
            // Leaving room function
            roomLeaveUno(userObj);
            const gameState = getGameState(userObj.room);
            io.to(userObj.room).emit('updateGameState', { gameState });
        }

        const userLeaveObj = userLeave(socket.id);
        if (userLeaveObj) {
            io.to(userLeaveObj.room).emit('message', `${userLeaveObj.user} has left the room`);

            // Send users and room info
            io.to(userLeaveObj.room).emit('roomUsers', {
                room: userLeaveObj.room,
                users: getRoomUsers(userLeaveObj.room)
            });

            checkEmptyRoom(userLeaveObj.room);
        }
    });

    socket.on('gameSetup', ({ room, maxPlayers }) => {
        setGameState(room, setMaxPlayers, maxPlayers)
    })

    socket.on('joinGame', ({ user, room }) => {
        const userObj = getCurrentUser(socket.id)
        setGameState(room, addPlayer, user)
        const gameState = getGameState(room);
        console.log(user + " joined room, emitting gameState to room")
        console.log(gameState)
        io.to(userObj.room).emit('updateGameState', { gameState });
    })

    socket.on('requestGameState', ({ room }) => {
        console.log("emitting gameState to room")
        const userObj = getCurrentUser(socket.id)
        const gameState = getGameState(room);
        // send gameState emit
        io.to(userObj.room).emit('updateGameState', { gameState });
    });

    socket.on('startGame', ({ room }) => {
        console.log("game started");
        const userObj = getCurrentUser(socket.id)
        const gamePlayersCount = getGameState(room).players.length;
        if (gamePlayersCount > 1) {
            setGameState(room, startGame);
            const gameState = getGameState(room);
            console.log("game started.")
            console.log(gameState)
            io.to(userObj.room).emit('updateGameState', { gameState });
        } else {
            // emit: need players to join message here
        }
    })

    socket.on('requestHandState', () => {
        const userObj = getCurrentUser(socket.id)
        const gameState = getGameState(userObj.room)
        if (gameState.players.includes(userObj.user) && gameState.gameStarted === true) {
            const hand = getPlayerHand(userObj.room, userObj.user)
            socket.emit('updateHandState', { hand })
        }
    })
};