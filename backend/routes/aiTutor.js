const express = require("express");
const router = express.Router();

router.post("/ask", async (req, res) => {
    try {
        const { question, subject, language, grade } = req.body;

        if (!question || !question.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please enter a question."
            });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                message: "Gemini API key is missing."
            });
        }

        const { GoogleGenAI } = await import("@google/genai");

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });

        const prompt = `
You are EDURURAL-AI Tutor, a friendly educational assistant
for rural school students.

Student grade: ${grade || "8 to 10"}
Subject: ${subject || "General"}
Preferred language: ${language || "English"}

Student question: ${question}

Instructions:
1. Explain in simple words suitable for school students.
2. Give step-by-step explanations.
3. Use examples wherever useful.
4. If Kannada is requested, answer in simple Kannada.
5. Be friendly, patient and encouraging.
6. Focus on education and learning.
7. Format answers using proper Markdown.
8. Use headings, bold text and bullet points.
9. Avoid unnecessary introductory text and separator lines.
`;

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: prompt
        });

        res.json({
            success: true,
            answer: response.text
        });

    } catch (error) {
        console.error("AI Tutor Error:", error);

        res.status(500).json({
            success: false,
            message: "AI Tutor could not answer right now. Please try again."
        });
    }
});

module.exports = router;