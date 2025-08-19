import { defineStore } from 'pinia';
import { api } from 'boot/axios';
const STORAGE_KEY = 'auth_trading_session';
interface User {
  access_token: string;
  refresh_token: string;
  name: string;
  email: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }),
  actions: {
    init() {
      if (this.isAuthenticated) return;

      const session = localStorage.getItem(STORAGE_KEY);
      if (session) {
        if (session) {
          this.user = JSON.parse(session);
          this.isAuthenticated = true;
        }
      }
    },
    async login(payload: { email: string; password: string }) {
      try {
        this.loading = true;
        this.error = null;
        const { data } = await api.post('/auth/login', payload);
        // console.log('Login response:', data);
        this.user = {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          name: data.name,
          email: data.email,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.user));
        this.isAuthenticated = true;
      } catch (error: any) {
        console.log('Login error:', error);
        const error_string = Array.isArray(error.response.data.message)
          ? error.response.data.message.join('<br>')
          : error.response.data.message || 'Login failed. Please try again.';
        // console.log({ error });
        this.error = error_string;
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.$reset();
      localStorage.removeItem(STORAGE_KEY);
      delete api.defaults.headers.common.Authorization;
    },
  },
  getters: {
    userData: (state) => state.user,
    loggued: (state) => state.isAuthenticated,
  },
});
