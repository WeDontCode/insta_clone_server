const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    required: true,
  },
  likes: [{type: ObjectId,ref: "User",}],
  comments:[{
    text:String,
    postedBy:{type:ObjectId,ref:"User"}
}],
  postedBy: {
    type: ObjectId,
    ref: 'User', // Reference to the User model
    required: true, // Ensure every post is linked to a user
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Post', postSchema);
