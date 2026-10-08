import { Router } from 'express';
import * as VoiceController from '../controllers/voice.controller';

const router = Router();

// Vapi phone assistant: tool calls + call events. Authenticated by shared secret.
router.post('/vapi', VoiceController.vapiWebhook);

export default router;
