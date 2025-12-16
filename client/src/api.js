import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getPolls = async () => {
  const response = await axios.get(`${API_URL}/api/polls`);
  return response.data;
};

export const getPollById = async (id) => {
  const response = await axios.get(`${API_URL}/api/polls/${id}`);
  return response.data;
};

export const createPoll = async (pollData) => {
  const response = await axios.post(`${API_URL}/api/polls`, pollData);
  return response.data;
};
