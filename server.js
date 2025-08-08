// server.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// --- Middleware ---
// This should come first to parse the body of POST requests
app.use(express.json());

// --- MongoDB Connection ---
const mongoURI = 'mongodb+srv://<username>:<password>@<your-cluster-url>/bhaktiSaints?retryWrites=true&w=majority'; // IMPORTANT: Make sure this is your correct Atlas URI
// Example: 'mongodb+srv://vibhu:myPassword@cluster0.abcde.mongodb.net/bhaktiSaints?retryWrites=true&w=majority'

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully.'))
.catch(err => console.error('MongoDB connection error:', err));

// --- Mongoose Schema ---
const saintSchema = new mongoose.Schema({
    name: { type: String, required: true },
    tradition: String,
    placeAssociated: [String],
    placeAssociatedDetails: { type: Map, of: String },
    influence: [String],
    period: String,
    traditionType: String,
    gender: String,
    language: String,
    deity: String,
    texts: [String],
    philosophy: String,
}, { timestamps: true });

const Saint = mongoose.model('Saint', saintSchema);

// --- API Routes (FIX: Define API routes BEFORE static file routes) ---

// POST a new saint entry
app.post('/api/saints', async (req, res) => {
    try {
        const newSaint = new Saint(req.body);
        const savedSaint = await newSaint.save();
        res.status(201).json(savedSaint);
    } catch (error) {
        console.error("Error saving saint:", error);
        res.status(400).json({ message: 'Error saving saint data', error: error.message });
    }
});

// GET all saints
app.get('/api/saints', async (req, res) => {
    try {
        const saints = await Saint.find().sort({ createdAt: -1 });
        res.status(200).json(saints);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching saints', error: error.message });
    }
});

// --- Static File Serving ---
// This serves the CSS and JS files
app.use(express.static(path.join(__dirname)));

// This serves the main HTML file for any other GET request that isn't an API call
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'form.html'));
});


// --- Start the server ---
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
