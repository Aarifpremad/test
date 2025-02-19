let express = require("express")
let router = express.Router();
let Model = require("../models/model");
const moment = require('moment'); 



router.get('/api/support', async (req, res) => {
    let finddata =await Model.Enquiry.find()
    res.json({ success: true, data: finddata });
});

router.post('/api/support/update-status', async (req, res) => {
    const { id, status } = req.body;
    try {
        let query = await Model.Enquiry.findOne({ srno: id });
        if (query) {
            query.status = status;
            await query.save();
            res.json({ success: true, message: `Status updated to "${status}".` });
        } else {
            res.status(404).json({ success: false, message: 'Query not found.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
});

router.delete('/api/support/delete/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    let index = await Model.Enquiry.deleteOne({ srno: id });
    if (index) {
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