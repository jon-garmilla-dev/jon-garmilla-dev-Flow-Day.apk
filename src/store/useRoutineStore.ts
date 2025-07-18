import AsyncStorage from "@react-native-async-storage/async-storage";
import { produce } from "immer";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { Routine, Block, Action } from "../types";

const ROUTINE_INDEX_KEY = "@FlowDay:RoutineIndex";
const getRoutineKey = (routineId: string) => `@FlowDay:Routine:${routineId}`;

// Helper function to save a single routine and update the index if needed
const saveRoutine = async (routine: Routine, updateIndex = false) => {
  try {
    await AsyncStorage.setItem(
      getRoutineKey(routine.id),
      JSON.stringify(routine),
    );
    if (updateIndex) {
      const index = await AsyncStorage.getItem(ROUTINE_INDEX_KEY);
      const newIndex: string[] = index ? JSON.parse(index) : [];
      if (!newIndex.includes(routine.id)) {
        newIndex.push(routine.id);
        await AsyncStorage.setItem(ROUTINE_INDEX_KEY, JSON.stringify(newIndex));
      }
    }
  } catch (e) {
    console.error("Failed to save routine.", e);
  }
};

interface RoutineState {
  routines: Routine[];
  activeRoutineId: string | null;
}

interface RoutineActions {
  setActiveRoutineId: (routineId: string | null) => void;
  loadRoutines: () => Promise<void>;
  addRoutine: (title: string, color?: string, icon?: string, blocks?: Block[]) => string;
  updateRoutine: (routineId: string, title: string, color?: string, icon?: string) => void;
  deleteRoutine: (routineId: string) => Promise<void>;
  reorderRoutines: (reorderedRoutines: Routine[]) => Promise<void>;
  _updateAndSave: (routineId: string, producer: (routine: Routine) => void) => void;
  addBlock: (routineId: string, blockData: Omit<Block, 'id' | 'actions'> & { actions?: Action[] }) => string;
  updateBlock: (routineId: string, blockId: string, name: string) => void;
  deleteBlock: (routineId: string, blockId: string) => void;
  reorderBlocks: (routineId: string, reorderedBlocks: Block[]) => void;
  addAction: (routineId: string, blockId: string, actionData: Omit<Action, 'id'>) => void;
  updateAction: (routineId: string, blockId: string, actionId: string, actionData: Partial<Action>) => void;
  deleteAction: (routineId: string, blockId: string, actionId: string) => void;
  reorderActions: (routineId: string, blockId: string, reorderedActions: Action[]) => void;
}

const useRoutineStore = create<RoutineState & RoutineActions>((set, get) => ({
  routines: [],
  activeRoutineId: null,

  setActiveRoutineId: (routineId) => set({ activeRoutineId: routineId }),

  loadRoutines: async () => {
    try {
      const indexJson = await AsyncStorage.getItem(ROUTINE_INDEX_KEY);
      if (indexJson === null) {
        set({ routines: [] });
        return;
      }

      const routineIds: string[] = JSON.parse(indexJson);
      const keys = routineIds.map(getRoutineKey);
      const storedRoutines = await AsyncStorage.multiGet(keys);

      const routines: Routine[] = storedRoutines
        .map(([, value]) => (value ? JSON.parse(value) : null))
        .filter((r): r is Routine => r !== null);

      set({ routines });
    } catch (e) {
      console.error("Failed to load routines.", e);
      set({ routines: [] });
    }
  },

  addRoutine: (
    title,
    color = "#6366F1",
    icon = "apps-outline",
    blocks = [],
  ) => {
    const newRoutine: Routine = { id: uuidv4(), title, color, icon, blocks };
    set((state) => ({ routines: [...state.routines, newRoutine] }));
    saveRoutine(newRoutine, true);
    return newRoutine.id;
  },

  updateRoutine: (routineId, title, color, icon) => {
    const updatedRoutines = produce(get().routines, (draft) => {
      const routine = draft.find((r) => r.id === routineId);
      if (routine) {
        routine.title = title;
        if (color) routine.color = color;
        if (icon) routine.icon = icon;
      }
    });
    set({ routines: updatedRoutines });
    const routineToSave = updatedRoutines.find((r) => r.id === routineId);
    if (routineToSave) {
      saveRoutine(routineToSave);
    }
  },

  deleteRoutine: async (routineId) => {
    const updatedRoutines = get().routines.filter((r) => r.id !== routineId);
    set({ routines: updatedRoutines });

    try {
      await AsyncStorage.removeItem(getRoutineKey(routineId));
      const indexJson = await AsyncStorage.getItem(ROUTINE_INDEX_KEY);
      if (indexJson) {
        const newIndex = JSON.parse(indexJson).filter((id: string) => id !== routineId);
        await AsyncStorage.setItem(ROUTINE_INDEX_KEY, JSON.stringify(newIndex));
      }
    } catch (e) {
      console.error("Failed to delete routine.", e);
    }
  },

  reorderRoutines: async (reorderedRoutines) => {
    set({ routines: reorderedRoutines });
    const newIndex = reorderedRoutines.map((r) => r.id);
    try {
      await AsyncStorage.setItem(ROUTINE_INDEX_KEY, JSON.stringify(newIndex));
    } catch (e) {
      console.error("Failed to save reordered routine index.", e);
    }
  },

  _updateAndSave: (routineId, producer) => {
    const updatedRoutines = produce(get().routines, (draft) => {
      const routine = draft.find((r) => r.id === routineId);
      if (routine) {
        producer(routine);
      }
    });
    set({ routines: updatedRoutines });
    const routineToSave = updatedRoutines.find((r) => r.id === routineId);
    if (routineToSave) {
      saveRoutine(routineToSave);
    }
  },

  addBlock: (routineId, blockData) => {
    const newBlock: Block = { ...blockData, id: uuidv4(), actions: blockData.actions || [] };
    get()._updateAndSave(routineId, (routine) => {
      routine.blocks.push(newBlock);
    });
    return newBlock.id;
  },

  updateBlock: (routineId, blockId, name) => {
    get()._updateAndSave(routineId, (routine) => {
      const block = routine.blocks.find((b) => b.id === blockId);
      if (block) {
        block.name = name;
      }
    });
  },

  deleteBlock: (routineId, blockId) => {
    get()._updateAndSave(routineId, (routine) => {
      routine.blocks = routine.blocks.filter((b) => b.id !== blockId);
    });
  },

  reorderBlocks: (routineId, reorderedBlocks) => {
    get()._updateAndSave(routineId, (routine) => {
      routine.blocks = reorderedBlocks;
    });
  },

  addAction: (routineId, blockId, actionData) => {
    const newAction: Action = { ...actionData, id: uuidv4() };
    get()._updateAndSave(routineId, (routine) => {
      const block = routine.blocks.find((b) => b.id === blockId);
      if (block) {
        block.actions.push(newAction);
      }
    });
  },

  updateAction: (routineId, blockId, actionId, actionData) => {
    get()._updateAndSave(routineId, (routine) => {
      const block = routine.blocks.find((b) => b.id === blockId);
      const action = block?.actions.find((a) => a.id === actionId);
      if (action) {
        Object.assign(action, actionData);
      }
    });
  },

  deleteAction: (routineId, blockId, actionId) => {
    get()._updateAndSave(routineId, (routine) => {
      const block = routine.blocks.find((b) => b.id === blockId);
      if (block) {
        block.actions = block.actions.filter((a) => a.id !== actionId);
      }
    });
  },

  reorderActions: (routineId, blockId, reorderedActions) => {
    get()._updateAndSave(routineId, (routine) => {
      const block = routine.blocks.find((b) => b.id === blockId);
      if (block) {
        block.actions = reorderedActions;
      }
    });
  },
}));

export default useRoutineStore;
