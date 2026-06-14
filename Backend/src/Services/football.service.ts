import api from "../Apis/api";
import { API_FOOTBALL_ENDPOINTS } from "../Config/constants";

export const getFootballFixtures = async (params: {
  league: number;
  season: number;
}) => {
  const response = await api.get(API_FOOTBALL_ENDPOINTS.FIXTURES, {
    params: {
      league: params.league,
      season: params.season,
    },
  });
  return response.data;
};

const getWorldCupFixtures = async () => {
  const response = await api.get(API_FOOTBALL_ENDPOINTS.LEAGUES, {
    params: {
      season: 2026,
      league: 1,
    },
  });
  console.log(response);
};
getWorldCupFixtures();
