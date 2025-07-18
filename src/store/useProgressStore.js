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
          pausedTimers,
        } = JSON.parse(storedProgress);
        set({
          routineId: routine.id,
          progress,
          actions,
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
        // Set all other active actions to pending
        Object.keys(draft.actions).forEach(actionId => {
          if (draft.actions[actionId] === 'active') {
            draft.actions[actionId] = 'pending';
          }
        });

        // Set all other active blocks to pending
        Object.keys(draft.progress).forEach(bId => {
            if(draft.progress[bId] === 'active') {
                const isComplete = routine.blocks.find(b => b.id === bId)?.actions.every(a => draft.actions[a.id] === 'completed');
                if(!isComplete) {
                    draft.progress[bId] = 'pending';
                }
            }
        });

        draft.progress[blockId] = "active";
        draft.actions[nextAction.id] = "active";
      }),
    );
    get().saveProgress(routine.id);
  },

  completeAction: (routine, completedActionId) => {
    set(
      produce((draft) => {
        draft.actions[completedActionId] = "completed";

        if (draft.pausedTimers[completedActionId]) {
          delete draft.pausedTimers[completedActionId];
        }

        // Find which block this action belongs to
        const parentBlock = routine.blocks.find(b => 
          b.actions.some(a => a.id === completedActionId)
        );

        if (parentBlock) {
          const isBlockComplete = parentBlock.actions.every(
            (a) => draft.actions[a.id] === "completed",
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
        draft.pausedTimers = {};
        if (actionId && remainingTime !== null) {
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
