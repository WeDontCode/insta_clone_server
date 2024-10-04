const express = require('express');
const router = express.Router();
const requireLogin = require('../middleware/requireLogin');
const mongoose = require('mongoose');
const Post = mongoose.model("Post");
const User = mongoose.model("User");

// Fetch user and their posts
router.get('/user/:id', requireLogin, async (req, res) => {
    console.log("Fetching user with ID:", req.params.id); // Log the ID
    try {
        const user = await User.findOne({ _id: req.params.id }).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        console.log("User found:", user); // Log the user data

        const posts = await Post.find({ postedBy: req.params.id }).populate("postedBy", "_id name");
        console.log("Posts found:", posts); // Log the posts data
        
        res.json({ user, posts });
    } catch (err) {
        console.error(err); // Log any errors
        return res.status(422).json({ error: err.message });
    }
});

// Unfollow user
router.put('/unfollow', requireLogin, (req, res) => {
    User.findByIdAndUpdate(
        req.body.unfollowId, 
        { $pull: { followers: req.user._id } }, // Remove current user from followers
        { new: true }).select("-password")
    .then(result => {
        User.findByIdAndUpdate(
            req.user._id, 
            { $pull: { following: req.body.unfollowId } }, // Remove unfollowed user from current user's following
            { new: true }
        )
        .then(result => res.json(result))
        .catch(err => res.status(422).json({ error: err }));
    })
    .catch(err => res.status(422).json({ error: err }));
});

// Follow user
router.put('/follow', requireLogin, (req, res) => {
    User.findByIdAndUpdate(
        req.body.followId, 
        { $push: { followers: req.user._id } }, // Add current user to followers
        { new: true }).select("-password")
    .then(result => {
        User.findByIdAndUpdate(
            req.user._id, 
            { $push: { following: req.body.followId } }, // Add followed user to current user's following
            { new: true }
        )
        .then(result => res.json(result))
        .catch(err => res.status(422).json({ error: err }));
    })
    .catch(err => res.status(422).json({ error: err }));
});
router.put('/updatepic',requireLogin,(req,res)=>{
User.findByIdAndUpdate(req.user._id,{$set:{pic:req.body.pic}},{new:true},(err,result)=>{
    if(err){
        return res.status(422).json({error:"pic can not post"})
    }
    res.json(result)
})
})

module.exports = router;
