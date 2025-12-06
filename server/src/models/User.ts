import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false
    },
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    profilePicture: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    // Location data
    lastLocation: {
        latitude: Number,
        longitude: Number,
        timestamp: Date,
        accuracy: Number
    },
    // Safety settings
    safetyEnabled: {
        type: Boolean,
        default: true
    },
    sosEnabled: {
        type: Boolean,
        default: true
    },
    // Emergency preferences
    emergencyContacts: [{
        name: String,
        phone: String,
        relation: String
    }],
    trustedCircles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bubble'
    }],
    // Device information
    deviceInfo: {
        deviceId: String,
        deviceName: String,
        osType: String,
        osVersion: String
    },
    // Verification
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    // Preferences
    preferences: {
        language: { type: String, default: 'en' },
        notifications: { type: Boolean, default: true },
        soundEnabled: { type: Boolean, default: true },
        darkMode: { type: Boolean, default: true }
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;