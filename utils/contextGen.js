const axios = require('axios');
const OPENAI_API_KEY = 'your_openai_api_key'; // Optional if using GPT-based context

async function generateContext(question) {
    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct',
            {
                inputs: `Generate a helpful paragraph for the question: "${question}"`
            },
            {
                headers: {
                    Authorization: `Bearer ${HF_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data[0]?.generated_text || "No context available.";
    } catch (error) {
        console.error("Context Generation Error:", error.message);
        return "Unable to generate context.";
    }
}


module.exports = generateContext;
