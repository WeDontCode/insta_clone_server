const express = require('express'); 
//const { default: mongoose } = require('mongoose');
const app = express();
const mongoose = require('mongoose')
const port = process.env.PORT || 5000;
const {MONGOURI} = require('./config/keys')


mongoose.connect(MONGOURI,{ 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})


mongoose.connection.on('connected',()=>{
    console.log("connected to mongo yeah")
})
mongoose.connection.on('error',(err)=>{
    console.log("err connecting",err)
})

require('./models/user')
require('./models/post')

app.use(express.json())
app.use(require('./routes/auth'))
app.use(require('./routes/post'))
app.use(require('./routes/user'))

if(process.env.NODE_ENV=="production"){
    app.use(express.static('client/build'))
    const path = require('path')
    app.length("*",(req,res)=>{
        res.sendFile(path.resolve(_dirname,'client','build','index.html'))
    })
}

app.listen(port, () => {
    console.log("Server is running on", port); // Corrected variable name
});
