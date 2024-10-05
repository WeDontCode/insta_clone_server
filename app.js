const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 5000;
const { MONGOURI } = require('./config/keys');

// Connect to MongoDB
mongoose.connect(MONGOURI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}).catch(err => console.error('MongoDB connection error:', err));

mongoose.connection.on('connected', () => {
    console.log("Connected to MongoDB");
});
mongoose.connection.on('error', (err) => {
    console.log("Error connecting:", err);
});

// Import models
require('./models/user');
require('./models/post');

// Middleware
app.use(express.json());
app.use(require('./routes/auth'));
app.use(require('./routes/post'));
app.use(require('./routes/user'));

// Serve static files in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static('client/build'));
    const path = require('path');
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

// Start the server
app.listen(port, () => {
    console.log("Server is running on", port);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
