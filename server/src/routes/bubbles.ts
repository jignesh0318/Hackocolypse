import express from 'express';
import Bubble from '../models/Bubble';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();


// Create a new bubble
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, icon, color, type } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Validate required fields
        if (!name || !icon || !color || !type) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Generate unique invite code
        const inviteCode = `BUBBLE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Create new bubble
        const bubble = new Bubble({
            name,
            icon,
            color,
            type,
            creator: userId,
            members: [userId], // Creator is automatically a member
            inviteCode,
        });

        await bubble.save();

        res.status(201).json({
            message: 'Bubble created successfully',
            bubble: {
                id: bubble._id,
                name: bubble.name,
                icon: bubble.icon,
                color: bubble.color,
                type: bubble.type,
                inviteCode: bubble.inviteCode,
                createdAt: bubble.createdAt,
            },
        });
    } catch (error) {
        console.error('Error creating bubble:', error);
        res.status(500).json({ message: 'Failed to create bubble' });
    }
});

// Get all bubbles for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Find all bubbles where user is a member
        const bubbles = await Bubble.find({ members: userId })
            .sort({ createdAt: -1 })
            .select('name icon color type creator inviteCode createdAt');

        res.status(200).json({
            bubbles: bubbles.map(bubble => ({
                id: bubble._id,
                name: bubble.name,
                icon: bubble.icon,
                color: bubble.color,
                type: bubble.type,
                isCreator: bubble.creator.toString() === userId,
                inviteCode: bubble.inviteCode,
                createdAt: bubble.createdAt,
            })),
        });
    } catch (error) {
        console.error('Error fetching bubbles:', error);
        res.status(500).json({ message: 'Failed to fetch bubbles' });
    }
});

// Join a bubble using invite code
router.post('/join/:code', authenticateToken, async (req, res) => {
    try {
        const { code } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Find bubble by invite code
        const bubble = await Bubble.findOne({ inviteCode: code });

        if (!bubble) {
            return res.status(404).json({ message: 'Invalid invite code' });
        }

        // Check if user is already a member
        if (bubble.members.includes(userId as any)) {
            return res.status(400).json({ message: 'You are already a member of this bubble' });
        }

        // Add user to members
        bubble.members.push(userId as any);
        await bubble.save();

        res.status(200).json({
            message: 'Successfully joined bubble',
            bubble: {
                id: bubble._id,
                name: bubble.name,
                icon: bubble.icon,
                color: bubble.color,
                type: bubble.type,
            },
        });
    } catch (error) {
        console.error('Error joining bubble:', error);
        res.status(500).json({ message: 'Failed to join bubble' });
    }
});

export default router;
