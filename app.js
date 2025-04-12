const express = require('express');
require('dotenv').config();
const app = express();
const bodyParser = require('body-parser');
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const fuzz = require("fuzzball");

const askHuggingFace = require('./utils/hfClient');
const stockRoutes = require('./routes/stocks');
const marketRoutes = require('./routes/market');
const holdingsRoutes = require('./routes/holdings');
const nseRoutes = require('./routes/nse'); // Corrected the import for NSE route

// View Engine and Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Load Mutual Fund CSV Data
let schemes = [];

fs.createReadStream(path.join(__dirname, "data/data.csv"))
    .pipe(csv())
    .on("data", (row) => schemes.push(row))
    .on("end", () => {
        console.log("✅ Schemes loaded:", schemes.length);
        console.log("🔎 Sample:", schemes.slice(0, 2));
    });

/* ---------- ROUTES ---------- */

// Home Route - HuggingFace QA
app.get('/', (req, res) => {
    res.render('home', { answer: null, question: '', context: '' });
});

app.post('/ask', async (req, res) => {
    const question = req.body.question;
    const { answer, context } = await askHuggingFace(question);
    res.render('home', { answer, context, question });
});

// GET /news-feed - Render empty search page
app.get('/news-feed', (req, res) => {
    res.render('news-feed', { query: '', matches: [] });
});

// POST /search - Fuzzy search mutual funds
app.post('/search', (req, res) => {
    const { query } = req.body;
    const threshold = 70;

    if (!query) {
        return res.render('news-feed', { query, matches: [] });
    }

    const userQuery = query.toString().toLowerCase().trim();
    const matches = [];

    console.log("🔍 Searching for:", userQuery);

    schemes.forEach((s) => {
        const fundName = s.name_of_the_fund?.toLowerCase().trim();

        if (fundName) {
            const score = fuzz.token_set_ratio(userQuery, fundName);
            if (score >= threshold) {
                matches.push({
                    name: s.name_of_the_fund,
                    aum: s.aum_funds_individual_lst || "N/A",
                    nav: s.nav_funds_individual_lst || "N/A",
                    risk: s.risk_of_the_fund || "N/A",
                    type: s.type_of_fund || "N/A",
                    returns_1y: s.one_year_returns || "N/A",
                    returns_3y: s.three_year_returns || "N/A",
                    returns_5y: s.five_year_returns || "N/A",
                    link: s.link_of_the_funds || "#",
                    score,
                });
            }
        }
    });

    res.render('news-feed', { query, matches });
});

// Stock and Market Routes
app.use('/', stockRoutes);
app.use('/', marketRoutes);
app.use('/', holdingsRoutes);

// NSE Stock Route
app.use('/', nseRoutes); // NSE route to display stock and graph data

// About Page
app.get('/about', (req, res) => {
    res.render('about');
});

/* ---------- START SERVER ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
