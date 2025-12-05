import express from 'express';
import { createZone, getZones, updateZone, deleteZone } from '../controllers/zonesController';

const router = express.Router();

// Route to create a new zone
router.post('/', createZone);

// Route to get all zones
router.get('/', getZones);

// Route to update a zone by ID
router.put('/:id', updateZone);

// Route to delete a zone by ID
router.delete('/:id', deleteZone);

export default router;