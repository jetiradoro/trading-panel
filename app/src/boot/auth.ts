import { boot } from 'quasar/wrappers';
import { useUserStore } from 'src/stores/user';
import type { RouteLocationNormalized } from 'vue-router';
import { config } from 'src/config';
import { api } from 'boot/axios';
import type { AxiosError, AxiosRequestConfig } from 'axios';

export default boot(async ({ router }) => {
  const user = useUserStore();
  let refreshPromise: Promise<void> | null = null;

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const status = error.response?.status;
      const originalRequest = error.config as
        | (AxiosRequestConfig & { _retry?: boolean })
        | undefined;
      const url = originalRequest?.url ?? '';

      if (
        status !== 401 ||
        !originalRequest ||
        originalRequest._retry ||
        url.includes('/auth/login') ||
        url.includes('/auth/refresh')
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = user.refresh().finally(() => {
          refreshPromise = null;
        });
      }

      await refreshPromise;
      if (!user.loggued) {
        return Promise.reject(error);
      }

      return api(originalRequest);
    },
  );
  await user.init();
  router.beforeEach((to: RouteLocationNormalized) => {
    const isAuth = user.loggued;
    // Si la ruta es pública:
    if (to.meta?.public === true) {
      // Si ya está logado y va a /login -> al panel
      if (isAuth && (to.name === 'login' || to.path === '/login')) {
        return { name: config.home_page };
      }
      return true;
    }

    // Rutas protegidas por defecto:
    if (!isAuth) {
      return {
        name: 'login',
        query: { redirect: to.fullPath }, // para volver tras logar
      };
    }

    return true;
  });
});
