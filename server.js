const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const app = express();

dotenv.config();

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://test:zeus@cluster0.phuw2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Models
const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
});

// Update the LeadSchema in server.js
const LeadSchema = new mongoose.Schema({
    businessName: { type: String, required: true },
    category: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    website: { type: String },
    socialMedia: [{
        platform: String,
        url: String
    }]
}, { timestamps: true });

const Category = mongoose.model('Category', CategorySchema);
const Lead = mongoose.model('Lead', LeadSchema);

// Routes

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Home route (Login page)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Dashboard route
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// API Routes

// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new category
app.post('/api/categories', async (req, res) => {
    try {
        const newCategory = new Category({ name: req.body.name });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Add Lead
app.post('/api/leads', async (req, res) => {
    try {
        const newLead = new Lead(req.body);
        await newLead.save();
        res.status(201).json(newLead);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get All Leads
app.get('/api/leads', async (req, res) => {
    try {
        const leads = await Lead.find().sort({ createdAt: -1 });
        res.json(leads);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Single Lead
app.get('/api/leads/:id', async (req, res) => {
    try {
        // Validate ID format first
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid lead ID format' });
        }

        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' });
        }
        res.json(lead);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Lead
app.put('/api/leads/:id', async (req, res) => {
    try {
        const updatedLead = await Lead.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        if (!updatedLead) {
            return res.status(404).json({ error: 'Lead not found' });
        }
        res.json(updatedLead);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete Lead
app.delete('/api/leads/:id', async (req, res) => {
    try {
        const deletedLead = await Lead.findByIdAndDelete(req.params.id);
        if (!deletedLead) {
            return res.status(404).json({ error: 'Lead not found' });
        }
        res.json({ message: 'Lead deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Authentication
app.post('/api/auth', (req, res) => {
    const { pin } = req.body;
    if (pin === process.env.AUTH_PIN || pin === '1234') { // Default pin for demo
        res.json({ success: true, message: 'Authentication successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid pin' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});