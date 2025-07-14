import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { produce } from 'immer';

const ROUTINES_KEY = '@FlowDay:Routines';

const useRoutineStore = create((set, get) => ({
  routines: [],
  activeRoutineId: null,
  // Note: Progress is not managed in this version of the store for simplicity.
  // It will be handled by a separate mechanism or in a future iteration.

  setActiveRoutineId: (routineId) => set({ activeRoutineId: routineId }),

  // --- Persistence ---
  saveRoutines: async (routines) => {
    try {
      await AsyncStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
    } catch (e) {
      console.error("Failed to save routines.", e);
    }
  },

  loadRoutines: async () => {
    try {
      const storedRoutines = await AsyncStorage.getItem(ROUTINES_KEY);
      if (storedRoutines !== null) {
        set({ routines: JSON.parse(storedRoutines) });
      }
    } catch (e) {
      console.error("Failed to load routines.", e);
    }
  },

  // --- Routines ---
  addRoutine: (title) => {
    const newRoutine = { id: uuidv4(), title, blocks: [] };
    const updatedRoutines = produce(get().routines, draft => {
      draft.push(newRoutine);
    });
    set({ routines: updatedRoutines });
    get().saveRoutines(updatedRoutines);
    return newRoutine.id;
  },

  updateRoutine: (routineId, title) => {
    const updatedRoutines = produce(get().routines, draft => {
      const routine = draft.find(r => r.id === routineId);
      if (routine) {
        routine.title = title;
      }
    });
    set({ routines: updatedRoutines });
    get().saveRoutines(updatedRoutines);
  },

  deleteRoutine: (routineId) => {
    const updatedRoutines = get().routines.filter(r => r.id !== routineId);
    set({ routines: updatedRoutines });
    get().saveRoutines(updatedRoutines);
  },

  // --- Blocks ---
  addBlock: (routineId, name) => {
    const newBlock = { id: uuidv4(), name, actions: [] };
    const updatedRoutines = produce(get().routines, draft => {
      const routine = draft.find(r => r.id === routineId);
      if (routine) {
        routine.blocks.push(newBlock);
      }
    });
    set({ routines: updatedRoutines });
    get().saveRoutines(updatedRoutines);
  },

  updateBlock: (routineId, blockId, name) => {
    const updatedRoutines = produce(get().routines, draft => {
      const routine = draft.find(r => r.id === routineId);
      const block = routine?.blocks.find(b => b.id === blockId);
      if (block) {
        block.name = name;
      }
    });
    set({ routines: updatedRoutines });
    get().saveRoutines(updatedRoutines);
  },

  deleteBlock: (routineId, blockId) => {
    const updatedRoutines = produce(get().routines, draft => {
      const routine = draft.find(r => r.id === routineId);
      if (routine) {
        routine.blocks = routine.blocks.filter(b => b.id !== blockId);
      }
    });
    set({ routines: updatedRoutines });
    get().saveRoutines(updatedRoutines);
  },

  // --- Actions ---
  addAction: (routineId, blockId, actionData) => {
    const newAction = { ...actionData, id: uuidv4() };
    const updatedRoutines = produce(get().routines, draft => {
      const block = draft.find(r => r.id === routineId)?.blocks.find(b => b.id === blockId);
      if (block) {
        block.actions.push(newAction);
      }
    });
    set({ routines: updatedRoutines });
    get().saveRoutines(updatedRoutines);
  },

  updateAction: (routineId, blockId, actionId, actionData) => {
    const updatedRoutines = produce(get().routines, draft => {
      const action = draft.find(r => r.id === routineId)?.blocks.find(b => b.id === blockId)?.actions.find(a => a.id === actionId);
      if (action) {
        Object.assign(action, actionData);
      }
    });
    set({ routines: updatedRoutines });
    get().saveRoutines(updatedRoutines);
  },

  deleteAction: (routineId, blockId, actionId) => {
    const updatedRoutines = produce(get().routines, draft => {
      const block = draft.find(r => r.id === routineId)?.blocks.find(b => b.id === blockId);
      if (block) {
        block.actions = block.actions.filter(a => a.id !== actionId);
      }
    });
    set({ routines: updatedRoutines });
    get().saveRoutines(updatedRoutines);
  },
}));

export default useRoutineStore;
