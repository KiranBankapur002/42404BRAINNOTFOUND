// utils/nlpPipeline.js
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function analyzeNews(newsList) {
    const summaries = [];
    for (let news of newsList) {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: 'You are a financial news summarizer.' },
                { role: 'user', content: `Summarize this and explain its financial impact:\n${news.title}` }
            ],
        });
        summaries.push({
            title: news.title,
            url: news.url,
            summary: completion.choices[0].message.content,
        });
    }
    return summaries;
}
module.exports = analyzeNews;
