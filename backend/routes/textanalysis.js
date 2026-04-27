const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/analyze', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant specialized in Autism Spectrum Disorder (ASD) behavioral analysis. 
Always respond ONLY with valid JSON, no extra text, no markdown, no backticks.`
        },
        {
          role: 'user',
          content: `Analyze this text from an individual with ASD: "${text}"

Respond ONLY in this exact JSON format:
{
  "emotions": {
    "frustration": <number 0-100>,
    "anxiety": <number 0-100>,
    "happiness": <number 0-100>,
    "sadness": <number 0-100>,
    "calm": <number 0-100>
  },
  "dominant_emotion": "<single word>",
  "intent": "<one sentence describing what person is communicating>",
  "sarcasm_detected": <true or false>,
  "caregiver_suggestion": "<2 sentences of specific actionable advice for caregiver>",
  "alert_level": "<low, medium, or high>"
}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const raw = completion.choices[0].message.content.trim();
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);

  } catch (err) {
    console.error('Groq error:', err.message);
    res.status(500).json({ error: 'Analysis failed', detail: err.message });
  }
});

module.exports = router;