const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_KEY = '35acdcb6dbf347209a2226334e49e6c0';

router.get('/market', async (req, res) => {
    const symbol = req.query.symbol || 'RELIANCE.BSE'; // Default stock

    try {
        const response = await axios.get('https://www.alphavantage.co/query', {
            params: {
                function: 'TIME_SERIES_INTRADAY',
                symbol,
                interval: '5min',
                apikey: API_KEY
            }
        });

        const rawData = response.data["Time Series (5min)"];
        if (!rawData) throw new Error("Invalid symbol or API limit reached");

        const labels = Object.keys(rawData).reverse();
        const prices = labels.map(time => parseFloat(rawData[time]["4. close"]));

        res.render('market', {
            symbol,
            labels,
            prices
        });
    } catch (error) {
        console.error(error.message);
        res.render('market', {
            symbol,
            labels: [],
            prices: [],
            error: 'Could not fetch stock data. Try again later.'
        });
    }
});

module.exports = router;
