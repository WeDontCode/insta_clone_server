const express = require('express');
const router = express.Router();
const requireLogin = require('../middleware/requireLogin');
const mongoose = require('mongoose');
const Post = mongoose.model("Post");

// Fetch all posts with only the user's _id and name
router.get('/allpost', requireLogin, async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("postedBy", "_id name"); // Limits the populated fields to _id and name
        res.json({ posts });
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).json({ error: "Failed to fetch posts. Please try again." });
    }
});

// Create a new post
router.post('/createpost', requireLogin, async (req, res) => {
    const { title, body, pic } = req.body;

    if (!title || !body || !pic) {
        return res.status(422).json({ error: "Please add all required fields" });
    }

    try {
        req.user.password = undefined;

        const post = new Post({
            title,
            body,
            photo: pic,
            postedBy: req.user
        });

        const result = await post.save();
        res.json({ post: result });
    } catch (err) {
        console.error("Post creation error:", err);
        res.status(500).json({ error: "Failed to create post. Please try again." });
    }
});

// Fetch user's posts
router.get('/mypost', requireLogin, async (req, res) => {
    try {
        const mypost = await Post.find({ postedBy: req.user._id })
            .populate("postedBy", "_id name"); // Correct the case sensitivity here
        res.json({ mypost });
    } catch (err) {
        console.error("Error fetching user's posts:", err);
        res.status(500).json({ error: "Failed to fetch your posts. Please try again." });
    }
});

// Like a post
router.put('/like', requireLogin, async (req, res) => {
    try {
        const result = await Post.findByIdAndUpdate(req.body.postId, {
            $push: { likes: req.user._id }
        }, { new: true }).populate("postedBy", "_id name");
        
        res.json(result);
    } catch (err) {
        console.error("Error liking post:", err);
        return res.status(422).json({ error: "Failed to like post." });
    }
});

// Unlike a post
router.put('/unlike', requireLogin, async (req, res) => {
    try {
        const result = await Post.findByIdAndUpdate(req.body.postId, {
            $pull: { likes: req.user._id }
        }, { new: true }).populate("postedBy", "_id name");
        
        res.json(result);
    } catch (err) {
        console.error("Error unliking post:", err);
        return res.status(422).json({ error: "Failed to unlike post." });
    }
});

// Comment on a post
router.put('/comment', requireLogin, async (req, res) => {
    const comment = {
      text: req.body.text,
      postedBy: req.user._id
    };
  
    try {
      const result = await Post.findByIdAndUpdate(
        req.body.postId,
        {
          $push: { comments: comment }
        },
        { new: true }
      )
        .populate("comments.postedBy", "_id name") // Ensure we populate the postedBy field in comments
        .populate("postedBy", "_id name"); // Optionally populate the postedBy of the post itself
  
      res.json(result);
    } catch (err) {
      return res.status(422).json({ error: err });
    }
  });
  

module.exports = router;
