import axios from "axios";
import fs from "fs";
import { env } from "../Config/env";

const api = axios.create({
  baseURL: "https://v3.football.api-sports.io",
  headers: {
    "x-apisports-key": env.API_FOOTBALL_SECRET_KEY,
  },
});

api.interceptors.response.use((res) => res.data);

export default api;
