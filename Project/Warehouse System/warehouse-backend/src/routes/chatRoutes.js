import express from 'express';
import { chatStream, getSuggestions } from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
import { chatGuardrails } from '../middleware/chatGuardrails.js';

const router = express.Router();

// Streaming chat — protected by JWT + guardrails
router.post('/stream', authenticate, chatGuardrails, chatStream);

// Suggestions — JWT only, no rate limit needed
router.get('/suggestions', authenticate, getSuggestions);

export default router;
