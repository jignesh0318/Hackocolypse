import mongoose, { Document, Schema } from 'mongoose';

export interface IVoicePreference extends Document {
    userId: mongoose.Types.ObjectId;
    voiceEnabled: boolean;
    wakeWordEnabled: boolean;
    wakeWord: string;
    language: string;
    volume: number;
    voiceGender: 'male' | 'female' | 'neutral';
    createdAt: Date;
    updatedAt: Date;
}

const VoicePreferenceSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    voiceEnabled: {
        type: Boolean,
        default: true,
    },
    wakeWordEnabled: {
        type: Boolean,
        default: true,
    },
    wakeWord: {
        type: String,
        default: 'Hey SafeZone',
    },
    language: {
        type: String,
        default: 'en-US',
    },
    volume: {
        type: Number,
        default: 1,
        min: 0,
        max: 1,
    },
    voiceGender: {
        type: String,
        enum: ['male', 'female', 'neutral'],
        default: 'neutral',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model<IVoicePreference>('VoicePreference', VoicePreferenceSchema);
