import { useEffect, useMemo, useState } from "react";

const API_BASE = (import.meta.env.VITE_appAPI_URL || "http://localhost:5000").replace(
  /\/$/,
  "",
);

const emptyForm = {
  question: "",
  options: ["", ""],
};

function normalizePoll(poll) {
  return {
    ...poll,
    options: Array.isArray(poll?.options) ? poll.options : [],
  };
}

export default function PollsPanel() {
  const [polls, setPolls] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingPoll, setEditingPoll] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingPollId, setDeletingPollId] = useState(null);
  const [votingPollKey, setVotingPollKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const sortedPolls = useMemo(
    () =>
      [...polls].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      ),
    [polls],
  );

  async function requestPolls(path = "/polls", options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      throw new Error(data.error || "Poll request failed");
    }

    return data;
  }

  async function loadPolls() {
    try {
      setIsLoading(true);
      setError("");
      const data = await requestPolls();
      setPolls((data.polls || []).map(normalizePoll));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPolls();
  }, []);

  function updateOption(index, value) {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? value : option,
      ),
    }));
  }

  function addOption() {
    setForm((current) => ({
      ...current,
      options: [...current.options, ""],
    }));
  }

  function removeOption(index) {
    setForm((current) => ({
      ...current,
      options: current.options.filter((_, optionIndex) => optionIndex !== index),
    }));
  }

  function startEdit(poll) {
    setEditingPoll(poll);
    setForm({
      question: poll.question || "",
      options: poll.options.map((option) => option.text),
    });
    setMessage("");
    setError("");
  }

  function resetForm() {
    setEditingPoll(null);
    setForm(emptyForm);
  }

  function replacePoll(nextPoll) {
    const normalizedPoll = normalizePoll(nextPoll);
    setPolls((current) =>
      current.some((poll) => poll.id === normalizedPoll.id)
        ? current.map((poll) => (poll.id === normalizedPoll.id ? normalizedPoll : poll))
        : [normalizedPoll, ...current],
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const cleanOptions = form.options
      .map((option) => option.trim())
      .filter(Boolean);

    if (!form.question.trim() || cleanOptions.length < 2) {
      setError("Add a question and at least two answer options.");
      return;
    }

    const payload = {
      question: form.question.trim(),
      options: cleanOptions.map((text, index) => ({
        text,
        votes: editingPoll?.options?.[index]?.votes || 0,
      })),
    };

    try {
      setIsSaving(true);
      const data = await requestPolls(
        editingPoll ? `/polls/${editingPoll.id}` : "/polls",
        {
          method: editingPoll ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );
      replacePoll(data.poll);
      setMessage(editingPoll ? "Poll updated." : "Poll created.");
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleVote(pollId, optionIndex) {
    const voteKey = `${pollId}-${optionIndex}`;
    try {
      setVotingPollKey(voteKey);
      setError("");
      const data = await requestPolls(`/polls/${pollId}/vote`, {
        method: "PATCH",
        body: JSON.stringify({ optionIndex }),
      });
      replacePoll(data.poll);
      setMessage("Vote recorded.");
    } catch (err) {
      setError(err.message);
    } finally {
      setVotingPollKey("");
    }
  }

  async function handleDelete(pollId) {
    try {
      setDeletingPollId(pollId);
      setError("");
      await requestPolls(`/polls/${pollId}`, { method: "DELETE" });
      setPolls((current) => current.filter((poll) => poll.id !== pollId));
      if (editingPoll?.id === pollId) resetForm();
      setMessage("Poll deleted.");
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingPollId(null);
    }
  }

  return (
    <section className="py-lg px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto min-h-[60vh] animate-fade-in">
      <div className="grid gap-lg lg:grid-cols-[0.85fr_1.15fr]">
        <form
          onSubmit={handleSubmit}
          className="bg-surface text-on-surface border border-outline-variant p-md space-y-md"
        >
          <div>
            <p className="font-label-caps text-label-caps text-secondary uppercase">
              Poll control
            </p>
            <h2 className="font-display-lg text-headline-lg text-primary uppercase">
              {editingPoll ? "Edit Poll" : "Create Poll"}
            </h2>
          </div>

          <label className="block space-y-2">
            <span className="font-label-caps text-label-caps text-on-surface-variant">
              Question
            </span>
            <textarea
              value={form.question}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  question: event.target.value,
                }))
              }
              rows={3}
              className="w-full border border-outline-variant bg-surface-container-lowest px-3 py-3 font-body-md text-on-surface outline-none focus:border-secondary"
              placeholder="Who will win the next match?"
            />
          </label>

          <div className="space-y-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                Options
              </span>
              <button
                type="button"
                onClick={addOption}
                className="inline-flex items-center gap-2 border border-outline-variant px-3 py-2 font-label-caps text-label-caps text-primary hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Add
              </button>
            </div>

            {form.options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={option}
                  onChange={(event) => updateOption(index, event.target.value)}
                  className="min-w-0 flex-1 border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-md text-on-surface outline-none focus:border-secondary"
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  disabled={form.options.length <= 2}
                  className="w-10 border border-outline-variant text-primary disabled:cursor-not-allowed disabled:opacity-30 hover:bg-error-container"
                  aria-label={`Remove option ${index + 1}`}
                >
                  <span className="material-symbols-outlined text-base">
                    close
                  </span>
                </button>
              </div>
            ))}
          </div>

          {(error || message) && (
            <p
              className={`font-body-md ${
                error ? "text-error" : "text-on-tertiary-container"
              }`}
            >
              {error || message}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-secondary text-on-secondary px-5 py-3 font-label-caps text-label-caps hover:bg-secondary-container disabled:cursor-wait disabled:opacity-70"
            >
              {isSaving ? "Saving..." : editingPoll ? "Save Changes" : "Create Poll"}
            </button>
            {editingPoll && (
              <button
                type="button"
                onClick={resetForm}
                className="border border-outline-variant px-5 py-3 font-label-caps text-label-caps text-primary hover:bg-surface-container"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="space-y-md">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-label-caps text-label-caps text-tertiary-fixed uppercase">
                Live fan pulse
              </p>
              <h2 className="font-display-lg text-headline-lg text-on-primary uppercase">
                Fan Polls
              </h2>
            </div>
            <button
              type="button"
              onClick={loadPolls}
              className="inline-flex items-center justify-center gap-2 border border-outline-variant px-4 py-2 font-label-caps text-label-caps text-on-primary hover:bg-white/10"
            >
              <span className="material-symbols-outlined text-base">sync</span>
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="border border-outline-variant bg-primary-container p-md text-on-primary-container font-body-md">
              Loading polls...
            </div>
          ) : sortedPolls.length === 0 ? (
            <div className="border border-outline-variant bg-primary-container p-md text-on-primary-container font-body-md">
              No polls yet. Create the first fan prompt.
            </div>
          ) : (
            sortedPolls.map((poll) => {
              const totalVotes = poll.options.reduce(
                (sum, option) => sum + (option.votes || 0),
                0,
              );

              return (
                <article
                  key={poll.id}
                  className="bg-surface text-on-surface border border-outline-variant p-md space-y-md"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-label-caps text-label-caps text-secondary uppercase">
                        {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
                      </p>
                      <h3 className="font-headline-lg text-title-md text-primary">
                        {poll.question}
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(poll)}
                        className="w-10 h-10 border border-outline-variant hover:bg-surface-container"
                        aria-label="Edit poll"
                      >
                        <span className="material-symbols-outlined text-base">
                          edit
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(poll.id)}
                        disabled={deletingPollId === poll.id}
                        className="w-10 h-10 border border-outline-variant hover:bg-error-container disabled:cursor-wait disabled:opacity-60"
                        aria-label="Delete poll"
                      >
                        <span className="material-symbols-outlined text-base">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-sm">
                    {poll.options.map((option, index) => {
                      const votes = option.votes || 0;
                      const percentage = totalVotes
                        ? Math.round((votes / totalVotes) * 100)
                        : 0;
                      const voteKey = `${poll.id}-${index}`;

                      return (
                        <button
                          key={`${poll.id}-${index}`}
                          type="button"
                          onClick={() => handleVote(poll.id, index)}
                          disabled={votingPollKey === voteKey}
                          className="group w-full border border-outline-variant bg-surface-container-lowest text-left hover:border-secondary disabled:cursor-wait"
                        >
                          <div className="flex items-center justify-between gap-4 px-3 py-2">
                            <span className="font-body-md text-on-surface">
                              {option.text}
                            </span>
                            <span className="font-label-caps text-label-caps text-on-surface-variant">
                              {percentage}%
                            </span>
                          </div>
                          <div className="h-1 bg-surface-container">
                            <div
                              className="h-full bg-tertiary-fixed transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
