let express = require("express");
let router = express.Router();
let Admin = require("../models/admin.model"); // Assume this is the Admin model
let authenticateSessionadmin = require("../service/auth").authenticateSessionadmin;

// Route to show profile page
router.get("/profile", authenticateSessionadmin, async (req, res) => {
    try {
        let admin = await Admin.findById(req.session.admin.id);
        if (!admin) {
            return res.status(404).send("Admin not found");
        }
        res.render("admin", { admin: admin });  // Render profile page with admin data
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

router.post("/profile/update", authenticateSessionadmin, async (req, res) => {
    const { name, password, confirmPassword } = req.body;
    console.log(req.body)
    // Ensure the passwords match
    if (password !== confirmPassword) {
        return res.status(400).send("Passwords do not match");
    }

    try {
        // Find the admin using the admin id from the session
        let admin = await Admin.findById(req.session.admin.id);
        if (!admin) {
            return res.status(404).send("Admin not found");
        }

        // Update admin details
        admin.name = name;

        // If password is provided, hash it and update
        if (password) {
            admin.password = password;  // Password will be hashed in the pre-save hook
        }

        await admin.save(); // Save the updated admin details
        res.send("Profile updated successfully"); // Send success response
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// Route for admin logout
router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Logout failed");
        }
        res.redirect("/"); // Redirect to login page after logout
    });
});

module.exports = router;
