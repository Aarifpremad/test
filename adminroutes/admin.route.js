let express = require("express")
let router = express.Router();
let Model = require("../models/model");
const moment = require('moment'); 
let admincontroller = require("../controller/admin.controller")
router.route("/admin/login").post((req,res)=>{
    console.log("admin login",req.body)
    admincontroller.adminlogin(req,res)
})


const transaction = require("../controller/usertranscation.controller")
const userscontroller = require("../controller/user.controller")



router.get('/api/prizes', async (req, res) => {
    let findspin = await Model.Spin.find();
    res.json(findspin);
});

router.post('/api/prizes', async (req, res) => {
    let prizes = req.body; 
    let deleteOld = await Model.Spin.deleteMany();
    let createnew = await Model.Spin.create(prizes);
    res.status(200).json({ message: 'Prizes updated successfully!' });
});



router.get('/api/dashboard-data', async (req, res) => {
    try {
        const currentDate = moment();
        const startOfDay = currentDate.clone().startOf('day'); 
        const endOfDay = currentDate.clone().endOf('day'); 

        const totalUsers = await Model.User.countDocuments({});

        const newUsers = await Model.User.countDocuments({
            createdAt: { $gte: startOfDay.toDate(), $lte: endOfDay.toDate() }
        });

        const monthlyUserStats = {
            labels: [],
            data: []
        };

        for (let i = 11; i >= 0; i--) {
            const monthStart = currentDate.clone().subtract(i, 'months').startOf('month');
            const monthEnd = currentDate.clone().subtract(i, 'months').endOf('month');

            const monthUsers = await Model.User.countDocuments({
                createdAt: { $gte: monthStart.toDate(), $lte: monthEnd.toDate() }
            });

            monthlyUserStats.labels.push(monthStart.format('MMM'));
            monthlyUserStats.data.push(monthUsers);
        }

        const topUsers = await Model.User.find({})
            .sort({ createdAt: -1 }) 
            .limit(4)
            .select('username balance avatar'); 

        let totaldeposit = await Model.Transaction.aggregate([
            { $match: { type: 'deposit' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        let totalwithdrowl = await Model.Transaction.aggregate([
            { $match: { type: 'withdraw' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        let totalreferlamount = await Model.Transaction.aggregate([
            { $match: { type: 'referral' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        totaldeposit = totaldeposit[0] ? totaldeposit[0].total : 0;
        totalwithdrowl = totalwithdrowl[0] ? totalwithdrowl[0].total : 0;
        totalreferlamount = totalreferlamount[0] ? totalreferlamount[0].total : 0;

        const avtivtournament = await Model.Tournament.countDocuments({ status: 'draft' });
        const todayrooms = await Model.Room.countDocuments({
            createdAt: { $gte: startOfDay.toDate(), $lte: endOfDay.toDate() }
        });
        const activebots = await Model.Bot.countDocuments({ status: true });

        const data = {
            totalUsers,
            newUsers,
            monthlyUserStats,
            topUsers,
            totalRevenue :0,
            totalCommissions :0,
            totaldeposit,
            totalwithdrowl ,
            totalreferlamount ,
            avtivtournament ,
            todayrooms ,
            activebots ,
        };
        console.log(data)
        res.json(data);
    } catch (error) {
        console.error('something went wrong', error);
        res.status(500).json({ message: 'something went wrong' });
    }
});






// Get Users
// router.get('/api/userslist', async (req, res) => {
//     try {
//         const { search, limit, page, orderColumn, orderDir } = req.query;

//         // Parse pagination parameters
//         const limitValue = parseInt(limit) || 10;
//         const pageValue = parseInt(page) || 1;
//         const skip = (pageValue - 1) * limitValue;

//         // Build search filter
//         const searchFilter = search
//             ? {
//                   $or: [
//                       { username: { $regex: search, $options: 'i' } },
//                       { email: { $regex: search, $options: 'i' } },
//                       { refercode: { $regex: search, $options: 'i' } },
//                   ],
//               }
//             : {};

//         // Build sorting options
//         const columns = ['username', 'refercode', 'email', 'balance'];
//         const sortOptions = {};
//         if (orderColumn && columns[orderColumn]) {
//             sortOptions[columns[orderColumn]] = orderDir === 'asc' ? 1 : -1;
//         } else {
//             sortOptions['createdAt'] = -1;
//         }

//         // Query database
//         const users = await Model.User.find(searchFilter)
//             .sort(sortOptions)
//             .skip(skip)
//             .limit(limitValue);

//         const totalCount = await Model.User.countDocuments();
//         const filteredCount = await Model.User.countDocuments(searchFilter);

//         const formattedData = users.map(user => ({
//             id: user._id,
//             username: user.username,
//             refercode: user.refercode,
//             image: user.image,
//             email: user.email,
//             balance: user.balance,
//         }));

//         res.status(200).json({
//             data: formattedData,
//             totalRecords: totalCount,
//             filteredRecords: filteredCount,
//         });
//     } catch (err) {
//         console.error('Error fetching user data:', err);
//         res.status(500).json({ message: 'Failed to fetch user data' });
//     }
// });







router.put('/api/users/toggle-status/:id', async (req, res) => {
    const userId = req.params.id;
    let user = await Model.User.findOne({_id : userId})
    let status =  user.status == 'Active' ? 'Inactive' : 'Active'
    // Simulate a database update (replace with actual DB query)
    user.status = status ; 
    await user.save();
    user.id = userId;
    if (user) {
        res.status(200).json({ message: 'User status updated successfully', user });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});


router.post('/api/users/wallet/deposit/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { amount } = req.body; // Amount to credit

    // Validation check
    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
    }
    
    try {
        // Find the user
        const user = await Model.User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.balance += Number(amount);
        await user.save();

        const transaction = new Model.Transaction({
            userId: user._id,
            type: 'deposit',
            amount: amount,
            currentbalance: user.balance,
            status: 'success',
            note: 'Wallet credited successfully ',
            details : {
                description: 'Deposit made by admin'
            },
        });
        const lastTransaction = await Model.Transaction.findOne().sort('-transactionId');
        transaction.transactionId = lastTransaction ? lastTransaction.transactionId + 1 : 1;
        await transaction.save();

        res.status(200).json({
            message: 'Wallet credited successfully',
            user: {
                balance: user.balance
            },
            transaction
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while processing the credit' });
    }
});



router.post('/api/users/wallet/withdraw/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      const { amount } = req.body;
 
      // Validate amount
      if (!amount || isNaN(amount) || amount <= 0) {
          return res.status(400).json({ error: 'Invalid amount' });
      }
 
      // Find user
      const user = await Model.User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
 
      // Check balance
      if (user.balance >= amount) {
          user.balance -= parseFloat(amount);
      } else {
        return res.status(400).json({ message:  'Insufficient balance'  });
      }
 
      // Save the updated user balance
      await user.save();
 
      // Create a new transaction entry
      const transaction = new Model.Transaction({
          userId,
          type: 'withdraw',  // Debit in user balance, recorded as 'deposit' here
          amount,          
          currentbalance: user.balance, 
          details: {
              description: 'withdraw made by admin'
          },
          note: "By admin"
      });
 
      const lastTransaction = await Model.Transaction.findOne().sort('-transactionId');
      transaction.transactionId = lastTransaction ? lastTransaction.transactionId + 1 : 1;
      const savedTransaction = await transaction.save(); 
 
      if (savedTransaction) {
          res.status(200).json({ message: 'Wallet debited successfully', user });
      } else {
          res.status(500).json({ error: 'Failed to save transaction' });
      }
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ error: 'Something went wrong' });
    }
 });
 



router.put('/api/users/toggle-freeze/:id', async (req, res) => {
    const userId = req.params.id;



    let user = await Model.User.findOne({_id : userId})

    user.walletFrozen = !user.walletFrozen ; 
    await user.save();
    user.id = userId;
    if (user) {
        user.walletFrozen = !user.walletFrozen;
        res.status(200).json({ message: 'Wallet freeze status updated successfully', user });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});






router.post('/place', async (req, res) => {
    try {
        const { userId, amount, gameType } = req.body;

        // Validate input
        if (!userId || !amount || !gameType) {
            return res.status(400).json({ error: 'Invalid data provided' });
        }

        // Create a new order
        const order = new Model.Order({
            orderId: `ORDER-${Date.now()}`,
            userId,
            amount,
            gameType,
        });

        // Check if a room exists or create a new one
        let room = await Model.Room.findOne({ gameType, status: 'active' });
        if (!room) {
            room = new Model.Room({
                roomId: `ROOM-${Date.now()}`,
                gameType,
                participants: [userId],
                totalBetAmount: amount,
            });
            await room.save();
        } else {
            // Add user to room
            room.participants.push(userId);
            room.totalBetAmount += amount;
            await room.save();
        }

        // Link room to order
        order.roomId = room._id;
        await order.save();

        // Handle transaction
        const transaction = new Model.Transaction({
            userId,
            amount,
            type: 'bet',
            referenceId: order._id,
        });
        await transaction.save();

        res.status(201).json({ message: 'Order placed successfully', order, room });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/', async (req, res) => {
    try {
        const { userId, status, startDate, endDate } = req.query;
        const filter = {};

        if (userId) filter.userId = userId;
        if (status) filter.status = status;
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const orders = await Model.Order.find(filter).populate('roomId', 'roomId gameType');
        res.status(200).json({ orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/rooms/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;

        const room = await Model.Room.findById(roomId).populate('participants', 'name');
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        res.status(200).json({ room });
    } catch (error) {
        console.error('Error fetching room details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/api/rooms', async (req, res) => {
    const { search, gameType, startDate, endDate, limit = 10, page = 1, orderColumn = 'createdAt', orderDir = 'desc' } = req.query;

    const filter = {};
    if (search) filter.$text = { $search: search };
    if (gameType) filter.gameType = gameType;
    if (startDate) filter.createdAt = { $gte: new Date(startDate) };
    if (endDate) filter.createdAt = { ...filter.createdAt, $lte: new Date(endDate) };

    const totalRecords = await Model.Room.countDocuments();
    const filteredRecords = await Model.Room.countDocuments(filter);

    const rooms = await Model.Room.find(filter).populate("tournamentId" ,"tournamentid")
        .sort({ [orderColumn]: orderDir === 'asc' ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    res.json({
        totalRecords,
        filteredRecords,
        rooms,
    });
});

router.get('/api/orders', async (req, res) => {
    try {
        const {
            search = '',
            orderStatus = '',
            gameType = '',
            startDate = '',
            endDate = '',
            limit = 10,
            page = 1,
            orderColumn = 'createdAt',
            orderDir = 'desc'
        } = req.query;

        const filters = {};

        if (search) {
            filters.$or = [
                { orderId: { $regex: search, $options: 'i' } },
                { userId: { $regex: search, $options: 'i' } }
            ];
        }

        if (orderStatus) {
            filters.status = orderStatus;
        }

        if (gameType) {
            filters.gameType = gameType;
        }

        if (startDate && endDate) {
            filters.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const totalRecords = await Model.Order.countDocuments(filters);
        const orders = await Model.Order.find(filters).populate("userId" , "numericid" )
            .sort({ [orderColumn]: orderDir })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            totalRecords,
            filteredRecords: orders.length,
            orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/api/users/transactions/:userId',transaction.transactionlist);
router.get('/api/userslist',userscontroller.userlist);
router.get('/api/transactions',transaction.transactionbyuser);

router.get('/api/users/numeric-ids', async (req, res) => {
    try {
        const users = await Model.User.find({}, 'numericid');  // Fetch all users with their IDs
        const numericIds = users.map(user =>  user.numericid);  // Convert user IDs to string
        res.status(200).json({ numericIds });  // Return as 'numericIds' to match frontend expectation
    } catch (error) {
        console.error('Error fetching user numeric IDs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
