import { GoogleGenerativeAI } from '@google/generative-ai';
import { retrieveContext, getSystemPrompt } from '../rag/retriever.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * POST /api/chat/stream
 * 
 * Streams the Gemini response back as Server-Sent Events (SSE).
 * Frontend reads chunks and appends them in real time.
 * 
 * SSE format:
 *   data: {"chunk":"...text..."}   — incremental text
 *   data: {"done":true}            — stream finished
 *   data: {"error":"..."}          — error occurred
 */
export const chatStream = async (req, res) => {
  const { message, history = [] } = req.body;
  const { role, name, id: userId } = req.user;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Message is required' });
  }

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return res.status(503).json({
      message: 'AI service not configured. Add GEMINI_API_KEY to .env',
      setupRequired: true,
    });
  }

  // ── Set SSE headers ───────────────────────────────────────────────────────
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable nginx buffering if present
  res.flushHeaders();

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    // ── RAG: retrieve live warehouse data scoped to this role ─────────────
    const warehouseContext = await retrieveContext(role);

    // ── Build system instruction: role rules + live DB data ───────────────
    const systemInstruction =
      getSystemPrompt(role, name) +
      '\n\n--- LIVE WAREHOUSE DATA ---\n' +
      warehouseContext;

    // ── Init Gemini with system instruction ───────────────────────────────
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      systemInstruction,
    });

    // ── Start chat session with conversation history (last 10 turns) ──────
    const chatSession = model.startChat({
      history: history.slice(-10),
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.3, // low = factual, grounded in the data
      },
    });

    // ── Stream response ───────────────────────────────────────────────────
    const streamResult = await chatSession.sendMessageStream(message);

    for await (const chunk of streamResult.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        send({ chunk: chunkText });
      }
    }

    // Signal completion
    send({ done: true });
    res.end();

  } catch (err) {
    console.error('[Chat Stream Error]', err.message);

    if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('API key')) {
      send({ error: 'Invalid Gemini API key. Check your .env file.' });
    } else if (err.status === 429 || err.message?.includes('quota')) {
      send({ error: 'AI rate limit reached. Please wait a moment and try again.' });
    } else {
      send({ error: 'AI service error. Please try again.' });
    }

    res.end();
  }
};

/**
 * GET /api/chat/suggestions
 * Role-specific suggested questions shown in the chat UI.
 */
export const getSuggestions = (req, res) => {
  const { role } = req.user;

  const suggestions = {
    staff: [
      'How much stock does the Laptop have?',
      'Which items are running low?',
      'Where is Printer Paper stored?',
      'What is the current stock of Steel Wire?',
    ],
    supervisor: [
      'Which items are below their minimum threshold?',
      'Show me recent stock movements',
      'What items are out of stock?',
      'How many units of Cardboard Box do we have?',
    ],
    manager: [
      'Which items are selling fastest?',
      'What is our total revenue for the last 30 days?',
      'What should we reorder urgently?',
      'Show me low stock items with days until stockout',
      'Which category has the highest inventory value?',
    ],
    admin: [
      'Give me a full warehouse health summary',
      'How many users are active in the system?',
      'Which items need immediate restocking?',
      'What is the total inventory value?',
      'Show stock movement activity for the last 7 days',
      'Which user roles are assigned in the system?',
    ],
  };

  res.json({ success: true, suggestions: suggestions[role] || suggestions.staff });
};
