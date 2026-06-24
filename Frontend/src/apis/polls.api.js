import { appAPI } from "./api.client.js";

const pollsApi = {
  getPolls() {
    return appAPI.get("/polls");
  },

  createPoll(payload) {
    return appAPI.post("/polls", payload);
  },

  updatePoll(pollId, payload) {
    return appAPI.put(`/polls/${pollId}`, payload);
  },

  votePoll(pollId, optionIndex) {
    return appAPI.patch(`/polls/${pollId}/vote`, { optionIndex });
  },

  deletePoll(pollId) {
    return appAPI.delete(`/polls/${pollId}`);
  },
};

export default pollsApi;
