// testHF.js
const axios = require('axios');

const HF_API_KEY = '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'; // your actual token

async function test() {
    const question = "Why did the QQQ ETF drop today?";
    const context = "The Nasdaq fell due to rising interest rates and weak tech earnings.";

    try {
        const res = await axios.post(
            'https://api-inference.huggingface.co/models/deepset/roberta-base-squad2',
            {
                inputs: { question, context }
            },
            {
                headers: {
                    Authorization: `Bearer ${HF_API_KEY}`
                }
            }
        );

        console.log("✅ Response:", res.data);
    } catch (error) {
        console.error("❌ Hugging Face API Error:", error.response?.data || error.message);
    }
}

test();
