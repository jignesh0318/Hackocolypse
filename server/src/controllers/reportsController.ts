import { Request, Response } from 'express';
import Report from '../models/Report';

// Create a new report
export const createReport = async (req: Request, res: Response) => {
    const { userId, zoneId, description } = req.body;

    try {
        const newReport = new Report({ userId, zoneId, description });
        await newReport.save();
        res.status(201).json(newReport);
    } catch (error) {
        res.status(500).json({ message: 'Error creating report', error });
    }
};

// Get all reports
export const getReports = async (req: Request, res: Response) => {
    try {
        const reports = await Report.find().populate('userId').populate('zoneId');
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reports', error });
    }
};