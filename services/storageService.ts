import { ChallengeData } from '../types';
import { supabase } from './supabaseClient';

const STORAGE_KEY = '21day_challenge_data';

// Helper for local storage interaction
const getLocalData = (): ChallengeData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading from localStorage', error);
    return null;
  }
};

export const saveChallenge = async (data: ChallengeData): Promise<void> => {
  // Always save locally first for immediate UI updates and offline support
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage', error);
  }

  // If user is logged in, sync to Supabase
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: session.user.id,
          challenge_data: data,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error syncing to Supabase:', error);
    }
  }
};

export const loadChallenge = async (): Promise<ChallengeData | null> => {
  // Check for session
  const { data: { session } } = await supabase.auth.getSession();
  
  // If logged in, try to fetch from Supabase
  if (session?.user) {
    try {
      // Use maybeSingle() to return null instead of error if no row exists
      const { data, error } = await supabase
        .from('user_progress')
        .select('challenge_data')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        // Real error (network, permission, etc), fall back to local
        console.error('Error loading from Supabase:', error);
        return getLocalData();
      }

      if (data?.challenge_data) {
        // Found data in cloud, update local storage to match
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.challenge_data));
        return data.challenge_data;
      } else {
        // User logged in but has no cloud data (first sync)
        // Check if we have local data to upload
        const localData = getLocalData();
        if (localData) {
          // Upload local progress to cloud
          await saveChallenge(localData);
        }
        return localData;
      }
    } catch (error) {
      console.error('Unexpected error loading from Supabase', error);
      return getLocalData();
    }
  }

  // Fallback to local storage (not logged in)
  return getLocalData();
};

export const clearChallenge = async (): Promise<void> => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
       await supabase
        .from('user_progress')
        .delete()
        .eq('user_id', session.user.id);
    }
  } catch (error) {
    console.error('Error clearing data', error);
  }
};
