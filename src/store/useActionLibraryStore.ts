import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { Action } from "../types";

const ACTION_LIBRARY_KEY = "@FlowDay:ActionLibrary";

interface ActionLibraryState {
  actionTemplates: Action[];
  selectedTemplateForRoutine: Action | null;
}

interface ActionLibraryActions {
  setSelectedTemplateForRoutine: (template: Action | null) => void;
  loadActionTemplates: () => Promise<void>;
  saveActionTemplates: (templates: Action[]) => Promise<void>;
  addActionTemplate: (templateData: Omit<Action, 'id'>) => void;
  updateActionTemplate: (templateId: string, templateData: Partial<Omit<Action, 'id'>>) => void;
  deleteActionTemplate: (templateId: string) => void;
  reorderActionTemplates: (templates: Action[]) => void;
}

const useActionLibraryStore = create<ActionLibraryState & ActionLibraryActions>((set, get) => ({
  actionTemplates: [],
  selectedTemplateForRoutine: null,

  setSelectedTemplateForRoutine: (template) =>
    set({ selectedTemplateForRoutine: template }),

  loadActionTemplates: async () => {
    try {
      const storedTemplates = await AsyncStorage.getItem(ACTION_LIBRARY_KEY);
      if (storedTemplates !== null) {
        const templates: Action[] = JSON.parse(storedTemplates);
        set({ actionTemplates: templates });
      }
    } catch (e) {
      console.error("Failed to load action templates.", e);
    }
  },

  saveActionTemplates: async (templates) => {
    try {
      await AsyncStorage.setItem(ACTION_LIBRARY_KEY, JSON.stringify(templates));
    } catch (e) {
      console.error("Failed to save action templates.", e);
    }
  },

  addActionTemplate: (templateData) => {
    const newTemplate: Action = { ...templateData, id: uuidv4() };
    const updatedTemplates = [...get().actionTemplates, newTemplate];
    set({ actionTemplates: updatedTemplates });
    get().saveActionTemplates(updatedTemplates);
  },

  updateActionTemplate: (templateId, templateData) => {
    const updatedTemplates = get().actionTemplates.map((t) =>
      t.id === templateId ? { ...t, ...templateData } : t,
    );
    set({ actionTemplates: updatedTemplates });
    get().saveActionTemplates(updatedTemplates);
  },

  deleteActionTemplate: (templateId) => {
    const updatedTemplates = get().actionTemplates.filter(
      (t) => t.id !== templateId,
    );
    set({ actionTemplates: updatedTemplates });
    get().saveActionTemplates(updatedTemplates);
  },

  reorderActionTemplates: (templates) => {
    set({ actionTemplates: templates });
    get().saveActionTemplates(templates);
  },
}));

export default useActionLibraryStore;
