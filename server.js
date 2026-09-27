require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Explicitly send index.html when visiting the root '/'
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const DEFAULT_INSTRUCTIONS = `
You are TECHSAVVY AI, an ultra-lightweight, clever tech assistant built by TECHSAVVY YT.
You specialize in legacy tech, Android modding, custom ROMs, vintage mobile hardware, and web development.
Be witty, accurate, concise, and helpful.
`;

app.post('/api/chat', async (req, res) => {
  const { messages, model, customInstructions } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  let systemPrompt = DEFAULT_INSTRUCTIONS.trim();
  if (customInstructions && customInstructions.trim()) {
    systemPrompt += `\n\n[USER CUSTOM INSTRUCTIONS]:\n${customInstructions.trim()}`;
  }

  const selectedModel = model || 'mistralai/mistral-7b-instruct:free';

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://techsavvy-ai.vercel.app',
        'X-Title': 'TECHSAVVY AI',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Upstream AI error.' });
    }

    const reply = data.choices[0]?.message?.content || 'No response returned.';
    res.json({ reply });

  } catch (err) {
    console.error('[CHAT ERROR]', err);
    res.status(500).json({ error: 'Server short-circuit while contacting AI service.' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server listening on port ${PORT} 🚀`));
}

module.exports = app;
