const express = require('express'); 
//const { default: mongoose } = require('mongoose');
const app = express();
const mongoose = require('mongoose')
const port = 5000;
const {MONGOURI} = require('./keys')





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

app.listen(port, () => {
    console.log("Server is running on", port); // Corrected variable name
});
