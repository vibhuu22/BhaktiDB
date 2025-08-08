// server.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
// Use port from environment variable for deployment, or 3000 for local development
const port = process.env.PORT || 3000;

// --- Middleware ---
app.use(express.json()); // To parse JSON bodies
app.use(express.static(__dirname)); // Serve static files like CSS and JS from the root directory

// --- MongoDB Connection ---
// IMPORTANT: For deployment, you will replace this with a cloud MongoDB URI
const mongoURI = 'mongodb+srv://vibhu22:<vibhu100>@saints.1q1mho2.mongodb.net/?retryWrites=true&w=majority&appName=Saints'; 

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully.'))
.catch(err => console.error('MongoDB connection error:', err));

// --- Mongoose Schema (Matches your form.html) ---
const saintSchema = new mongoose.Schema({
    name: { type: String, required: true },
    tradition: String,
    placeAssociated: [String], // Array of strings for checkboxes like 'Birth', 'Samadhi'
    placeAssociatedDetails: { type: Map, of: String }, // For dynamic textboxes: { 'Birth': 'Varanasi', 'Samadhi': 'Puri' }
    influence: [String], // Array of strings for comma-separated values
    period: String,
    traditionType: String,
    gender: String,
    language: String,
    deity: String,
    texts: [String], // Array of strings for comma-separated values
    philosophy: String,
}, { timestamps: true }); // Adds createdAt and updatedAt

const Saint = mongoose.model('Saint', saintSchema);

// --- API Routes ---

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

// --- Serve the HTML file for the root URL ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'form.html'));
});

// --- Start the server ---
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
