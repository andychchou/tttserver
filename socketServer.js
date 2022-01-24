const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./socketUsersUtil');

module.exports = (io, socket) => {
    console.log('socketServer connected');

    socket.on('joinRoom', ({ user, room }) => {
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
    });

    socket.on('send-message', ({text, sender}) => {
        const userObj = getCurrentUser(socket.id);
        socket.broadcast.to(userObj.room).emit('receive-message', {text, sender});
        // global broadcast
        // io.emit('message', text);
        console.log(getRoomUsers(userObj.room));
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