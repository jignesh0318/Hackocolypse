import mongoose, { Document, Schema } from 'mongoose';

export interface ISOSAlert extends Document {
    userId: mongoose.Types.ObjectId;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    address: string;
    status: 'active' | 'resolved' | 'false_alarm';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description?: string;
    emergencyContacts: mongoose.Types.ObjectId[];
    responders: mongoose.Types.ObjectId[];
    evidence: {
        imageUrl?: string;
        audioUrl?: string;
        videoUrl?: string;
    };
    resolution: {
        resolvedAt?: Date;
        resolvedBy?: mongoose.Types.ObjectId;
        notes?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const SOSAlertSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
            validate: {
                validator: function(v: number[]) {
                    return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
                },
                message: 'Invalid coordinates'
            }
        }
    },
    address: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['active', 'resolved', 'false_alarm'],
        default: 'active',
        index: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'high'
    },
    description: {
        type: String,
        maxlength: 500
    },
    emergencyContacts: [{
        type: Schema.Types.ObjectId,
        ref: 'EmergencyContact'
    }],
    responders: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    evidence: {
        imageUrl: String,
        audioUrl: String,
        videoUrl: String
    },
    resolution: {
        resolvedAt: Date,
        resolvedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        notes: String
    }
}, { timestamps: true });

// Create geospatial index for location-based queries
SOSAlertSchema.index({ 'location': '2dsphere' });

export default mongoose.model<ISOSAlert>('SOSAlert', SOSAlertSchema);
