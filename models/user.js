const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    pic:{
        type:String,
        default:"https://res.cloudinary.com/adejoh/image/upload/c_thumb,w_200,g_face/v1727973752/default_image_lbjcdi.jpg"
    },
    followers: [{type: ObjectId,ref: "User"}],
    following: [{type: ObjectId,ref: "User"}]
});

mongoose.model("User", userSchema);
