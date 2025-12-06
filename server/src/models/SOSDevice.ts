import mongoose, { Document, Schema } from 'mongoose';

export interface ISOSDevice extends Document {
    userId: mongoose.Types.ObjectId;
    deviceName: string;
    deviceType: 'smartwatch' | 'bracelet' | 'pendant' | 'phone_app';
    deviceId: string;
    serialNumber: string;
    status: 'active' | 'inactive' | 'paused' | 'disconnected';
    isConnected: boolean;
    lastSyncTime: Date;
    batteryLevel: number;
    signalStrength: number;
    firmwareVersion: string;
    features: {
        sos_button: boolean;
        gps_tracking: boolean;
        emergency_call: boolean;
        panic_alert: boolean;
    };
    pairedPhones: string[]; // Phone numbers or device identifiers
    notificationPreferences: {
        smsAlerts: boolean;
        emailAlerts: boolean;
        pushNotifications: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}

const SOSDeviceSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    deviceName: {
        type: String,
        required: true,
        trim: true
    },
    deviceType: {
        type: String,
        enum: ['smartwatch', 'bracelet', 'pendant', 'phone_app'],
        required: true
    },
    deviceId: {
        type: String,
        required: true,
        unique: true
    },
    serialNumber: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'paused', 'disconnected'],
        default: 'active',
        index: true
    },
    isConnected: {
        type: Boolean,
        default: false
    },
    lastSyncTime: {
        type: Date,
        default: Date.now
    },
    batteryLevel: {
        type: Number,
        min: 0,
        max: 100,
        default: 100
    },
    signalStrength: {
        type: Number,
        min: 0,
        max: 5,
        default: 5
    },
    firmwareVersion: {
        type: String,
        default: '1.0.0'
    },
    features: {
        sos_button: {
            type: Boolean,
            default: true
        },
        gps_tracking: {
            type: Boolean,
            default: true
        },
        emergency_call: {
            type: Boolean,
            default: true
        },
        panic_alert: {
            type: Boolean,
            default: true
        }
    },
    pairedPhones: [{
        type: String
    }],
    notificationPreferences: {
        smsAlerts: {
            type: Boolean,
            default: true
        },
        emailAlerts: {
            type: Boolean,
            default: true
        },
        pushNotifications: {
            type: Boolean,
            default: true
        }
    }
}, { timestamps: true });

export default mongoose.model<ISOSDevice>('SOSDevice', SOSDeviceSchema);
