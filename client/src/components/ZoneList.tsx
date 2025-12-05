import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Zone {
    _id: string;
    name: string;
    description: string;
    coordinates: number[];
}

const ZoneList: React.FC = () => {
    const [zones, setZones] = useState<Zone[]>([]);

    useEffect(() => {
        const fetchZones = async () => {
            try {
                const response = await axios.get('/api/zones');
                const data = response.data;
                // Ensure we always have an array to map over
                if (Array.isArray(data)) {
                    setZones(data);
                } else {
                    console.warn('Unexpected zones payload, expected array:', data);
                    setZones([]);
                }
            } catch (error) {
                console.error('Error fetching zones:', error);
                setZones([]);
            }
        };

        fetchZones();
    }, []);

    return (
        <div>
            <h2>Unsafe Zones</h2>
            {zones.length === 0 ? (
                <p>No zones yet.</p>
            ) : (
                <ul>
                    {zones.map((zone) => (
                        <li key={zone._id}>
                            <h3>{zone.name}</h3>
                            <p>{zone.description}</p>
                            <p>Coordinates: {zone.coordinates.join(', ')}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ZoneList;