import type { RouteRecordRaw } from 'vue-router';
import transactionsRoutes from '../modules/transactions/routes';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('pages/EntryPage.vue'),
    meta: { public: true },
  },
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    meta: { public: true },
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/LoginPage.vue'),
      },
      {
        path: 'logout',
        name: 'logout',
        component: () => import('pages/LogoutPage.vue'),
      },
    ],
  },

  {
    path: '/panel',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'panel',
        component: () => import('pages/IndexPage.vue'),
      },
    ],
  },
  transactionsRoutes,

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
