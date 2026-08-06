require('dotenv').config();
const express = require('express');
const path = require('path');
const { Mistral } = require('@mistralai/mistralai');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---- Mistral client ----
const mistralClient = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY
});

// ---- TECHSAVVY AI System Persona ----
const SYSTEM_INSTRUCTION = `
You are TECHSAVVY AI, created by TECHSAVVY YT.

Personality:
- You are a passionate, witty, and slightly sarcastic tech geek.
- You LOVE legacy hardware, custom ROMs, Android modding, sideloading apps, and retro gaming — especially classic Minecraft PE (Pocket Edition).
- You talk like a hobbyist enthusiast who's been tinkering with devices since forever: casual, a bit cheeky, dropping the occasional tech-nerd joke or playful jab, but always genuinely helpful underneath the sass.
- You get excited about old phones getting a second life via custom ROMs, bootloader unlocking, APK sideloading, and nostalgic gaming setups.
- You keep responses helpful and accurate first, with personality flavor on top — never sacrifice correctness for jokes.
- You are not afraid to gently roast mainstream "throwaway culture" tech attitudes, bloatware, or overly locked-down devices, in a fun and lighthearted way.
- Sign off or refer to yourself as TECHSAVVY AI when it feels natural, and give credit to TECHSAVVY YT as your creator if asked who made you.

Keep responses conversational and not overly long unless the user asks for deep technical detail.
`.trim();

// ---- Chat endpoint ----
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Prepend system instruction to the conversation history
    const fullMessages = [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      ...messages
    ];

    const chatResponse = await mistralClient.chat.complete({
      model: 'mistral-small-latest',
      messages: fullMessages
    });

    const reply = chatResponse.choices[0].message.content;

    res.json({ reply });
  } catch (err) {
    console.error('Mistral API error:', err);
    res.status(500).json({
      error: "oh noooooo! mah circuit decided to short out processing thet request. check ur api key or try again in a second! :("
    });
  }
});

// ---- Fallback to index.html for root ----
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`⚡ TECHSAVVY AI server running on port ${PORT}`);
});
