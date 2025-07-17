import AsyncStorage from "@react-native-async-storage/async-storage";
import { produce } from "immer";
import { create } from "zustand";

const getProgressKey = (routineId, date) =>
  `@FlowDay:Progress:${date}:${routineId}`;

const useProgressStore = create((set, get) => ({
  routineId: null,
  progress: {}, // { [blockId]: 'pending' | 'active' | 'completed', ... }
  actions: {}, // { [actionId]: 'pending' | 'active' | 'completed', ... }
  currentBlockId: null,
  currentActionId: null,
  pausedTimers: {}, // { [actionId]: remainingTime }

  loadProgress: async (routine) => {
    if (!routine) return;
    if (get().routineId === routine.id) {
      return; // Already loaded for this routine
    }
    const date = new Date().toISOString().split("T")[0];
    const key = getProgressKey(routine.id, date);
    try {
      const storedProgress = await AsyncStorage.getItem(key);
      if (storedProgress) {
        const {
          progress,
          actions,
          currentBlockId,
          currentActionId,
          pausedTimers,
        } = JSON.parse(storedProgress);
        set({
          routineId: routine.id,
          progress,
          actions,
          currentBlockId,
          currentActionId,
          pausedTimers: pausedTimers || {},
        });
      } else {
        // Initialize progress for a new day
        const initialProgress = {};
        const initialActions = {};
        routine.blocks.forEach((block) => {
          initialProgress[block.id] = "pending";
          block.actions.forEach((action) => {
            initialActions[action.id] = "pending";
          });
        });
        set({
          routineId: routine.id,
          progress: initialProgress,
          actions: initialActions,
          currentBlockId: null,
          currentActionId: null,
          pausedTimers: {},
        });
      }
    } catch (e) {
      console.error("Failed to load progress.", e);
    }
  },

  startAction: (routine, blockId) => {
    const block = routine.blocks.find((b) => b.id === blockId);
    if (!block) return;

    const nextAction = block.actions.find(
      (a) => get().actions[a.id] === "pending",
    );
    if (!nextAction) return;

    set(
      produce((draft) => {
        draft.progress[blockId] = "active";
        draft.currentBlockId = blockId;
        draft.actions[nextAction.id] = "active";
        draft.currentActionId = nextAction.id;
      }),
    );
    get().saveProgress(routine.id);
  },

  completeAction: (routine, completedActionId) => {
    set(
      produce((draft) => {
        draft.actions[completedActionId] = "completed";
        draft.currentActionId = null;

        const currentBlock = routine.blocks.find(
          (b) => b.id === draft.currentBlockId,
        );
        if (!currentBlock) return;

        const isBlockComplete = currentBlock.actions.every(
          (a) => draft.actions[a.id] === "completed",
        );
        if (isBlockComplete) {
          draft.progress[draft.currentBlockId] = "completed";
          draft.currentBlockId = null;
        }
      }),
      false,
      () => get().saveProgress(routine.id),
    );
  },

  pauseAction: (routineId, actionId, remainingTime) => {
    set(
      produce((draft) => {
        // Clear a specific timer (on resume)
        if (actionId && remainingTime === null) {
          delete draft.pausedTimers[actionId];
        }
        // Set a specific timer (on pause)
        else if (actionId && remainingTime !== null) {
          draft.pausedTimers[actionId] = remainingTime;
        }
        // Clear all timers (e.g., on routine completion/exit)
        else {
          draft.pausedTimers = {};
        }
      }),
    );
    get().saveProgress(routineId);
  },

  forceReloadNextLoad: () => {
    set({ routineId: null });
  },

  saveProgress: async (routineId) => {
    const {
      progress,
      actions,
      currentBlockId,
      currentActionId,
      pausedTimers,
    } = get();
    const date = new Date().toISOString().split("T")[0];
    const key = getProgressKey(routineId, date);
    const dataToStore = JSON.stringify({
      progress,
      actions,
      currentBlockId,
      currentActionId,
      pausedTimers,
    });
    try {
      await AsyncStorage.setItem(key, dataToStore);
    } catch (e) {
      console.error("Failed to save progress.", e);
    }
  },

  resetProgress: async (routine) => {
    if (!routine) return;
    const date = new Date().toISOString().split("T")[0];
    const key = getProgressKey(routine.id, date);
    try {
      await AsyncStorage.removeItem(key);
      // Force reload by resetting the routineId
      set({ routineId: null });
      get().loadProgress(routine);
    } catch (e) {
      console.error("Failed to reset progress.", e);
    }
  },
}));

export default useProgressStore;
