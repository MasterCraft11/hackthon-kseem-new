export interface FlashcardData {
  id: string;
  question: string;
  answer: string;
  nextReviewDate: number; // timestamp
  masteryLevel: number; // 0-100
}

export type Difficulty = 'Hard' | 'Good' | 'Easy';
