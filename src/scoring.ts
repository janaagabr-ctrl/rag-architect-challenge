import type { OptionKey, QuizQuestion } from './questions';

export type Answers = Record<number, OptionKey | undefined>;

export interface QuizResult {
  points: number;
  maxPoints: number;
  correctCount: number;
  totalQuestions: number;
  percentage: number;
  title: string;
  feedback: string;
}

export function maxPoints(qs: QuizQuestion[]): number {
  return qs.reduce((sum, q) => sum + q.points, 0);
}

/** Score titles, rescaled from the brief's 15-point bands to a 10-point quiz (1 point per question). */
export function scoreTitle(points: number): { title: string; feedback: string } {
  if (points >= 9)
    return {
      title: 'RAG Architect',
      feedback: 'Excellent. You can design, retrieve, and ground answers like a seasoned RAG architect.',
    };
  if (points >= 7)
    return {
      title: 'Retrieval Pro',
      feedback: 'Strong work. You understand the pipeline well; review the questions you missed to sharpen the details.',
    };
  if (points >= 5)
    return {
      title: 'RAG Builder',
      feedback: 'Solid foundation. Revisit metadata, top-k, and failure diagnosis to move up a level.',
    };
  if (points >= 3)
    return {
      title: 'RAG Apprentice',
      feedback: 'A good start. Review indexing, retrieval, and grounding, then try again.',
    };
  return {
    title: 'Time to Re-index',
    feedback: 'Every expert starts somewhere. Review the explanations below and take the challenge again.',
  };
}

export function calculateResult(qs: QuizQuestion[], answers: Answers): QuizResult {
  let points = 0;
  let correctCount = 0;
  for (const q of qs) {
    if (answers[q.id] === q.correctAnswer) {
      points += q.points;
      correctCount += 1;
    }
  }
  const max = maxPoints(qs);
  const { title, feedback } = scoreTitle(points);
  return {
    points,
    maxPoints: max,
    correctCount,
    totalQuestions: qs.length,
    percentage: Math.round((points / max) * 100),
    title,
    feedback,
  };
}
