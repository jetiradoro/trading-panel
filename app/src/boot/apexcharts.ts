import { boot } from 'quasar/wrappers';
import VueApexCharts from 'vue3-apexcharts';

/**
 * Configuración global de ApexCharts para gráficos de analítica
 */
export default boot(({ app }) => {
  app.use(VueApexCharts);
});
