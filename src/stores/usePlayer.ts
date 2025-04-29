import { create } from "zustand";

interface PlayerState {
  settings: {
    sound: boolean;
    music: boolean;
    quality: string;
  }; // Settings for the player, add more as needed
  completedLevels: string[]; // Array of level IDs that the player has completed
  unlockedLevels: string[]; // Array of level IDs that the player has unlocked
}

interface PlayerStore extends PlayerState {
  loadPlayer: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setSetting: (key: keyof PlayerState["settings"], value: any) => void;
  addCompletedLevel: (levelId: string) => void;
  unlockLevel: (levelId: string) => void;
}

const PLAYER_KEY = "playerState";

function getInitialState(): PlayerState {
  /*
  This function is used to get the initial state of the player.
  It checks if the player state exists in local storage and returns it if it does.
  If it doesn't exist, it sets the default state.
  */
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(PLAYER_KEY);
    if (stored) return JSON.parse(stored);
  }
  return {
    settings: { sound: true, music: true, quality: "normal" },
    completedLevels: ["level_1"],
    unlockedLevels: ["level_1", "level_2"],
  };
}

export const usePlayer = create<PlayerStore>((set, get) => ({
  ...getInitialState(),

  loadPlayer: () => {
    // Get the initial state of the player
    const data = getInitialState();
    set(data);
  },

  setSetting: (key, value) => {
    // Set a setting for the player
    const newSettings = { ...get().settings, [key]: value };
    const newState = { ...get(), settings: newSettings };
    set({ settings: newSettings });
    localStorage.setItem(PLAYER_KEY, JSON.stringify(newState));
  },

  addCompletedLevel: (levelId) => {
    // Add a completed level to the player
    if (!get().completedLevels.includes(levelId)) {
      // If the level is not already completed, add it to the completed levels
      const newCompleted = [...get().completedLevels, levelId];
      const newState = { ...get(), completedLevels: newCompleted };
      set({ completedLevels: newCompleted });
      localStorage.setItem(PLAYER_KEY, JSON.stringify(newState));
    }
  },

  unlockLevel: (levelId) => {
    // Unlock a level for the player
    if (!get().unlockedLevels.includes(levelId)) {
      // If the level is not already unlocked, add it to the unlocked levels
      const newUnlocked = [...get().unlockedLevels, levelId];
      const newState = { ...get(), unlockedLevels: newUnlocked };
      set({ unlockedLevels: newUnlocked });
      localStorage.setItem(PLAYER_KEY, JSON.stringify(newState));
    }
  },
}));
