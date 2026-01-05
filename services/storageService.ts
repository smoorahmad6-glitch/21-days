import { ChallengeData } from '../types';

const STORAGE_KEY = '21day_challenge_data';

export const saveChallenge = (data: ChallengeData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage', error);
  }
};

export const loadChallenge = (): ChallengeData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading from localStorage', error);
    return null;
  }
};

export const clearChallenge = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing localStorage', error);
  }
};
