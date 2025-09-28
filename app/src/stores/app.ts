import { defineStore } from 'pinia';

interface AppState {
  section: string | null;
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    section: null,
  }),
  actions: {
    setSection(section: string | null) {
      this.section = section;
    },
  },
  getters: {
    current_section: (state) => state.section,
  },
});
