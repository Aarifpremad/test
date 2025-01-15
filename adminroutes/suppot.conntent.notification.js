let express = require("express")
let router = express.Router();
let Model = require("../models/model");
const moment = require('moment'); 


let staticSupportData = [
    { id: 1, name: "Alice", email: "alice@example.com", mobile: "1234567890", subject: "Login Issue", message: "Unable to login.", status: "Pending", createdAt: "2024-12-20" ,state :"rrrr",dis : "dis"},
    { id: 2, name: "Bob", email: "bob@example.com", mobile: "9876543210", subject: "Wallet Problem", message: "Wallet balance not updating.", status: "Resolved", createdAt: "2024-12-21" },
    { id: 3, name: "Charlie", email: "charlie@example.com", mobile: "1112223334", subject: "Payment Issue", message: "Payment failed during checkout.", status: "Pending", createdAt: "2024-12-22" }
];

router.get('/api/support', (req, res) => {
    res.json({ success: true, data: staticSupportData });
});

router.post('/api/support/update-status', (req, res) => {
    const { id, status } = req.body;

    const query = staticSupportData.find(query => query.id == id);
    if (query) {
        query.status = status;
        res.json({ success: true, message: `Status updated to "${status}".` });
    } else {
        res.status(404).json({ success: false, message: 'Query not found.' });
    }
});

router.delete('/api/support/delete/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const index = staticSupportData.findIndex(query => query.id === id);

    if (index !== -1) {
        staticSupportData.splice(index, 1);
        res.json({ success: true, message: `Query ID: ${id} deleted successfully.` });
    } else {
        res.status(404).json({ success: false, message: 'Query not found.' });
    }
});

router.get('/api/content/:type', async (req, res) => {
    const type = req.params.type;
    let content = await Model.Content.findOne({type})
    console.log(content,"content",type)
    if (content) {
        res.json({ success: true, content: content.content });
    } else {
        res.json({ success: false, message: 'Invalid content type.' });
    }
});

router.post('/api/content/save', async (req, res) => {
 try {
       const { type, content } = req.body;
       let contentData = await Model.Content.findOne({type})
       contentData.content = content
       let updatedoc = await contentData.save()
       if (updatedoc) {
           res.json({ success: true, message: `${type} updated successfully.` });
       } else {
           res.json({ success: false, message: 'Invalid content type.' });
       }
 } catch (error) {
    res.json({ success: false, message: 'something went wrong' });
 }
});

router.get('/api/notifications', (req, res) => {
    res.json({ notifications });
});

router.post('/api/notifications/add', (req, res) => {
    const { message } = req.body;
    const newNotification = { _id: Date.now().toString(), message };
    notifications.push(newNotification);
    res.json({ success: true, message: 'Notification added successfully.' });
});

router.delete('/api/notifications/delete/:id', (req, res) => {
    const { id } = req.params;
    const index = notifications.findIndex(notification => notification._id === id);
    if (index !== -1) {
        notifications.splice(index, 1);
        res.json({ success: true, message: 'Notification deleted successfully.' });
    } else {
        res.json({ success: false, message: 'Notification not found.' });
    }
});

module.exports = router;