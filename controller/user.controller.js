
let Model = require("../models/model")

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); 
}

const signUp = async (req, res) => {
    try {
        const { username, mobileno , refercode , otp} = req.body;


        if(!username || !mobileno ){
            return res.status(400).json({ message: 'Mobile number and usename required' });
        }
        const existingUser = await Model.User.findOne({ mobileno , isDeleted :false });
        if (existingUser) return res.status(400).json({ message: 'Mobile number registered' });

        const otpRecord = await Model.OTP.findOne({ mobileno, otp });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (otpRecord.expireTime < new Date()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        await Model.OTP.updateOne({ _id: otpRecord._id }, { $set: { hitCount: 0 } });
        await Model.OTP.deleteOne({ _id: otpRecord._id });


        const lastUser = await Model.User.findOne().sort({ numericid: -1 });
        const numericid = lastUser ? lastUser.numericid + 1 : 100000;

        const generatedReferCode = username.slice(0, 3).toUpperCase() + numericid;
        let referuser = await Model.User.findOne({ refercode });
        console.log(referuser , refercode )
        if(refercode ){
            if(!referuser){
                return res.status(400).json({ message: 'Give a valid refer code' });
            }
        }
        const newUser = new Model.User({
            username,
            mobileno,
            avatar:1,
            numericid,
            refercode: generatedReferCode,
        });

        const token = newUser.generateAuthToken(); // Generate token
        newUser.token = token
        await newUser.save();
        
        res.status(201).json({ message: 'User registered successfully', user: newUser });
        if(referuser){
            
            newUser.refuser = referuser._id  
             await newUser.save();

            referuser.balance += 50
            await referuser.save()
            const transaction = new Model.Transaction({
                userId: referuser._id,
                type: 'referral',
                amount: 50,
                currentbalance: referuser.balance,
                status: 'success',
                note: 'refer successfully ',
                details : {
                    description: 'refer successfully '
                },
            });
            const lastTransaction = await Model.Transaction.findOne().sort('-transactionId');
            transaction.transactionId = lastTransaction ? lastTransaction.transactionId + 1 : 1;
            await transaction.save();
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error', error });
    }
};

const signIn = async (req, res) => {
    try {
        const { mobileno, otp } = req.body;

        if (!mobileno || !otp) {
            return res.status(400).json({ message: 'Mobile number and OTP are required' });
        }

        const otpRecord = await Model.OTP.findOne({ mobileno, otp });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (otpRecord.expireTime < new Date()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }


        await Model.OTP.updateOne({ _id: otpRecord._id }, { $set: { hitCount: 0 } });
        await Model.OTP.deleteOne({ _id: otpRecord._id });

        const user = await Model.User.findOne({ mobileno , isDeleted :false});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const token = user.generateAuthToken(); 
        user.token = token
        await user.save()
        res.status(200).json({ message: 'Sign in successful', user });
    } catch (error) {
        console.error('Error in signIn API:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


// Send OTP API
const sendOtp = async (req, res) => {
    try {
        const { mobileno } = req.body;

        if (!mobileno) {
            return res.status(400).json({ message: 'Missing mobile number.' });
        }

        const currentTime = new Date();
        let existingOtp = await Model.OTP.findOne({ mobileno });
        let otp = 1234
        if (existingOtp) {
            const timeDifference = (currentTime - existingOtp.lastSentTime) / 1000; 
            if (timeDifference < 60 && existingOtp.hitCount >= 10) {
                return res.status(429).json({
                    message: 'OTP request limit reached. Try again after 1 minute.'
                });
            }
            if (timeDifference >= 60) {
                existingOtp.hitCount = 1;
                existingOtp.lastSentTime = currentTime;
                existingOtp.otp = otp
                existingOtp.expireTime = new Date(currentTime.getTime() + 5 * 60 * 1000); // 5 minutes validity
                await existingOtp.save();
            } else {
                existingOtp.hitCount += 1;
                existingOtp.lastSentTime = currentTime;
                existingOtp.otp = otp
                existingOtp.expireTime = new Date(currentTime.getTime() + 5 * 60 * 1000); // 5 minutes validity
                await existingOtp.save();
            }

            return res.status(200).json({ message: 'OTP sent successfully.', otp: existingOtp.otp });
        }
        const otpCode = otp;
        const expireTime = new Date(currentTime.getTime() + 5 * 60 * 1000); // OTP valid for 5 minutes
        await Model.OTP.create({
            otp: otpCode,
            mobileno,
            lastSentTime: currentTime,
            expireTime,
            hitCount: 1
        });

        res.status(200).json({ message: 'OTP sent successfully.', otp: otpCode });
    } catch (error) {
        console.log('Error in sending OTP:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};


const verifyOtp = async (req, res) => {
    try {
        const { mobileno, otp } = req.body;
        if (!mobileno || !otp) {
            return res.status(400).json({ message: 'Mobile number and OTP are required' });
        }

        const user = await Model.User.findOne({ mobileno ,isDeleted:false });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otpRecord = await Model.OTP.findOne({ user: user._id, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (otpRecord.expireTime < new Date()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        await Model.OTP.deleteOne({ _id: otpRecord._id });

        res.status(200).json({ message: 'OTP verified successfully', user });
    } catch (error) {
        console.error('Error in verifyOtp API:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};



const getProfile = async (req, res) => {
    try {
        const userId = req.user.numericid; 

        const user = await Model.User.findOne({numericid : userId}) 

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Profile fetched successfully', user });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.numericid; 

        const user = await Model.User.findOne({numericid:userId ,isDeleted:false});

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.isDeleted) {
            return res.status(400).json({ message: 'Account is already deleted' });
        }

        user.isDeleted = true;
        user.deletedAt = new Date();
        await user.save(); 

        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.numericid; 
        const { username, email, mobile, dob, state, city } = req.body;

        const user = await Model.User.findOne({ numericid: userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let update = {};

        if (username) update.username = username;
        if (email) update.email = email;
        if (mobile) update.mobileno = mobile; 
        if (dob) update.dob = dob;
        if (state) update.state = state;
        if (city) update.city = city;

        await Model.User.updateOne({ numericid: userId }, { $set: update });

        res.status(200).json({ message: 'Profile updated successfully', user: { ...user.toObject(), ...update } });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);

        if (extname && mimeType) {
            return cb(null, true); 
        } else {
            cb(new Error('Only image files are allowed (JPEG, JPG, PNG, GIF)'));
        }
    }
}).single('profilePic'); 

const uploadProfileImage = async (req, res) => {
    try {
        upload(req, res, (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const userId = req.user.numericid; 

            Model.User.findOne({ numericid: userId ,isDeleted :false })
                .then(user => {
                    if (!user) {
                        return res.status(404).json({ message: 'User not found' });
                    }

                    user.avatar = req.file.path; 

                    user.save()
                        .then(() => {
                            res.status(200).json({ message: 'Profile image uploaded successfully', imagePath: req.file.path });
                        })
                        .catch(error => {
                            console.error('Error saving user profile:', error);
                            res.status(500).json({ message: 'Error saving profile image', error: error.message });
                        });
                })
                .catch(error => {
                    console.error('Error finding user:', error);
                    res.status(500).json({ message: 'Internal server error', error: error.message });
                });
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};



const createEnquiry = async (req, res) => {
    try {
        const { name, mobileno, email, state, city, description } = req.body;

        if (!name || !mobileno  || !description) {
            return res.status(400).json({ message: 'Name, mobile, and description are required' });
        }

        const userRef = req.user._id;
        let enquiryno = await Model.Enquiry.findOne().sort({ srno: -1 });
        enquiryno = enquiryno ? parseInt(enquiryno.srno) + 1 : 1000;

        const newEnquiry = new Model.Enquiry({ name, mobileno, email, state, city, description, userRef , srno: enquiryno });
        await newEnquiry.save();

        res.status(201).json({ message: 'Enquiry created successfully', enquiry: newEnquiry });
    } catch (error) {
        console.error('Error creating enquiry:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const getEnquiries = async (req, res) => {
    try {
        const id = req.user._id; 
        const enquiries = await Model.Enquiry.find({_id:id}).populate('userRef', 'username mobileno');

        res.status(200).json({ message: 'Enquiries retrieved successfully', enquiries });
    } catch (error) {
        console.error('Error fetching enquiries:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const deleteEnquiry = async (req, res) => {
    try {
        const { id } = req.params;

        const enquiry = await Model.Enquiry.findById(id);
        if (!enquiry) {
            return res.status(404).json({ message: 'Enquiry not found' });
        }

        await enquiry.deleteOne();
        res.status(200).json({ message: 'Enquiry deleted successfully' });
    } catch (error) {
        console.error('Error deleting enquiry:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};



const userlist = async (req, res) => {
    try {
        const { search, limit, page, orderColumn, orderDir } = req.query;
        let limitValue = parseInt(limit) || 10;
        const pageValue = parseInt(page) || 1;
        const skip = (pageValue - 1) * limitValue;
        limitValue = limitValue < 0 ? 0 : limitValue;

        const searchFilter = search
            ? {
                  $or: [
                      { username: { $regex: search, $options: 'i' } },
                      { email: { $regex: search, $options: 'i' } },
                      { refercode: { $regex: search, $options: 'i' } },
                  ],
              }
            : {};

        const sortOptions = {};
        if (orderColumn) sortOptions[orderColumn] = orderDir === 'asc' ? 1 : -1;
        else sortOptions['createdAt'] = -1;

        const users = await Model.User.find(searchFilter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitValue);

        const totalCount = await Model.User.countDocuments();
        const filteredCount = await Model.User.countDocuments(searchFilter);

        const formattedData = users.map(user => ({

            numericid : user.numericid,
            id: user._id,
            username: user.username,
            refercode: user.refercode,
            image: user.image,
            email: user.email,
            balance: user.balance,
            avatar: user.avatar,
            mobileno : user.mobileno
        }));
        console.log({
            totalRecords: totalCount,
            filteredRecords: filteredCount,dd:formattedData.length})
        res.status(200).json({
            data: formattedData,
            totalRecords: totalCount,
            filteredRecords: filteredCount,
        });
    } catch (err) {
        console.error('Error fetching user data:', err);
        res.status(500).json({ message: 'Failed to fetch user data' });
    }
}



module.exports = { signUp, signIn, sendOtp ,verifyOtp ,getProfile ,deleteAccount , uploadProfileImage,updateProfile ,createEnquiry, getEnquiries, deleteEnquiry , userlist};