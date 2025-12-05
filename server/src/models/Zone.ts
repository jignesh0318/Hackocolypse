import mongoose from 'mongoose';

const zoneSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    coordinates: {
        type: {
            type: String,
            enum: ['Point'], // 'Point' for GeoJSON
            required: true,
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
        },
    },
}, {
    timestamps: true,
});

zoneSchema.index({ coordinates: '2dsphere' }); // Create a 2dsphere index for geospatial queries

const Zone = mongoose.model('Zone', zoneSchema);

export default Zone;