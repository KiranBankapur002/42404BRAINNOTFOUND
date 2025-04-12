// utils/fundFetcher.js
const axios = require('axios');

async function getFundPerformance(symbol) {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${process.env.ALPHA_KEY}`;
    const response = await axios.get(url);
    const data = response.data['Time Series (Daily)'];
    const latest = Object.keys(data)[0];
    const prev = Object.keys(data)[1];
    return {
        date: latest,
        priceToday: data[latest]['4. close'],
        priceYesterday: data[prev]['4. close'],
        change: (data[latest]['4. close'] - data[prev]['4. close']).toFixed(2),
    };
}
module.exports = getFundPerformance;
