import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/auth';

export const register = async ({username, email, password}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, {
      username,
      email,
      password,
    }, { withCredentials: true });
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const login = async ({email, password}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      email,
      password,
    }, { withCredentials: true });
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const logout = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/logout`, { withCredentials: true });
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const getMe = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get-me`, { withCredentials: true });
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
