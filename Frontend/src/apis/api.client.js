import { getToken } from "@clerk/react";
import axios from "axios";

const APP_API_URL = import.meta.env.VITE_appAPI_URL;
const FOOTBALL_API_URL = import.meta.env.VITE_FOOTBALL_API_URL;

const appAPI = axios.create({
  baseURL: APP_API_URL,
  timeout: APP_API_URL?.includes("localhost") ? 5000 : 10000,
});

const footballAPI = axios.create({
  baseURL: FOOTBALL_API_URL,
  timeout: FOOTBALL_API_URL?.includes("localhost") ? 5000 : 10000,
});

appAPI.interceptors.request.use(async (config) => {
  const token = await getToken();

  if (token) {
    config.headers.authorization = `Bearer ${token}`;
  }

  return config;
});

appAPI.interceptors.response.use((res) => res.data);

export { appAPI, footballAPI };
