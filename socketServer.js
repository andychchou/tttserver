const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./socketUsersUtil');
const { roomJoinUno } = require('./unoUtil')

module.exports = (io, socket) => {
    console.log('socketServer connected');

    socket.on('tryJoinRoom', ({ user, room }) => {
        const userList = getRoomUsers(room).map(userObj => userObj.user);
        if (userList.includes(user)) {
            socket.emit('userExists', userList);
        } else {
            socket.emit('joinRoomOK', {user});
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

            // work on code here

            // emit 'joinUno' here
        }
    });

    socket.on('send-message', ({text, sender}) => {
        const userObj = getCurrentUser(socket.id);
        socket.broadcast.to(userObj.room).emit('receive-message', {text, sender});
        // global broadcast
        // io.emit('message', text);
    });

    // Runs when client disconnects
    socket.on('disconnect', () => {
        const userObj = userLeave(socket.id);
        if (userObj) {
            io.to(userObj.room).emit('message', `${userObj.user} has left the room`);
        
            // Send users and room info
            io.to(userObj.room).emit('roomUsers', {
                room: userObj.room,
                users: getRoomUsers(userObj.room)
            });
        }
    });
};