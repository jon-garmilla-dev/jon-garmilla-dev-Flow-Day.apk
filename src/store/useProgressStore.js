import AsyncStorage from "@react-native-async-storage/async-storage";
import { produce } from "immer";
import { create } from "zustand";

const getProgressKey = (routineId, date) =>
  `@FlowDay:Progress:${date}:${routineId}`;

const useProgressStore = create((set, get) => ({
  routineId: null,
  progress: {}, // { [blockId]: 'pending' | 'active' | 'completed', ... }
  actions: {}, // { [actionId]: 'pending' | 'active' | 'completed', ... }
  pausedTimers: {}, // { [actionId]: remainingTime }

  loadProgress: async (routine) => {
    if (!routine || !routine.id) {
      console.error("Attempted to load progress with invalid routine.", routine);
      return;
    }
    if (get().routineId === routine.id) {
      return;
    }
    const date = new Date().toISOString().split("T")[0];
    const key = getProgressKey(routine.id, date);
    try {
      const storedProgress = await AsyncStorage.getItem(key);
      if (storedProgress) {
        const {
          progress,
          actions,
          pausedTimers,
        } = JSON.parse(storedProgress);
        set({
          routineId: routine.id,
          progress,
          actions,
          pausedTimers: pausedTimers || {},
        });
      } else {
        const initialProgress = {};
        const initialActions = {};
        if (Array.isArray(routine.blocks)) {
          routine.blocks.forEach((block) => {
            if (block && block.id && Array.isArray(block.actions)) {
              initialProgress[block.id] = "pending";
              block.actions.forEach((action) => {
                if (action && action.id) {
                  initialActions[action.id] = "pending";
                }
              });
            }
          });
        }
        set({
          routineId: routine.id,
          progress: initialProgress,
          actions: initialActions,
          pausedTimers: {},
        });
      }
    } catch (e) {
      console.error("Failed to load progress.", e);
    }
  },

  startAction: (routine, blockId) => {
    if (!routine || !Array.isArray(routine.blocks)) {
      console.error("startAction: Invalid routine provided.", routine);
      return;
    }
    const block = routine.blocks.find((b) => b && b.id === blockId);
    if (!block || !Array.isArray(block.actions)) {
      console.error("startAction: Invalid block found for blockId:", blockId, block);
      return;
    }

    const nextAction = block.actions.find(
      (a) => a && get().actions[a.id] !== "completed",
    );
  
    if (!nextAction) {
      return;
    }
  
    set(
      produce((draft) => {
        // 1. Reset any other action that is currently 'active' to 'pending'.
        // This ensures only one action is running at a time across all blocks.
        for (const actionId in draft.actions) {
          if (draft.actions[actionId] === 'active') {
            draft.actions[actionId] = 'pending';
          }
        }
  
        // 2. Set the new block to 'active' (without deactivating others).
        draft.progress[blockId] = "active";
        // 3. Set the new action to 'active'.
        draft.actions[nextAction.id] = "active";
      }),
    );
    get().saveProgress(routine.id);
  },

  completeAction: (routine, completedActionId) => {
    if (!routine || !Array.isArray(routine.blocks)) {
      console.error("completeAction: Invalid routine provided.", routine);
      return;
    }
    set(
      produce((draft) => {
        draft.actions[completedActionId] = "completed";

        if (draft.pausedTimers[completedActionId]) {
          delete draft.pausedTimers[completedActionId];
        }

        const parentBlock = routine.blocks.find(b => 
          b && Array.isArray(b.actions) && b.actions.some(a => a && a.id === completedActionId)
        );

        if (parentBlock) {
          const isBlockComplete = parentBlock.actions.every(
            (a) => a && draft.actions[a.id] === "completed",
          );

          if (isBlockComplete) {
            draft.progress[parentBlock.id] = "completed";
          }
        }
      }),
      false,
      () => get().saveProgress(routine.id),
    );
  },

  pauseAction: (routineId, actionId, remainingTime) => {
    set(
      produce((draft) => {
        if (actionId && remainingTime === null) {
          delete draft.pausedTimers[actionId];
        } 
        else if (actionId && remainingTime !== null) {
          draft.pausedTimers[actionId] = remainingTime;
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
      pausedTimers,
    } = get();
    const date = new Date().toISOString().split("T")[0];
    const key = getProgressKey(routineId, date);
    const dataToStore = JSON.stringify({
      progress,
      actions,
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
      set({ routineId: null });
      get().loadProgress(routine);
    } catch (e) {
      console.error("Failed to reset progress.", e);
    }
  },
}));

export default useProgressStore;
