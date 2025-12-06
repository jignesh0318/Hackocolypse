import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import EmergencyContact from '../models/EmergencyContact';
import SOSAlert from '../models/SOSAlert';
import SafetyTip from '../models/SafetyTip';
import SOSDevice from '../models/SOSDevice';
import RouteTracking from '../models/RouteTracking';
import Bubble from '../models/Bubble';
import Report from '../models/Report';
import Zone from '../models/Zone';
import VoicePreference from '../models/VoicePreference';

dotenv.config();

const initializeDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('✅ Connected to MongoDB');

        // Create all indexes
        console.log('\n📑 Creating indexes...');
        
        // User indexes
        await User.collection.createIndex({ username: 1 }, { unique: true });
        await User.collection.createIndex({ email: 1 }, { sparse: true });
        console.log('✓ User indexes created');

        // Emergency Contact indexes
        await EmergencyContact.collection.createIndex({ userId: 1 });
        await EmergencyContact.collection.createIndex({ phone: 1 });
        console.log('✓ EmergencyContact indexes created');

        // SOS Alert indexes
        await SOSAlert.collection.createIndex({ userId: 1 });
        await SOSAlert.collection.createIndex({ status: 1 });
        await SOSAlert.collection.createIndex({ 'location': '2dsphere' });
        await SOSAlert.collection.createIndex({ createdAt: -1 });
        console.log('✓ SOSAlert indexes created');

        // Safety Tip indexes
        await SafetyTip.collection.createIndex({ category: 1 });
        await SafetyTip.collection.createIndex({ isActive: 1 });
        await SafetyTip.collection.createIndex({ tags: 1 });
        console.log('✓ SafetyTip indexes created');

        // SOS Device indexes
        await SOSDevice.collection.createIndex({ userId: 1 });
        await SOSDevice.collection.createIndex({ status: 1 });
        console.log('✓ SOSDevice indexes created');

        // Route Tracking indexes
        await RouteTracking.collection.createIndex({ userId: 1 });
        await RouteTracking.collection.createIndex({ status: 1 });
        await RouteTracking.collection.createIndex({ 'startLocation': '2dsphere' });
        await RouteTracking.collection.createIndex({ 'endLocation': '2dsphere' });
        console.log('✓ RouteTracking indexes created');

        // Bubble indexes
        await Bubble.collection.createIndex({ creator: 1 });
        await Bubble.collection.createIndex({ inviteCode: 1 }, { unique: true });
        console.log('✓ Bubble indexes created');

        // Report indexes
        await Report.collection.createIndex({ userId: 1 });
        await Report.collection.createIndex({ type: 1 });
        console.log('✓ Report indexes created');

        // Zone indexes
        await Zone.collection.createIndex({ 'location': '2dsphere' });
        console.log('✓ Zone indexes created');

        // Voice Preference indexes
        await VoicePreference.collection.createIndex({ userId: 1 }, { unique: true });
        console.log('✓ VoicePreference indexes created');

        console.log('\n📦 Creating sample safety tips...');

        // Create sample safety tips if collection is empty
        const tipCount = await SafetyTip.countDocuments();
        if (tipCount === 0) {
            const sampleTips = [
                {
                    title: 'Stay Alert in Crowded Places',
                    description: 'Be aware of your surroundings in busy areas',
                    category: 'awareness',
                    severity: 'medium',
                    icon: '👀',
                    content: 'In crowded places like markets or transport hubs, keep your valuables secure, avoid distractions, and stay aware of suspicious activities. Trust your instincts.',
                    tags: ['crowded', 'awareness', 'prevention'],
                    isActive: true
                },
                {
                    title: 'Share Your Route with Trusted Contacts',
                    description: 'Let someone know where you are going',
                    category: 'prevention',
                    severity: 'high',
                    icon: '📍',
                    content: 'Always inform a trusted friend or family member about your travel plans, expected arrival time, and the route you will take. Use the SafeZone app to share your live location.',
                    tags: ['route', 'safety', 'sharing'],
                    isActive: true
                },
                {
                    title: 'Trust Your Gut Feeling',
                    description: 'Your intuition is often right',
                    category: 'awareness',
                    severity: 'high',
                    icon: '🎯',
                    content: 'If something feels wrong, it probably is. Leave uncomfortable situations immediately. Change routes, go to a crowded area, or call for help if needed.',
                    tags: ['intuition', 'awareness', 'response'],
                    isActive: true
                },
                {
                    title: 'Keep Emergency Contacts Updated',
                    description: 'Ensure your emergency contacts are always current',
                    category: 'prevention',
                    severity: 'high',
                    icon: '📞',
                    content: 'Maintain updated emergency contact information including phone numbers of trusted friends, family, and local authorities. Verify they are reachable.',
                    tags: ['emergency', 'contacts', 'prevention'],
                    isActive: true
                },
                {
                    title: 'Digital Safety Tips',
                    description: 'Protect yourself online',
                    category: 'digital_safety',
                    severity: 'medium',
                    icon: '🔒',
                    content: 'Use strong passwords, enable two-factor authentication, avoid public WiFi for sensitive activities, and be cautious with personal information shared online.',
                    tags: ['digital', 'security', 'privacy'],
                    isActive: true
                }
            ];

            await SafetyTip.insertMany(sampleTips);
            console.log(`✓ Created ${sampleTips.length} sample safety tips`);
        }

        console.log('\n✅ Database initialization completed successfully!');
        console.log('\n📋 Summary:');
        console.log(`   • Collections created and indexed`);
        console.log(`   • Sample data loaded`);
        console.log(`   • Ready for production use\n`);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
};

// Run initialization
initializeDatabase();
