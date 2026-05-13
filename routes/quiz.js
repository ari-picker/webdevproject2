var express = require('express');
var router = express.Router();
var axios = require("axios");           // Axios makes HTTP requests — we use it to call the Groq API
const { getCollection } = require('../models/db');

// Helper function: fetch a user's last 10 quiz attempts from MongoDB
async function getHistory(email) {
  try {
    let conn = getCollection("quiz_history");
    return await conn.find({ userEmail: email })
      .sort({ timestamp: -1 }).limit(10).toArray();
  } catch(e) {
    return [];
  }
}

// POST /quiz/generate — call the Groq API to create a quiz on the given topic
router.post("/generate", async (req, res) => {
  let name = req.signedCookies.userName;
  if (!name) {
    res.redirect("/signin");
    return;
  }
  try {
    let topic = req.body.topic;
    // Default to 5 questions, clamp between 1 and 10
    let numQuestions = parseInt(req.body.numQuestions) || 5;
    if (numQuestions < 1) numQuestions = 1;
    if (numQuestions > 10) numQuestions = 10;

    // Build a prompt that tells the AI exactly what JSON structure to return
    // response_format: { type: "json_object" } forces valid JSON from the model
    const prompt = `Generate a ${numQuestions}-question multiple choice quiz about "${topic}". 
Return ONLY valid JSON with this structure:
{
  "title": "Quiz title",
  "questions": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0
    }
  ]
}
correctIndex is the 0-based index of the correct option.`;

    // POST to Groq's OpenAI-compatible endpoint — same pattern as the Axios weather API lesson
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": "Bearer " + process.env.GROQ_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    // Parse the JSON the AI returned and store it as quiz data
    let quizData = JSON.parse(response.data.choices[0].message.content);
    quizData.topic = topic;
    let history = await getHistory(req.signedCookies.userEmail);
    // Re-render dashboard with the generated quiz (result is null since they haven't answered yet)
    res.render("dashboard", {
      name: name,
      quiz: quizData,
      result: null,
      error: null,
      history: history
    });
  } catch (e) {
    console.error(e);
    let history = await getHistory(req.signedCookies.userEmail);
    res.render("dashboard", {
      name: name,
      quiz: null,
      result: null,
      error: "Failed to generate quiz. Check your API key or try a different topic.",
      history: history
    });
  }
});

// POST /quiz/submit — compare user answers to correct answers and save the result
router.post("/submit", async (req, res) => {
  let name = req.signedCookies.userName;
  if (!name) {
    res.redirect("/signin");
    return;
  }
  try {
    let title = req.body.title;
    let questions = JSON.parse(req.body.questionsJson);  // The questions were sent as a hidden form field
    let score = 0;
    let total = questions.length;

    // Loop over each question — req.body["q" + i] is the radio button value the user selected
    let results = questions.map((q, i) => {
      let userAnswer = req.body["q" + i] !== undefined ? parseInt(req.body["q" + i]) : -1;
      let correct = userAnswer === q.correctIndex;
      if (correct) score++;
      return {
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        userAnswer: userAnswer,
        correct: correct
      };
    });

    let quizData = { title: title, questions: questions };
    let topic = req.body.topic || "";

    // Build a history entry and save it to MongoDB
    let historyEntry = {
      userEmail: req.signedCookies.userEmail,
      userName: name,
      topic: topic,
      title: title,
      score: score,
      total: total,
      percentage: Math.round((score / total) * 100),
      results: results,
      timestamp: new Date()
    };
    try {
      let conn = getCollection("quiz_history");
      await conn.insertOne(historyEntry);
    } catch(e) {
      console.error("Failed to save quiz history:", e);
    }

    // Fetch updated history and render the dashboard with results
    let history = await getHistory(req.signedCookies.userEmail);
    res.render("dashboard", {
      name: name,
      quiz: quizData,
      result: { score: score, total: total, results: results },
      error: null,
      history: history
    });
  } catch (e) {
    console.error(e);
    let history = await getHistory(req.signedCookies.userEmail);
    res.render("dashboard", {
      name: name,
      quiz: null,
      result: null,
      error: "Error scoring quiz.",
      history: history
    });
  }
});

module.exports = router;
