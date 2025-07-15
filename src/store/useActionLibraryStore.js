import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";

const ACTION_LIBRARY_KEY = "@FlowDay:ActionLibrary";

const useActionLibraryStore = create((set, get) => ({
  actionTemplates: [],
  selectedTemplateForRoutine: null, // Used to pass data back from picker

  setSelectedTemplateForRoutine: (template) =>
    set({ selectedTemplateForRoutine: template }),

  loadActionTemplates: async () => {
    try {
      const storedTemplates = await AsyncStorage.getItem(ACTION_LIBRARY_KEY);
      if (storedTemplates !== null) {
        set({ actionTemplates: JSON.parse(storedTemplates) });
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
    const newTemplate = { ...templateData, id: uuidv4() };
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
}));

export default useActionLibraryStore;
