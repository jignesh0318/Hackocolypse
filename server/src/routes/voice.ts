import express from 'express';
import VoicePreference from '../models/VoicePreference';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get user's voice preferences
router.get('/preferences', authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        let preferences = await VoicePreference.findOne({ userId });

        // Create default preferences if they don't exist
        if (!preferences) {
            preferences = new VoicePreference({ userId });
            await preferences.save();
        }

        res.status(200).json({
            preferences: {
                voiceEnabled: preferences.voiceEnabled,
                wakeWordEnabled: preferences.wakeWordEnabled,
                wakeWord: preferences.wakeWord,
                language: preferences.language,
                volume: preferences.volume,
                voiceGender: preferences.voiceGender,
            },
        });
    } catch (error) {
        console.error('Error fetching voice preferences:', error);
        res.status(500).json({ message: 'Failed to fetch voice preferences' });
    }
});

// Update voice preferences
router.put('/preferences', authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { voiceEnabled, wakeWordEnabled, wakeWord, language, volume, voiceGender } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        let preferences = await VoicePreference.findOne({ userId });

        if (!preferences) {
            preferences = new VoicePreference({ userId });
        }

        if (voiceEnabled !== undefined) preferences.voiceEnabled = voiceEnabled;
        if (wakeWordEnabled !== undefined) preferences.wakeWordEnabled = wakeWordEnabled;
        if (wakeWord) preferences.wakeWord = wakeWord;
        if (language) preferences.language = language;
        if (volume !== undefined) preferences.volume = Math.max(0, Math.min(1, volume));
        if (voiceGender) preferences.voiceGender = voiceGender;

        preferences.updatedAt = new Date();
        await preferences.save();

        res.status(200).json({
            message: 'Voice preferences updated successfully',
            preferences: {
                voiceEnabled: preferences.voiceEnabled,
                wakeWordEnabled: preferences.wakeWordEnabled,
                wakeWord: preferences.wakeWord,
                language: preferences.language,
                volume: preferences.volume,
                voiceGender: preferences.voiceGender,
            },
        });
    } catch (error) {
        console.error('Error updating voice preferences:', error);
        res.status(500).json({ message: 'Failed to update voice preferences' });
    }
});

// Process voice command
router.post('/command', authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { command, transcript } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!command || !transcript) {
            return res.status(400).json({ message: 'Command and transcript are required' });
        }

        let response = '';
        let action = '';
        let success = false;

        const lowerCommand = command.toLowerCase();

        // SOS/Emergency Command
        if (lowerCommand.includes('help') || lowerCommand.includes('emergency') || lowerCommand.includes('sos')) {
            action = 'SOS_TRIGGERED';
            response = 'Emergency alert has been triggered. Help is on the way.';
            success = true;

            // Log SOS event
            console.log('Voice SOS triggered for user:', userId, 'Transcript:', transcript);
        }
        // Location Command
        else if (lowerCommand.includes('location') || lowerCommand.includes('where') || lowerCommand.includes('track')) {
            action = 'LOCATION_SHARE';
            response = 'Your location has been shared with emergency contacts.';
            success = true;
            console.log('Voice location share triggered for user:', userId);
        }
        // Safety Tips Command
        else if (lowerCommand.includes('tips') || lowerCommand.includes('safety') || lowerCommand.includes('advice')) {
            action = 'SAFETY_TIPS';
            response = 'Here are some safety tips: Stay aware of your surroundings, keep your phone charged, and trust your instincts. Never share personal information with strangers.';
            success = true;
        }
        // Route Command
        else if (lowerCommand.includes('route') || lowerCommand.includes('map') || lowerCommand.includes('navigate')) {
            action = 'OPEN_ROUTE';
            response = 'Opening your route information and map.';
            success = true;
        }
        // Help/Status Command
        else if (lowerCommand.includes('help') || lowerCommand.includes('what') || lowerCommand.includes('can')) {
            action = 'HELP_INFO';
            response = 'I am SafeZone AI Voice Assistant. I can help you with emergencies, location sharing, safety tips, and navigation. Say "Hey SafeZone" followed by your command.';
            success = true;
        }
        // Unknown Command
        else {
            action = 'UNKNOWN_COMMAND';
            response = 'I did not understand that command. You can say: emergency, location, safety tips, or route.';
            success = false;
        }

        res.status(200).json({
            message: 'Command processed successfully',
            command: action,
            response: response,
            success: success,
            transcript: transcript,
        });
    } catch (error) {
        console.error('Error processing voice command:', error);
        res.status(500).json({ message: 'Failed to process voice command' });
    }
});

// Log voice interaction
router.post('/log', authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { command, transcript, success } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        console.log('Voice Interaction Log:', {
            userId,
            command,
            transcript,
            success,
            timestamp: new Date().toISOString(),
        });

        res.status(200).json({ message: 'Voice interaction logged' });
    } catch (error) {
        console.error('Error logging voice interaction:', error);
        res.status(500).json({ message: 'Failed to log voice interaction' });
    }
});

export default router;
