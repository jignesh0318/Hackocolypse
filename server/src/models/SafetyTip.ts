import mongoose, { Document, Schema } from 'mongoose';

export interface ISafetyTip extends Document {
    title: string;
    description: string;
    category: string;
    severity: 'low' | 'medium' | 'high';
    icon: string;
    content: string;
    source?: string;
    isActive: boolean;
    views: number;
    likes: number;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const SafetyTipSchema: Schema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        maxlength: 500
    },
    category: {
        type: String,
        enum: ['prevention', 'awareness', 'response', 'emergency', 'travel', 'digital_safety', 'self_defense'],
        required: true,
        index: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    icon: {
        type: String,
        default: '💡'
    },
    content: {
        type: String,
        required: true
    },
    source: {
        type: String,
        default: 'SafeZone AI'
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String,
        lowercase: true
    }]
}, { timestamps: true });

export default mongoose.model<ISafetyTip>('SafetyTip', SafetyTipSchema);
