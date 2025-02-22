const Model = require("../models/model")
const onlineUsers = new Set();

let socketevents = (socket, io) => {
    const userId = socket.user.numericid;
    if (!userId) {
        console.log("User ID missing in socket auth.");
        return;
    }

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

    socket.on("roomjoin", async ({ roomid, betamount }) => {
        let user = socket.user;
        console.log(roomid)
        if (!user) {
            return socket.emit("error", { message: "User data missing!" });
        }

        socket.join(roomid);
        console.log(io.sockets.adapter.rooms.get(roomid) )
        let room = io.sockets.adapter.rooms.get(roomid);
let players = [];

if (room) {
    for (let socketId of room) {
        let playerSocket = io.sockets.sockets.get(socketId);
        if (playerSocket && playerSocket.user) {
            console.log(playerSocket.user)
            players.push({
                userId: playerSocket.user.id,  // Change according to your user object
                nickname: playerSocket.user.nickname,
                username: playerSocket.user.username,
                balance: playerSocket.user.balance,
                avatar: playerSocket.user.avatar,
                numericid: playerSocket.user.numericid,
                mobileno: playerSocket.user.mobileno,
                socketId: socketId,
                betamount : betamount
            });
        } else {
            console.log(`No user found for socketId: ${socketId}`);
        }
    }
}

        socket.emit("roomjoin", { player: user, roomid });
        socket.emit("allPlayers", { players, roomid });

        try {
            let foundUser = await Model.User.findById(user.id);
            if (!foundUser) return socket.emit("error", { message: "User not found!" });

            if (foundUser.balance >= betamount) {
                foundUser.balance -= betamount;
                await foundUser.save();

                const transaction = new Model.Transaction({
                    userId: user.id,
                    amount: betamount,
                    type: 'game',
                    txntype: 'debit',
                    roomid: roomid,
                    status: 'success',
                    note : "game amount deduct",
                    currentbalance : foundUser.balance
                });
                const lastTransaction = await Model.Transaction.findOne().sort('-transactionId');
                transaction.transactionId = lastTransaction ? lastTransaction.transactionId + 1 : 1;
                await transaction.save();

                // console.log(`Transaction created for user ${user.id} with amount ${betamount}`);
            } else {
                socket.emit("error", { message: "Insufficient balance!" });
            }
        } catch (err) {
            console.error("Error processing transaction:", err);
        }
    });

    socket.on("gamestart", async (data) => {
        let { roomid, noofplayer, players, betamount, timeduration ,tournamentId } = data;

        try {
            let existingRoom = await Model.Room.findOne({ roomId: roomid });
            if (existingRoom) return socket.emit("error", { message: "Room already exists!" });

            const newRoom = new Model.Room({
                roomId: roomid,
                gameType: "ludo",
                participants: players.map((p) => p.userId),
                players,
                totalBetAmount: betamount * players.length,
                status: "active",
                timeduration,
                tournamentId ,
                entryFee : betamount,
                commission :0
            });

            await newRoom.save();
            console.log(`Room ${roomid} created successfully!`);

            io.to(roomid).emit("gamestart", {
                message: "Game has started!",
                status: "start",
                noofplayer,
                players,
                betamount,
                timeduration,
            });

            saveGameHistory(roomid);
        } catch (err) {
            console.error("Error creating room:", err);
            socket.emit("error", { message: "Room creation failed!" });
        }
    });

    socket.on("gameend", async (data) => {
        let { roomid, players } = data;

        try {
            let room = await Model.Room.findOne({ roomId: roomid });
            if (!room) return socket.emit("error", { message: "Room not found!" });

            let winner = players.find((p) => p.rank === 1);
            room.winner = winner?.userId || null;
            room.winnername = winner?.username || null;
            room.players = players;
            room.status = "completed";

            await room.save();
            console.log(`Game ended in room ${roomid}`);

            io.to(roomid).emit("gameend", { message: "Game has ended!", status: "end", players });

            await processTransactions(roomid, players);
        } catch (err) {
            console.error("Error in game end:", err);
            socket.emit("error", { message: "Game end processing failed!" });
        }
    });
};

function saveGameHistory(roomid) {
    console.log(`Saving history for room ${roomid}`);
}

async function processTransactions(roomid, players) {
    try {
        let room = await Model.Room.findOne({ roomId: roomid });
        if (!room) {
            console.error(`Room ${roomid} not found for transactions!`);
            return;
        }

        let totalBetAmount = room.totalBetAmount;
        let winner = players.find((p) => p.rank === 1);
        if (!winner) return console.error("No winner found!");

        let winnerUser = await Model.User.findById(winner.userId);
        if (!winnerUser) return console.error("Winner user not found!");

        let prizeAmount = totalBetAmount;
        winnerUser.balance += prizeAmount;
        await winnerUser.save();

        const transaction = new Model.Transaction({
            userId: winnerUser._id,
            amount: prizeAmount,
            type: 'game',
            txntype: 'credit',
            roomid: roomid,
            status: 'success',
            note: "game winning amount",
            currentbalance: winnerUser.balance
        });

        const lastTransaction = await Model.Transaction.findOne().sort('-transactionId');
        transaction.transactionId = lastTransaction ? lastTransaction.transactionId + 1 : 1;
        await transaction.save();
        console.log(`Transaction saved: ${winnerUser.username} won ${prizeAmount}`);



    } catch (err) {
        console.error("Error processing transactions:", err);
    }
}

module.exports = { socketevents };
