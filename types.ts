export interface ChallengeData {
  habitName: string;
  startDate: string;
  completedDays: number[]; // Array of day numbers (1-21)
  isCompleted: boolean;
  lastInteractionDate: string | null;
}

export type ViewState = 'HOME' | 'SELECTION' | 'DASHBOARD' | 'SUCCESS';

export interface DailyQuote {
  text: string;
  author?: string;
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark'
}
