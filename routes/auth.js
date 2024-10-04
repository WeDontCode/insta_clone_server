const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model("User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/keys');
const requireLogin = require('../middleware/requireLogin')

// token confirmation navigation route
// router.get('/protected',requireLogin,(req, res) => {
//     res.send("hello user");
// });

// Signup route
router.post('/signup', (req, res) => {
    const { name, email, password,pic } = req.body;

    // Check for missing fields
    if (!email || !password || !name) {
        return res.status(422).json({ error: "Please fill all fields" });
    }

    // Check if user already exists
    User.findOne({ email: email })
        .then((savedUser) => {
            if (savedUser) {
                return res.status(422).json({ error: "User already exists with that email" });
            }

            // Create new user instance with hashed password
            bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        email,
                        password: hashedPassword,
                        name,
                        pic
                    });

                    // Save user to the database
                    user.save()
                        .then((user) => {
                            res.json({ message: "Saved successfully", user });
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({ error: "Failed to save user" });
                        });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ error: "Failed to hash password" });
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "An error occurred" });
        });
});

// Signin route
router.post('/signin', (req, res) => {
    const { email, password } = req.body;

    // Check for missing fields
    if (!email || !password) {
        return res.status(422).json({ error: "Please add email and password" });
    }

    // Find user by email
    User.findOne({ email: email })
        .then(savedUser => {
            if (!savedUser) {
                return res.status(422).json({ error: "Invalid Email or Password" });
            }

            // Compare the password with the hashed password
            bcrypt.compare(password, savedUser.password)
                .then(doMatch => {
                    if (doMatch) {
                        const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET); // Corrected the variable name
                        const {_id,name,email} = savedUser;
                        return res.json({ token,user:{_id,name,email}}); // Added return to prevent further execution
                    } else {
                        return res.status(422).json({ error: "Invalid Email or Password" });
                    }
                })
                .catch(err => {
                    console.log(err);
                    return res.status(500).json({ error: "An error occurred while comparing passwords" });
                });
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({ error: "An error occurred while finding the user" });
        });
});

module.exports = router;
