import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/auth.js';
import { generatePlan, savePlan, listPlans, getPlan, deletePlan, downloadPdf, chat, clearChat } from '../controllers/planController.js';

const router = Router();
// AI calls cost money, so cap them per IP.
const aiLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 60, message: { message: 'Too many AI requests. Try again in a while.' } });

router.use(protect);
router.get('/', listPlans);
router.post('/', savePlan);
router.post('/generate', aiLimiter, generatePlan);
router.get('/:id', getPlan);
router.delete('/:id', deletePlan);
router.get('/:id/pdf', downloadPdf);
router.post('/:id/chat', aiLimiter, chat);
router.delete('/:id/chat', clearChat);

export default router;
