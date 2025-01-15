const onlineUsers = new Set();

let socketevents = (socket, io) => {
    const userId = socket.user.id;

    onlineUsers.add(userId);
    console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
    io.emit('online', { onlineUsers: Array.from(onlineUsers) });

    socket.on('message', () => {
        io.emit('online', { onlineUsers: Array.from(onlineUsers) });
    });

    socket.on('disconnect', () => {
        onlineUsers.delete(userId);
        console.log(`User disconnected: ${userId}`);
        io.emit('online', { onlineUsers: Array.from(onlineUsers) });
    });
};

module.exports = {socketevents}
