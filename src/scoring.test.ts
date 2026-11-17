import { describe, expect, it } from 'vitest';
import { questions, type OptionKey } from './questions';
import { calculateResult, maxPoints, scoreTitle, type Answers } from './scoring';

const wrong = (k: OptionKey): OptionKey => (k === 'A' ? 'B' : 'A');
const allCorrect: Answers = Object.fromEntries(questions.map((q) => [q.id, q.correctAnswer]));
const allWrong: Answers = Object.fromEntries(questions.map((q) => [q.id, wrong(q.correctAnswer)]));

describe('quiz data', () => {
  it('has 10 questions with 4 options and a valid key', () => {
    expect(questions).toHaveLength(10);
    for (const q of questions) {
      expect(q.options.map((o) => o.key)).toEqual(['A', 'B', 'C', 'D']);
      expect(['A', 'B', 'C', 'D']).toContain(q.correctAnswer);
    }
  });
  it('totals 10 points', () => expect(maxPoints(questions)).toBe(10));
});

describe('scoring', () => {
  it('all correct = 10/10, 100%, RAG Architect', () => {
    const r = calculateResult(questions, allCorrect);
    expect([r.points, r.correctCount, r.percentage, r.title]).toEqual([10, 10, 100, 'RAG Architect']);
  });
  it('all incorrect = 0/10, Time to Re-index', () => {
    const r = calculateResult(questions, allWrong);
    expect([r.points, r.correctCount, r.percentage, r.title]).toEqual([0, 0, 0, 'Time to Re-index']);
  });
  it('mixed set: 7 correct = 7/10, 70%, Retrieval Pro', () => {
    const a: Answers = Object.fromEntries(questions.map((q, i) => [q.id, i < 7 ? q.correctAnswer : wrong(q.correctAnswer)]));
    const r = calculateResult(questions, a);
    expect([r.points, r.correctCount, r.percentage, r.title]).toEqual([7, 7, 70, 'Retrieval Pro']);
  });
  it('thresholds', () => {
    const table: [number, string][] = [
      [10, 'RAG Architect'], [9, 'RAG Architect'], [8, 'Retrieval Pro'], [7, 'Retrieval Pro'],
      [6, 'RAG Builder'], [5, 'RAG Builder'], [4, 'RAG Apprentice'], [3, 'RAG Apprentice'],
      [2, 'Time to Re-index'], [0, 'Time to Re-index'],
    ];
    for (const [p, t] of table) expect(scoreTitle(p).title).toBe(t);
  });
  it('percentage rounds to whole number', () => {
    // Every reachable point total, by brute force over subsets
    const seen = new Set<number>();
    for (let mask = 0; mask < 1 << questions.length; mask++) {
      const a: Answers = Object.fromEntries(questions.map((q, i) => [q.id, mask & (1 << i) ? q.correctAnswer : wrong(q.correctAnswer)]));
      const r = calculateResult(questions, a);
      expect(r.percentage).toBe(Math.round((r.points / 10) * 100));
      seen.add(r.points);
    }
    expect(Math.max(...seen)).toBe(10);
    expect(Math.min(...seen)).toBe(0);
  });
});
