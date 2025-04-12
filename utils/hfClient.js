const axios = require('axios');
const HF_API_KEY = process.env.HF_API_KEY;

async function generateContext(question) {
    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
            {
                inputs: `Provide a detailed background or explanation for the question: "${question}"`
            },
            {
                headers: {
                    Authorization: `Bearer ${HF_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const generated = response.data?.[0]?.generated_text;
        return generated || "No context available.";
    } catch (error) {
        console.error("Context Generation Error:", error.message);
        return "Unable to generate context.";
    }
}


async function askQuestion(question, context) {
    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/distilbert-base-uncased-distilled-squad',
            {
                inputs: {
                    question: question,
                    context: context
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${HF_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (Array.isArray(response.data)) {
            return response.data[0]?.answer || "No answer found.";
        }

        return response.data.answer || "No answer found.";
    } catch (error) {
        if (error.response?.status === 503) {
            return "⚠️ Model is starting or busy. Try again shortly.";
        }
        return "❌ Error fetching answer.";
    }
}

async function askHuggingFace(question) {
    const context = await generateContext(question);
    console.log("Generated context:", context);

    const answer = await askQuestion(question, context);
    console.log("Generated answer:", answer);

    return {
        answer,
        context
    };
}

module.exports = askHuggingFace;
