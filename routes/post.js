const express = require('express');
const router = express.Router();
const requireLogin = require('../middleware/requireLogin');
const mongoose = require('mongoose');
const Post = mongoose.model("Post");

// Fetch all posts with only the user's _id and name
router.get('/allpost', (req, res) => {
    Post.find()
        .populate("postedBy","_id name") // Limits the populated fields to _id and name
        .then(posts => {
            res.json({ posts });
        })
        .catch(err => {
            console.log(err);
        });
});

router.post('/createpost', requireLogin, (req, res) => {
    const { title, body, pic} = req.body;
    if (!title || !body || !pic) {
        return res.status(422).json({ error: "Please add all required fields" });
    }
    req.user.password = undefined
    const post = new Post({
        title,
        body,
        pic, // Default value if no photo is provided
        postedBy: req.user // req.user is the currently logged-in user
    });

    post.save()
        .then(result => {
            res.json({ post: result });
        })
        .catch(err => {
            console.log(err);
        });
});

router.get('/mypost', requireLogin, (req, res) => {
    Post.find({ postedBy: req.user._id })  // Ensure the field matches the one in the schema
        .populate("postedBy", "_id name")  // Correct the case sensitivity here
        .then(mypost => {
            res.json({ mypost });
        })
        .catch(err => {
            console.log(err);
        });
});


module.exports = router;
