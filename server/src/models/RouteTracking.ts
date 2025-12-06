import mongoose, { Document, Schema } from 'mongoose';

export interface IRouteTracking extends Document {
    userId: mongoose.Types.ObjectId;
    startLocation: {
        type: 'Point';
        coordinates: [number, number];
    };
    endLocation: {
        type: 'Point';
        coordinates: [number, number];
    };
    startAddress: string;
    endAddress: string;
    routePath: Array<{
        latitude: number;
        longitude: number;
        timestamp: Date;
        speed?: number;
        accuracy?: number;
    }>;
    duration: number; // in seconds
    distance: number; // in meters
    averageSpeed: number; // in km/h
    safetyScore: number; // 0-100
    incidentsOnRoute: mongoose.Types.ObjectId[]; // References to SOSAlerts or Reports
    status: 'ongoing' | 'completed' | 'abandoned';
    sharedWith: mongoose.Types.ObjectId[]; // Users who can track this route
    isPublic: boolean;
    routeName?: string;
    departureTime: Date;
    estimatedArrivalTime?: Date;
    actualArrivalTime?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const RouteTrackingSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    startLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    endLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    startAddress: {
        type: String,
        default: ''
    },
    endAddress: {
        type: String,
        default: ''
    },
    routePath: [{
        latitude: Number,
        longitude: Number,
        timestamp: Date,
        speed: Number,
        accuracy: Number
    }],
    duration: {
        type: Number,
        default: 0
    },
    distance: {
        type: Number,
        default: 0
    },
    averageSpeed: {
        type: Number,
        default: 0
    },
    safetyScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 50
    },
    incidentsOnRoute: [{
        type: Schema.Types.ObjectId,
        ref: 'SOSAlert'
    }],
    status: {
        type: String,
        enum: ['ongoing', 'completed', 'abandoned'],
        default: 'ongoing',
        index: true
    },
    sharedWith: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    isPublic: {
        type: Boolean,
        default: false
    },
    routeName: {
        type: String,
        trim: true
    },
    departureTime: {
        type: Date,
        default: Date.now
    },
    estimatedArrivalTime: Date,
    actualArrivalTime: Date
}, { timestamps: true });

// Create geospatial indexes
RouteTrackingSchema.index({ 'startLocation': '2dsphere' });
RouteTrackingSchema.index({ 'endLocation': '2dsphere' });

export default mongoose.model<IRouteTracking>('RouteTracking', RouteTrackingSchema);
