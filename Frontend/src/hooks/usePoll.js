import { useCallback, useState } from "react";
import pollsApi from "../apis/polls.api.js";

function getErrorMessage(error) {
  return error?.response?.data?.error || error?.message || "Poll request failed";
}

function usePoll() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const execute = useCallback(async (apiCall) => {
    setLoading(true);
    setError("");
    setData(null);

    try {
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const methods = {
    getPolls: useCallback(
      () => execute(() => pollsApi.getPolls()),
      [execute],
    ),

    createPoll: useCallback(
      (payload) => execute(() => pollsApi.createPoll(payload)),
      [execute],
    ),

    updatePoll: useCallback(
      (pollId, payload) => execute(() => pollsApi.updatePoll(pollId, payload)),
      [execute],
    ),

    votePoll: useCallback(
      (pollId, optionIndex) =>
        execute(() => pollsApi.votePoll(pollId, optionIndex)),
      [execute],
    ),

    deletePoll: useCallback(
      (pollId) => execute(() => pollsApi.deletePoll(pollId)),
      [execute],
    ),
  };

  return {
    data,
    loading,
    error,
    ...methods,
  };
}

export default usePoll;
