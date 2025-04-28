import { create } from "zustand";

interface PlayerState {
  settings: {
    sound: boolean;
    music: boolean;
    quality: string;
  };
  completedLevels: string[];
  unlockedLevels: string[];
}

interface PlayerStore extends PlayerState {
  loadPlayer: () => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setSetting: (key: keyof PlayerState["settings"], value: any) => Promise<void>;
  addCompletedLevel: (levelId: string) => Promise<void>;
  unlockLevel: (levelId: string) => Promise<void>;
}

const PLAYER_KEY = "playerState";

function getInitialState(): PlayerState {
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

const fetchPlayer = async (): Promise<PlayerState> => {
  const res = await fetch("/api/player");
  return await res.json();
};

const savePlayer = async (player: PlayerState) => {
  await fetch("/api/player", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(player),
  });
};

export const usePlayer = create<PlayerStore>((set, get) => ({
  ...getInitialState(),

  loadPlayer: async () => {
    const data = await fetchPlayer();
    set(data);
  },

  setSetting: async (key, value) => {
    const newSettings = { ...get().settings, [key]: value };
    const newState = { ...get(), settings: newSettings };
    set({ settings: newSettings });
    await savePlayer(newState);
  },

  addCompletedLevel: async (levelId) => {
    if (!get().completedLevels.includes(levelId)) {
      const newCompleted = [...get().completedLevels, levelId];
      const newState = { ...get(), completedLevels: newCompleted };
      set({ completedLevels: newCompleted });
      await savePlayer(newState);
    }
  },

  unlockLevel: async (levelId) => {
    if (!get().unlockedLevels.includes(levelId)) {
      const newUnlocked = [...get().unlockedLevels, levelId];
      const newState = { ...get(), unlockedLevels: newUnlocked };
      set({ unlockedLevels: newUnlocked });
      await savePlayer(newState);
    }
  },
}));
