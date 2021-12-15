const io = require('socket.io');

module.exports = (io, socket) => {
    console.log('socketServer connected');

    // socket.emit will emit to the single client connecting
    socket.emit('message', 'Emitting message from server...');

    // Broadcast to everyone (except connecting user) when a user connects, use io.emit() to include everyone in general
    socket.broadcast.emit('message', 'A user has joined.');

    // Runs when client disconnects
    socket.on('disconnect', () => {
        io.emit('message', 'A user has left the chat');
    })
};