const express = require("express");
const router = express.Router();
const faqs = require("../Faqs.js");
const stringSimilarity = require("string-similarity");

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

module.exports = router;
