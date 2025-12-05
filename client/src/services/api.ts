import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Adjust the URL as needed

// Function to register a new user
export const registerUser = async (userData: Record<string, unknown>) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
};

// Function to login a user
export const loginUser = async (credentials: Record<string, unknown>) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
};

// Function to get all unsafe zones
export const getZones = async () => {
    const response = await axios.get(`${API_URL}/zones`);
    return response.data;
};

// Function to create a new zone
export const createZone = async (zoneData: Record<string, unknown>) => {
    const response = await axios.post(`${API_URL}/zones`, zoneData);
    return response.data;
};

// Function to report an unsafe zone
export const reportZone = async (reportData: Record<string, unknown>) => {
    const response = await axios.post(`${API_URL}/reports`, reportData);
    return response.data;
};

// Function to get all reports
export const getReports = async () => {
    const response = await axios.get(`${API_URL}/reports`);
    return response.data;
};