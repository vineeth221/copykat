// routes/chatbot.js
import express from "express";
import faqs from "../Faqs.js";
import stringSimilarity from "string-similarity";

const router = express.Router();

router.post("/chatbot", (req, res) => {
  const userQuestion = req.body.question.toLowerCase();
  const questionsArray = faqs.map((faq) => faq.question.toLowerCase());

  const matches = stringSimilarity.findBestMatch(userQuestion, questionsArray);
  const bestMatch = faqs.find(
    (faq) => faq.question.toLowerCase() === matches.bestMatch.target
  );

  if (matches.bestMatch.rating >= 0.4 && bestMatch) {
    res.json({ answer: bestMatch.answer });
  } else {
    res.json({
      answer:
        "I'm not sure how to answer that. Please contact our support team or check the Help Center.",
    });
  }
});

// ✅ Use export default so Server.js can import properly
export default router;
