// routes/fund.js
const express = require('express');
const router = express.Router();
const getFundPerformance = require('../utils/fundFetcher');
const scrapeNews = require('../utils/newsScraper');
const analyzeNews = require('../utils/nlpPipeline');

router.get('/', (req, res) => res.render('index'));

router.post('/analyze', async (req, res) => {
    const fund = req.body.fundQuery;
    const perf = await getFundPerformance(fund);
    const news = await scrapeNews(fund);
    const analyzedNews = await analyzeNews(news);
    res.render('result', { fund, perf, analyzedNews });
});

module.exports = router;
