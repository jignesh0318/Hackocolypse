import express from 'express';
import { sendSOS } from '../controllers/alertsController';

const router = express.Router();

// POST /api/alerts/sos
router.post('/sos', sendSOS);

export default router;
