import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/auth';

export const login = async ({ usernameOrEmail, password }) => {
    console.log("Sending login request with:", { usernameOrEmail });

    try {
        const response = await axios.post(`${API_BASE_URL}/login`, { usernameOrEmail, password });

        console.log("Login successful:", response.data);
        return response;
    } catch (error) {
    if (error.response) {
        console.error("Server responded with error:", error.response.data);
    } else if (error.request) {
        console.error("No response received from server:", error.request);
    } else {
        console.error("Error setting up request:", error.message);
    }

    throw error;
    }
};

export const register = (data) => axios.post(`${API_BASE_URL}/register`, data);

export const forgotPassword = (data) => axios.post(`${API_BASE_URL}/forgot-password`, data);

export const resetPassword = (token, data) =>
    axios.post(`${API_BASE_URL}/reset-password/${token}`, data);