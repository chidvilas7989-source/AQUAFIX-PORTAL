const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
// Serve the static files from current directory
app.use(express.static(__dirname));

// In-memory storage for reports
let reports = [];
let nextId = 1;

// Get all reports, ordered by timestamp descending
app.get('/api/reports', (req, res) => {
    // Return sorted reports (newest first)
    const sortedReports = [...reports].sort((a, b) => b.timestamp - a.timestamp);
    res.json(sortedReports);
});

// Create a new report
app.post('/api/reports', (req, res) => {
    const { location, description } = req.body;
    
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
        return res.status(400).json({ error: 'Valid location is required' });
    }

    const report = {
        id: nextId.toString(),
        location,
        description: description || 'No details provided',
        status: 'pending',
        timestamp: Date.now()
    };
    
    reports.push(report);
    nextId++;
    
    res.status(201).json(report);
});

// Update report status (e.g. mark as completed)
app.put('/api/reports/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const report = reports.find(r => r.id === id);
    if (!report) {
        return res.status(404).json({ error: 'Report not found' });
    }
    
    if (status) {
        report.status = status;
        if (status === 'completed') {
            report.completedAt = Date.now();
        }
    }
    
    res.json(report);
});

// Delete a report
app.delete('/api/reports/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = reports.length;
    
    reports = reports.filter(r => r.id !== id);
    
    if (reports.length < initialLength) {
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Report not found' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Water Leak Portal Server running on http://localhost:${PORT}`);
});
