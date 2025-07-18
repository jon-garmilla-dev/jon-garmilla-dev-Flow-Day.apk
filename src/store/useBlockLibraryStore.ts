import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { BlockTemplate } from "../types";

const BLOCK_LIBRARY_KEY = "@FlowDay:BlockLibrary";

interface BlockLibraryState {
  blockTemplates: BlockTemplate[];
  selectedBlockTemplate: BlockTemplate | null;
}

interface BlockLibraryActions {
  setSelectedBlockTemplate: (template: BlockTemplate | null) => void;
  loadBlockTemplates: () => Promise<void>;
  saveBlockTemplates: (templates: BlockTemplate[]) => Promise<void>;
  addBlockTemplate: (templateData: Omit<BlockTemplate, 'id'>) => void;
  updateBlockTemplate: (templateId: string, templateData: Partial<Omit<BlockTemplate, 'id'>>) => void;
  deleteBlockTemplate: (templateId: string) => void;
  reorderBlockTemplates: (templates: BlockTemplate[]) => void;
}

const useBlockLibraryStore = create<BlockLibraryState & BlockLibraryActions>((set, get) => ({
  blockTemplates: [],
  selectedBlockTemplate: null,

  setSelectedBlockTemplate: (template) => set({ selectedBlockTemplate: template }),

  loadBlockTemplates: async () => {
    try {
      const storedTemplates = await AsyncStorage.getItem(BLOCK_LIBRARY_KEY);
      if (storedTemplates !== null) {
        const templates: BlockTemplate[] = JSON.parse(storedTemplates);
        set({ blockTemplates: templates });
      }
    } catch (e) {
      console.error("Failed to load block templates.", e);
    }
  },

  saveBlockTemplates: async (templates) => {
    try {
      await AsyncStorage.setItem(BLOCK_LIBRARY_KEY, JSON.stringify(templates));
    } catch (e) {
      console.error("Failed to save block templates.", e);
    }
  },

  addBlockTemplate: (templateData) => {
    const newTemplate: BlockTemplate = { ...templateData, id: uuidv4() };
    const updatedTemplates = [...get().blockTemplates, newTemplate];
    set({ blockTemplates: updatedTemplates });
    get().saveBlockTemplates(updatedTemplates);
  },

  updateBlockTemplate: (templateId, templateData) => {
    const updatedTemplates = get().blockTemplates.map((t) =>
      t.id === templateId ? { ...t, ...templateData } : t,
    );
    set({ blockTemplates: updatedTemplates });
    get().saveBlockTemplates(updatedTemplates);
  },

  deleteBlockTemplate: (templateId) => {
    const updatedTemplates = get().blockTemplates.filter(
      (t) => t.id !== templateId,
    );
    set({ blockTemplates: updatedTemplates });
    get().saveBlockTemplates(updatedTemplates);
  },

  reorderBlockTemplates: (templates) => {
    set({ blockTemplates: templates });
    get().saveBlockTemplates(templates);
  },
}));

export default useBlockLibraryStore;
