import mongoose, { Document, Schema } from 'mongoose';

export interface IEmergencyContact extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    phone: string;
    email?: string;
    relation: string;
    isPrimary: boolean;
    isVerified: boolean;
    verificationCode?: string;
    createdAt: Date;
    updatedAt: Date;
}

const EmergencyContactSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        match: /^\+?1?\d{9,15}$/
    },
    email: {
        type: String,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        sparse: true
    },
    relation: {
        type: String,
        enum: ['parent', 'sibling', 'friend', 'spouse', 'other'],
        default: 'other'
    },
    isPrimary: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String,
        select: false
    }
}, { timestamps: true });

// Ensure only one primary contact per user
EmergencyContactSchema.pre('save', async function(next) {
    if ((this as any).isPrimary) {
        await mongoose.model('EmergencyContact').updateMany(
            { userId: (this as any).userId, _id: { $ne: (this as any)._id } },
            { isPrimary: false }
        );
    }
    next();
});

export default mongoose.model<IEmergencyContact>('EmergencyContact', EmergencyContactSchema);
