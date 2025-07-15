import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { produce } from 'immer';

const ROUTINE_INDEX_KEY = '@FlowDay:RoutineIndex';
const getRoutineKey = (routineId) => `@FlowDay:Routine:${routineId}`;

// Helper function to save a single routine and update the index if needed
const saveRoutine = async (routine, updateIndex = false) => {
  try {
    await AsyncStorage.setItem(getRoutineKey(routine.id), JSON.stringify(routine));
    if (updateIndex) {
      const index = await AsyncStorage.getItem(ROUTINE_INDEX_KEY);
      const newIndex = index ? JSON.parse(index) : [];
      if (!newIndex.includes(routine.id)) {
        newIndex.push(routine.id);
        await AsyncStorage.setItem(ROUTINE_INDEX_KEY, JSON.stringify(newIndex));
      }
    }
  } catch (e) {
    console.error("Failed to save routine.", e);
  }
};

const useRoutineStore = create((set, get) => ({
  routines: [],
  activeRoutineId: null,

  setActiveRoutineId: (routineId) => set({ activeRoutineId: routineId }),

  // --- Persistence ---
  loadRoutines: async () => {
    try {
      const indexJson = await AsyncStorage.getItem(ROUTINE_INDEX_KEY);
      if (indexJson === null) {
        set({ routines: [] });
        return;
      }
      
      const routineIds = JSON.parse(indexJson);
      const keys = routineIds.map(getRoutineKey);
      const storedRoutines = await AsyncStorage.multiGet(keys);
      
      const routines = storedRoutines
        .map(([, value]) => (value ? JSON.parse(value) : null))
        .filter(Boolean);
        
      set({ routines });
    } catch (e) {
      console.error("Failed to load routines.", e);
      set({ routines: [] });
    }
  },

  // --- Routines ---
  addRoutine: (title) => {
    const newRoutine = { id: uuidv4(), title, blocks: [] };
    set(state => ({ routines: [...state.routines, newRoutine] }));
    saveRoutine(newRoutine, true); // true to update index
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
    const routineToSave = updatedRoutines.find(r => r.id === routineId);
    if (routineToSave) {
      saveRoutine(routineToSave);
    }
  },

  deleteRoutine: async (routineId) => {
    const updatedRoutines = get().routines.filter(r => r.id !== routineId);
    set({ routines: updatedRoutines });
    
    try {
      await AsyncStorage.removeItem(getRoutineKey(routineId));
      const indexJson = await AsyncStorage.getItem(ROUTINE_INDEX_KEY);
      if (indexJson) {
        const newIndex = JSON.parse(indexJson).filter(id => id !== routineId);
        await AsyncStorage.setItem(ROUTINE_INDEX_KEY, JSON.stringify(newIndex));
      }
    } catch (e) {
      console.error("Failed to delete routine.", e);
    }
  },

  // --- Generic update function for Blocks and Actions ---
  _updateAndSave: (routineId, producer) => {
    const updatedRoutines = produce(get().routines, draft => {
      const routine = draft.find(r => r.id === routineId);
      if (routine) {
        producer(routine);
      }
    });
    set({ routines: updatedRoutines });
    const routineToSave = updatedRoutines.find(r => r.id === routineId);
    if (routineToSave) {
      saveRoutine(routineToSave);
    }
  },

  // --- Blocks ---
  addBlock: (routineId, blockData) => {
    const newBlock = { ...blockData, id: uuidv4() };
    get()._updateAndSave(routineId, routine => {
      routine.blocks.push(newBlock);
    });
    return newBlock.id;
  },

  updateBlock: (routineId, blockId, name) => {
    get()._updateAndSave(routineId, routine => {
      const block = routine.blocks.find(b => b.id === blockId);
      if (block) {
        block.name = name;
      }
    });
  },

  deleteBlock: (routineId, blockId) => {
    get()._updateAndSave(routineId, routine => {
      routine.blocks = routine.blocks.filter(b => b.id !== blockId);
    });
  },

  // --- Actions ---
  addAction: (routineId, blockId, actionData) => {
    const newAction = { ...actionData, id: uuidv4() };
    get()._updateAndSave(routineId, routine => {
      const block = routine.blocks.find(b => b.id === blockId);
      if (block) {
        block.actions.push(newAction);
      }
    });
  },

  updateAction: (routineId, blockId, actionId, actionData) => {
    get()._updateAndSave(routineId, routine => {
      const block = routine.blocks.find(b => b.id === blockId);
      const action = block?.actions.find(a => a.id === actionId);
      if (action) {
        Object.assign(action, actionData);
      }
    });
  },

  deleteAction: (routineId, blockId, actionId) => {
    get()._updateAndSave(routineId, routine => {
      const block = routine.blocks.find(b => b.id === blockId);
      if (block) {
        block.actions = block.actions.filter(a => a.id !== actionId);
      }
    });
  },
}));

export default useRoutineStore;
