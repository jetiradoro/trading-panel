import { defineStore } from 'pinia';
import { api } from 'boot/axios';

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
      delete api.defaults.headers.common.Authorization;
    },
  },
  getters: {
    userData: (state) => state.user,
  },
});
