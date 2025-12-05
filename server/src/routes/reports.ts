import express from 'express';
import { createReport, getReports } from '../controllers/reportsController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Route to create a new report
router.post('/', authenticateToken, createReport);

// Route to get all reports
router.get('/', getReports);

export default router;