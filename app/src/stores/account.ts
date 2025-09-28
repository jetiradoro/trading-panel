import { defineStore } from 'pinia';
import { api } from 'boot/axios';
const STORAGE_KEY = 'current_account';
interface Account {
  id: string;
  userId: string;
  active: boolean;
  name: string;
  balance: number;
}

interface AccountState {
  current: Account | null;
}

export const useAccountStore = defineStore('account', {
  state: (): AccountState => ({
    current: null,
  }),
  actions: {
    async getCurrent() {
      // const session = localStorage.getItem(STORAGE_KEY);

      try {
        // La petición usará automáticamente el header de Authorization establecido por defecto
        const { data } = await api.get('/accounts/active');
        this.current = data;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.current));
      } catch (error) {
        console.log('Error getting current account:', error);
        this.current = null;
      }
    },
  },
  getters: {
    currentAccount: (state): Account | null => {
      return state.current;
    },
  },
});
