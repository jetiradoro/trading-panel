export default {
  path: '/transactions',
  component: () => import('../../layouts/MainLayout.vue'),
  children: [
    {
      path: '',
      name: 'transactions',
      component: () => import('./pages/TransactionsPage.vue'),
    },
  ],
};
