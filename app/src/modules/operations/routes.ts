export default {
  path: '/operations',
  component: () => import('../../layouts/MainLayout.vue'),
  children: [
    {
      path: '',
      name: 'operations',
      component: () => import('./pages/OperationsPage.vue'),
    },
    {
      path: 'new',
      name: 'operations.new',
      component: () => import('./pages/NewOperationPage.vue'),
    },
    {
      path: ':id',
      name: 'operations.detail',
      component: () => import('./pages/OperationDetailPage.vue'),
    },
  ],
};
