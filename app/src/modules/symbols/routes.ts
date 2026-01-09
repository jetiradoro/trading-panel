export default {
  path: '/symbols',
  component: () => import('../../layouts/MainLayout.vue'),
  children: [
    {
      path: '',
      name: 'symbols',
      component: () => import('./pages/SymbolsPage.vue'),
    },
    {
      path: 'new',
      name: 'symbols.new',
      component: () => import('./pages/SymbolFormPage.vue'),
    },
    {
      path: ':id/edit',
      name: 'symbols.edit',
      component: () => import('./pages/SymbolFormPage.vue'),
    },
  ],
};
