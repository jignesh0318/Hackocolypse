import mongoose, { Document, Schema } from 'mongoose';

export interface IBubble extends Document {
    name: string;
    icon: string;
    color: string;
    type: 'permanent' | 'temporary';
    creator: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
    inviteCode: string;
    createdAt: Date;
}

const BubbleSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        maxlength: 20,
    },
    icon: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['permanent', 'temporary'],
        required: true,
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    inviteCode: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model<IBubble>('Bubble', BubbleSchema);
