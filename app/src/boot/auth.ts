import { boot } from 'quasar/wrappers';
import { useUserStore } from 'src/stores/user';
import type { RouteLocationNormalized } from 'vue-router';

export default boot(({ router }) => {
  const user = useUserStore();

  router.beforeEach((to: RouteLocationNormalized) => {
    user.init();
    const isAuth = user.loggued;
    // Si la ruta es pública:
    if (to.meta?.public === true) {
      // Si ya está logado y va a /login -> al panel
      if (isAuth && (to.name === 'login' || to.path === '/login')) {
        return { name: 'panel' };
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
