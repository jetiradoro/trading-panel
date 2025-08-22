import { defineStore } from 'pinia';
import { api } from 'boot/axios';
const STORAGE_KEY = 'auth_trading_session';
interface User {
  access_token: string;
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
    async init() {
      const session = localStorage.getItem(STORAGE_KEY);
      if (session) {
        this.user = JSON.parse(session);
        try {
          await this.me();
          // console.log('me success');
          this.isAuthenticated = true;
          api.defaults.headers.common.Authorization = `Bearer ${this.user?.access_token}`;
        } catch {
          console.log('me error');
          await this.refresh();
        }
      } else {
        console.log('no session');
        this.logout();
      }
    },
    async me() {
      const { data } = await api.get('/users/me', {
        headers: {
          Authorization: `Bearer ${this.user?.access_token}`,
        },
      });
      return data;
    },
    async login(payload: { username: string; password: string }) {
      try {
        this.loading = true;
        this.error = null;
        const { data } = await api.post('/auth/login', payload);
        // console.log('Login response:', data);
        this.user = {
          access_token: data.access_token,
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
    async refresh() {
      try {
        const { data } = await api.post('/auth/refresh');
        console.log('refresh token');
        this.user = {
          access_token: data.access_token,
          name: data.name,
          email: data.email,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.user));
        this.isAuthenticated = true;
        api.defaults.headers.common.Authorization = `Bearer ${this.user?.access_token}`;
      } catch {
        console.log('refresh invalid');
        this.logout();
      }
    },
  },
  getters: {
    userData: (state) => state.user,
    loggued: (state) => state.isAuthenticated,
  },
});
