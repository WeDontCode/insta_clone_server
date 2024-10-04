const express = require('express');
const router = express.Router();
const requireLogin = require('../middleware/requireLogin');
const mongoose = require('mongoose');
const Post = mongoose.model("Post");

// Fetch all posts with user and comment data populated
router.get('/getsubpost', requireLogin,(req,res)=>{
  this.post.find({postedBy:{$in:req.user.following}})
  .populate("postedBy","_id name")
  .then(posts=>{
    res.json({posts})
  })
  .catch(err=>{
    console.log(err)
  })
})
router.get('/allpost', requireLogin, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("postedBy", "_id name")
      .populate("comments.postedBy", "_id name"); // Populate comment user
    res.json({ posts });
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: "Failed to fetch posts." });
  }
});

// Create a new post
router.post('/createpost', requireLogin, async (req, res) => {
  const { title, body, pic } = req.body;
  if (!title || !body || !pic) {
    return res.status(422).json({ error: "Please add all fields" });
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
    res.status(500).json({ error: "Failed to create post." });
  }
});

// Fetch user's posts
router.get('/mypost', requireLogin, async (req, res) => {
  try {
    const mypost = await Post.find({ postedBy: req.user._id })
      .populate("postedBy", "_id name");
    res.json({ mypost });
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: "Failed to fetch posts." });
  }
});

// Like a post
router.put('/like', requireLogin, async (req, res) => {
  try {
    const result = await Post.findByIdAndUpdate(
      req.body.postId,
      { $push: { likes: req.user._id } },
      { new: true }
    ).populate("postedBy", "_id name")
      .populate("comments.postedBy", "_id name");
    res.json(result);
  } catch (err) {
    console.error("Error liking post:", err);
    res.status(422).json({ error: "Failed to like post." });
  }
});

// Unlike a post
router.put('/unlike', requireLogin, async (req, res) => {
  try {
    const result = await Post.findByIdAndUpdate(
      req.body.postId,
      { $pull: { likes: req.user._id } },
      { new: true }
    ).populate("postedBy", "_id name")
      .populate("comments.postedBy", "_id name");
    res.json(result);
  } catch (err) {
    console.error("Error unliking post:", err);
    res.status(422).json({ error: "Failed to unlike post." });
  }
});

// Comment on a post
router.put('/comment', requireLogin, async (req, res) => {
  const comment = { text: req.body.text, postedBy: req.user._id };
  try {
    const result = await Post.findByIdAndUpdate(
      req.body.postId,
      { $push: { comments: comment } },
      { new: true }
    ).populate("comments.postedBy", "_id name")
      .populate("postedBy", "_id name");
    res.json(result);
  } catch (err) {
    res.status(422).json({ error: err });
  }
});

// Delete a post
router.delete('/deletepost/:postId', requireLogin, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId })
      .populate("postedBy", "_id");
    if (!post) {
      return res.status(422).json({ error: "Post not found" });
    }
    if (post.postedBy._id.toString() === req.user._id.toString()) {
      await post.deleteOne();
      res.json({ message: "Post deleted successfully" });
    } else {
      res.status(403).json({ error: "Unauthorized to delete this post" });
    }
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ error: "Failed to delete post." });
  }
});

// Delete a comment
router.delete('/deletecomment/:postId/:commentId', requireLogin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate("comments.postedBy", "_id name");
    if (!post) {
      return res.status(422).json({ error: "Post not found" });
    }
    const comment = post.comments.find(
      comment => comment._id.toString() === req.params.commentId
    );
    if (!comment) {
      return res.status(422).json({ error: "Comment not found" });
    }
    if (comment.postedBy.toString() === req.user._id.toString() ||
        post.postedBy.toString() === req.user._id.toString()) {
      post.comments = post.comments.filter(
        comment => comment._id.toString() !== req.params.commentId
      );
      await post.save();
      res.json({ message: "Comment deleted successfully" });
    } else {
      res.status(403).json({ error: "Unauthorized to delete this comment" });
    }
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ error: "Failed to delete comment." });
  }
});

module.exports = router;
