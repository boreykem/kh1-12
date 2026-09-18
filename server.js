require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
// For local development without Atlas, it will try to use local MongoDB.
// When deployed on Render, set the MONGODB_URI environment variable to the Atlas connection string.
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/klemtech';

let isDbConnected = false;
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//       isDbConnected = true;
//       console.log('Connected to MongoDB successfully!');
//   })
//   .catch(err => console.error('MongoDB connection error. Running in offline/memory mode.'));

// ----------------------------------------
// Models & Memory Fallback
// ----------------------------------------
// const userSchema = new mongoose.Schema({
//     username: { type: String, required: true },
//     grade: { type: Number, required: true },
//     xp: { type: Number, default: 0 },
//     streak: { type: Number, default: 0 }
// });
// const User = mongoose.model('User', userSchema);

let memoryUser = { username: 'hero', grade: 4, xp: 1240, streak: 5 };

// ----------------------------------------
// API Routes
// ----------------------------------------

// Health check endpoint for Render.com
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Get or Create Mock User for the prototype
app.get('/api/user/mock', async (req, res) => {
    if (!isDbConnected) {
        return res.json(memoryUser);
    }
    try {
        let user = await User.findOne({ username: 'hero' });
        if (!user) {
            user = await User.create({ username: 'hero', grade: 4, xp: 1240, streak: 5 });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update XP endpoint (called when a game is won)
app.post('/api/progress/xp', async (req, res) => {
    const { xpEarned } = req.body;
    
    if (!isDbConnected) {
        memoryUser.xp += xpEarned || 0;
        return res.json({ success: true, newTotalXp: memoryUser.xp });
    }

    try {
        let user = await User.findOne({ username: 'hero' });
        if (user) {
            user.xp += xpEarned || 0;
            await user.save();
            res.json({ success: true, newTotalXp: user.xp });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Server started below
// Start Server
// ----------------------------------------
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
