import { Request, Response } from 'express';
import Zone from '../models/Zone';

// Create a new zone
export const createZone = async (req: Request, res: Response) => {
    try {
        const zone = new Zone(req.body);
        await zone.save();
        res.status(201).json(zone);
    } catch (error) {
        res.status(400).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};

// Get all zones
export const getZones = async (_: unknown, res: Response) => {
    try {
        const zones = await Zone.find();
        res.status(200).json(zones);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};

// Get a zone by ID
export const getZoneById = async (req: Request, res: Response) => {
    try {
        const zone = await Zone.findById(req.params.id);
        if (!zone) return res.status(404).json({ message: 'Zone not found' });
        res.status(200).json(zone);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};

// Update a zone by ID
export const updateZone = async (req: Request, res: Response) => {
    try {
        const zone = await Zone.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!zone) return res.status(404).json({ message: 'Zone not found' });
        res.status(200).json(zone);
    } catch (error) {
        res.status(400).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};

// Delete a zone by ID
export const deleteZone = async (req: Request, res: Response) => {
    try {
        const zone = await Zone.findByIdAndDelete(req.params.id);
        if (!zone) return res.status(404).json({ message: 'Zone not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};