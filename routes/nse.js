const express = require('express');
const router = express.Router();
const axios = require('axios');

const API_KEY = '35acdcb6dbf347209a2226334e49e6c0';

router.get('/nse', async (req, res) => {
    const symbol = 'RELIANCE.BSE'; // You can replace with dynamic symbol or dropdown later

    try {
        const response = await axios.get('https://api.twelvedata.com/time_series', {
            params: {
                symbol,
                interval: '1min',
                outputsize: 30,
                apikey: API_KEY,
            }
        });

        const data = response.data;

        if (!data || !Array.isArray(data.values)) {
            console.error('Invalid API response:', data);
            return res.render('nse', {
                stockName: symbol,
                error: 'Unable to fetch stock data.',
                timestamps: [],
                prices: []
            });
        }

        const timestamps = data.values.map(item => item.datetime).reverse();
        const prices = data.values.map(item => parseFloat(item.close)).reverse();

        res.render('nse', {
            stockName: symbol,
            error: null,
            timestamps,
            prices
        });

    } catch (err) {
        console.error('Error fetching stock data:', err.message);
        res.render('nse', {
            stockName: symbol,
            error: 'Failed to fetch stock data.',
            timestamps: [],
            prices: []
        });
    }
});

module.exports = router;
