// utils/newsScraper.js
const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeNews(keyword) {
    const url = `https://www.google.com/search?q=${keyword}+site:reuters.com&tbm=nws`;
    const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const $ = cheerio.load(data);
    const news = [];
    $('a').each((i, link) => {
        const title = $(link).text();
        const href = $(link).attr('href');
        if (title && href && href.includes('http')) {
            news.push({ title, url: href });
        }
    });
    return news.slice(0, 5); // Top 5 news
}
module.exports = scrapeNews;
