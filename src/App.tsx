import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { questions, SCENARIO, type OptionKey } from './questions';
import { calculateResult, maxPoints, type Answers } from './scoring';

type Screen = 'welcome' | 'quiz' | 'review' | 'results' | 'answers';

interface PersistedState {
  screen: Screen;
  current: number;
  answers: Answers;
  submitted: boolean;
}

const STORAGE_KEY = 'rag-architect-challenge:v1';
const TOTAL = questions.length;
const MAX_POINTS = maxPoints(questions);

const initialState: PersistedState = { screen: 'welcome', current: 0, answers: {}, submitted: false };

function loadState(): PersistedState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as PersistedState;
    const validScreens: Screen[] = ['welcome', 'quiz', 'review', 'results', 'answers'];
    if (!validScreens.includes(parsed.screen)) return initialState;
    const current = Number.isInteger(parsed.current) && parsed.current >= 0 && parsed.current < TOTAL ? parsed.current : 0;
    const answers: Answers = {};
    for (const q of questions) {
      const a = parsed.answers?.[q.id];
      if (a && ['A', 'B', 'C', 'D'].includes(a)) answers[q.id] = a;
    }
    const allAnswered = questions.every((q) => answers[q.id]);
    const submitted = Boolean(parsed.submitted) && allAnswered;
    // Never land on a results screen without a valid submitted attempt.
    let screen = parsed.screen;
    if ((screen === 'results' || screen === 'answers') && !submitted) screen = allAnswered ? 'review' : 'quiz';
    if ((screen === 'quiz' || screen === 'review') && submitted) screen = 'results';
    return { screen, current, answers, submitted };
  } catch {
    return initialState;
  }
}

function saveState(state: PersistedState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable: the attempt still works in memory */
  }
}

function clearState() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function Brand() {
  return (
    <header className="site-header">
      <div className="brand">
        <span className="brand-accent" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="brand-text">RAG Fundamentals</span>
      </div>
    </header>
  );
}

export default function App() {
  const [state, setState] = useState<PersistedState>(loadState);
  const [announcement, setAnnouncement] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const firstRender = useRef(true);

  const { screen, current, answers, submitted } = state;
  const answeredCount = questions.filter((q) => answers[q.id]).length;
  const allAnswered = answeredCount === TOTAL;
  const result = useMemo(() => (submitted ? calculateResult(questions, answers) : null), [submitted, answers]);

  useLayoutEffect(() => saveState(state), [state]);

  // Move focus to the main heading whenever the screen or question changes.
  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [screen, current]);

  const go = (patch: Partial<PersistedState>) => setState((s) => ({ ...s, ...patch }));

  const start = () => {
    setAnnouncement('');
    go({ screen: 'quiz', current: 0 });
  };

  const select = (qid: number, key: OptionKey) => {
    if (submitted) return;
    setState((s) => ({ ...s, answers: { ...s.answers, [qid]: key } }));
    setAnnouncement(`Answer ${key} selected for question ${qid}.`);
  };

  const openConfirm = () => {
    if (!allAnswered || submitted) return;
    const d = dialogRef.current;
    if (d && typeof d.showModal === 'function') d.showModal();
    else if (window.confirm('Submit your answers? You will see your final score immediately.')) submit();
  };

  const submit = () => {
    if (submitting || submitted || !allAnswered) return; // prevents double submission
    setSubmitting(true);
    dialogRef.current?.close();
    const r = calculateResult(questions, answers);
    setState((s) => ({ ...s, submitted: true, screen: 'results' }));
    setAnnouncement(`Quiz submitted. You scored ${r.points} out of ${r.maxPoints} points, ${r.correctCount} of ${r.totalQuestions} correct. ${r.title}.`);
    setSubmitting(false);
  };

  const restart = () => {
    clearState();
    setAnnouncement('The quiz has been reset. A new attempt is ready.');
    setState({ ...initialState, screen: 'welcome' });
  };

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Brand />
      <main id="main" className="container">
        <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>

        {screen === 'welcome' && (
          <section aria-labelledby="page-title">
            <p className="eyebrow">Final exercise</p>
            <h1 id="page-title" ref={headingRef} tabIndex={-1}>RAG Architect Challenge</h1>
            <p className="subtitle">Test how well you can retrieve, troubleshoot, and generate with RAG.</p>
            <hr className="rule" />
            <div className="card card-grey">
              <h2 className="card-title">Scenario</h2>
              <p>{SCENARIO}</p>
            </div>
            <div className="card card-tint">
              <h2 className="card-title">Quiz information</h2>
              <ul className="info-list">
                <li><strong>{TOTAL}</strong> questions</li>
                <li><strong>{MAX_POINTS}</strong> total points</li>
                <li>Approximately <strong>8</strong> minutes</li>
                <li>One correct answer per question</li>
                <li>Score shown immediately after submission</li>
              </ul>
            </div>
            <div className="actions">
              <button type="button" className="btn btn-primary" onClick={start}>Start Challenge</button>
            </div>
          </section>
        )}

        {screen === 'quiz' && (() => {
          const q = questions[current];
          const selected = answers[q.id];
          const isLast = current === TOTAL - 1;
          const progress = Math.round(((current + 1) / TOTAL) * 100);
          return (
            <section aria-labelledby="q-heading">
              <div className="quiz-top">
                <p className="q-counter">Question {current + 1} of {TOTAL}</p>
                <p className="q-meta">{q.points} {q.points === 1 ? 'point' : 'points'}</p>
              </div>
              <div
                className="progress"
                role="progressbar"
                aria-label="Quiz progress"
                aria-valuemin={1}
                aria-valuemax={TOTAL}
                aria-valuenow={current + 1}
                aria-valuetext={`Question ${current + 1} of ${TOTAL}`}
              >
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <p className="selection-state">
                {selected ? <>Selected answer: <strong>{selected}</strong></> : 'No answer selected yet'}
              </p>

              <fieldset className="question" key={q.id}>
                <legend>
                  <h1 id="q-heading" ref={headingRef} tabIndex={-1} className="q-text">
                    {q.question.split('\n\n').map((part, i) => (
                      <span key={i} className={part.startsWith('“') ? 'q-quote' : 'q-part'}>{part}</span>
                    ))}
                  </h1>
                </legend>
                <div className="options">
                  {q.options.map((o) => {
                    const id = `q${q.id}-${o.key}`;
                    const isSel = selected === o.key;
                    return (
                      <label key={o.key} htmlFor={id} className={`option${isSel ? ' selected' : ''}`}>
                        <input
                          type="radio"
                          id={id}
                          name={`q${q.id}`}
                          value={o.key}
                          checked={isSel}
                          onChange={() => select(q.id, o.key)}
                        />
                        <span className="option-key" aria-hidden="true">{o.key}</span>
                        <span className="option-text"><span className="sr-only">{o.key}. </span>{o.text}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className="nav">
                <button type="button" className="btn btn-secondary" onClick={() => go({ current: current - 1 })} disabled={current === 0}>
                  Previous
                </button>
                {isLast ? (
                  <button type="button" className="btn btn-primary" onClick={() => go({ screen: 'review' })} disabled={!selected}>
                    Review answers
                  </button>
                ) : (
                  <button type="button" className="btn btn-primary" onClick={() => go({ current: current + 1 })} disabled={!selected}>
                    Next
                  </button>
                )}
              </div>
              {!selected && <p className="hint">Select an answer to continue.</p>}
            </section>
          );
        })()}

        {screen === 'review' && (
          <section aria-labelledby="review-heading">
            <h1 id="review-heading" ref={headingRef} tabIndex={-1}>Review your answers</h1>
            <p className="subtitle">
              {allAnswered
                ? 'All questions are answered. Select a question number to change an answer, or submit the quiz.'
                : `${TOTAL - answeredCount} of ${TOTAL} questions are unanswered. Answer every question before submitting.`}
            </p>
            <hr className="rule" />
            <ol className="review-grid">
              {questions.map((q, i) => {
                const a = answers[q.id];
                return (
                  <li key={q.id}>
                    <button
                      type="button"
                      className={`review-item${a ? ' answered' : ' unanswered'}`}
                      onClick={() => go({ screen: 'quiz', current: i })}
                      aria-label={`Question ${q.id}: ${a ? `answer ${a} selected` : 'unanswered'}. Go to question.`}
                    >
                      <span className="review-num">{q.id}</span>
                      <span className="review-status">{a ? `Answer ${a}` : 'Unanswered'}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="actions">
              <button type="button" className="btn btn-secondary" onClick={() => go({ screen: 'quiz', current: TOTAL - 1 })}>
                Back to questions
              </button>
              <button type="button" className="btn btn-primary" onClick={openConfirm} disabled={!allAnswered || submitted}>
                Submit Quiz
              </button>
            </div>
          </section>
        )}

        {screen === 'results' && result && (
          <section aria-labelledby="results-heading">
            <p className="eyebrow">Your result</p>
            <h1 id="results-heading" ref={headingRef} tabIndex={-1}>{result.title}</h1>
            <p className="subtitle">{result.feedback}</p>
            <hr className="rule" />
            <dl className="stats">
              <div className="stat">
                <dt>Score</dt>
                <dd>{result.points}/{result.maxPoints}</dd>
                <span className="stat-note">points</span>
              </div>
              <div className="stat">
                <dt>Percentage</dt>
                <dd>{result.percentage}%</dd>
                <span className="stat-note">of available points</span>
              </div>
              <div className="stat">
                <dt>Correct answers</dt>
                <dd>{result.correctCount}/{result.totalQuestions}</dd>
                <span className="stat-note">questions</span>
              </div>
            </dl>
            <div className="actions">
              <button type="button" className="btn btn-primary" onClick={() => go({ screen: 'answers' })}>Review Answers</button>
              <button type="button" className="btn btn-secondary" onClick={restart}>Restart Quiz</button>
            </div>
          </section>
        )}

        {screen === 'answers' && result && (
          <section aria-labelledby="answers-heading">
            <h1 id="answers-heading" ref={headingRef} tabIndex={-1}>Answer review</h1>
            <p className="subtitle">
              {result.correctCount}/{result.totalQuestions} correct · {result.points}/{result.maxPoints} points · {result.title}
            </p>
            <hr className="rule" />
            <ol className="answer-list">
              {questions.map((q, i) => {
                const chosen = answers[q.id];
                const isCorrect = chosen === q.correctAnswer;
                const chosenText = q.options.find((o) => o.key === chosen)?.text;
                const correctText = q.options.find((o) => o.key === q.correctAnswer)?.text;
                return (
                  <li key={q.id} className={`card answer-card ${i % 2 === 0 ? 'card-grey' : 'card-tint'}`}>
                    <div className="answer-head">
                      <h2 className="answer-q">Question {q.id}</h2>
                      <span className={`badge ${isCorrect ? 'badge-correct' : 'badge-incorrect'}`}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    <p className="answer-qtext">{q.question}</p>
                    <dl className="answer-details">
                      <div><dt>Point value</dt><dd>{q.points}</dd></div>
                      <div>
                        <dt>Your answer</dt>
                        <dd className={isCorrect ? 'text-correct' : 'text-incorrect'}>{chosen}. {chosenText}</dd>
                      </div>
                      <div>
                        <dt>Correct answer</dt>
                        <dd className="text-correct">{q.correctAnswer}. {correctText}</dd>
                      </div>
                      <div><dt>Points earned</dt><dd>{isCorrect ? q.points : 0} of {q.points}</dd></div>
                    </dl>
                    <div className="explanation">
                      <h3>Explanation</h3>
                      <p>{q.explanation}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className="actions">
              <button type="button" className="btn btn-secondary" onClick={() => go({ screen: 'results' })}>Back to results</button>
              <button type="button" className="btn btn-primary" onClick={restart}>Restart Quiz</button>
            </div>
          </section>
        )}
      </main>

      <dialog ref={dialogRef} className="confirm" aria-labelledby="confirm-title" aria-describedby="confirm-desc">
        <h2 id="confirm-title">Submit quiz</h2>
        <p id="confirm-desc">Submit your answers? You will see your final score immediately.</p>
        <div className="actions">
          <button type="button" className="btn btn-secondary" onClick={() => dialogRef.current?.close()}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={submit} disabled={submitting}>Submit</button>
        </div>
      </dialog>

      <footer className="site-footer">
        <p>RAG Fundamentals · Final exercise. No personal data is collected or stored.</p>
      </footer>
    </>
  );
}
