// server.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// --- Middleware ---
app.use(express.json()); // To parse JSON bodies
app.use(express.static(path.join(__dirname))); // To serve static files like HTML, CSS, JS

// --- MongoDB Connection ---
// This is the complete and correct connection string for your Atlas database.
const mongoURI = 'mongodb+srv://vibhu22:vibhu100@saints.1q1mho2.mongodb.net/bhaktiSaints?retryWrites=true&w=majority&appName=Saints'; 

// The options `useNewUrlParser` and `useUnifiedTopology` are deprecated in recent versions of Mongoose and are no longer needed.
mongoose.connect(mongoURI)
.then(() => console.log('MongoDB connected successfully.'))
.catch(err => console.error('MongoDB connection error:', err));

// --- Mongoose Schema and Model ---
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
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

const Saint = mongoose.model('Saint', saintSchema);

// --- API Routes ---

// POST a new saint entry
app.post('/api/saints', async (req, res) => {
    try {
        const newSaint = new Saint(req.body);
        const savedSaint = await newSaint.save();
        res.status(201).json(savedSaint);
    } catch (error) {
        // --- ENHANCED ERROR LOGGING ---
        console.error("\n--- ERROR SAVING SAINT ---");
        console.error("Timestamp:", new Date().toISOString());
        console.error("Received Data (req.body):", JSON.stringify(req.body, null, 2));
        console.error("Mongoose Error:", error.message);
        console.error("--------------------------\n");
        
        res.status(400).json({ 
            message: 'Error saving saint data. Check server logs for details.', 
            error: error.message 
        });
    }
});

// GET all saints (for potential future use, e.g., displaying a list)
app.get('/api/saints', async (req, res) => {
    try {
        const saints = await Saint.find();
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
    console.log(`Server running on http://localhost:${port}`);
});

