import type { RouteRecordRaw } from 'vue-router';

const analyticsRoutes: RouteRecordRaw = {
  path: '/panel',
  component: () => import('layouts/MainLayout.vue'),
  children: [
    {
      path: 'dashboard',
      name: 'dashboard',
      component: () => import('./pages/DashboardPage.vue'),
    },
  ],
};

export default analyticsRoutes;
