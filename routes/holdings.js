const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const express = require('express');
const router = express.Router();

const csvFilePath = path.join(__dirname, '../data/mf_holdings_data.csv');

router.get('/holdings', (req, res) => {
    const query = req.query.search?.toLowerCase() || '';
    const results = [];

    if (!query) {
        // If no search query, just render the page with empty results
        return res.render('holdings', { holdings: [], search: '' });
    }

    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
            const isin = (row.isin || '').toLowerCase();
            const name = (row.name || '').toLowerCase();
            const sector = (row.sector || '').toLowerCase();

            if (isin.includes(query) || name.includes(query) || sector.includes(query)) {
                results.push(row);
            }
        })
        .on('end', () => {
            res.render('holdings', {
                holdings: results,
                search: req.query.search
            });
        })
        .on('error', (err) => {
            console.error('Error reading CSV:', err);
            res.status(500).send('Error loading data');
        });
});

module.exports = router;
