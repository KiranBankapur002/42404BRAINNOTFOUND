const express = require('express');
const router = express.Router();
const yahooFinance = require('yahoo-finance2').default;
const Parser = require('rss-parser');
const parser = new Parser();

const niftyCompanies = ['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 'ICICIBANK.NS'];
const sensexCompanies = ['RELIANCE.BO', 'TCS.BO', 'INFY.BO', 'HDFCBANK.BO', 'ICICIBANK.BO'];

router.get('/stocks', async (req, res) => {
    try {
        const [nifty, sensex] = await Promise.all([
            yahooFinance.quote('^NSEI'),
            yahooFinance.quote('^BSESN')
        ]);

        const [niftyHistory, sensexHistory] = await Promise.all([
            yahooFinance.historical('^NSEI', {
                period1: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                interval: '1d'
            }),
            yahooFinance.historical('^BSESN', {
                period1: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                interval: '1d'
            })
        ]);

        const topNiftyCompanies = await Promise.all(
            niftyCompanies.map(async (symbol) => {
                const quote = await yahooFinance.quote(symbol);
                return {
                    name: quote.shortName || symbol,
                    price: quote.regularMarketPrice,
                    change: quote.regularMarketChange,
                    percentChange: quote.regularMarketChangePercent
                };
            })
        );

        const topSensexCompanies = await Promise.all(
            sensexCompanies.map(async (symbol) => {
                const quote = await yahooFinance.quote(symbol);
                return {
                    name: quote.shortName || symbol,
                    price: quote.regularMarketPrice,
                    change: quote.regularMarketChange,
                    percentChange: quote.regularMarketChangePercent
                };
            })
        );

        // 🔥 Fetch stock-related news using Google News RSS
        const feed = await parser.parseURL('https://news.google.com/rss/search?q=indian+stock+market&hl=en-IN&gl=IN&ceid=IN:en');
        const newsArticles = feed.items.slice(0, 10);

        res.render('stocks', {
            nifty,
            sensex,
            niftyHistory,
            sensexHistory,
            topNiftyCompanies,
            topSensexCompanies,
            newsArticles,
            error: null
        });

    } catch (err) {
        console.error(err);
        res.render('stocks', {
            error: 'Failed to fetch stock data or news.',
            nifty: null,
            sensex: null,
            niftyHistory: [],
            sensexHistory: [],
            topNiftyCompanies: [],
            topSensexCompanies: [],
            newsArticles: []
        });
    }
});

module.exports = router;
