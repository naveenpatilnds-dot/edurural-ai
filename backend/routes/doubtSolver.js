const express = require("express");
const multer = require("multer");
const { GoogleGenAI } = require("@google/genai");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed."));
        }
    }
});

router.post("/solve", protect, upload.single("image"), async (req, res) => {
    try {
        const { question, subject, language, grade } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a question image."
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

        const imageBase64 = req.file.buffer.toString("base64");

        const prompt = `
You are EDURURAL-AI Doubt Solver.

Student Grade: ${grade || "8"}
Subject: ${subject || "General"}
Preferred Language: ${language || "English"}
Additional Question: ${question || "Solve the question shown in the image."}

Instructions:
1. Carefully read the uploaded image.
2. Identify the actual question.
3. Explain the solution step by step.
4. Use simple language suitable for school students.
5. Show calculations wherever necessary.
6. If Kannada is requested, answer completely in Kannada.
7. If the image is unclear, ask the student to upload a clearer image.
8. Do not invent missing information.
`;

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: req.file.mimetype,
                                data: imageBase64
                            }
                        }
                    ]
                }
            ]
        });

        res.status(200).json({
            success: true,
            answer: response.text
        });

    } catch (error) {
        console.error("Doubt Solver Error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to solve the question right now."
        });
    }
});

module.exports = router;