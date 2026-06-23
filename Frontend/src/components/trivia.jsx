import { useState, useEffect } from 'react';
import triviaDatabase from '../data/trivia.json';

export default function DailyTriviaQuiz() {
  // --- STATE SYSTEM ---
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { questionId: "A" | "B" | "C" | "D" }
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  const TOTAL_SESSION_QUESTIONS = 6;

  // --- COMPILING POOL FUNCTION ---
  const loadFreshQuizPool = () => {
    if (triviaDatabase && triviaDatabase.length > 0) {
      // Randomize the entry pool
      const shuffled = [...triviaDatabase].sort(() => 0.5 - Math.random());
      setQuizQuestions(shuffled.slice(0, TOTAL_SESSION_QUESTIONS));
    }
  };

  // Initial Pool Lifecycle Trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      loadFreshQuizPool();
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // --- ACTIONS ---
  const handleSelectOption = (letter) => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: letter,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      setIsQuizComplete(true);
    }
  };

  // INTERNAL COMPONENT STATE RESET (Fixes full page reload issue)
  const handlePlayAgain = () => {
    setLoading(true);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setIsQuizComplete(false);

    // Shuffle a brand new collection of questions instantly
    loadFreshQuizPool();

    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  const calculateResults = () => {
    let score = 0;
    quizQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.answer) score++;
    });
    const percentage = Math.round((score / TOTAL_SESSION_QUESTIONS) * 100);

    let remark = 'Keep training! ⚽';
    if (percentage === 100) remark = 'World Cup Champion Status! 🏆🏆🏆';
    else if (percentage >= 75) remark = 'Fantastic Performance! 🌟';
    else if (percentage >= 50)
      remark = 'Qualified for the Knockout Stages! 🏃💨';

    return { score, percentage, remark };
  };

  // --- VIEW 1: LOADER ANIMATION ---
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <video style={styles.loaderVideo} autoPlay loop muted playsInline>
            <source src="/trionda.mp4" type="video/mp4" />
          </video>
          <p style={styles.loadingText}>Assembling TriOnda Match Pools...</p>
        </div>
      </div>
    );
  }

  // --- VIEW 2: SCORE METRICS ---
  if (isQuizComplete) {
    const { score, percentage, remark } = calculateResults();
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Daily Trivia Complete!</h2>
          <hr style={styles.divider} />
          <div style={styles.scoreContainer}>
            <p style={styles.scoreLabel}>Final Accuracy Matrix</p>
            <h1 style={styles.scoreValue}>
              {score} / {TOTAL_SESSION_QUESTIONS}
            </h1>
            <h3 style={styles.percentageValue}>{percentage}% Correct</h3>
          </div>
          <blockquote style={styles.quote}>"{remark}"</blockquote>
          <button style={styles.primaryButton} onClick={handlePlayAgain}>
            Play Another Round
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW 3: ACTIVE PLAY ENGINE ---
  const currentQuestion = quizQuestions[currentQuestionIndex];
  const selectedOptionLetter = currentQuestion
    ? userAnswers[currentQuestion.id]
    : undefined;

  if (!currentQuestion) return null;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.metaHeader}>
          <span style={styles.badge}>
            Question {currentQuestionIndex + 1} of {TOTAL_SESSION_QUESTIONS}
          </span>
          <span
            style={{
              ...styles.difficultyBadge,
              backgroundColor:
                currentQuestion.difficulty === 'super_hard'
                  ? '#c62828'
                  : '#2e7d32',
            }}
          >
            {currentQuestion.difficulty
              ? currentQuestion.difficulty.replace('_', ' ')
              : 'NORMAL'}
          </span>
        </div>

        <h3 style={styles.questionText}>{currentQuestion.question}</h3>

        <div style={styles.optionsGrid}>
          {currentQuestion.options &&
            currentQuestion.options.map((optionStr) => {
              // Safely extracts "A", "B", "C", or "D" from the string options wrapper
              const letter = optionStr.trim().charAt(0).toUpperCase();
              const isChosen = selectedOptionLetter === letter;

              return (
                <button
                  key={letter}
                  onClick={() => handleSelectOption(letter)}
                  style={{
                    ...styles.optionButton,
                    ...(isChosen ? styles.optionButtonActive : {}),
                  }}
                >
                  {optionStr}
                </button>
              );
            })}
        </div>

        <div style={{ textAlign: 'right' }}>
          <button
            disabled={!selectedOptionLetter}
            onClick={handleNextQuestion}
            style={{
              ...styles.primaryButton,
              ...(!selectedOptionLetter ? styles.buttonDisabled : {}),
            }}
          >
            {currentQuestionIndex === TOTAL_SESSION_QUESTIONS - 1
              ? 'Finish Quiz'
              : 'Next Question'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- TRIONDA COMPONENT STYLING SPECIFICATIONS ---
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    width: '100%',
  },
  card: {
    backgroundColor: '#161b22',
    borderRadius: '12px',
    border: '1px solid #30363d',
    padding: '30px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
  },
  title: { textAlign: 'center', color: '#f0f6fc', margin: '0 0 10px 0' },
  divider: {
    border: '0',
    borderTop: '1px solid #30363d',
    marginBottom: '20px',
  },
  metaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '25px',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#21262d',
    color: '#8b949e',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
  },
  difficultyBadge: {
    color: '#ffffff',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  questionText: {
    color: '#f0f6fc',
    lineHeight: '1.5',
    marginBottom: '25px',
    fontSize: '1.25rem',
  },
  optionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '30px',
  },
  optionButton: {
    textAlign: 'left',
    padding: '14px 20px',
    borderRadius: '8px',
    backgroundColor: '#21262d',
    border: '1px solid #30363d',
    color: '#c9d1d9',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.15s ease',
    outline: 'none',
  },
  optionButtonActive: {
    backgroundColor: '#1f6feb',
    borderColor: '#58a6ff',
    color: '#ffffff',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#238636',
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'block',
    marginLeft: 'auto',
    transition: 'opacity 0.2s ease',
  },
  buttonDisabled: {
    opacity: '0.3',
    cursor: 'not-allowed',
    pointerEvents: 'none',
  },
  loaderVideo: {
    width: '140px',
    height: 'auto',
    display: 'block',
    margin: '20px auto',
    borderRadius: '8px',
  },
  loadingText: { textAlign: 'center', color: '#8b949e', fontSize: '1rem' },
  scoreContainer: { textAlign: 'center', margin: '30px 0' },
  scoreLabel: {
    color: '#8b949e',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontSize: '0.85rem',
  },
  scoreValue: { fontSize: '3.5rem', color: '#58a6ff', margin: '10px 0' },
  percentageValue: { color: '#34d058', fontWidth: 'bold' },
  quote: {
    borderLeft: '4px solid #1f6feb',
    backgroundColor: '#10141b',
    padding: '15px',
    borderRadius: '4px',
    color: '#f0f6fc',
    textAlign: 'center',
    fontStyle: 'italic',
    margin: '20px 0',
  },
};
